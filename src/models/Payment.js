const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    trim: true
  },
  client: {
    type: String,
    required: [true, 'Please provide client name'],
    trim: true,
    maxlength: [100, 'Client name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide payment description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide amount'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    required: [true, 'Please provide payment method'],
    enum: {
      values: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'stripe', 'other'],
      message: '{VALUE} is not a valid payment method'
    }
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for faster queries
PaymentSchema.index({ invoiceNo: 1 }, { unique: true });
PaymentSchema.index({ client: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ date: -1 });

// Static method to generate invoice number
PaymentSchema.statics.generateInvoiceNumber = async function() {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;
  
  // Find the last invoice number for the current year
  const lastPayment = await this.findOne({
    invoiceNo: { $regex: `^${prefix}` }
  }).sort({ createdAt: -1 });
  
  let nextNumber = 1;
  if (lastPayment && lastPayment.invoiceNo) {
    const lastNumber = parseInt(lastPayment.invoiceNo.split('-').pop());
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  // Pad with zeros (e.g., 0001, 0002, etc.)
  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${prefix}${paddedNumber}`;
};

// Pre-save hook to auto-generate invoice number if not provided
PaymentSchema.pre('save', async function(next) {
  // Only generate invoice number for new documents
  if (this.isNew && !this.invoiceNo) {
    try {
      this.invoiceNo = await this.constructor.generateInvoiceNumber();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);

