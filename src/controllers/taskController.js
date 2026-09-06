const Task = require('../models/Task');
const Mission = require('../models/Mission');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @desc    Create a task under a mission
 * @route   POST /api/v1/missions/:missionId/tasks
 * @route   POST /api/v1/tasks
 * @access  Private
 */
exports.createTask = asyncHandler(async (req, res) => {
  const missionId = req.params.missionId || req.body.mission;

  const mission = await Mission.findById(missionId);
  if (!mission) {
    return res.status(404).json({ status: 'fail', message: 'Mission not found' });
  }

  req.body.mission = missionId;
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const task = await Task.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Task created successfully',
    data: task
  });
});

/**
 * @desc    Get tasks (flat, cross-mission — filterable)
 * @route   GET /api/v1/tasks
 * @access  Private
 */
exports.getTasks = asyncHandler(async (req, res) => {
  const queryObj = {};
  if (req.query.mission) queryObj.mission = req.query.mission;
  if (req.query.status && req.query.status !== 'all') queryObj.status = req.query.status;
  if (req.query.priority) queryObj.priority = req.query.priority;
  if (req.query.overdue === 'true') {
    queryObj.status = { $ne: 'done' };
    queryObj.dueDate = { $lt: new Date() };
  }

  const tasks = await Task.find(queryObj)
    .populate('mission', 'name status')
    .sort(req.query.sort ? req.query.sort.split(',').join(' ') : 'dueDate priority');

  res.status(200).json({
    status: 'success',
    count: tasks.length,
    data: tasks
  });
});

/**
 * @desc    Update a task
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
exports.updateTask = asyncHandler(async (req, res) => {
  // Ownership + parent mission are not changed through a normal update.
  delete req.body.createdBy;
  delete req.body.mission;
  delete req.body.completedAt; // managed by the model hook

  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Task updated successfully',
    data: task
  });
});

/**
 * @desc    Quick status change
 * @route   PATCH /api/v1/tasks/:id/status
 * @access  Private
 */
exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Task status updated',
    data: task
  });
});

/**
 * @desc    Bulk reorder tasks within a mission
 * @route   PUT /api/v1/tasks/reorder
 * @access  Private
 */
exports.reorderTasks = asyncHandler(async (req, res) => {
  const { tasks } = req.body; // [{ id, order }]

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'tasks array is required' });
  }

  await Promise.all(
    tasks.map((t) => Task.findByIdAndUpdate(t.id, { order: t.order }))
  );

  res.status(200).json({
    status: 'success',
    message: 'Tasks reordered',
    data: null
  });
});

/**
 * @desc    Delete a task
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
exports.deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return res.status(404).json({ status: 'fail', message: 'Task not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Task deleted successfully',
    data: null
  });
});
