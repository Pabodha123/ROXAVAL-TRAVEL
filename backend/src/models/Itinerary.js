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
    // Per-occupancy breakdown + computed cost from the hotel picker. Additive
    // alongside roomType/numberOfRooms above (kept in sync by the frontend)
    // so existing consumers (hotel vouchers, PDFs) are unaffected.
    roomOccupancy: {
      single: { type: Number, default: 0 },
      double: { type: Number, default: 0 },
      triple: { type: Number, default: 0 },
      quad: { type: Number, default: 0 },
      extraBed: { type: Number, default: 0 },
      childWithBed: { type: Number, default: 0 },
      childNoBed: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },
    roomCost: { type: Number, default: 0 },
    // Backup/alternate hotel candidates for this day, kept visible rather than
    // overwritten when a different room is chosen. Exactly one has
    // `selected: true`, and that one is mirrored into hotel/roomType/
    // numberOfRooms/roomOccupancy/roomCost above so every existing reader
    // (hotel vouchers, PDFs) keeps working unmodified.
    hotelOptions: [
      {
        hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
        roomType: { type: String, default: '' },
        numberOfRooms: { type: Number, default: 1, min: 1 },
        roomOccupancy: {
          single: { type: Number, default: 0 },
          double: { type: Number, default: 0 },
          triple: { type: Number, default: 0 },
          quad: { type: Number, default: 0 },
          extraBed: { type: Number, default: 0 },
          childWithBed: { type: Number, default: 0 },
          childNoBed: { type: Number, default: 0 },
          infant: { type: Number, default: 0 },
        },
        roomCost: { type: Number, default: 0 },
        selected: { type: Boolean, default: false },
      },
    ],
    meals: { type: [String], enum: ['Breakfast', 'Lunch', 'Dinner'], default: [] },
    transport: { type: String, default: '' },
    // Per-traveler cost detail for the day's selected activities (mirrors
    // `activities` above, which stays the source of truth for display/PDF).
    // `selected: false` keeps an item visible as a backup option without
    // counting it toward dayCost.
    activityPricing: [
      {
        activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
        adultCount: { type: Number, default: 0 },
        childCount: { type: Number, default: 0 },
        infantCount: { type: Number, default: 0 },
        cost: { type: Number, default: 0 },
        selected: { type: Boolean, default: true },
      },
    ],
    transfers: [
      {
        transfer: { type: mongoose.Schema.Types.ObjectId, ref: 'Transfer' },
        withDriver: { type: Boolean, default: true },
        vehicleCount: { type: Number, default: 1, min: 1 },
        cost: { type: Number, default: 0 },
        selected: { type: Boolean, default: true },
      },
    ],
    // Manual per-day flight entries (no catalog — flights are always
    // one-off, so admins enter them directly rather than picking from a list).
    flights: [
      {
        airline: { type: String, default: '' },
        flightNumber: { type: String, default: '' },
        from: { type: String, default: '' },
        to: { type: String, default: '' },
        departureTime: { type: String, default: '' },
        arrivalTime: { type: String, default: '' },
        cost: { type: Number, default: 0 },
        selected: { type: Boolean, default: true },
      },
    ],
    // Sum of primary hotel roomCost + selected activity/transfer/flight costs.
    dayCost: { type: Number, default: 0 },
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
    tourGuide: { type: mongoose.Schema.Types.ObjectId, ref: 'TourGuide' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    pricing: {
      basePrice: Number,
      discount: Number,
      totalPrice: Number,
      currency: String,
      pricePerPerson: Boolean,
    },
    adminNotes: String,
    customerFacingNotes: String,
    visaRequirements: String,
    travelInsurance: String,
    cancellationPolicy: String,
    inclusions: String,
    exclusions: String,
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
    tourGuide: { type: mongoose.Schema.Types.ObjectId, ref: 'TourGuide' },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    pricing: {
      basePrice: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      pricePerPerson: { type: Boolean, default: true },
    },
    adminNotes: { type: String, default: '' },
    customerFacingNotes: { type: String, default: '' },
    visaRequirements: { type: String, default: '' },
    travelInsurance: { type: String, default: '' },
    cancellationPolicy: { type: String, default: '' },
    inclusions: { type: String, default: '' },
    exclusions: { type: String, default: '' },
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
