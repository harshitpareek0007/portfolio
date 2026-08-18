const Message = require('../models/Message');

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({}).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Private/Admin
const getMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);
        
        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }

        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a message (Public Contact Form)
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res, next) => {
    try {
        let { name, email, subject, message } = req.body;

        name = name ? name.trim() : '';
        email = email ? email.trim() : '';
        subject = subject ? subject.trim() : '';
        message = message ? message.trim() : '';

        if (!name) {
            res.status(400);
            throw new Error('Name is required');
        }
        
        if (name.length > 100) {
            res.status(400);
            throw new Error('Name is too long');
        }

        if (!email) {
            res.status(400);
            throw new Error('Email is required');
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            res.status(400);
            throw new Error('Please provide a valid email address');
        }

        if (!message) {
            res.status(400);
            throw new Error('Message is required');
        }
        
        if (message.length > 5000) {
            res.status(400);
            throw new Error('Message is too long');
        }

        const newMessage = await Message.create({
            name,
            email,
            subject,
            message
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully.'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a message (e.g. mark as read)
// @route   PUT /api/messages/:id
// @access  Private/Admin
const updateMessage = async (req, res, next) => {
    try {
        const { read } = req.body;

        const message = await Message.findById(req.params.id);

        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }

        if (read !== undefined) {
            message.read = Boolean(read);
        }

        const updatedMessage = await message.save();
        res.status(200).json(updatedMessage);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            res.status(404);
            throw new Error('Message not found');
        }

        await message.deleteOne();
        res.status(200).json({ message: 'Message removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    getMessage,
    createMessage,
    updateMessage,
    deleteMessage
};
