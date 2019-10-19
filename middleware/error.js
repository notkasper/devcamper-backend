const ErrorResponse = require('../utils/errorResponse');

module.exports = (error, req, res, next) => {
  console.error(error.stack.red);

  let message;
  let status;
  if (error.name === 'CastError') {
    message = `Resource not found with id ${error.value}`;
    status = 404;
  }

  const errorResponse = new ErrorResponse(message ? message : error.message, status ? status : 500);

  res.status(errorResponse.statusCode || 500).json({ success: false, error: errorResponse.message || 'Server errror' });
};
