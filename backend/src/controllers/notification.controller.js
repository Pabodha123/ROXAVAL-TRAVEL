const { Notification } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

const getMyNotifications = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Notification.find({ recipient: req.user._id }), req.query).filter().sort().paginate();
  const docs = await features.query;
  const meta = await features.getMeta(Notification, { recipient: req.user._id });
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  new ApiResponse(200, docs, 'Notifications fetched', { ...meta, unreadCount }).send(res);
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!notification) throw ApiError.notFound('Notification not found');
  new ApiResponse(200, notification, 'Notification marked as read').send(res);
});

const markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  new ApiResponse(200, null, 'All notifications marked as read').send(res);
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
