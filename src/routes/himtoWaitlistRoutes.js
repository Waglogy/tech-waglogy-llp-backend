const express = require('express');
const { body } = require('express-validator');
const {
  addToWaitlist,
  getWaitlistEntries,
  getWaitlistEntry,
  deleteWaitlistEntry
} = require('../controllers/himtoWaitlistController');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const waitlistValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
];

// Routes
router
  .route('/')
  .get(getWaitlistEntries)
  .post(waitlistValidation, validate, addToWaitlist);

router
  .route('/:id')
  .get(getWaitlistEntry)
  .delete(deleteWaitlistEntry);

module.exports = router;

