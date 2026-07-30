const mongoose = require('mongoose');

/**
 * Stores a snapshot of a generated analytics report (e.g. a monthly
 * revenue report exported by an admin) so it can be revisited later
 * without recomputation. Live dashboard stats are computed on demand by
 * reportService and are NOT stored here.
 */
const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['revenue', 'bookings', 'customers', 'destinations', 'packages', 'custom'],
      required: true,
    },
    period: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    fileUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
