const mongoose = require('mongoose');

/**
 * One voucher per consecutive same-hotel stay within a booking's itinerary
 * (see hotelVoucher.service.js#groupHotelStays). Denormalizes customer/tour/
 * hotel details at generation time so a voucher's content stays accurate
 * even if the source records change later — this is what makes keeping
 * `Superseded` rows around actually useful for auditing.
 */
const hotelVoucherSchema = new mongoose.Schema(
  {
    voucherNumber: { type: String, required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    sequence: { type: Number, required: true },

    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    roomType: { type: String, default: '' },
    numberOfRooms: { type: Number, default: 1, min: 1 },
    mealPlan: { type: String, enum: ['Room Only', 'BB', 'HB', 'FB', 'AI'], default: 'BB' },
    ratePerNight: { type: Number },
    totalAmount: { type: Number },
    specialRequests: { type: String, default: '' },
    arrivalTime: { type: String, default: '' },
    departureTime: { type: String, default: '' },

    // Snapshot fields captured at generation time
    customerName: { type: String, required: true },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    guests: {
      adults: { type: Number, default: 0 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },
    tourPackageName: { type: String, default: '' },
    tourStartDate: { type: Date },
    tourEndDate: { type: Date },
    tourReferenceNumber: { type: String, default: '' },
    bookingReference: { type: String, required: true },
    emergencyContact: { type: String, default: '' },
    hotelSnapshot: {
      name: { type: String, default: '' },
      address: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
      starRating: { type: Number, default: 0 },
    },

    status: { type: String, enum: ['Draft', 'Generated', 'Sent', 'Superseded'], default: 'Draft' },
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    sentToHotelAt: { type: Date },
    sentToCustomerAt: { type: Date },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

hotelVoucherSchema.index({ booking: 1, status: 1 });
// A voucher number (e.g. "HV-BK-260729-40BB-01") is reused across regenerations
// of the same stay — each regeneration supersedes the old row rather than
// deleting it, so history stays around for auditing. Uniqueness therefore
// only needs to hold among the *current* (non-superseded) vouchers.
hotelVoucherSchema.index({ voucherNumber: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'Superseded' } } });

module.exports = mongoose.model('HotelVoucher', hotelVoucherSchema);
