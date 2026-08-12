const mongoose = require('mongoose');
const slugify = require('slugify');
const { localizedString, localizedStringSchema } = require('./shared/localizedField');

// Optional magazine-style breakdown of a post into numbered, illustrated
// sections (e.g. "1. Minneriya", "2. Pinnawala") — additive to `content`,
// which stays as the plain-paragraph fallback for posts that don't use it
// and for search indexing. When present, the frontend renders these
// instead of the flat `content` paragraphs.
const blogSectionSchema = new mongoose.Schema(
  {
    heading: localizedStringSchema,
    body: localizedStringSchema,
    image: { type: String, default: '' },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: localizedString('Title is required'),
    slug: { type: String, unique: true, index: true },
    excerpt: localizedString('Excerpt is required'),
    content: localizedString('Content is required'),
    sections: { type: [blogSectionSchema], default: [] },
    // Which sectioned layout to render — 'default' is the numbered magazine
    // grid; 'romantic' is a softer, full-bleed editorial layout for
    // honeymoon/romance-themed posts. Purely a rendering switch, doesn't
    // change how content/sections are authored or stored.
    template: { type: String, enum: ['default', 'romantic'], default: 'default' },
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
