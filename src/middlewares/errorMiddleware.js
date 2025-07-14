const { ZodError } = require('zod');
const ApiError = require('../utils/apiError');

/**
 * Global error handler middleware.
 * Responds with structured error format compatible with ApiError / ApiResponse types.
 */
const errorMiddleware = (err, _req, res, _next) => {
  console.error('🔴 Error:', err);

  // Zod validation error
  if (err instanceof ZodError) {
    const formatted = formatZodError(err);
    return res.status(422).json({
      code: 422,
      status: false,
      message: formatted,
    });
  }

  // If it's an ApiError (custom thrown error)
  if (err instanceof ApiError) {
    return res.status(err.code || 500).json({
      code: err.code || 500,
      status: false,
      message: err.message || 'Something went wrong',
    });
  }

  // Uncaught errors (fallback)
  return res.status(500).json({
    code: 500,
    status: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message || 'Unhandled error'
        : 'Internal Server Error',
  });
};

module.exports = errorMiddleware;

/**
 * Format ZodError into a more friendly message format
 * Can be enhanced to return object of field errors too
 */
function formatZodError(zodErr) {
  return zodErr.errors
    .map((e) => `${e.path.join('.')}: ${e.message}`)
    .join('; ');
}
