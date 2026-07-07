const mongoose = require('mongoose');
const { resolveAlt, insightAlt } = require('../utils/altText');

const InsightSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [300, 'Title cannot be more than 300 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  readTime: {
    type: String,
    trim: true,
    maxlength: [20, 'Read time cannot be more than 20 characters']
  },
  image: {
    type: String,
    trim: true
  },
  imageAlt: {
    type: String,
    trim: true,
    maxlength: [200, 'Image alt text cannot be more than 200 characters']
  },
  heroImage: {
    type: String,
    trim: true
  },
  heroImageAlt: {
    type: String,
    trim: true,
    maxlength: [200, 'Hero image alt text cannot be more than 200 characters']
  },
  featured: {
    type: Boolean,
    default: false
  },
  author: {
    name: { type: String, trim: true, default: 'Waglogy Team' },
    role: { type: String, trim: true, default: 'Engineering' }
  },
  content: [{
    type: { type: String, enum: ['paragraph', 'heading'], default: 'paragraph' },
    text: { type: String, trim: true }
  }],
  relatedSlugs: [{
    type: String,
    trim: true
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Guaranteed alt text: explicit *Alt fields or generated SEO fallbacks
InsightSchema.virtual('imageAltText').get(function() {
  return resolveAlt(this.imageAlt, insightAlt(this, 'image'));
});

InsightSchema.virtual('heroImageAltText').get(function() {
  return resolveAlt(this.heroImageAlt, insightAlt(this, 'hero'));
});

// Auto-generate slug from title
InsightSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    if (!this.isNew) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }

  // Auto-calculate read time from content
  if (this.isModified('content') && this.content && this.content.length > 0) {
    const totalWords = this.content.reduce((sum, block) => {
      return sum + (block.text ? block.text.split(/\s+/).length : 0);
    }, 0);
    this.readTime = `${Math.max(1, Math.ceil(totalWords / 200))} min read`;
  }

  // Auto-generate excerpt from first paragraph if not provided
  if (this.isModified('content') && !this.excerpt && this.content && this.content.length > 0) {
    const firstParagraph = this.content.find(b => b.type === 'paragraph');
    if (firstParagraph && firstParagraph.text) {
      this.excerpt = firstParagraph.text.substring(0, 300) + (firstParagraph.text.length > 300 ? '...' : '');
    }
  }

  next();
});

InsightSchema.index({ slug: 1 });
InsightSchema.index({ isPublished: 1, priority: -1, date: -1 });
InsightSchema.index({ category: 1 });
InsightSchema.index({ featured: 1 });

module.exports = mongoose.model('Insight', InsightSchema);
