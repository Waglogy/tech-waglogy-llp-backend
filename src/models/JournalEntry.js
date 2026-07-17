const mongoose = require('mongoose');

/**
 * A single posting line inside a journal entry.
 * Each line hits exactly one account with either a debit OR a credit.
 * Account code/name/type are denormalised so historical entries stay
 * readable even if the account is later renamed.
 */
const LineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  code: { type: String, trim: true },
  name: { type: String, trim: true },
  type: {
    type: String,
    enum: ['asset', 'liability', 'equity', 'income', 'expense']
  },
  debit: {
    type: Number,
    default: 0,
    min: [0, 'Debit cannot be negative']
  },
  credit: {
    type: Number,
    default: 0,
    min: [0, 'Credit cannot be negative']
  }
}, { _id: false });

/**
 * JournalEntry = one balanced double-entry transaction.
 * Total debits must equal total credits, with at least two lines.
 */
const JournalEntrySchema = new mongoose.Schema({
  entryNo: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  reference: {
    type: String,
    trim: true,
    maxlength: [100, 'Reference cannot be more than 100 characters']
  },
  // Who money was received from / paid to (free text for v1).
  party: {
    name: { type: String, trim: true, maxlength: 150 },
    type: {
      type: String,
      enum: ['client', 'vendor', 'employee', 'other'],
      default: 'other'
    }
  },
  // How the entry originated.
  source: {
    type: String,
    enum: ['payment', 'manual', 'opening'],
    default: 'manual'
  },
  // Cash flow direction for payment-sourced entries.
  direction: {
    type: String,
    enum: ['in', 'out']
  },
  method: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'stripe', 'other']
  },
  lines: {
    type: [LineSchema],
    validate: {
      validator: (lines) => Array.isArray(lines) && lines.length >= 2,
      message: 'A journal entry needs at least two lines'
    }
  },
  totalDebit: { type: Number, default: 0 },
  totalCredit: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['posted', 'void'],
    default: 'posted'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

JournalEntrySchema.index({ entryNo: 1 }, { unique: true });
JournalEntrySchema.index({ date: -1 });
JournalEntrySchema.index({ source: 1 });
JournalEntrySchema.index({ direction: 1 });
JournalEntrySchema.index({ status: 1 });
JournalEntrySchema.index({ 'lines.account': 1 });

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// Generate the next entry number, e.g. JE-2025-0001.
JournalEntrySchema.statics.generateEntryNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `JE-${currentYear}-`;

  const last = await this.findOne({ entryNo: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });

  let next = 1;
  if (last && last.entryNo) {
    const lastNumber = parseInt(last.entryNo.split('-').pop(), 10);
    if (!isNaN(lastNumber)) next = lastNumber + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
};

// Recompute totals and enforce the fundamental double-entry rule.
JournalEntrySchema.pre('validate', function(next) {
  if (Array.isArray(this.lines)) {
    this.lines.forEach((l) => {
      l.debit = round2(l.debit);
      l.credit = round2(l.credit);
    });
    this.totalDebit = round2(this.lines.reduce((s, l) => s + (l.debit || 0), 0));
    this.totalCredit = round2(this.lines.reduce((s, l) => s + (l.credit || 0), 0));

    if (this.totalDebit !== this.totalCredit) {
      return next(new Error(`Entry is not balanced: debits (${this.totalDebit}) must equal credits (${this.totalCredit})`));
    }
    if (this.totalDebit === 0) {
      return next(new Error('Entry total cannot be zero'));
    }
  }
  next();
});

// Assign an entry number on first save.
JournalEntrySchema.pre('save', async function(next) {
  if (this.isNew && !this.entryNo) {
    try {
      this.entryNo = await this.constructor.generateEntryNumber();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
