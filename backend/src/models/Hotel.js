const mongoose = require('mongoose');
const slugify = require('slugify');
const { localizedString, localizedStringArray } = require('./shared/localizedField');

const roomTypeSchema = new mongoose.Schema(
  {
    name: localizedString('Room type name is required'), // e.g. "Deluxe Double"
    maxOccupancy: { type: Number, default: 2 },
    pricePerNight: { type: Number, required: true },
    mealPlan: {
      type: String,
      enum: ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive'],
      default: 'Bed & Breakfast',
    },
    // Per-occupancy nightly rates used by the itinerary builder's hotel picker.
    pricing: {
      single: { type: Number, default: 0 },
      double: { type: Number, default: 0 },
      triple: { type: Number, default: 0 },
      quad: { type: Number, default: 0 },
      extraBed: { type: Number, default: 0 },
      childWithBed: { type: Number, default: 0 },
      childNoBed: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },
    amenities: localizedStringArray(),
  },
  { _id: true }
);

const hotelSchema = new mongoose.Schema(
  {
    name: localizedString('Hotel name is required'),
    slug: { type: String, unique: true, index: true },
    category: {
      type: String,
      enum: ['Budget', 'Standard', 'Deluxe', 'Boutique', 'Luxury', 'Resort'],
      default: 'Standard',
    },
    starRating: { type: Number, min: 1, max: 5, default: 3 },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
    address: localizedString('Address is required'),
    description: localizedString('Description is required'),
    images: { type: [String], default: [] },
    amenities: localizedStringArray(),
    roomTypes: { type: [roomTypeSchema], default: [] },
    contactPerson: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    isPartner: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    averageRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

hotelSchema.pre('save', function setSlug(next) {
  if (this.isModified('name.en')) this.slug = `${slugify(this.name.en, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  next();
});

hotelSchema.index({ 'name.en': 'text', 'description.en': 'text' });
hotelSchema.index({ destination: 1, status: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);
