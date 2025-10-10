const express = require('express');
const { body } = require('express-validator');
const {
  createContact,
  getContacts,
  getContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const contactValidation = [
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
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\+\-\(\)]+$/)
    .withMessage('Please provide a valid phone number'),
  
  body('organizationName')
    .trim()
    .notEmpty()
    .withMessage('Organization name is required')
    .isLength({ max: 200 })
    .withMessage('Organization name cannot be more than 200 characters'),
  
  body('budgetRange')
    .notEmpty()
    .withMessage('Budget range is required')
    .isIn([
      'Less than $5,000',
      '$5,000 - $10,000',
      '$10,000 - $25,000',
      '$25,000 - $50,000',
      '$50,000 - $100,000',
      'More than $100,000'
    ])
    .withMessage('Please select a valid budget range'),
  
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
router
  .route('/')
  .get(getContacts)
  .post(contactValidation, validate, createContact);

router
  .route('/:id')
  .get(getContact)
  .put(updateContactValidation, validate, updateContact)
  .delete(deleteContact);

module.exports = router;

