const { Review, Customer, Booking } = require('../models');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

// Customer: submit a review — only allowed for a booking they own that is
// already Completed, and only once per booking.
const create = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  if (!customer) throw ApiError.notFound('Customer profile not found');

  const booking = await Booking.findOne({ _id: req.body.booking, customer: customer._id });
  if (!booking) throw ApiError.notFound('Booking not found for this customer');
  if (booking.status !== 'Completed') {
    throw ApiError.badRequest('You can only review a booking after your tour is completed');
  }

  const existing = await Review.findOne({ booking: booking._id });
  if (existing) throw ApiError.badRequest('You have already submitted a review for this booking');

  const tourPackage = req.body.tourPackage || booking.tourPackage || undefined;
  const review = await Review.create({ ...req.body, tourPackage, customer: customer._id, status: 'pending' });
  new ApiResponse(201, review, 'Review submitted and pending moderation').send(res);
});

// Public: only approved reviews are ever shown on the website
const getApproved = catchAsync(async (req, res) => {
  req.query = { ...req.query, status: 'approved' };
  const features = new ApiFeatures(Review.find({ status: 'approved' }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const docs = await features.query
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName' } })
    .populate('tourPackage', 'name heroImage');
  const meta = await features.getMeta(Review, { status: 'approved' });
  new ApiResponse(200, docs, 'Approved reviews fetched', meta).send(res);
});

// Public: overall rating + star breakdown across all approved reviews
const getStats = catchAsync(async (req, res) => {
  const [stats] = await Review.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        five: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        four: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        three: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        two: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        one: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
      },
    },
  ]);

  const result = {
    avgRating: stats?.avgRating || 0,
    totalReviews: stats?.totalReviews || 0,
    breakdown: { 5: stats?.five || 0, 4: stats?.four || 0, 3: stats?.three || 0, 2: stats?.two || 0, 1: stats?.one || 0 },
  };
  new ApiResponse(200, result, 'Review stats fetched').send(res);
});

// Customer: their own reviews, regardless of moderation status
const getMyReviews = catchAsync(async (req, res) => {
  const customer = await Customer.findOne({ user: req.user._id });
  if (!customer) throw ApiError.notFound('Customer profile not found');
  const reviews = await Review.find({ customer: customer._id }).populate('tourPackage', 'name');
  new ApiResponse(200, reviews, 'Your reviews fetched').send(res);
});

// Admin: full moderation queue
const getAllForModeration = catchAsync(async (req, res) => {
  const features = new ApiFeatures(Review.find(), req.query).search(['text', 'title']).filter().sort().limitFields().paginate();
  const docs = await features.query
    .populate({ path: 'customer', populate: { path: 'user', select: 'fullName email' } })
    .populate('tourPackage', 'name');
  const meta = await features.getMeta(Review, {});
  new ApiResponse(200, docs, 'Reviews fetched', meta).send(res);
});

const moderate = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, moderationNote: req.body.moderationNote, moderatedBy: req.user._id },
    { new: true }
  );
  if (!review) throw ApiError.notFound('Review not found');
  await Review.recalculatePackageRating(review.tourPackage);
  new ApiResponse(200, review, `Review ${req.body.status}`).send(res);
});

const remove = catchAsync(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  await Review.recalculatePackageRating(review.tourPackage);
  new ApiResponse(200, null, 'Review deleted').send(res);
});

module.exports = { create, getApproved, getStats, getMyReviews, getAllForModeration, moderate, remove };
