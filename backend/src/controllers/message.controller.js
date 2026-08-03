const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const messageService = require('../services/message.service');

const listMessages = catchAsync(async (req, res) => {
  const messages = await messageService.listMessages(req.user._id, req.user.role, req.params.id);
  new ApiResponse(200, messages, 'Messages fetched').send(res);
});

const sendMessage = catchAsync(async (req, res) => {
  const message = await messageService.sendMessage(req.user._id, req.user.role, req.params.id, req.body.text);
  new ApiResponse(201, message, 'Message sent').send(res);
});

module.exports = { listMessages, sendMessage };
