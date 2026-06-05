const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getAllProjects,
  getProject,
  getProjectBySlug,
  updateProject,
  deleteProject,
  togglePublishStatus,
  updatePriority,
  reorderPriorities
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createProjectValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('tag')
    .trim()
    .notEmpty()
    .withMessage('Tag is required (e.g. E-Commerce, SaaS)')
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('metric')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Metric cannot exceed 20 characters'),
  body('metricLabel')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Metric label cannot exceed 50 characters'),
  body('image')
    .optional()
    .trim(),
  body('color')
    .optional()
    .isIn(['primary', 'accent'])
    .withMessage('Color must be primary or accent'),
  body('heroImage')
    .optional()
    .trim(),
  body('client')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Client name cannot exceed 100 characters'),
  body('timeline')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timeline cannot exceed 50 characters'),
  body('year')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Year cannot exceed 10 characters'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('liveUrl')
    .optional()
    .trim(),
  body('overview')
    .optional()
    .trim(),
  body('challenge')
    .optional()
    .trim(),
  body('solution')
    .optional()
    .trim(),
  body('results')
    .optional()
    .isArray()
    .withMessage('Results must be an array'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('galleryImages')
    .optional()
    .isArray()
    .withMessage('Gallery images must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean'),
  body('priority')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Priority must be a non-negative integer')
];

const updateProjectValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('tag')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tag cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('color')
    .optional()
    .isIn(['primary', 'accent'])
    .withMessage('Color must be primary or accent'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('results')
    .optional()
    .isArray()
    .withMessage('Results must be an array'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('galleryImages')
    .optional()
    .isArray()
    .withMessage('Gallery images must be an array'),
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
  .get(getAllProjects)
  .post(protect, createProjectValidation, validate, createProject);

router
  .route('/slug/:slug')
  .get(getProjectBySlug);

// Priority management (admin)
router
  .route('/priority/reorder')
  .put(protect, reorderPriorities);

router
  .route('/:id')
  .get(getProject)
  .put(protect, updateProjectValidation, validate, updateProject)
  .delete(protect, deleteProject);

router
  .route('/:id/publish')
  .patch(protect, togglePublishStatus);

router
  .route('/:id/priority')
  .patch(protect, updatePriority);

module.exports = router;
