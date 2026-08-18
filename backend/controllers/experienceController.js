const Experience = require('../models/Experience');

// @desc    Get all experiences
// @route   GET /api/experience
// @access  Public
const getExperiences = async (req, res, next) => {
    try {
        const experiences = await Experience.find({}).sort({ order: 1, startDate: -1 });
        res.status(200).json(experiences);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single experience
// @route   GET /api/experience/:id
// @access  Public
const getExperience = async (req, res, next) => {
    try {
        const experience = await Experience.findById(req.params.id);
        
        if (!experience) {
            res.status(404);
            throw new Error('Experience not found');
        }

        res.status(200).json(experience);
    } catch (error) {
        next(error);
    }
};

// @desc    Create an experience
// @route   POST /api/experience
// @access  Private/Admin
const createExperience = async (req, res, next) => {
    try {
        const { company, role, location, description, startDate, endDate, currentlyWorking, technologies, order } = req.body;

        if (!company || !role || !description || !startDate) {
            res.status(400);
            throw new Error('Company, role, description, and start date are required');
        }
        
        // Backend validation for dates
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            res.status(400);
            throw new Error('Invalid start date');
        }

        let end = null;
        if (!currentlyWorking && endDate) {
            end = new Date(endDate);
            if (isNaN(end.getTime())) {
                res.status(400);
                throw new Error('Invalid end date');
            }
            if (end < start) {
                res.status(400);
                throw new Error('End date cannot be earlier than start date');
            }
        }

        const experience = await Experience.create({
            company,
            role,
            location,
            description,
            startDate: start,
            endDate: currentlyWorking ? null : end,
            currentlyWorking,
            technologies,
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json(experience);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an experience
// @route   PUT /api/experience/:id
// @access  Private/Admin
const updateExperience = async (req, res, next) => {
    try {
        const { company, role, location, description, startDate, endDate, currentlyWorking, technologies, order } = req.body;

        const experience = await Experience.findById(req.params.id);

        if (!experience) {
            res.status(404);
            throw new Error('Experience not found');
        }
        
        if (company) experience.company = company;
        if (role) experience.role = role;
        if (location !== undefined) experience.location = location;
        if (description) experience.description = description;
        
        if (startDate) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                res.status(400);
                throw new Error('Invalid start date');
            }
            experience.startDate = start;
        }

        if (currentlyWorking !== undefined) {
            experience.currentlyWorking = currentlyWorking;
        }

        if (experience.currentlyWorking) {
            experience.endDate = null;
        } else if (endDate !== undefined) {
            if (endDate === null || endDate === '') {
                experience.endDate = null;
            } else {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    res.status(400);
                    throw new Error('Invalid end date');
                }
                if (end < experience.startDate) {
                    res.status(400);
                    throw new Error('End date cannot be earlier than start date');
                }
                experience.endDate = end;
            }
        }

        if (technologies) experience.technologies = technologies;
        if (order !== undefined) experience.order = Number(order);

        const updatedExperience = await experience.save();
        res.status(200).json(updatedExperience);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an experience
// @route   DELETE /api/experience/:id
// @access  Private/Admin
const deleteExperience = async (req, res, next) => {
    try {
        const experience = await Experience.findById(req.params.id);

        if (!experience) {
            res.status(404);
            throw new Error('Experience not found');
        }

        await experience.deleteOne();
        res.status(200).json({ message: 'Experience removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getExperiences,
    getExperience,
    createExperience,
    updateExperience,
    deleteExperience
};
