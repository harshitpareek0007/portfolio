const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getEducations,
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation
} = require('../controllers/educationController');

router.route('/')
    .get(getEducations)
    .post(protect, adminRole, createEducation);

router.route('/:id')
    .get(getEducation)
    .put(protect, adminRole, updateEducation)
    .delete(protect, adminRole, deleteEducation);

module.exports = router;
