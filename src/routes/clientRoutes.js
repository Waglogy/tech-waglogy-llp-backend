const express = require('express');
const { body } = require('express-validator');
const {
  createClient,
  getAllClients,
  getClient,
  updateClient,
  deleteClient,
  getClientStats,
  searchClients
} = require('../controllers/clientController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createClientValidation = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('contactPerson')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required')
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('service')
    .trim()
    .notEmpty()
    .withMessage('Service is required')
    .isLength({ max: 200 })
    .withMessage('Service cannot exceed 200 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('revenue')
    .notEmpty()
    .withMessage('Revenue is required')
    .isNumeric()
    .withMessage('Revenue must be a number')
    .isFloat({ min: 0 })
    .withMessage('Revenue cannot be negative'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Invalid status'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

const updateClientValidation = [
  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Company name cannot exceed 200 characters'),
  body('contactPerson')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact person name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Contact person name cannot exceed 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('service')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Service cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Service cannot exceed 200 characters'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('revenue')
    .optional()
    .isNumeric()
    .withMessage('Revenue must be a number')
    .isFloat({ min: 0 })
    .withMessage('Revenue cannot be negative'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Invalid status'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Routes
router
  .route('/')
  .post(createClientValidation, validate, createClient)
  .get(getAllClients);

router
  .route('/stats/summary')
  .get(getClientStats);

router
  .route('/search')
  .get(searchClients);

router
  .route('/:id')
  .get(getClient)
  .put(updateClientValidation, validate, updateClient)
  .delete(deleteClient);

module.exports = router;

