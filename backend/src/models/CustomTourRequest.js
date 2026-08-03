const mongoose = require('mongoose');
const generateReference = require('../utils/generateReference');

const aiItineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: { type: String, required: true },
    schedule: { type: String, required: true },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    meals: { type: [String], enum: ['Breakfast', 'Lunch', 'Dinner'], default: [] },
  },
  { _id: false }
);

/**
 * Captures the customer's multi-step customized-tour inquiry. The admin
 * turns an approved request into an Itinerary (see Itinerary.js), and the
 * two-way accept / request-changes loop is tracked via `status` +
 * `revisionHistory`.
 */
const customTourRequestSchema = new mongoose.Schema(
  {
    referenceNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    // Step 1: Travel details
    travelDates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      isFlexible: { type: Boolean, default: false },
    },
    travelers: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0 },
      infants: { type: Number, default: 0 },
    },

    // Step 2: Preferences
    preferredDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    preferredActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    // Free-text entries for places/experiences not yet in the system
    customDestinations: { type: [String], default: [] },
    customActivities: { type: [String], default: [] },
    hotelCategory: {
      type: String,
      enum: ['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort'],
      default: 'Standard',
    },
    mealPreferences: {
      type: [String],
      enum: ['Breakfast Only', 'Half Board', 'Full Board', 'All Inclusive', 'Vegetarian', 'Vegan', 'Halal', 'No Preference'],
      default: ['No Preference'],
    },
    travelStyle: {
      type: String,
      enum: ['Relaxed', 'Adventure', 'Cultural', 'Luxury', 'Family', 'Honeymoon', 'Backpacking'],
      default: 'Relaxed',
    },
    transportPreference: {
      type: String,
      enum: ['Private Car', 'Van', 'SUV', 'Minibus', 'No Preference'],
      default: 'No Preference',
    },
    roomTypePreference: { type: String, default: '' },
    guideRequired: { type: Boolean, default: false },

    // Step 3: Budget & requests
    estimatedBudget: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      perPerson: { type: Boolean, default: true },
    },
    specialRequests: { type: String, default: '' },

    // AI-drafted itinerary the customer reviewed before submitting (read-only snapshot,
    // kept alongside the admin's finalized `itinerary` so the two can be compared later).
    aiGeneratedItinerary: {
      summary: { type: String, default: '' },
      days: { type: [aiItineraryDaySchema], default: [] },
      estimatedTotal: { type: Number },
      currency: { type: String, default: 'USD' },
      generatedAt: { type: Date },
    },

    // Workflow
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Awaiting Customer Approval', 'Approved', 'Rejected', 'Booking Confirmed'],
      default: 'Pending',
    },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    itinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
    revisionHistory: [
      {
        action: { type: String, enum: ['submitted', 'itinerary_sent', 'changes_requested', 'approved', 'rejected', 'cannot_modify'] },
        note: { type: String, default: '' },
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

customTourRequestSchema.pre('validate', function setReference(next) {
  if (!this.referenceNumber) this.referenceNumber = generateReference('CTR');
  next();
});

customTourRequestSchema.index({ status: 1, createdAt: -1 });
customTourRequestSchema.index({ customer: 1 });

module.exports = mongoose.model('CustomTourRequest', customTourRequestSchema);
