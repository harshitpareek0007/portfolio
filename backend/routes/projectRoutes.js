const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

// Publicly accessible but we can apply protection on writes
router.route('/')
    .get(getProjects)
    .post(protect, adminRole, createProject);

router.route('/:id')
    .get(getProject)
    .put(protect, adminRole, updateProject)
    .delete(protect, adminRole, deleteProject);

module.exports = router;
