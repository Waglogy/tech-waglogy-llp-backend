const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create a client
 * @route   POST /api/v1/clients
 * @access  Private
 */
exports.createClient = asyncHandler(async (req, res) => {
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
 * @desc    Get all clients (paginated, filterable)
 * @route   GET /api/v1/clients
 * @access  Private
 */
exports.getAllClients = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
  excludedFields.forEach((field) => delete queryObj[field]);

  // Free-text search across the most useful fields.
  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    queryObj.$or = [
      { name: rx },
      { contactPerson: rx },
      { email: rx },
      { projectName: rx },
      { services: rx },
      { 'domains.name': rx }
    ];
  }

  let query = Client.find(queryObj);

  if (req.query.sort) {
    query = query.sort(req.query.sort.split(',').join(' '));
  } else {
    query = query.sort('-createdAt');
  }

  if (req.query.fields) {
    query = query.select(req.query.fields.split(',').join(' '));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const clients = await query;
  const total = await Client.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    count: clients.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: clients
  });
});

/**
 * @desc    Get a single client
 * @route   GET /api/v1/clients/:id
 * @access  Private
 */
exports.getClient = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.params.id).populate('createdBy', 'name email');

  if (!client) {
    return res.status(404).json({ status: 'fail', message: 'Client not found' });
  }

  res.status(200).json({ status: 'success', data: client });
});

/**
 * @desc    Update a client
 * @route   PUT /api/v1/clients/:id
 * @access  Private
 */
exports.updateClient = asyncHandler(async (req, res) => {
  delete req.body.createdBy;

  const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!client) {
    return res.status(404).json({ status: 'fail', message: 'Client not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Client updated successfully',
    data: client
  });
});

/**
 * @desc    Delete a client
 * @route   DELETE /api/v1/clients/:id
 * @access  Private
 */
exports.deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);

  if (!client) {
    return res.status(404).json({ status: 'fail', message: 'Client not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Client deleted successfully',
    data: null
  });
});

/**
 * @desc    Client statistics (counts by status + totals)
 * @route   GET /api/v1/clients/stats/summary
 * @access  Private
 */
exports.getClientStats = asyncHandler(async (req, res) => {
  const byStatus = await Client.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$revenue' } } }
  ]);

  const totals = await Client.aggregate([
    { $group: { _id: null, total: { $sum: 1 }, revenue: { $sum: '$revenue' } } }
  ]);

  const statuses = {};
  byStatus.forEach((s) => { statuses[s._id] = s.count; });

  res.status(200).json({
    status: 'success',
    data: {
      total: totals[0] ? totals[0].total : 0,
      revenue: totals[0] ? totals[0].revenue : 0,
      statuses,
      byStatus
    }
  });
});

/**
 * @desc    Search clients (lightweight, for autocompletes)
 * @route   GET /api/v1/clients/search?q=
 * @access  Private
 */
exports.searchClients = asyncHandler(async (req, res) => {
  const q = req.query.q || req.query.search || '';
  const rx = new RegExp(q, 'i');

  const clients = await Client.find({
    $or: [{ name: rx }, { contactPerson: rx }, { email: rx }, { projectName: rx }]
  }).limit(20);

  res.status(200).json({
    status: 'success',
    count: clients.length,
    data: clients
  });
});

/**
 * @desc    Clients with domains/hosting expiring within `days` (default 30).
 * @route   GET /api/v1/clients/renewals?days=30
 * @access  Private
 */
exports.getUpcomingRenewals = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const clients = await Client.find({
    $or: [
      { 'domains.expiresOn': { $lte: cutoff } },
      { 'hosting.expiresOn': { $lte: cutoff } }
    ]
  });

  // Flatten to individual renewal items (domain / hosting) within the window.
  const items = [];
  clients.forEach((client) => {
    (client.domains || []).forEach((d) => {
      if (d.expiresOn && new Date(d.expiresOn) <= cutoff) {
        items.push({
          clientId: client._id,
          clientName: client.name,
          kind: 'domain',
          label: d.name,
          provider: d.registrar,
          expiresOn: d.expiresOn,
          autoRenew: d.autoRenew,
          overdue: new Date(d.expiresOn) < now
        });
      }
    });
    (client.hosting || []).forEach((h) => {
      if (h.expiresOn && new Date(h.expiresOn) <= cutoff) {
        items.push({
          clientId: client._id,
          clientName: client.name,
          kind: 'hosting',
          label: h.provider ? `${h.provider}${h.plan ? ' · ' + h.plan : ''}` : 'Hosting',
          provider: h.provider,
          expiresOn: h.expiresOn,
          autoRenew: h.autoRenew,
          overdue: new Date(h.expiresOn) < now
        });
      }
    });
  });

  items.sort((a, b) => new Date(a.expiresOn) - new Date(b.expiresOn));

  res.status(200).json({
    status: 'success',
    count: items.length,
    days,
    data: items
  });
});
