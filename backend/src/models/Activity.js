const mongoose = require('mongoose');
const slugify = require('slugify');
const { localizedString, localizedStringArray } = require('./shared/localizedField');

/**
 * Standalone bookable experience (Wildlife Safari, Train Journey, etc.)
 * that can be linked to multiple destinations and included in packages
 * or customized itineraries.
 */
const activitySchema = new mongoose.Schema(
  {
    name: localizedString('Activity name is required'),
    slug: { type: String, unique: true, index: true },
    description: localizedString('Description is required'),
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    category: {
      type: String,
      enum: ['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature'],
      default: 'Adventure',
    },
    durationHours: { type: Number, default: 2 },
    priceFrom: { type: Number, default: 0 },
    // Per-traveler pricing used by the itinerary builder's sightseeing picker.
    pricing: {
      adult: { type: Number, default: 0 },
      child: { type: Number, default: 0 },
      infant: { type: Number, default: 0 },
    },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    difficultyLevel: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Easy' },
    location: localizedString(),
    bestSeason: localizedString(),
    highlights: localizedStringArray(),
    thingsIncluded: localizedStringArray(),
    thingsToBring: localizedStringArray(),
    mapLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  },
  { timestamps: true }
);

activitySchema.pre('save', function setSlug(next) {
  if (this.isModified('name.en')) this.slug = slugify(this.name.en, { lower: true, strict: true });
  next();
});

activitySchema.index({ 'name.en': 1 }, { unique: true });
activitySchema.index({ 'name.en': 'text', 'description.en': 'text' });
activitySchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Activity', activitySchema);
