class ApiError extends Error {
  constructor(message = 'Something went wrong', code = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = false;
  }

  static badRequest(message = 'Bad Request') {
    return new ApiError(message, 400);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(message, 409);
  }

  static unprocessable(message = 'Unprocessable Entity') {
    return new ApiError(message, 422);
  }

  static internal(message = 'Internal Server Error') {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
