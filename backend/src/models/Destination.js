const mongoose = require('mongoose');
const slugify = require('slugify');

/**
 * A tourist attraction that belongs to a destination
 * (e.g. "Sigiriya Rock Fortress" attraction within "Sigiriya" destination).
 */
const attractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: { type: [String], default: [] },
    bestVisitingMonths: { type: [String], default: [] },
    estimatedVisitDuration: { type: String, default: '' }, // e.g. "2-3 hours"
    googleMapsLink: { type: String, default: '' },
    travelTips: { type: [String], default: [] },
    entryFee: { type: Number, default: 0 },
  },
  { timestamps: true, _id: true }
);

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Destination name is required'], trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    region: {
      type: String,
      enum: ['Cultural Triangle', 'Hill Country', 'Tea Country', 'Wildlife', 'South Coast', 'West Coast', 'North', 'East'],
    },
    // Short visitor-facing category — shown on capsule cards and used as the list-page filter facet.
    tag: {
      type: String,
      enum: ['Cultural', 'Wildlife', 'Beach', 'Hill Country', 'City', 'Nature', 'Adventure'],
      required: [true, 'Category is required'],
    },
    description: { type: String, required: true },
    heroImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    attractions: { type: [attractionSchema], default: [] }, // "Top Attractions" on the detail page
    history: { type: String, default: '' },
    whyVisit: { type: [String], default: [] },
    popularActivities: { type: [String], default: [] },
    bestTimeToVisit: { type: String, default: '' },
    openingHours: { type: String, default: '' }, // free text; not every destination has fixed hours
    entranceFee: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      notes: { type: String, default: '' },
    },
    travelTips: { type: [String], default: [] },
    nearbyDestinations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
    mapLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

destinationSchema.pre('save', function setSlug(next) {
  if (this.isModified('name')) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

destinationSchema.index({ name: 'text', description: 'text' });
destinationSchema.index({ status: 1, isFeatured: 1 });

module.exports = mongoose.model('Destination', destinationSchema);
