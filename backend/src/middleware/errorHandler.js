const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

const handleCastErrorDB = (err) => ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0];
  const value = err.keyValue?.[field];
  return ApiError.conflict(`Duplicate value for '${field}': '${value}'. Please use another value.`);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({ field: el.path, message: el.message }));
  return ApiError.badRequest('Invalid input data', errors);
};

const handleJWTError = () => ApiError.unauthorized('Invalid token. Please log in again.');
const handleJWTExpiredError = () => ApiError.unauthorized('Your session has expired. Please log in again.');

/**
 * Centralized error-handling middleware. Every ApiError thrown (or async
 * error forwarded via catchAsync) ends up here and is converted into the
 * standard { success, message, errors } response shape.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;
  error.statusCode = error.statusCode || 500;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  if (!error.isOperational) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, { stack: error.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.isOperational ? error.message : 'Something went wrong. Please try again later.',
    errors: error.errors && error.errors.length ? error.errors : undefined,
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
};

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.originalUrl} on this server`));
};

module.exports = { errorHandler, notFoundHandler };
