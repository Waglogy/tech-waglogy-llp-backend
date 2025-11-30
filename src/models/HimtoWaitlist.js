const mongoose = require('mongoose');

const HimtoWaitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
HimtoWaitlistSchema.index({ email: 1 });
HimtoWaitlistSchema.index({ createdAt: -1 });

module.exports = mongoose.model('HimtoWaitlist', HimtoWaitlistSchema);

