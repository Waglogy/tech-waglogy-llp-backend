const mongoose = require('mongoose');

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
  color: {
    type: String,
    enum: ['primary', 'accent'],
    default: 'primary'
  },
  heroImage: {
    type: String,
    trim: true
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
  timestamps: true
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
