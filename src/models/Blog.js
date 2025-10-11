const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide blog description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
    default: Date.now
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  author: {
    type: String,
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters']
  },
  image: {
    type: String,
    trim: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create slug from title before saving
BlogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
    
    // Add timestamp to ensure uniqueness
    if (!this.isNew) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});

// Index for better search performance
BlogSchema.index({ title: 'text', description: 'text', tags: 'text' });
BlogSchema.index({ date: -1 });
BlogSchema.index({ isPublished: 1, date: -1 });

module.exports = mongoose.model('Blog', BlogSchema);

