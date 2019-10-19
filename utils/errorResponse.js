class ErrorResponse extends Error {
  constructor(message, status, name) {
    super(message);
    this.statusCode = status;
    this.name = name;
  }
}

module.exports = ErrorResponse;
