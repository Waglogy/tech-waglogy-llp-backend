const mongoose = require('mongoose');

const QuerySchema = new mongoose.Schema({
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded', 'closed'],
    default: 'new'
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
QuerySchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Query', QuerySchema);

