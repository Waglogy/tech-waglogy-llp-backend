const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const queryRoutes = require('./queryRoutes');
const contactRoutes = require('./contactRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/queries', queryRoutes);
router.use('/contacts', contactRoutes);

module.exports = router;

