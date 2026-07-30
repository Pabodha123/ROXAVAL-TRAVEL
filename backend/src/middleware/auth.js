const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Verifies the JWT access token (from Authorization header or cookie),
 * loads the current user and attaches it to req.user.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(ApiError.unauthorized('You are not logged in. Please log in to access this resource.'));
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired session. Please log in again.'));
  }

  const currentUser = await User.findById(decoded.sub).select('+active');
  if (!currentUser || !currentUser.active) {
    return next(ApiError.unauthorized('The account belonging to this token no longer exists or is disabled.'));
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(ApiError.unauthorized('Password was recently changed. Please log in again.'));
  }

  req.user = currentUser;
  next();
});

/**
 * Restricts a route to the given roles.
 * Usage: restrictTo('admin', 'superadmin')
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action.'));
  }
  next();
};

/**
 * Optional auth: attaches req.user if a valid token is present, but does
 * not block the request otherwise. Useful for public endpoints that
 * personalize output for logged-in customers.
 */
const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }
  if (!token) return next();

  try {
    const decoded = verifyAccessToken(token);
    const currentUser = await User.findById(decoded.sub);
    if (currentUser && currentUser.active) req.user = currentUser;
  } catch (err) {
    // silently ignore invalid tokens for optional auth
  }
  next();
});

module.exports = { protect, restrictTo, optionalAuth };
