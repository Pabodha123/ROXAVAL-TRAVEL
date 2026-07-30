const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    date: { type: Date },
    title: { type: String, required: true },
    schedule: { type: String, required: true }, // free-text daily schedule/description
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    customDestinations: { type: [String], default: [] },
    customActivities: { type: [String], default: [] },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    roomType: { type: String, default: '' },
    numberOfRooms: { type: Number, default: 1, min: 1 },
    tourGuide: { type: mongoose.Schema.Types.ObjectId, ref: 'TourGuide' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    meals: { type: [String], enum: ['Breakfast', 'Lunch', 'Dinner'], default: [] },
    transport: { type: String, default: '' },
    arrivalTime: { type: String, default: '' },
    departureTime: { type: String, default: '' },
    travelTime: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

// Read-only snapshot of a prior itinerary version, kept whenever the admin
// revises an already-sent itinerary — gives customers/admins a full audit
// trail (spec requires previous versions to remain inspectable).
const itineraryVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    title: String,
    summary: String,
    days: { type: [itineraryDaySchema], default: [] },
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    pricing: {
      basePrice: Number,
      discount: Number,
      totalPrice: Number,
      currency: String,
      pricePerPerson: Boolean,
    },
    adminNotes: String,
    customerFacingNotes: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

/**
 * A personalized itinerary built by an admin in response to a
 * CustomTourRequest. Once the customer accepts it, a Booking is created
 * from this document.
 */
const itinerarySchema = new mongoose.Schema(
  {
    customTourRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomTourRequest', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    title: { type: String, required: true },
    summary: { type: String, default: '' },
    days: { type: [itineraryDaySchema], default: [] },
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    pricing: {
      basePrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      pricePerPerson: { type: Boolean, default: true },
    },
    adminNotes: { type: String, default: '' },
    customerFacingNotes: { type: String, default: '' },
    version: { type: Number, default: 1 },
    versionHistory: { type: [itineraryVersionSchema], default: [] },
    status: {
      type: String,
      enum: ['Draft', 'Sent', 'Changes Requested', 'Accepted', 'Rejected'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

itinerarySchema.index({ customTourRequest: 1 });
itinerarySchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
