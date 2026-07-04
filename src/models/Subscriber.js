const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  source: {
    type: String,
    trim: true,
    default: 'website'
  },
  status: {
    type: String,
    enum: ['subscribed', 'unsubscribed'],
    default: 'subscribed'
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

SubscriberSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Subscriber', SubscriberSchema);
