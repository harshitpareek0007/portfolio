const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const skillRoutes = require('./routes/skillRoutes');
const educationRoutes = require('./routes/educationRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(cors({
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/messages', messageRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
