const express = require('express');
const { body } = require('express-validator');
const {
  createPayment,
  getAllPayments,
  getPayment,
  getPaymentByInvoice,
  updatePayment,
  deletePayment,
  getPaymentStats
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createPaymentValidation = [
  body('client')
    .trim()
    .notEmpty()
    .withMessage('Client name is required')
    .isLength({ max: 100 })
    .withMessage('Client name cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount cannot be negative'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'stripe', 'other'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
    .withMessage('Invalid status'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

const updatePaymentValidation = [
  body('client')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Client name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Client name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount cannot be negative'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('method')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'stripe', 'other'])
    .withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
    .withMessage('Invalid status'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Routes
router
  .route('/')
  .post(createPaymentValidation, validate, createPayment)
  .get(getAllPayments);

router
  .route('/stats/summary')
  .get(getPaymentStats);

router
  .route('/invoice/:invoiceNo')
  .get(getPaymentByInvoice);

router
  .route('/:id')
  .get(getPayment)
  .put(updatePaymentValidation, validate, updatePayment)
  .delete(deletePayment);

module.exports = router;

