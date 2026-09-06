const Mission = require('../models/Mission');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');

// Lower rank = more important. Used to pick each mission's "next action".
const PRIORITY_RANK = { P0: 0, P1: 1, P2: 2, P3: 3 };
const OPEN_STATUSES = ['todo', 'in-progress', 'blocked'];
const DAY_MS = 1000 * 60 * 60 * 24;

/** Whole days from now until `date` (negative = overdue), or null. */
function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY_MS);
}

/** The single most important open task in a list (P0 first, then soonest due, then order). */
function pickNextAction(tasks) {
  const open = tasks.filter((t) => t.status !== 'done');
  if (open.length === 0) return null;
  open.sort((a, b) => {
    const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (p !== 0) return p;
    const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
    if (ad !== bd) return ad - bd;
    return (a.order || 0) - (b.order || 0);
  });
  const t = open[0];
  return { _id: t._id, title: t.title, priority: t.priority, status: t.status, dueDate: t.dueDate };
}

/**
 * Attach `{ progress, taskCounts, nextAction, daysToDeadline }` to a set of
 * missions using a single Task query. Kept as one helper so the list and
 * dashboard endpoints stay consistent.
 */
async function enrichMissions(missions) {
  const ids = missions.map((m) => m._id);
  const tasks = await Task.find({ mission: { $in: ids } })
    .select('mission title status priority dueDate order')
    .lean();

  const byMission = {};
  tasks.forEach((t) => {
    const key = String(t.mission);
    (byMission[key] = byMission[key] || []).push(t);
  });

  return missions.map((m) => {
    const mTasks = byMission[String(m._id)] || [];
    const total = mTasks.length;
    const done = mTasks.filter((t) => t.status === 'done').length;
    const counts = { total, done, todo: 0, 'in-progress': 0, blocked: 0 };
    mTasks.forEach((t) => { if (t.status !== 'done') counts[t.status] += 1; });

    return {
      ...m.toObject(),
      progress: total ? Math.round((done / total) * 100) : 0,
      taskCounts: counts,
      nextAction: pickNextAction(mTasks),
      daysToDeadline: daysUntil(m.deadline)
    };
  });
}

/**
 * @desc    Get all missions (enriched with progress + next action)
 * @route   GET /api/v1/missions
 * @access  Private
 */
exports.getAllMissions = asyncHandler(async (req, res) => {
  const queryObj = {};
  if (req.query.status && req.query.status !== 'all') {
    queryObj.status = req.query.status;
  }
  if (req.query.search) {
    const rx = new RegExp(req.query.search, 'i');
    queryObj.$or = [{ name: rx }, { client: rx }, { description: rx }];
  }

  const sort = req.query.sort
    ? req.query.sort.split(',').join(' ')
    : 'status priority deadline -createdAt';

  const missions = await Mission.find(queryObj).sort(sort);
  const enriched = await enrichMissions(missions);

  res.status(200).json({
    status: 'success',
    count: enriched.length,
    data: enriched
  });
});

/**
 * @desc    One-shot overview: active missions + cross-project needs-attention
 * @route   GET /api/v1/missions/dashboard
 * @access  Private
 */
exports.getMissionDashboard = asyncHandler(async (req, res) => {
  // Cards: everything still in play, most important / soonest first.
  const activeMissions = await Mission.find({ status: { $nin: ['completed', 'cancelled'] } })
    .sort('priority deadline -createdAt');
  const missions = await enrichMissions(activeMissions);

  // Needs-attention: open tasks across all missions, tagged with mission name.
  const openTasks = await Task.find({ status: { $in: OPEN_STATUSES } })
    .populate('mission', 'name status')
    .sort('dueDate')
    .lean();

  // Ignore tasks whose mission is archived (completed/cancelled) or deleted.
  const live = openTasks.filter(
    (t) => t.mission && !['completed', 'cancelled'].includes(t.mission.status)
  );

  const shape = (t) => ({
    _id: t._id,
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
    missionId: t.mission._id,
    missionName: t.mission.name,
    daysToDue: daysUntil(t.dueDate)
  });

  const overdue = live.filter((t) => t.dueDate && daysUntil(t.dueDate) < 0).map(shape);
  const dueSoon = live
    .filter((t) => t.dueDate && daysUntil(t.dueDate) >= 0 && daysUntil(t.dueDate) <= 7)
    .map(shape);
  const highPriority = live
    .filter((t) => ['P0', 'P1'].includes(t.priority))
    .map(shape);

  const summary = {
    totalMissions: await Mission.countDocuments(),
    activeMissions: missions.length,
    openTasks: live.length,
    overdue: overdue.length
  };

  res.status(200).json({
    status: 'success',
    data: {
      missions,
      needsAttention: { overdue, dueSoon, highPriority },
      summary
    }
  });
});

/**
 * @desc    Get a single mission with its tasks
 * @route   GET /api/v1/missions/:id
 * @access  Private
 */
exports.getMission = asyncHandler(async (req, res) => {
  const mission = await Mission.findById(req.params.id).populate('createdBy', 'name email');

  if (!mission) {
    return res.status(404).json({ status: 'fail', message: 'Mission not found' });
  }

  // Sort: open before done, then P0 first, then soonest due, then manual order.
  const tasks = await Task.find({ mission: mission._id }).sort('order priority dueDate createdAt');

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;

  res.status(200).json({
    status: 'success',
    data: {
      mission,
      tasks,
      progress: total ? Math.round((done / total) * 100) : 0,
      taskCounts: { total, done }
    }
  });
});

/**
 * @desc    Create a mission
 * @route   POST /api/v1/missions
 * @access  Private
 */
exports.createMission = asyncHandler(async (req, res) => {
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const mission = await Mission.create(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Mission created successfully',
    data: mission
  });
});

/**
 * @desc    Update a mission
 * @route   PUT /api/v1/missions/:id
 * @access  Private
 */
exports.updateMission = asyncHandler(async (req, res) => {
  delete req.body.createdBy;

  const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!mission) {
    return res.status(404).json({ status: 'fail', message: 'Mission not found' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Mission updated successfully',
    data: mission
  });
});

/**
 * @desc    Delete a mission and all of its tasks
 * @route   DELETE /api/v1/missions/:id
 * @access  Private
 */
exports.deleteMission = asyncHandler(async (req, res) => {
  const mission = await Mission.findByIdAndDelete(req.params.id);

  if (!mission) {
    return res.status(404).json({ status: 'fail', message: 'Mission not found' });
  }

  // Cascade: a mission's tasks have no meaning without it.
  await Task.deleteMany({ mission: mission._id });

  res.status(200).json({
    status: 'success',
    message: 'Mission and its tasks deleted successfully',
    data: null
  });
});
