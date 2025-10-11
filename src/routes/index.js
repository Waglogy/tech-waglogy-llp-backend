const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const queryRoutes = require('./queryRoutes');
const contactRoutes = require('./contactRoutes');
const paymentRoutes = require('./paymentRoutes');
const clientRoutes = require('./clientRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/queries', queryRoutes);
router.use('/contacts', contactRoutes);
router.use('/payments', paymentRoutes);
router.use('/clients', clientRoutes);

module.exports = router;

