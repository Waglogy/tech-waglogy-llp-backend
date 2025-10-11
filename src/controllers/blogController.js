const Blog = require('../models/Blog');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create new blog
 * @route   POST /api/v1/blogs
 * @access  Private
 */
exports.createBlog = asyncHandler(async (req, res) => {
  // Add user who created the blog
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const blog = await Blog.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Blog created successfully',
    data: blog
  });
});

/**
 * @desc    Get all blogs
 * @route   GET /api/v1/blogs
 * @access  Public
 */
exports.getAllBlogs = asyncHandler(async (req, res) => {
  // Build query
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'limit', 'sort', 'fields', 'search'];
  excludedFields.forEach(field => delete queryObj[field]);

  // Filter for published blogs only for non-authenticated users
  if (!req.user) {
    queryObj.isPublished = true;
  }

  let query = Blog.find(queryObj);

  // Search functionality
  if (req.query.search) {
    query = Blog.find({
      $and: [
        queryObj,
        {
          $or: [
            { title: { $regex: req.query.search, $options: 'i' } },
            { description: { $regex: req.query.search, $options: 'i' } },
            { tags: { $regex: req.query.search, $options: 'i' } }
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
    query = query.sort('-date'); // Default: newest first by date
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
  const blogs = await query.populate('createdBy', 'name email');
  const total = await Blog.countDocuments(
    req.query.search 
      ? {
          $and: [
            queryObj,
            {
              $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { tags: { $regex: req.query.search, $options: 'i' } }
              ]
            }
          ]
        }
      : queryObj
  );

  res.status(200).json({
    status: 'success',
    count: blogs.length,
    total: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: blogs
  });
});

/**
 * @desc    Get single blog by ID
 * @route   GET /api/v1/blogs/:id
 * @access  Public
 */
exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate('createdBy', 'name email');

  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  // Check if blog is published (unless authenticated)
  if (!blog.isPublished && !req.user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
});

/**
 * @desc    Get single blog by slug
 * @route   GET /api/v1/blogs/slug/:slug
 * @access  Public
 */
exports.getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug }).populate('createdBy', 'name email');

  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  // Check if blog is published (unless authenticated)
  if (!blog.isPublished && !req.user) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    status: 'success',
    data: blog
  });
});

/**
 * @desc    Update blog
 * @route   PUT /api/v1/blogs/:id
 * @access  Private
 */
exports.updateBlog = asyncHandler(async (req, res) => {
  // Don't allow updating createdBy
  delete req.body.createdBy;

  const blog = await Blog.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Blog updated successfully',
    data: blog
  });
});

/**
 * @desc    Delete blog
 * @route   DELETE /api/v1/blogs/:id
 * @access  Private
 */
exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);

  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Blog deleted successfully',
    data: null
  });
});

/**
 * @desc    Get blog statistics
 * @route   GET /api/v1/blogs/stats/summary
 * @access  Private
 */
exports.getBlogStats = asyncHandler(async (req, res) => {
  const totalBlogs = await Blog.countDocuments();
  const publishedBlogs = await Blog.countDocuments({ isPublished: true });
  const draftBlogs = await Blog.countDocuments({ isPublished: false });
  
  const totalViews = await Blog.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: '$views' }
      }
    }
  ]);

  // Get most viewed blogs
  const mostViewed = await Blog.find()
    .sort({ views: -1 })
    .limit(5)
    .select('title views date isPublished');

  // Get recent blogs
  const recentBlogs = await Blog.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title date isPublished views');

  // Get blogs by tag
  const blogsByTag = await Blog.aggregate([
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: totalViews[0]?.total || 0
      },
      mostViewed,
      recentBlogs,
      blogsByTag
    }
  });
});

/**
 * @desc    Toggle blog publish status
 * @route   PATCH /api/v1/blogs/:id/publish
 * @access  Private
 */
exports.togglePublishStatus = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return res.status(404).json({
      status: 'fail',
      message: 'Blog not found'
    });
  }

  blog.isPublished = !blog.isPublished;
  await blog.save();

  res.status(200).json({
    status: 'success',
    message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
    data: blog
  });
});

