const Insight = require('../models/Insight');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new insight
 * @route   POST /api/v1/insights
 * @access  Private
 */
exports.createInsight = asyncHandler(async (req, res) => {
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  // If marking as featured, unmark any existing featured post
  if (req.body.featured) {
    await Insight.updateMany({ featured: true }, { featured: false });
  }

  const insight = await Insight.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Insight created successfully',
    data: insight
  });
});

/**
 * @desc    Get all insights
 * @route   GET /api/v1/insights
 * @access  Public
 */
exports.getAllInsights = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Only published for public
  if (!req.user) {
    queryObj.isPublished = true;
  }

  let query = Insight.find(queryObj);

  // Search
  if (req.query.search) {
    query = Insight.find({
      $and: [
        queryObj,
        {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { excerpt: { $regex: req.query.search, $options: 'i' } },
            { category: { $regex: req.query.search, $options: 'i' } }
          ]
        }
      ]
    });
  }

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-priority -date');
  }

  // Field limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  const insights = await query;
  const total = await Insight.countDocuments(
    req.query.search
      ? {
          $and: [
            queryObj,
            {
              $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { excerpt: { $regex: req.query.search, $options: 'i' } },
                { category: { $regex: req.query.search, $options: 'i' } }
              ]
            }
          ]
        }
      : queryObj
  );

  res.status(200).json({
    status: 'success',
    count: insights.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: insights
  });
});

/**
 * @desc    Get single insight by ID
 * @route   GET /api/v1/insights/:id
 * @access  Public
 */
exports.getInsight = asyncHandler(async (req, res) => {
  const insight = await Insight.findById(req.params.id);

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  if (!insight.isPublished && !req.user) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  res.status(200).json({ status: 'success', data: insight });
});

/**
 * @desc    Get single insight by slug
 * @route   GET /api/v1/insights/slug/:slug
 * @access  Public
 */
exports.getInsightBySlug = asyncHandler(async (req, res) => {
  const insight = await Insight.findOne({ slug: req.params.slug });

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  if (!insight.isPublished && !req.user) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  res.status(200).json({ status: 'success', data: insight });
});

/**
 * @desc    Get all unique categories
 * @route   GET /api/v1/insights/categories/list
 * @access  Public
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Insight.distinct('category', { isPublished: true });

  res.status(200).json({
    status: 'success',
    data: categories
  });
});

/**
 * @desc    Update insight
 * @route   PUT /api/v1/insights/:id
 * @access  Private
 */
exports.updateInsight = asyncHandler(async (req, res) => {
  delete req.body.createdBy;

  // If marking as featured, unmark any existing featured post
  if (req.body.featured) {
    await Insight.updateMany(
      { featured: true, _id: { $ne: req.params.id } },
      { featured: false }
    );
  }

  const insight = await Insight.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Insight updated successfully',
    data: insight
  });
});

/**
 * @desc    Delete insight
 * @route   DELETE /api/v1/insights/:id
 * @access  Private
 */
exports.deleteInsight = asyncHandler(async (req, res) => {
  const insight = await Insight.findByIdAndDelete(req.params.id);

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Insight deleted successfully',
    data: null
  });
});

/**
 * @desc    Toggle publish status
 * @route   PATCH /api/v1/insights/:id/publish
 * @access  Private
 */
exports.togglePublishStatus = asyncHandler(async (req, res) => {
  const insight = await Insight.findById(req.params.id);

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  insight.isPublished = !insight.isPublished;
  await insight.save();

  res.status(200).json({
    status: 'success',
    message: `Insight ${insight.isPublished ? 'published' : 'unpublished'} successfully`,
    data: insight
  });
});

/**
 * @desc    Toggle featured status (only one can be featured at a time)
 * @route   PATCH /api/v1/insights/:id/featured
 * @access  Private
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const insight = await Insight.findById(req.params.id);

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  if (!insight.featured) {
    // Unmark all others, mark this one
    await Insight.updateMany({ featured: true }, { featured: false });
    insight.featured = true;
  } else {
    insight.featured = false;
  }

  await insight.save();

  res.status(200).json({
    status: 'success',
    message: `Insight ${insight.featured ? 'featured' : 'unfeatured'} successfully`,
    data: insight
  });
});

/**
 * @desc    Update priority for a single insight
 * @route   PATCH /api/v1/insights/:id/priority
 * @access  Private
 */
exports.updatePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;

  if (priority === undefined || priority === null) {
    return res.status(400).json({ status: 'fail', message: 'Priority value is required' });
  }

  const insight = await Insight.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true, runValidators: true }
  );

  if (!insight) {
    return res.status(404).json({ status: 'fail', message: 'Insight not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Priority updated successfully',
    data: insight
  });
});

/**
 * @desc    Bulk reorder insight priorities
 * @route   PUT /api/v1/insights/priority/reorder
 * @access  Private
 */
exports.reorderPriorities = asyncHandler(async (req, res) => {
  const { insights } = req.body;

  if (!Array.isArray(insights) || insights.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide an array of insights with id and priority'
    });
  }

  const bulkOps = insights.map(({ id, priority }) => ({
    updateOne: {
      filter: { _id: id },
      update: { priority }
    }
  }));

  await Insight.bulkWrite(bulkOps);

  const updated = await Insight.find().sort('-priority -date');

  res.status(200).json({
    status: 'success',
    message: 'Priorities reordered successfully',
    data: updated
  });
});
