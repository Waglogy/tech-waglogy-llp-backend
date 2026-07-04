const express = require('express');
const { body } = require('express-validator');
const {
  subscribe,
  getSubscribers,
  getSubscriberStats,
  deleteSubscriber
} = require('../controllers/subscriberController');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

const subscribeValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('source')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Source cannot exceed 50 characters')
];

// /stats must be declared before /:id so it isn't captured as an id.
router.get('/stats', protect, getSubscriberStats);

router
  .route('/')
  .get(protect, getSubscribers)
  .post(subscribeValidation, validate, subscribe);

router.delete('/:id', protect, deleteSubscriber);

module.exports = router;
