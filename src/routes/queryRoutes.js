const express = require('express');
const { body } = require('express-validator');
const {
  createQuery,
  getQueries,
  getQuery,
  updateQuery,
  deleteQuery
} = require('../controllers/queryController');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const queryValidation = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot be more than 1000 characters')
];

const updateQueryValidation = [
  body('status')
    .isIn(['new', 'read', 'responded', 'closed'])
    .withMessage('Invalid status value')
];

// Routes
router
  .route('/')
  .get(getQueries)
  .post(queryValidation, validate, createQuery);

router
  .route('/:id')
  .get(getQuery)
  .put(updateQueryValidation, validate, updateQuery)
  .delete(deleteQuery);

module.exports = router;

