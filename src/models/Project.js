const mongoose = require('mongoose');
const { resolveAlt, projectAlt } = require('../utils/altText');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  tag: {
    type: String,
    required: [true, 'Please provide a project tag (e.g. E-Commerce, SaaS)'],
    trim: true,
    maxlength: [50, 'Tag cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a short description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  metric: {
    type: String,
    trim: true,
    maxlength: [20, 'Metric cannot be more than 20 characters']
  },
  metricLabel: {
    type: String,
    trim: true,
    maxlength: [50, 'Metric label cannot be more than 50 characters']
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
  color: {
    type: String,
    enum: ['primary', 'accent'],
    default: 'primary'
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
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  timeline: {
    type: String,
    trim: true,
    maxlength: [50, 'Timeline cannot be more than 50 characters']
  },
  year: {
    type: String,
    trim: true,
    maxlength: [10, 'Year cannot be more than 10 characters']
  },
  services: [{
    type: String,
    trim: true
  }],
  liveUrl: {
    type: String,
    trim: true
  },
  overview: {
    type: String,
    trim: true
  },
  challenge: {
    type: String,
    trim: true
  },
  solution: {
    type: String,
    trim: true
  },
  results: [{
    metric: { type: String, trim: true },
    label: { type: String, trim: true }
  }],
  techStack: [{
    type: String,
    trim: true
  }],
  testimonial: {
    quote: { type: String, trim: true },
    author: { type: String, trim: true },
    role: { type: String, trim: true }
  },
  galleryImages: [{
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
ProjectSchema.virtual('imageAltText').get(function() {
  return resolveAlt(this.imageAlt, projectAlt(this, 'image'));
});

ProjectSchema.virtual('heroImageAltText').get(function() {
  return resolveAlt(this.heroImageAlt, projectAlt(this, 'hero'));
});

// Gallery images paired with generated alt text: [{ url, alt }, ...]
ProjectSchema.virtual('galleryImagesWithAlt').get(function() {
  const gallery = Array.isArray(this.galleryImages) ? this.galleryImages : [];
  return gallery.map((url, i) => ({
    url,
    alt: `${projectAlt(this, 'image')} — screenshot ${i + 1}`
  }));
});

// Create slug from title before saving
ProjectSchema.pre('save', function(next) {
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
  next();
});

ProjectSchema.index({ slug: 1 });
ProjectSchema.index({ isPublished: 1, priority: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
