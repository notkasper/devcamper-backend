const ErrorResponse = require('../utils/errorResponse');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  let message;
  if (error.name === 'CastError') {
    message = 'Resource not found';
    error = new ErrorResponse(message, 404);
  }

  if (error.code === 11000) {
    message = `One or more data fields are not unique: ${error.errmsg}`;
    error = new ErrorResponse(message, 400);
  }

  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors).map(value => value.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message });
};
