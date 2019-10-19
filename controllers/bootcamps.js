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
  const removeFields = ['select'];
  // loop over removeFields and delete them from the query
  removeFields.forEach(param => delete reqQuery[param]);

  let queryString = JSON.stringify(reqQuery);
  queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b()/g, match => `$${match}`);
  let query = Bootcamp.find(JSON.parse(queryString));
  if (req.query) {
    const fields = req.query.select.replace(',', ' ');
    query = query.select(fields);
  }
  const bootcamps = await query;
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
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
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    return;
  }
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
