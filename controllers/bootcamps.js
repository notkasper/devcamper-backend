const Bootcamp = require('../models/Bootcamp');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootCamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();
    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootCamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      res.status(404).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!bootcamp) {
      res.status(404).json({ success: false });
      return;
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
  try {
    await Bootcamp.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
