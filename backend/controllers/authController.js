const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        const admin = await Admin.findOne({ email });

        if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
                expiresIn: '1d', // 1 day
            });

            // Set JWT in HTTP-Only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            res.json({
                authenticated: true,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get admin profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-passwordHash');
        
        if (admin) {
            res.json({
                authenticated: true,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role
                }
            });
        } else {
            res.status(404);
            throw new Error('Admin not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    getMe
};
