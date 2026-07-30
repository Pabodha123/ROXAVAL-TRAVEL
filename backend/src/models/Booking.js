const mongoose = require('mongoose');
const generateReference = require('../utils/generateReference');

/**
 * Unified booking record. `sourceType` distinguishes whether the booking
 * originated from a standard published TourPackage or an approved
 * customized Itinerary; exactly one of `tourPackage` / `itinerary` is set.
 */
const bookingSchema = new mongoose.Schema(
  {
    bookingReference: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    sourceType: { type: String, enum: ['package', 'customized'], required: true },
    tourPackage: { type: mongoose.Schema.Types.ObjectId, ref: 'TourPackage' },
    itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },

    travelDate: { type: Date, required: true },
    returnDate: { type: Date },
    travelers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true },
      advanceAmount: { type: Number, required: true },
      balanceAmount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
    },

    status: {
      type: String,
      enum: [
        'Pending',
        'Awaiting Approval',
        'Approved',
        'Payment Pending',
        'Payment Verification',
        'Confirmed',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },

    specialRequests: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    statusHistory: [
      {
        status: { type: String },
        note: { type: String, default: '' },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function setReference(next) {
  if (!this.bookingReference) this.bookingReference = generateReference('BK');
  next();
});

bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ status: 1, travelDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
