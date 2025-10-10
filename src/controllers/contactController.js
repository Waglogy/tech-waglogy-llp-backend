const Contact = require('../models/Contact');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Submit a new contact form
 * @route   POST /api/v1/contacts
 * @access  Public
 */
exports.createContact = asyncHandler(async (req, res) => {
  // Get IP address
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  const contact = await Contact.create({
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    organizationName: req.body.organizationName,
    budgetRange: req.body.budgetRange,
    projectDetails: req.body.projectDetails,
    ipAddress
  });

  res.status(201).json({
    status: 'success',
    message: 'Contact form submitted successfully',
    data: contact
  });
});

/**
 * @desc    Get all contacts
 * @route   GET /api/v1/contacts
 * @access  Public (you can protect this later with auth middleware)
 */
exports.getContacts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, budgetRange } = req.query;

  // Build query
  const queryFilter = {};
  if (status) {
    queryFilter.status = status;
  }
  if (budgetRange) {
    queryFilter.budgetRange = budgetRange;
  }

  // Execute query with pagination
  const contacts = await Contact.find(queryFilter)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Contact.countDocuments(queryFilter);

  res.status(200).json({
    status: 'success',
    count: contacts.length,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalContacts: count,
    data: contacts
  });
});

/**
 * @desc    Get single contact
 * @route   GET /api/v1/contacts/:id
 * @access  Public (you can protect this later)
 */
exports.getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      status: 'fail',
      message: 'Contact not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: contact
  });
});

/**
 * @desc    Update contact status
 * @route   PUT /api/v1/contacts/:id
 * @access  Public (you can protect this later)
 */
exports.updateContact = asyncHandler(async (req, res) => {
  const allowedUpdates = ['status'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field]) {
      updates[field] = req.body[field];
    }
  });

  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  if (!contact) {
    return res.status(404).json({
      status: 'fail',
      message: 'Contact not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Contact updated successfully',
    data: contact
  });
});

/**
 * @desc    Delete contact
 * @route   DELETE /api/v1/contacts/:id
 * @access  Public (you can protect this later)
 */
exports.deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return res.status(404).json({
      status: 'fail',
      message: 'Contact not found'
    });
  }

  await contact.deleteOne();

  res.status(200).json({
    status: 'success',
    message: 'Contact deleted successfully'
  });
});

