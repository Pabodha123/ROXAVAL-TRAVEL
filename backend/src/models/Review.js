const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    tourPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage' },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '' },
    text: { type: String, required: true },
    country: { type: String, default: '' },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    moderationNote: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reviewSchema.index({ status: 1, tourPackage: 1 });

// Recalculate the parent package's rating/reviewsCount whenever a review's
// approval status changes, keeping TourPackage.rating in sync.
reviewSchema.statics.recalculatePackageRating = async function recalculatePackageRating(tourPackageId) {
  if (!tourPackageId) return;
  const TourPackage = mongoose.model('TourPackage');
  const stats = await this.aggregate([
    { $match: { tourPackage: tourPackageId, status: 'approved' } },
    { $group: { _id: '$tourPackage', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await TourPackage.findByIdAndUpdate(tourPackageId, {
    rating: stats[0]?.avgRating || 0,
    reviewsCount: stats[0]?.count || 0,
  });
};

module.exports = mongoose.model('Review', reviewSchema);
