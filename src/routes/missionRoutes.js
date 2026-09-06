const express = require('express');
const { body } = require('express-validator');
const {
  getAllMissions,
  getMissionDashboard,
  getMission,
  createMission,
  updateMission,
  deleteMission
} = require('../controllers/missionController');
const { createTask } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

const STATUSES = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
const PRIORITIES = ['P0', 'P1', 'P2', 'P3'];
const COLORS = ['primary', 'accent', 'neutral'];
const TASK_STATUSES = ['todo', 'in-progress', 'blocked', 'done'];

// Shared mission validators (create & update; `required` toggles the name check).
const missionFields = (required) => [
  required
    ? body('name').trim().notEmpty().withMessage('Mission name is required').isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters')
    : body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('client').optional().trim().isLength({ max: 100 }).withMessage('Client cannot exceed 100 characters'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('color').optional().isIn(COLORS).withMessage('Invalid color'),
  body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid start date'),
  body('deadline').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid deadline')
];

// Validators for creating a task through the nested mission route.
const taskFields = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status').optional().isIn(TASK_STATUSES).withMessage('Invalid status'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('dueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid due date'),
  body('order').optional().isInt().withMessage('Order must be an integer')
];

// All routes require authentication.
router.use(protect);

router.get('/dashboard', getMissionDashboard);

router
  .route('/')
  .post(missionFields(true), validate, createMission)
  .get(getAllMissions);

// Nested: add a task to a mission.
router.post('/:missionId/tasks', taskFields, validate, createTask);

router
  .route('/:id')
  .get(getMission)
  .put(missionFields(false), validate, updateMission)
  .delete(deleteMission);

module.exports = router;
