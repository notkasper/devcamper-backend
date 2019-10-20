const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role
  });

  sendTokenResponse(user, 200, res);
});

// @desc    Login User
// @route   POST /api/v1/auth/register
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    next(new ErrorResponse('Please provide an email and password', 400));
    return;
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    next(new ErrorResponse(`Invalid credentials`, 401));
    return;
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    next(new ErrorResponse(`Invalid credentials`, 401));
    return;
  }

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 1000 * 60 * 60 * 24),
    httpOnly: true
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({ success: true, token });
};
