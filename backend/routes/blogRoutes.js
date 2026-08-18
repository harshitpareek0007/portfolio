const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

// Helper middleware to optionally authenticate for GET requests
// If token exists, req.user will be populated, else it proceeds as guest
const optionalProtect = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    const Admin = require('../models/Admin');
    
    let token = req.cookies.jwt;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await Admin.findById(decoded.id).select('-password');
        } catch (error) {
            // Invalid token, ignore and proceed as guest
        }
    }
    next();
};

router.route('/')
    .get(optionalProtect, getBlogs)
    .post(protect, adminRole, createBlog);

router.route('/:id')
    .get(optionalProtect, getBlog)
    .put(protect, adminRole, updateBlog)
    .delete(protect, adminRole, deleteBlog);

module.exports = router;
