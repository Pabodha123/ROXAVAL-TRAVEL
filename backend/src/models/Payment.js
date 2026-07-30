const mongoose = require('mongoose');
const generateReference = require('../utils/generateReference');

/**
 * Flexible payment record. `method` determines which sub-fields are
 * relevant. Card gateway integration is future-ready via `gatewayRef` /
 * `gatewayResponse` without requiring a schema change later.
 */
const paymentSchema = new mongoose.Schema(
  {
    paymentReference: { type: String, unique: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'whatsapp', 'cash'],
      required: true,
    },
    paymentType: { type: String, enum: ['advance', 'balance', 'full'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },

    // Bank transfer / manual verification
    receiptUrl: { type: String, default: '' },
    bankReference: { type: String, default: '' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verifiedAt: { type: Date },
    verificationNote: { type: String, default: '' },

    // Card gateway (future-ready)
    gatewayProvider: { type: String, default: '' }, // e.g. 'stripe', 'payhere'
    gatewayRef: { type: String, default: '' },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },

    // WhatsApp
    whatsappLinkSentAt: { type: Date },

    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Verified', 'Rejected', 'Refunded'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

paymentSchema.pre('validate', function setReference(next) {
  if (!this.paymentReference) this.paymentReference = generateReference('PAY');
  next();
});

paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
