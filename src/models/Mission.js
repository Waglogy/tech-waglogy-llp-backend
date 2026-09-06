const mongoose = require('mongoose');

/**
 * A Mission — an internal project you are actively delivering. Unlike the
 * public-facing `Project` (portfolio/showcase), a Mission is a private
 * work-tracker: it owns a set of Tasks and carries the status, priority and
 * deadline you use to see, at a glance, what needs doing across everything.
 */
const MissionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a mission name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  // Free-text client name — consistent with the Projects/Finance modules
  // (not linked to a Client `_id`).
  client: {
    type: String,
    trim: true,
    maxlength: [100, 'Client cannot be more than 100 characters']
  },

  status: {
    type: String,
    enum: {
      values: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  // Project-level importance. P0 = drop everything … P3 = whenever.
  priority: {
    type: String,
    enum: {
      values: ['P0', 'P1', 'P2', 'P3'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'P2'
  },
  // Visual grouping colour for the dashboard cards.
  color: {
    type: String,
    enum: {
      values: ['primary', 'accent', 'neutral'],
      message: '{VALUE} is not a valid color'
    },
    default: 'primary'
  },

  startDate: {
    type: Date
  },
  deadline: {
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

MissionSchema.index({ status: 1, deadline: 1 });
MissionSchema.index({ name: 1 });

module.exports = mongoose.model('Mission', MissionSchema);
