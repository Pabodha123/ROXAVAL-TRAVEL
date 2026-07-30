const mongoose = require('mongoose');
const slugify = require('slugify');
const { localizedString } = require('./shared/localizedField');

const blogSchema = new mongoose.Schema(
  {
    title: localizedString('Title is required'),
    slug: { type: String, unique: true, index: true },
    excerpt: localizedString('Excerpt is required'),
    content: localizedString('Content is required'),
    featuredImage: { type: String, required: true },
    gallery: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      keywords: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

blogSchema.pre('save', function setSlug(next) {
  if (this.isModified('title.en')) this.slug = `${slugify(this.title.en, { lower: true, strict: true })}-${Date.now().toString().slice(-4)}`;
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

blogSchema.index({ 'title.en': 'text', 'content.en': 'text', tags: 'text' });
blogSchema.index({ status: 1, category: 1 });

module.exports = mongoose.model('Blog', blogSchema);
