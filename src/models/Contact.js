const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide your phone number'],
    trim: true,
    match: [
      /^[\d\s\+\-\(\)]+$/,
      'Please provide a valid phone number'
    ]
  },
  organizationName: {
    type: String,
    required: [true, 'Please provide your organization name'],
    trim: true,
    maxlength: [200, 'Organization name cannot be more than 200 characters']
  },
  budgetRange: {
    type: String,
    required: [true, 'Please select a budget range'],
    enum: {
      values: [
        'Less than $5,000',
        '$5,000 - $10,000',
        '$10,000 - $25,000',
        '$25,000 - $50,000',
        '$50,000 - $100,000',
        'More than $100,000'
      ],
      message: 'Please select a valid budget range'
    }
  },
  projectDetails: {
    type: String,
    required: [true, 'Please provide project details'],
    trim: true,
    maxlength: [2000, 'Project details cannot be more than 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'contacted', 'qualified', 'closed'],
    default: 'new'
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for faster queries
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });

module.exports = mongoose.model('Contact', ContactSchema);

