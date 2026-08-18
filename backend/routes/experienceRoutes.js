const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getExperiences,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience
} = require('../controllers/experienceController');

router.route('/')
    .get(getExperiences)
    .post(protect, adminRole, createExperience);

router.route('/:id')
    .get(getExperience)
    .put(protect, adminRole, updateExperience)
    .delete(protect, adminRole, deleteExperience);

module.exports = router;
