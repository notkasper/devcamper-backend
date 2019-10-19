const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootCamps = asyncHandler(async (req, res, next) => {
  const reqQuery = { ...req.query };

  // fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  // loop over removeFields and delete them from the query
  removeFields.forEach(param => delete reqQuery[param]);

  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b()/g, match => `$${match}`);
  let query = Bootcamp.find(JSON.parse(queryString)).populate('courses');
  if (req.query.select) {
    const fields = req.query.select.replace(',', ' ');
    query = query.select(fields);
  }
  if (req.query.sort) {
    const sortBy = req.query.sort.replace(',', '');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();
  query = query.skip(startIndex).limit(limit);

  const bootcamps = await query;

  // Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps, pagination });
});

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    return;
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    return;
  }
  bootcamp.remove();
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get bootcamps within a radius
// @route   GET /api/v1/bootcamps/radius/:zipcode/:distanceKm
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distanceKm } = req.params;
  const location = await geocoder.geocode(zipcode);
  const latitude = location[0].latitude;
  const longitude = location[0].longitude;

  const earthRadiusKm = 6378.1;
  const radius = distanceKm / earthRadiusKm;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius]
      }
    }
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps
  });
});

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    return;
  }

  if (!req.files) {
    next(new ErrorResponse('Please upload a file', 400));
    return;
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    next(new ErrorResponse('Please upload an image file', 400));
    return;
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    next(new ErrorResponse(`Image exceeds max file size of ${process.env.MAX_FILE_UPLOAD_SIZE}`, 400));
    return;
  }

  // Create custom name
  file.name = `photo_${bootcamp.id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async error => {
    if (error) {
      console.error(error);
      next(new ErrorResponse('Problem with file upload  ', 500));
      return;
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
