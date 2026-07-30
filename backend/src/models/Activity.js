const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * Standalone bookable experience (Wildlife Safari, Train Journey, etc.)
 * that can be linked to multiple destinations and included in packages
 * or customized itineraries.
 */
const activitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    gallery: { type: [String], default: [] },
    category: {
      type: String,
      enum: ['Adventure', 'Wildlife', 'Culture', 'Relaxation', 'Scenic', 'Water Sports', 'Nature'],
      default: 'Adventure',
    },
    durationHours: { type: Number, default: 2 },
    priceFrom: { type: Number, default: 0 },
    destinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    difficultyLevel: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Easy' },
    location: { type: String, trim: true, default: '' },
    bestSeason: { type: String, trim: true, default: '' },
    highlights: { type: [String], default: [] },
    thingsIncluded: { type: [String], default: [] },
    thingsToBring: { type: [String], default: [] },
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
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

activitySchema.index({ name: 'text', description: 'text' });
activitySchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Activity', activitySchema);
