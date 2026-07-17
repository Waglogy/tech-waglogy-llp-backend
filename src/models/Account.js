const mongoose = require('mongoose');

/**
 * Account = a single line in the Chart of Accounts.
 * Every journal entry line posts a debit or credit against one of these.
 *
 * Accounting types and their "normal" (increasing) balance side:
 *   asset      -> debit
 *   expense    -> debit
 *   liability  -> credit
 *   equity     -> credit
 *   income     -> credit
 */
const AccountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide an account code'],
    trim: true,
    maxlength: [20, 'Account code cannot be more than 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Please provide an account name'],
    trim: true,
    maxlength: [100, 'Account name cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide an account type'],
    enum: {
      values: ['asset', 'liability', 'equity', 'income', 'expense'],
      message: '{VALUE} is not a valid account type'
    }
  },
  // Auto-derived from `type` in a pre-validate hook.
  normalBalance: {
    type: String,
    enum: ['debit', 'credit']
  },
  // Optional grouping: cash, bank, receivable, payable, tax, ...
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot be more than 50 characters']
  },
  // Cash/bank accounts that money physically flows through. Shown in the
  // "From / To account" dropdown of the simple payment form.
  isPaymentAccount: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot be more than 300 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Seeded default accounts — protected from deletion.
  isSystem: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

AccountSchema.index({ code: 1 }, { unique: true });
AccountSchema.index({ type: 1 });
AccountSchema.index({ isActive: 1 });

// Map an account type to the side that increases its balance.
AccountSchema.statics.normalBalanceFor = function(type) {
  return type === 'asset' || type === 'expense' ? 'debit' : 'credit';
};

// Keep normalBalance consistent with type.
AccountSchema.pre('validate', function(next) {
  if (this.type) {
    this.normalBalance = this.constructor.normalBalanceFor(this.type);
  }
  next();
});

module.exports = mongoose.model('Account', AccountSchema);
