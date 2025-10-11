const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
    maxlength: [200, 'Company name cannot be more than 200 characters']
  },
  contactPerson: {
    type: String,
    required: [true, 'Please provide contact person name'],
    trim: true,
    maxlength: [100, 'Contact person name cannot be more than 100 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  service: {
    type: String,
    required: [true, 'Please provide service type'],
    trim: true,
    maxlength: [200, 'Service cannot be more than 200 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date'],
    default: Date.now
  },
  endDate: {
    type: Date
  },
  revenue: {
    type: Number,
    required: [true, 'Please provide revenue amount'],
    min: [0, 'Revenue cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['active', 'inactive', 'pending', 'completed', 'on-hold', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
ClientSchema.index({ company: 1 });
ClientSchema.index({ contactPerson: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ startDate: -1 });
ClientSchema.index({ revenue: -1 });

// Virtual for client duration
ClientSchema.virtual('duration').get(function() {
  if (this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return Math.ceil((Date.now() - this.startDate) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
ClientSchema.set('toJSON', { virtuals: true });
ClientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Client', ClientSchema);

