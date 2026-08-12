const mongoose = require('mongoose');

/**
 * One record per customer per birthday year per channel — both the daily
 * scheduler (email only) and an admin's manual "Resend"/"Send via WhatsApp"
 * write here. The unique (customer, year, channel) index is what makes the
 * daily cron idempotent: re-running it the same day (or a retried
 * invocation) never double-sends, while "Resend" explicitly bumps
 * `resendCount` instead of creating a duplicate row. Email and WhatsApp are
 * tracked as separate rows for the same customer/year since they're sent
 * independently (WhatsApp always needs an admin to click "Send").
 */
const birthdayLogSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    year: { type: Number, required: true },
    channel: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
    emailTo: { type: String, default: '' },
    whatsappTo: { type: String, default: '' },
    status: { type: String, enum: ['sent', 'failed'], required: true },
    method: { type: String, enum: ['auto', 'manual'], default: 'auto' },
    couponCode: { type: String, default: '' },
    errorMessage: { type: String, default: '' },
    resendCount: { type: Number, default: 0 },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

birthdayLogSchema.index({ customer: 1, year: 1, channel: 1 }, { unique: true });

module.exports = mongoose.model('BirthdayLog', birthdayLogSchema);
