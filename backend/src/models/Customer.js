const mongoose = require('mongoose');

/**
 * Extended profile information for customer accounts, referencing the
 * base User document for auth. Keeps 'My Tours' related preferences.
 */
const customerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    country: { type: String, trim: true },
    dateOfBirth: { type: Date },
    passportNumber: { type: String, trim: true },
    preferredLanguage: { type: String, default: 'English' },
    address: { type: String, trim: true },
    marketingOptIn: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    loyaltyPoints: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
    totalSpend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

customerSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
