const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new client
 * @route   POST /api/v1/clients
 * @access  Private/Admin
 */
exports.createClient = asyncHandler(async (req, res) => {
  // Add user who created the client
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const client = await Client.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Client created successfully',
    data: client
  });
});

/**
 * @desc    Get all clients
 * @route   GET /api/v1/clients
 * @access  Private/Admin
 */
exports.getAllClients = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Filter by status, company, service if provided
  let query = Client.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt'); // Default: newest first
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  // Execute query
  const clients = await query.populate('createdBy', 'name email');
  const total = await Client.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    count: clients.length,
    total: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: clients
  });
});

/**
 * @desc    Get single client
 * @route   GET /api/v1/clients/:id
 * @access  Private/Admin
 */
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate('createdBy', 'name email');

  if (!client) {
    return res.status(404).json({
      status: 'fail',
      message: 'Client not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: client
  });
});

/**
 * @desc    Update client
 * @route   PUT /api/v1/clients/:id
 * @access  Private/Admin
 */
exports.updateClient = asyncHandler(async (req, res) => {
  // Don't allow updating createdBy
  delete req.body.createdBy;

  const client = await Client.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!client) {
    return res.status(404).json({
      status: 'fail',
      message: 'Client not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Client updated successfully',
    data: client
  });
});

/**
 * @desc    Delete client
 * @route   DELETE /api/v1/clients/:id
 * @access  Private/Admin
 */
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    return res.status(404).json({
      status: 'fail',
      message: 'Client not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Client deleted successfully',
    data: null
  });
});

/**
 * @desc    Get client statistics
 * @route   GET /api/v1/clients/stats/summary
 * @access  Private/Admin
 */
exports.getClientStats = asyncHandler(async (req, res) => {
  const stats = await Client.aggregate([
    {
      $group: {
        _id: '$status',
        totalRevenue: { $sum: '$revenue' },
        count: { $sum: 1 },
        avgRevenue: { $avg: '$revenue' }
      }
    },
    {
      $sort: { totalRevenue: -1 }
    }
  ]);

  const totalStats = await Client.aggregate([
    {
      $group: {
        _id: null,
        totalClients: { $sum: 1 },
        totalRevenue: { $sum: '$revenue' },
        avgRevenue: { $avg: '$revenue' }
      }
    }
  ]);

  // Get top clients by revenue
  const topClients = await Client.find()
    .sort({ revenue: -1 })
    .limit(5)
    .select('company contactPerson revenue status service');

  res.status(200).json({
    status: 'success',
    data: {
      byStatus: stats,
      overall: totalStats[0] || { totalClients: 0, totalRevenue: 0, avgRevenue: 0 },
      topClients: topClients
    }
  });
});

/**
 * @desc    Search clients
 * @route   GET /api/v1/clients/search
 * @access  Private/Admin
 */
exports.searchClients = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide a search query'
    });
  }

  const clients = await Client.find({
    $or: [
      { company: { $regex: query, $options: 'i' } },
      { contactPerson: { $regex: query, $options: 'i' } },
      { service: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).limit(20);

  res.status(200).json({
    status: 'success',
    count: clients.length,
    data: clients
  });
});

