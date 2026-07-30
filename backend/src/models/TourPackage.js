const mongoose = require('mongoose');
const slugify = require('slugify');
const { localizedString, localizedStringArray } = require('./shared/localizedField');

const itineraryDaySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    title: localizedString('Day title is required'),
    description: localizedString('Day description is required'),
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    meals: { type: [String], enum: ['Breakfast', 'Lunch', 'Dinner'], default: [] },
  },
  { _id: false }
);

const tourPackageSchema = new mongoose.Schema(
  {
    name: localizedString('Package name is required'),
    slug: { type: String, unique: true, index: true },
    category: {
      type: String,
      enum: ['Best Seller', 'Scenic', 'Adventure', 'Relax', 'Luxury', 'Signature', 'Honeymoon', 'Family', 'Wildlife'],
      default: 'Best Seller',
    },
    tourType: { type: String, enum: ['Private', 'Group'], default: 'Private' },
    heroImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
    hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
    durationDays: { type: Number, required: true },
    durationNights: { type: Number, required: true },
    itinerary: { type: [itineraryDaySchema], default: [] },
    includedServices: localizedStringArray(),
    excludedServices: localizedStringArray(),
    description: localizedString('Description is required'),
    highlights: localizedStringArray(),
    price: { type: Number, required: [true, 'Price is required'] },
    discountPrice: { type: Number },
    currency: { type: String, default: 'USD' },
    minTravelers: { type: Number, default: 1 },
    maxTravelers: { type: Number, default: 20 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
    },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

tourPackageSchema.pre('save', function setSlug(next) {
  if (this.isModified('name.en')) this.slug = `${slugify(this.name.en, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  next();
});

tourPackageSchema.index({ 'name.en': 'text', 'description.en': 'text' });
tourPackageSchema.index({ status: 1, isFeatured: 1, category: 1 });

module.exports = mongoose.model('TourPackage', tourPackageSchema);
