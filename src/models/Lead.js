const mongoose = require('mongoose');

/**
 * A sales lead — a potential client moving through the pipeline until it is
 * either won (and converted into a Client) or lost.
 */
const LeadSchema = new mongoose.Schema({
  // --- Who ---
  name: {
    type: String,
    required: [true, 'Please provide the lead / contact name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Company cannot be more than 200 characters']
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

  // --- Where it came from & what they want ---
  source: {
    type: String,
    enum: {
      values: ['website', 'referral', 'social', 'cold-outreach', 'ad', 'event', 'other'],
      message: '{VALUE} is not a valid source'
    },
    default: 'website'
  },
  service: {
    type: String,
    trim: true,
    maxlength: [200, 'Service cannot be more than 200 characters']
  },

  // --- Commercials & prioritisation ---
  value: {
    type: Number,
    min: [0, 'Value cannot be negative'],
    default: 0
  },
  priority: {
    type: String,
    enum: {
      values: ['hot', 'warm', 'cold'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'warm'
  },

  // --- Pipeline ---
  status: {
    type: String,
    enum: {
      values: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'on-hold'],
      message: '{VALUE} is not a valid status'
    },
    default: 'new'
  },

  // --- Ownership & follow-up ---
  assignedTo: {
    type: String,
    trim: true,
    maxlength: [100, 'Assigned-to cannot be more than 100 characters']
  },
  nextFollowUpDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },

  // --- Conversion link (set when a won lead becomes a Client) ---
  convertedClientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  convertedAt: {
    type: Date
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

LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ name: 1 });
LeadSchema.index({ email: 1 });
LeadSchema.index({ nextFollowUpDate: 1 });

// Whether this lead has already been converted into a Client.
LeadSchema.virtual('isConverted').get(function() {
  return !!this.convertedClientId;
});

module.exports = mongoose.model('Lead', LeadSchema);
