const ErrorResponse = require('../utils/errorResponse');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  console.error(error);

  let message;
  let status;
  if (error.name === 'CastError') {
    message = `Resource not found with id ${error.value}`;
    error = new ErrorResponse(message, 404);
  }

  if (error.code === 11000) {
    message = `Resource with id ${error.value} already exists`;
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message });
};
