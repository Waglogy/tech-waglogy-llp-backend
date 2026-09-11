const express = require('express');
const { body } = require('express-validator');
const {
  createContact,
  getContacts,
  getContact,
  getContactStats,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const contactValidation = [
  body('attribution').optional().isObject(),
  body('attribution.landingPage').optional().isString().isLength({ max: 500 }).matches(/^\/(?!\/)[^?#]*$/),
  body('attribution.submissionPage').optional().isString().isLength({ max: 500 }).matches(/^\/(?!\/)[^?#]*$/),
  body('attribution.referrerHost').optional().isString().isLength({ max: 255 }).matches(/^[a-zA-Z0-9.-]*$/),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot be more than 100 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s+\-()]+$/)
    .withMessage('Please provide a valid phone number'),

  body('organizationName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Organization name cannot be more than 200 characters'),

  body('budgetRange')
    .optional({ checkFalsy: true })
    .trim(),

  body('projectDetails')
    .trim()
    .notEmpty()
    .withMessage('Project details are required')
    .isLength({ max: 2000 })
    .withMessage('Project details cannot be more than 2000 characters')
];

const updateContactValidation = [
  body('status')
    .isIn(['new', 'in-progress', 'contacted', 'qualified', 'closed'])
    .withMessage('Invalid status value')
];

// Routes
// Public: form submission. Admin (protected): everything else.
// NOTE: /stats must be declared before /:id so it isn't captured as an id.
router.get('/stats', protect, getContactStats);

router
  .route('/')
  .get(protect, getContacts)
  .post(contactValidation, validate, createContact);

router
  .route('/:id')
  .get(protect, getContact)
  .put(protect, updateContactValidation, validate, updateContact)
  .delete(protect, deleteContact);

module.exports = router;

