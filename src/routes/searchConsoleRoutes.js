const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Report = require('../models/SearchConsoleReport');
const { parseExport } = require('../utils/searchConsole');
const baseline = require('../data/search-console-baseline.json');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 1, parts: 2 } });
router.use(protect, authorize('admin'));
router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.get('/', asyncHandler(async (_req, res) => {
  const reports = await Report.find().select('-daily -queries -pages -countries -devices -importedBy').sort('-createdAt').limit(100).lean();
  const { daily, queries, pages, countries, devices, ...summary } = baseline;
  res.json({ data: [...reports, ...(reports.some(r => r.fingerprint === baseline.fingerprint) ? [] : [{ ...summary, isBaseline: true }])] });
}));
router.get('/:id', asyncHandler(async (req, res) => {
  if (req.params.id === 'baseline') return res.json({ data: baseline });
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid report ID.' });
  const report = await Report.findById(req.params.id).select('-importedBy').lean();
  if (!report) return res.status(404).json({ message: 'Report not found.' });
  res.json({ data: report });
}));
router.post('/', (req, res, next) => upload.single('file')(req, res, error => {
  if (error) return res.status(400).json({ message: 'Upload one Search Console ZIP file smaller than 2 MB.' });
  next();
}), asyncHandler(async (req, res) => {
  let data;
  try { data = parseExport(req.file?.buffer, req.body.property, req.file?.originalname); }
  catch (error) { return res.status(400).json({ message: error.message }); }
  if (data.fingerprint === baseline.fingerprint) return res.json({ data: baseline, duplicate: true });
  let report;
  try {
    report = await Report.findOneAndUpdate({ fingerprint: data.fingerprint }, { $setOnInsert: { ...data, importedBy: req.user.id } }, { upsert: true, new: true, runValidators: true });
  } catch (error) {
    if (error.code !== 11000) throw error;
    report = await Report.findOne({ fingerprint: data.fingerprint });
  }
  res.json({ data: report });
}));
module.exports = router;
