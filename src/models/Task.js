const mongoose = require('mongoose');

/**
 * A Task belonging to a Mission. Carries its own status and P0–P3 importance,
 * plus an optional due date. `completedAt` is stamped automatically whenever
 * the task moves to `done` (and cleared if it moves back), so progress and
 * velocity can be derived without extra bookkeeping.
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [300, 'Title cannot be more than 300 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mission',
    required: [true, 'A task must belong to a mission'],
    index: true
  },

  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'blocked', 'done'],
      message: '{VALUE} is not a valid status'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['P0', 'P1', 'P2', 'P3'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'P2'
  },
  dueDate: {
    type: Date
  },
  // Manual sort position within a mission.
  order: {
    type: Number,
    default: 0
  },
  completedAt: {
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

TaskSchema.index({ mission: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });

// Keep `completedAt` in sync with the `done` status on direct saves.
TaskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = undefined;
    }
  }
  next();
});

// Same sync for findOneAndUpdate / findByIdAndUpdate paths.
TaskSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  const status = update.status || (update.$set && update.$set.status);
  if (status === undefined) return next();

  if (status === 'done') {
    this.set({ completedAt: new Date() });
  } else {
    this.set({ completedAt: null });
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
