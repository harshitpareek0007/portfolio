const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getSettings,
    updateSettings
} = require('../controllers/siteSettingsController');

router.route('/')
    .get(getSettings) // Public access
    .put(protect, adminRole, updateSettings); // Protected admin access

module.exports = router;
