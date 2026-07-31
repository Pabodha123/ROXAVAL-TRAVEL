const mongoose = require('mongoose');

/**
 * One record per customer per birthday year — both the daily scheduler and
 * an admin's manual "Resend" write here. The unique (customer, year) index
 * is what makes the daily cron idempotent: re-running it the same day (or a
 * retried invocation) never double-sends, while "Resend" explicitly bumps
 * `resendCount` instead of creating a duplicate row.
 */
const birthdayLogSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    year: { type: Number, required: true },
    emailTo: { type: String, required: true },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    method: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    couponCode: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    resendCount: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

birthdayLogSchema.index({ customer: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('BirthdayLog', birthdayLogSchema);
