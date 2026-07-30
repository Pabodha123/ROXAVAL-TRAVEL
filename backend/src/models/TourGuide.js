const mongoose = require('mongoose');
const slugify = require('slugify');

const tourGuideSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Guide name is required'], trim: true },
    slug: { type: String, unique: true, index: true },
    photo: { type: String, default: '' },
    languages: { type: [String], default: [] },
    specialties: { type: [String], default: [] },
    yearsExperience: { type: Number, default: 0 },
    bio: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    pricePerDay: { type: Number, required: [true, 'Price per day is required'] },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

tourGuideSchema.pre('save', function setSlug(next) {
  if (this.isModified('name')) this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  next();
});

tourGuideSchema.index({ name: 'text', bio: 'text' });
tourGuideSchema.index({ status: 1 });

module.exports = mongoose.model('TourGuide', tourGuideSchema);
