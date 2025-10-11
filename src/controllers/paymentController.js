const Payment = require('../models/Payment');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new payment
 * @route   POST /api/v1/payments
 * @access  Private/Admin
 */
exports.createPayment = asyncHandler(async (req, res) => {
  // Add user who created the payment
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const payment = await Payment.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Payment created successfully',
    data: payment
  });
});

/**
 * @desc    Get all payments
 * @route   GET /api/v1/payments
 * @access  Private/Admin
 */
exports.getAllPayments = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Filter by status, client, method if provided
  let query = Payment.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-date -createdAt'); // Default: newest first
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const payments = await query.populate('createdBy', 'name email');
  const total = await Payment.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    count: payments.length,
    total: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: payments
  });
});

/**
 * @desc    Get single payment
 * @route   GET /api/v1/payments/:id
 * @access  Private/Admin
 */
exports.getPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id).populate('createdBy', 'name email');

  if (!payment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Payment not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: payment
  });
});

/**
 * @desc    Get payment by invoice number
 * @route   GET /api/v1/payments/invoice/:invoiceNo
 * @access  Private/Admin
 */
exports.getPaymentByInvoice = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ invoiceNo: req.params.invoiceNo }).populate('createdBy', 'name email');

  if (!payment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Payment not found with that invoice number'
    });
  }

  res.status(200).json({
    status: 'success',
    data: payment
  });
});

/**
 * @desc    Update payment
 * @route   PUT /api/v1/payments/:id
 * @access  Private/Admin
 */
exports.updatePayment = asyncHandler(async (req, res) => {
  // Don't allow updating invoice number
  delete req.body.invoiceNo;
  delete req.body.createdBy;

  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!payment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Payment not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment updated successfully',
    data: payment
  });
});

/**
 * @desc    Delete payment
 * @route   DELETE /api/v1/payments/:id
 * @access  Private/Admin
 */
exports.deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    return res.status(404).json({
      status: 'fail',
      message: 'Payment not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment deleted successfully',
    data: null
  });
});

/**
 * @desc    Get payment statistics
 * @route   GET /api/v1/payments/stats/summary
 * @access  Private/Admin
 */
exports.getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await Payment.aggregate([
    {
      $group: {
        _id: '$status',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);

  const totalStats = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        avgAmount: { $avg: '$amount' }
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      byStatus: stats,
      overall: totalStats[0] || { totalPayments: 0, totalAmount: 0, avgAmount: 0 }
    }
  });
});

