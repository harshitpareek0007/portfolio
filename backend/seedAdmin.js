require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');
const connectDB = require('./config/database');

const seedAdmin = async () => {
    try {
        await connectDB();
        
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            console.error('ADMIN_EMAIL or ADMIN_PASSWORD missing from .env');
            process.exit(1);
        }

        const adminExists = await Admin.findOne({ email });

        if (adminExists) {
            console.log('Admin already exists.');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await Admin.create({
            email,
            passwordHash,
            role: 'superadmin'
        });

        console.log('Admin created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
