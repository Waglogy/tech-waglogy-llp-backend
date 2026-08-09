const express = require('express');
const { body } = require('express-validator');
const {
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  deleteLead,
  getLeadStats,
  convertLead
} = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

const SOURCES = ['website', 'referral', 'social', 'cold-outreach', 'ad', 'event', 'other'];
const PRIORITIES = ['hot', 'warm', 'cold'];
const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'on-hold'];

// Shared field validators (used for create & update; `required` toggles the name check).
const leadFields = (required) => [
  required
    ? body('name').trim().notEmpty().withMessage('Lead name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
    : body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('company').optional().trim().isLength({ max: 200 }).withMessage('Company cannot exceed 200 characters'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('source').optional().isIn(SOURCES).withMessage('Invalid source'),
  body('service').optional().trim().isLength({ max: 200 }).withMessage('Service cannot exceed 200 characters'),
  body('value').optional().isNumeric().withMessage('Value must be a number').isFloat({ min: 0 }).withMessage('Value cannot be negative'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Invalid priority'),
  body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  body('assignedTo').optional().trim().isLength({ max: 100 }).withMessage('Assigned-to cannot exceed 100 characters'),
  body('nextFollowUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('Please provide a valid follow-up date'),
  body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters')
];

// All routes require authentication.
router.use(protect);

router
  .route('/')
  .post(leadFields(true), validate, createLead)
  .get(getAllLeads);

router.get('/stats/summary', getLeadStats);

router.post('/:id/convert', convertLead);

router
  .route('/:id')
  .get(getLead)
  .put(leadFields(false), validate, updateLead)
  .delete(deleteLead);

module.exports = router;
