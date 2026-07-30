const env = require('../config/env');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
};

const sendTokens = (res, tokens) => {
  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, cookieOptions);
};

const register = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  sendTokens(res, { accessToken, refreshToken });
  new ApiResponse(201, { user, accessToken }, 'Account created successfully').send(res);
});

const login = catchAsync(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  sendTokens(res, { accessToken, refreshToken });
  new ApiResponse(200, { user, accessToken }, 'Logged in successfully').send(res);
});

const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  const tokens = await authService.refresh(token);
  sendTokens(res, tokens);
  new ApiResponse(200, { accessToken: tokens.accessToken }, 'Token refreshed').send(res);
});

const logout = catchAsync(async (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const getMe = catchAsync(async (req, res) => {
  new ApiResponse(200, { user: req.user }, 'Current user fetched').send(res);
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  new ApiResponse(200, null, 'If that email exists, a reset link has been sent').send(res);
});

const resetPassword = catchAsync(async (req, res) => {
  const tokens = await authService.resetPassword(req.params.token, req.body.password);
  sendTokens(res, tokens);
  new ApiResponse(200, { accessToken: tokens.accessToken }, 'Password reset successfully').send(res);
});

const updatePassword = catchAsync(async (req, res) => {
  const tokens = await authService.updatePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
  sendTokens(res, tokens);
  new ApiResponse(200, { accessToken: tokens.accessToken }, 'Password updated successfully').send(res);
});

module.exports = { register, login, refresh, logout, getMe, forgotPassword, resetPassword, updatePassword };
