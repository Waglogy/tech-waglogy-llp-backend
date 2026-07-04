const Subscriber = require('../models/Subscriber');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Subscribe to the newsletter
 * @route   POST /api/v1/subscribers
 * @access  Public
 */
exports.subscribe = asyncHandler(async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const email = (req.body.email || '').toLowerCase().trim();

  // Idempotent: if already subscribed, return success without erroring.
  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return res.status(200).json({
      status: 'success',
      message: 'You are already subscribed',
      data: existing
    });
  }

  const subscriber = await Subscriber.create({
    email,
    source: req.body.source || 'website',
    ipAddress
  });

  res.status(201).json({
    status: 'success',
    message: 'Subscribed successfully',
    data: subscriber
  });
});

/**
 * @desc    List subscribers
 * @route   GET /api/v1/subscribers
 * @access  Private (admin)
 */
exports.getSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, source } = req.query;

  const queryFilter = {};
  if (source) queryFilter.source = source;

  const subscribers = await Subscriber.find(queryFilter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Subscriber.countDocuments(queryFilter);

  res.status(200).json({
    status: 'success',
    count: subscribers.length,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalSubscribers: count,
    data: subscribers
  });
});

/**
 * @desc    Subscriber stats
 * @route   GET /api/v1/subscribers/stats
 * @access  Private (admin)
 */
exports.getSubscriberStats = asyncHandler(async (req, res) => {
  const [total, bySource] = await Promise.all([
    Subscriber.countDocuments(),
    Subscriber.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }])
  ]);

  const sources = bySource.reduce((acc, s) => {
    acc[s._id || 'website'] = s.count;
    return acc;
  }, {});

  res.status(200).json({
    status: 'success',
    data: { total, sources }
  });
});

/**
 * @desc    Delete a subscriber
 * @route   DELETE /api/v1/subscribers/:id
 * @access  Private (admin)
 */
exports.deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);

  if (!subscriber) {
    return res.status(404).json({
      status: 'fail',
      message: 'Subscriber not found'
    });
  }

  await subscriber.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Subscriber deleted successfully'
  });
});
