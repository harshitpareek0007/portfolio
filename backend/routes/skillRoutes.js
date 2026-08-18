const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill
} = require('../controllers/skillController');

router.route('/')
    .get(getSkills)
    .post(protect, adminRole, createSkill);

router.route('/:id')
    .get(getSkill)
    .put(protect, adminRole, updateSkill)
    .delete(protect, adminRole, deleteSkill);

module.exports = router;
