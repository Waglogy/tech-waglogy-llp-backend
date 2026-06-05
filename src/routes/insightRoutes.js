const express = require('express');
const { body } = require('express-validator');
const {
  createInsight,
  getAllInsights,
  getInsight,
  getInsightBySlug,
  getCategories,
  updateInsight,
  deleteInsight,
  togglePublishStatus,
  toggleFeatured,
  updatePriority,
  reorderPriorities
} = require('../controllers/insightController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createInsightValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('readTime')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Read time cannot exceed 20 characters'),
  body('image')
    .optional()
    .trim(),
  body('heroImage')
    .optional()
    .trim(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('content')
    .optional()
    .isArray()
    .withMessage('Content must be an array'),
  body('relatedSlugs')
    .optional()
    .isArray()
    .withMessage('Related slugs must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be a non-negative integer')
];

const updateInsightValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 300 })
    .withMessage('Title cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('image')
    .optional()
    .trim(),
  body('heroImage')
    .optional()
    .trim(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('content')
    .optional()
    .isArray()
    .withMessage('Content must be an array'),
  body('relatedSlugs')
    .optional()
    .isArray()
    .withMessage('Related slugs must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be a non-negative integer')
];

// Public routes
router
  .route('/')
  .get(getAllInsights)
  .post(protect, createInsightValidation, validate, createInsight);

router
  .route('/slug/:slug')
  .get(getInsightBySlug);

router
  .route('/categories/list')
  .get(getCategories);

// Priority management (must be before /:id)
router
  .route('/priority/reorder')
  .put(protect, reorderPriorities);

router
  .route('/:id')
  .get(getInsight)
  .put(protect, updateInsightValidation, validate, updateInsight)
  .delete(protect, deleteInsight);

router
  .route('/:id/publish')
  .patch(protect, togglePublishStatus);

router
  .route('/:id/featured')
  .patch(protect, toggleFeatured);

router
  .route('/:id/priority')
  .patch(protect, updatePriority);

module.exports = router;
