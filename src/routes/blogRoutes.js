const express = require('express');
const { body } = require('express-validator');
const {
  createBlog,
  getAllBlogs,
  getBlog,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogStats,
  togglePublishStatus
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createBlogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('contentType')
    .optional()
    .isIn(['html', 'markdown', 'text'])
    .withMessage('Content type must be html, markdown, or text'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateBlogValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .optional()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt cannot exceed 500 characters'),
  body('contentType')
    .optional()
    .isIn(['html', 'markdown', 'text'])
    .withMessage('Content type must be html, markdown, or text'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Author name cannot exceed 100 characters'),
  body('image')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid image URL'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

// Public routes
router
  .route('/')
  .get(getAllBlogs)
  .post(protect, createBlogValidation, validate, createBlog);

router
  .route('/slug/:slug')
  .get(getBlogBySlug);

router
  .route('/stats/summary')
  .get(protect, getBlogStats);

router
  .route('/:id')
  .get(getBlog)
  .put(protect, updateBlogValidation, validate, updateBlog)
  .delete(protect, deleteBlog);

router
  .route('/:id/publish')
  .patch(protect, togglePublishStatus);

module.exports = router;

