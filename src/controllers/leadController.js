const Lead = require('../models/Lead');
const Client = require('../models/Client');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create a lead
 * @route   POST /api/v1/leads
 * @access  Private
 */
exports.createLead = asyncHandler(async (req, res) => {
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const lead = await Lead.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Lead created successfully',
    data: lead
  });
});

/**
 * @desc    Get all leads (paginated, filterable)
 * @route   GET /api/v1/leads
 * @access  Private
 */
exports.getAllLeads = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
  excludedFields.forEach((field) => delete queryObj[field]);

  // Free-text search across the most useful fields.
  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    queryObj.$or = [
      { name: rx },
      { company: rx },
      { email: rx },
      { service: rx },
      { assignedTo: rx }
    ];
  }

  let query = Lead.find(queryObj);

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

  const leads = await query;
  const total = await Lead.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    count: leads.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: leads
  });
});

/**
 * @desc    Get a single lead
 * @route   GET /api/v1/leads/:id
 * @access  Private
 */
exports.getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('convertedClientId', 'name');

  if (!lead) {
    return res.status(404).json({ status: 'fail', message: 'Lead not found' });
  }

  res.status(200).json({ status: 'success', data: lead });
});

/**
 * @desc    Update a lead
 * @route   PUT /api/v1/leads/:id
 * @access  Private
 */
exports.updateLead = asyncHandler(async (req, res) => {
  // Conversion linkage is managed only by the convert endpoint.
  delete req.body.createdBy;
  delete req.body.convertedClientId;
  delete req.body.convertedAt;

  const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!lead) {
    return res.status(404).json({ status: 'fail', message: 'Lead not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Lead updated successfully',
    data: lead
  });
});

/**
 * @desc    Delete a lead
 * @route   DELETE /api/v1/leads/:id
 * @access  Private
 */
exports.deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);

  if (!lead) {
    return res.status(404).json({ status: 'fail', message: 'Lead not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Lead deleted successfully',
    data: null
  });
});

/**
 * @desc    Lead statistics (counts by status + pipeline value)
 * @route   GET /api/v1/leads/stats/summary
 * @access  Private
 */
exports.getLeadStats = asyncHandler(async (req, res) => {
  const byStatus = await Lead.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } }
  ]);

  const totals = await Lead.aggregate([
    { $group: { _id: null, total: { $sum: 1 }, value: { $sum: '$value' } } }
  ]);

  // "Open" pipeline = everything not yet won or lost.
  const openValue = await Lead.aggregate([
    { $match: { status: { $nin: ['won', 'lost'] } } },
    { $group: { _id: null, value: { $sum: '$value' } } }
  ]);

  const wonValue = await Lead.aggregate([
    { $match: { status: 'won' } },
    { $group: { _id: null, value: { $sum: '$value' } } }
  ]);

  const statuses = {};
  byStatus.forEach((s) => { statuses[s._id] = s.count; });

  res.status(200).json({
    status: 'success',
    data: {
      total: totals[0] ? totals[0].total : 0,
      value: totals[0] ? totals[0].value : 0,
      openValue: openValue[0] ? openValue[0].value : 0,
      wonValue: wonValue[0] ? wonValue[0].value : 0,
      statuses,
      byStatus
    }
  });
});

/**
 * @desc    Convert a won lead into a Client
 * @route   POST /api/v1/leads/:id/convert
 * @access  Private
 */
exports.convertLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ status: 'fail', message: 'Lead not found' });
  }

  if (lead.convertedClientId) {
    return res.status(400).json({
      status: 'fail',
      message: 'This lead has already been converted to a client'
    });
  }

  // Map lead fields onto a new Client. Company is preferred for the client
  // name (falls back to the contact name), the contact becomes contactPerson.
  const client = await Client.create({
    name: lead.company || lead.name,
    contactPerson: lead.company ? lead.name : undefined,
    email: lead.email,
    phone: lead.phone,
    services: lead.service ? [lead.service] : [],
    projectName: lead.service || undefined,
    revenue: lead.value || 0,
    notes: lead.notes,
    status: 'active',
    createdBy: req.user ? req.user.id : undefined
  });

  // Mark the lead won and link it to the new client.
  lead.status = 'won';
  lead.convertedClientId = client._id;
  lead.convertedAt = new Date();
  await lead.save();

  res.status(201).json({
    status: 'success',
    message: 'Lead converted to client successfully',
    data: { lead, client }
  });
});
