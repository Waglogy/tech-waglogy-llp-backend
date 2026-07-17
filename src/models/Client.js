const mongoose = require('mongoose');

/**
 * A registered domain the client owns/manages through us.
 * expiresOn drives renewal reminders.
 */
const DomainSchema = new mongoose.Schema({
  name: { type: String, trim: true, maxlength: 253 },      // example.com
  registrar: { type: String, trim: true, maxlength: 100 }, // GoDaddy, Namecheap...
  registeredOn: { type: Date },
  expiresOn: { type: Date },
  autoRenew: { type: Boolean, default: false }
}, { _id: true });

/**
 * A hosting/infrastructure subscription for the client.
 */
const HostingSchema = new mongoose.Schema({
  provider: { type: String, trim: true, maxlength: 100 },  // AWS, Hostinger, Vercel...
  plan: { type: String, trim: true, maxlength: 100 },
  startedOn: { type: Date },
  expiresOn: { type: Date },
  autoRenew: { type: Boolean, default: false }
}, { _id: true });

const ClientSchema = new mongoose.Schema({
  // --- Identity ---
  name: {
    type: String,
    required: [true, 'Please provide the client / company name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  contactPerson: {
    type: String,
    trim: true,
    maxlength: [100, 'Contact person cannot be more than 100 characters']
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
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters']
  },

  // --- Engagement ---
  // Services can be chosen from our preset list or added as custom strings.
  services: {
    type: [String],
    default: []
  },
  projectName: {
    type: String,
    trim: true,
    maxlength: [200, 'Project name cannot be more than 200 characters']
  },
  projectDetails: {
    type: String,
    trim: true,
    maxlength: [3000, 'Project details cannot be more than 3000 characters']
  },

  // --- Assets we manage (renewal tracking) ---
  domains: { type: [DomainSchema], default: [] },
  hosting: { type: [HostingSchema], default: [] },

  // --- Commercials ---
  revenue: {
    type: Number,
    min: [0, 'Revenue cannot be negative'],
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },

  // --- Status & meta ---
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'pending', 'completed', 'on-hold', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
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

ClientSchema.index({ name: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ startDate: -1 });
ClientSchema.index({ 'domains.expiresOn': 1 });
ClientSchema.index({ 'hosting.expiresOn': 1 });

// The soonest upcoming expiry across all domains + hosting (or null).
ClientSchema.virtual('nextRenewal').get(function() {
  const dates = [];
  (this.domains || []).forEach((d) => { if (d.expiresOn) dates.push(new Date(d.expiresOn)); });
  (this.hosting || []).forEach((h) => { if (h.expiresOn) dates.push(new Date(h.expiresOn)); });
  const sorted = dates.sort((a, b) => a - b);
  return sorted.length ? sorted[0] : null;
});

module.exports = mongoose.model('Client', ClientSchema);
