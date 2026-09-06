const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  reorderTasks,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const TASK_STATUSES = ['todo', 'in-progress', 'blocked', 'done'];
const isMongoId = (v) => /^[0-9a-fA-F]{24}$/.test(v);

// Shared task validators (create & update; `required` toggles the title check).
const taskFields = (required) => [
  required
    ? body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters')
    : body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid due date'),
  body('order').optional().isInt().withMessage('Order must be an integer'),
  // Required only when creating a task through the flat route.
  required
    ? body('mission').custom(isMongoId).withMessage('A valid mission id is required')
    : body('mission').optional().custom(isMongoId).withMessage('Invalid mission id')
];

// All routes require authentication.
router.use(protect);

router
  .route('/')
  .get(getTasks)
  .post(taskFields(true), validate, createTask);

router.put('/reorder', reorderTasks);

router.patch(
  '/:id/status',
  body('status').isIn(TASK_STATUSES).withMessage('Invalid status'),
  validate,
  updateTaskStatus
);

router
  .route('/:id')
  .put(taskFields(false), validate, updateTask)
  .delete(deleteTask);

module.exports = router;
