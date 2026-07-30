const crypto = require('crypto');
const { User, Customer } = require('../models');
const ApiError = require('../utils/ApiError');
const { generateAuthTokens, verifyRefreshToken } = require('../utils/token');
const { sendEmail } = require('../utils/email');
const env = require('../config/env');

const register = async ({ fullName, email, phone, password, country }) => {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({ fullName, email, phone, password, role: 'customer' });
  await Customer.create({ user: user._id, country });

  const tokens = generateAuthTokens(user);
  return { user, ...tokens };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +active');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password.');
  }
  if (!user.active) throw ApiError.forbidden('This account has been disabled. Please contact support.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const tokens = generateAuthTokens(user);
  return { user, ...tokens };
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token missing.');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }
  const user = await User.findById(decoded.sub);
  if (!user || !user.active) throw ApiError.unauthorized('Account no longer available.');
  return generateAuthTokens(user);
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) return; // Do not reveal whether the email exists

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Roxaval Travels - Password Reset Request',
    html: `<p>Hello ${user.fullName},</p><p>You requested a password reset. Click the link below (valid for 10 minutes):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
  });
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw ApiError.badRequest('Token is invalid or has expired.');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return generateAuthTokens(user);
};

const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect.');
  }
  user.password = newPassword;
  await user.save();
  return generateAuthTokens(user);
};

module.exports = { register, login, refresh, forgotPassword, resetPassword, updatePassword };
