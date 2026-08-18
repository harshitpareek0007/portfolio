const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} = require('../controllers/testimonialController');

router.route('/')
    .get(getTestimonials)
    .post(protect, adminRole, createTestimonial);

router.route('/:id')
    .get(getTestimonial)
    .put(protect, adminRole, updateTestimonial)
    .delete(protect, adminRole, deleteTestimonial);

module.exports = router;
