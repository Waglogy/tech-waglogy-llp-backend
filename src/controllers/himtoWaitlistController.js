const HimtoWaitlist = require('../models/HimtoWaitlist');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Add email to waitlist
 * @route   POST /api/v1/himto-waitlist
 * @access  Public
 */
exports.addToWaitlist = asyncHandler(async (req, res) => {
  // Get IP address
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const waitlistEntry = await HimtoWaitlist.create({
    email: req.body.email,
    ipAddress
  });

  res.status(201).json({
    status: 'success',
    message: 'Email added to waitlist successfully',
    data: waitlistEntry
  });
});

/**
 * @desc    Get all waitlist entries
 * @route   GET /api/v1/himto-waitlist
 * @access  Public (you can protect this later with auth middleware)
 */
exports.getWaitlistEntries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Execute query with pagination
  const entries = await HimtoWaitlist.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await HimtoWaitlist.countDocuments();

  res.status(200).json({
    status: 'success',
    count: entries.length,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalEntries: count,
    data: entries
  });
});

/**
 * @desc    Get single waitlist entry
 * @route   GET /api/v1/himto-waitlist/:id
 * @access  Public (you can protect this later)
 */
exports.getWaitlistEntry = asyncHandler(async (req, res) => {
  const entry = await HimtoWaitlist.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      status: 'fail',
      message: 'Waitlist entry not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: entry
  });
});

/**
 * @desc    Delete waitlist entry
 * @route   DELETE /api/v1/himto-waitlist/:id
 * @access  Public (you can protect this later)
 */
exports.deleteWaitlistEntry = asyncHandler(async (req, res) => {
  const entry = await HimtoWaitlist.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      status: 'fail',
      message: 'Waitlist entry not found'
    });
  }

  await entry.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Waitlist entry deleted successfully'
  });
});

