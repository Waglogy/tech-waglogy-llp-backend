const express = require('express');
const { body } = require('express-validator');
const {
  seedAccounts,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  recordPayment,
  getEntries,
  getEntry,
  createEntry,
  deleteEntry,
  getTrialBalance,
  getProfitAndLoss,
  getLedger,
  getDashboard
} = require('../controllers/financeController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createAccountValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Account code is required')
    .isLength({ max: 20 })
    .withMessage('Account code cannot exceed 20 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ max: 100 })
    .withMessage('Account name cannot exceed 100 characters'),
  body('type')
    .notEmpty()
    .withMessage('Account type is required')
    .isIn(['asset', 'liability', 'equity', 'income', 'expense'])
    .withMessage('Invalid account type')
];

const recordPaymentValidation = [
  body('direction')
    .notEmpty()
    .withMessage('Direction is required')
    .isIn(['in', 'out'])
    .withMessage("Direction must be 'in' (received) or 'out' (paid)"),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be greater than zero'),
  body('paymentAccount')
    .notEmpty()
    .withMessage('Payment account is required')
    .isMongoId()
    .withMessage('Invalid payment account'),
  body('categoryAccount')
    .notEmpty()
    .withMessage('Category account is required')
    .isMongoId()
    .withMessage('Invalid category account'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('party')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('Party name cannot exceed 150 characters'),
  body('partyType')
    .optional()
    .isIn(['client', 'vendor', 'employee', 'other'])
    .withMessage('Invalid party type'),
  body('method')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'upi', 'paypal', 'stripe', 'other'])
    .withMessage('Invalid payment method'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
];

// All finance routes require authentication.
router.use(protect);

// Chart of accounts
router.route('/accounts')
  .get(getAccounts)
  .post(createAccountValidation, validate, createAccount);
router.post('/accounts/seed', seedAccounts);
router.route('/accounts/:id')
  .put(updateAccount)
  .delete(deleteAccount);

// Payments (simple form -> balanced journal entry)
router.post('/payments', recordPaymentValidation, validate, recordPayment);

// Journal entries
router.route('/entries')
  .get(getEntries)
  .post(createEntry);
router.route('/entries/:id')
  .get(getEntry)
  .delete(deleteEntry);

// Reports
router.get('/reports/trial-balance', getTrialBalance);
router.get('/reports/pnl', getProfitAndLoss);
router.get('/reports/ledger/:accountId', getLedger);

// Dashboard summary
router.get('/dashboard', getDashboard);

module.exports = router;
