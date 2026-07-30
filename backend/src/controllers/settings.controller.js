const { Settings } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

const getSettings = catchAsync(async (req, res) => {
  const settings = await Settings.getSingleton();
  new ApiResponse(200, settings, 'Settings fetched').send(res);
});

const updateSettings = catchAsync(async (req, res) => {
  const settings = await Settings.getSingleton();
  Object.assign(settings, req.body);
  await settings.save();
  new ApiResponse(200, settings, 'Settings updated').send(res);
});

module.exports = { getSettings, updateSettings };
