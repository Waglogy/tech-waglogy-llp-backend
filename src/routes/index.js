const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const queryRoutes = require('./queryRoutes');
const contactRoutes = require('./contactRoutes');
const paymentRoutes = require('./paymentRoutes');
const clientRoutes = require('./clientRoutes');
const blogRoutes = require('./blogRoutes');
const himtoWaitlistRoutes = require('./himtoWaitlistRoutes');
const projectRoutes = require('./projectRoutes');
const uploadRoutes = require('./uploadRoutes');
const insightRoutes = require('./insightRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/queries', queryRoutes);
router.use('/contacts', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/clients', clientRoutes);
router.use('/blogs', blogRoutes);
router.use('/himto-waitlist', himtoWaitlistRoutes);
router.use('/projects', projectRoutes);
router.use('/upload', uploadRoutes);
router.use('/insights', insightRoutes);

module.exports = router;

