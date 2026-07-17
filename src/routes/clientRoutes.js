const express = require('express');
const { body } = require('express-validator');
const {
  createClient,
  getAllClients,
  getClient,
  updateClient,
  deleteClient,
  getClientStats,
  searchClients,
  getUpcomingRenewals
} = require('../controllers/clientController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Shared field validators (used for create & update; `required` toggles the name check).
const clientFields = (required) => [
  required
    ? body('name').trim().notEmpty().withMessage('Client name is required').isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters')
    : body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),
  body('contactPerson').optional().trim().isLength({ max: 100 }).withMessage('Contact person cannot exceed 100 characters'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  body('services').optional().isArray().withMessage('Services must be an array'),
  body('projectName').optional().trim().isLength({ max: 200 }).withMessage('Project name cannot exceed 200 characters'),
  body('projectDetails').optional().trim().isLength({ max: 3000 }).withMessage('Project details cannot exceed 3000 characters'),
  body('domains').optional().isArray().withMessage('Domains must be an array'),
  body('hosting').optional().isArray().withMessage('Hosting must be an array'),
  body('revenue').optional().isNumeric().withMessage('Revenue must be a number').isFloat({ min: 0 }).withMessage('Revenue cannot be negative'),
  body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid start date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid end date'),
  body('status').optional().isIn(['active', 'inactive', 'pending', 'completed', 'on-hold', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters')
];

// All routes require authentication.
router.use(protect);

router
  .route('/')
  .post(clientFields(true), validate, createClient)
  .get(getAllClients);

router.get('/stats/summary', getClientStats);
router.get('/search', searchClients);
router.get('/renewals', getUpcomingRenewals);

router
  .route('/:id')
  .get(getClient)
  .put(clientFields(false), validate, updateClient)
  .delete(deleteClient);

module.exports = router;
