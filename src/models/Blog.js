const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a blog title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide blog content']
  },
  contentType: {
    type: String,
    enum: ['html', 'markdown', 'text'],
    default: 'html'
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
  readTime: {
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

// Helper function to strip HTML tags for read time calculation
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Helper function to calculate read time (average 200 words per minute)
function calculateReadTime(content) {
  const text = stripHtml(content);
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

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
  
  // Calculate read time if content is modified
  if (this.isModified('content')) {
    this.readTime = calculateReadTime(this.content);
    
    // Auto-generate excerpt from content if not provided
    if (!this.excerpt) {
      const text = stripHtml(this.content);
      this.excerpt = text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }
  }
  
  next();
});

// Index for better search performance
BlogSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });
BlogSchema.index({ date: -1 });
BlogSchema.index({ isPublished: 1, date: -1 });

module.exports = mongoose.model('Blog', BlogSchema);

