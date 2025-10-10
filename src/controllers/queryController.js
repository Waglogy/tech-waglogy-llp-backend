const Query = require('../models/Query');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Submit a new query
 * @route   POST /api/v1/queries
 * @access  Public
 */
exports.createQuery = asyncHandler(async (req, res) => {
  // Get IP address
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const query = await Query.create({
    message: req.body.message,
    ipAddress
  });

  res.status(201).json({
    status: 'success',
    message: 'Query submitted successfully',
    data: query
  });
});

/**
 * @desc    Get all queries
 * @route   GET /api/v1/queries
 * @access  Public (you can protect this later with auth middleware)
 */
exports.getQueries = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  // Build query
  const queryFilter = {};
  if (status) {
    queryFilter.status = status;
  }

  // Execute query with pagination
  const queries = await Query.find(queryFilter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Query.countDocuments(queryFilter);

  res.status(200).json({
    status: 'success',
    count: queries.length,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalQueries: count,
    data: queries
  });
});

/**
 * @desc    Get single query
 * @route   GET /api/v1/queries/:id
 * @access  Public (you can protect this later)
 */
exports.getQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    return res.status(404).json({
      status: 'fail',
      message: 'Query not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: query
  });
});

/**
 * @desc    Update query status
 * @route   PUT /api/v1/queries/:id
 * @access  Public (you can protect this later)
 */
exports.updateQuery = asyncHandler(async (req, res) => {
  const query = await Query.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!query) {
    return res.status(404).json({
      status: 'fail',
      message: 'Query not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Query updated successfully',
    data: query
  });
});

/**
 * @desc    Delete query
 * @route   DELETE /api/v1/queries/:id
 * @access  Public (you can protect this later)
 */
exports.deleteQuery = asyncHandler(async (req, res) => {
  const query = await Query.findById(req.params.id);

  if (!query) {
    return res.status(404).json({
      status: 'fail',
      message: 'Query not found'
    });
  }

  await query.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Query deleted successfully'
  });
});

