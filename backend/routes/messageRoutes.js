const express = require('express');
const router = express.Router();
const { protect, adminRole } = require('../middleware/authMiddleware');
const {
    getMessages,
    getMessage,
    createMessage,
    updateMessage,
    deleteMessage
} = require('../controllers/messageController');

// Basic rate limiting for public POST endpoint
const rateLimit = require('express-rate-limit');
const messageLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: { message: 'Too many messages sent from this IP, please try again later.' }
});

router.route('/')
    .get(protect, adminRole, getMessages)
    .post(messageLimiter, createMessage); // Public endpoint

router.route('/:id')
    .get(protect, adminRole, getMessage)
    .put(protect, adminRole, updateMessage)
    .delete(protect, adminRole, deleteMessage);

module.exports = router;
