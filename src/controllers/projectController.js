const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new project
 * @route   POST /api/v1/projects
 * @access  Private
 */
exports.createProject = asyncHandler(async (req, res) => {
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const project = await Project.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Project created successfully',
    data: project
  });
});

/**
 * @desc    Get all projects
 * @route   GET /api/v1/projects
 * @access  Public
 */
exports.getAllProjects = asyncHandler(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Only show published projects for non-authenticated users
  if (!req.user) {
    queryObj.isPublished = true;
  }

  let query = Project.find(queryObj);

  // Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-priority -createdAt');
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

  const projects = await query;
  const total = await Project.countDocuments(queryObj);

  res.status(200).json({
    status: 'success',
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: projects
  });
});

/**
 * @desc    Get single project by ID
 * @route   GET /api/v1/projects/:id
 * @access  Public
 */
exports.getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  if (!project.isPublished && !req.user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: project
  });
});

/**
 * @desc    Get single project by slug
 * @route   GET /api/v1/projects/slug/:slug
 * @access  Public
 */
exports.getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  if (!project.isPublished && !req.user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  res.status(200).json({
    status: 'success',
    data: project
  });
});

/**
 * @desc    Update project
 * @route   PUT /api/v1/projects/:id
 * @access  Private
 */
exports.updateProject = asyncHandler(async (req, res) => {
  delete req.body.createdBy;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Project updated successfully',
    data: project
  });
});

/**
 * @desc    Delete project
 * @route   DELETE /api/v1/projects/:id
 * @access  Private
 */
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Project deleted successfully',
    data: null
  });
});

/**
 * @desc    Toggle project publish status
 * @route   PATCH /api/v1/projects/:id/publish
 * @access  Private
 */
exports.togglePublishStatus = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  project.isPublished = !project.isPublished;
  await project.save();

  res.status(200).json({
    status: 'success',
    message: `Project ${project.isPublished ? 'published' : 'unpublished'} successfully`,
    data: project
  });
});

/**
 * @desc    Update priority for a single project
 * @route   PATCH /api/v1/projects/:id/priority
 * @access  Private
 */
exports.updatePriority = asyncHandler(async (req, res) => {
  const { priority } = req.body;

  if (priority === undefined || priority === null) {
    return res.status(400).json({
      status: 'fail',
      message: 'Priority value is required'
    });
  }

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { priority },
    { new: true, runValidators: true }
  );

  if (!project) {
    return res.status(404).json({
      status: 'fail',
      message: 'Project not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Priority updated successfully',
    data: project
  });
});

/**
 * @desc    Bulk reorder project priorities
 * @route   PUT /api/v1/projects/priority/reorder
 * @access  Private
 * @body    { projects: [{ id: "...", priority: 1 }, { id: "...", priority: 2 }] }
 */
exports.reorderPriorities = asyncHandler(async (req, res) => {
  const { projects } = req.body;

  if (!Array.isArray(projects) || projects.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide an array of projects with id and priority'
    });
  }

  const bulkOps = projects.map(({ id, priority }) => ({
    updateOne: {
      filter: { _id: id },
      update: { priority }
    }
  }));

  await Project.bulkWrite(bulkOps);

  const updated = await Project.find().sort('-priority -createdAt');

  res.status(200).json({
    status: 'success',
    message: 'Priorities reordered successfully',
    data: updated
  });
});
