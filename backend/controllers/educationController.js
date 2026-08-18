const Education = require('../models/Education');

// @desc    Get all education records
// @route   GET /api/education
// @access  Public
const getEducations = async (req, res, next) => {
    try {
        const education = await Education.find({}).sort({ order: 1, startDate: -1 });
        res.status(200).json(education);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single education record
// @route   GET /api/education/:id
// @access  Public
const getEducation = async (req, res, next) => {
    try {
        const education = await Education.findById(req.params.id);
        
        if (!education) {
            res.status(404);
            throw new Error('Education record not found');
        }

        res.status(200).json(education);
    } catch (error) {
        next(error);
    }
};

// @desc    Create an education record
// @route   POST /api/education
// @access  Private/Admin
const createEducation = async (req, res, next) => {
    try {
        let { institution, degree, field, startDate, endDate, description, grade, order } = req.body;

        institution = institution ? institution.trim() : '';
        degree = degree ? degree.trim() : '';

        if (!institution || !degree) {
            res.status(400);
            throw new Error('Institution and degree are required');
        }

        if (!startDate) {
            res.status(400);
            throw new Error('Start date is required');
        }

        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
            res.status(400);
            throw new Error('Invalid start date');
        }

        let end = null;
        if (endDate) {
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

        const education = await Education.create({
            institution,
            degree,
            field,
            startDate: start,
            endDate: end,
            description,
            grade,
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json(education);
    } catch (error) {
        next(error);
    }
};

// @desc    Update an education record
// @route   PUT /api/education/:id
// @access  Private/Admin
const updateEducation = async (req, res, next) => {
    try {
        let { institution, degree, field, startDate, endDate, description, grade, order } = req.body;

        const education = await Education.findById(req.params.id);

        if (!education) {
            res.status(404);
            throw new Error('Education record not found');
        }

        if (institution !== undefined) {
            institution = institution.trim();
            if (!institution) {
                res.status(400);
                throw new Error('Institution cannot be empty');
            }
            education.institution = institution;
        }

        if (degree !== undefined) {
            degree = degree.trim();
            if (!degree) {
                res.status(400);
                throw new Error('Degree cannot be empty');
            }
            education.degree = degree;
        }

        if (field !== undefined) education.field = field;
        if (description !== undefined) education.description = description;
        if (grade !== undefined) education.grade = grade;
        if (order !== undefined) education.order = Number(order);

        if (startDate !== undefined) {
            const start = new Date(startDate);
            if (isNaN(start.getTime())) {
                res.status(400);
                throw new Error('Invalid start date');
            }
            education.startDate = start;
        }

        if (endDate !== undefined) {
            if (endDate === null || endDate === '') {
                education.endDate = null;
            } else {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) {
                    res.status(400);
                    throw new Error('Invalid end date');
                }
                if (end < education.startDate) {
                    res.status(400);
                    throw new Error('End date cannot be earlier than start date');
                }
                education.endDate = end;
            }
        }

        const updatedEducation = await education.save();
        res.status(200).json(updatedEducation);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete an education record
// @route   DELETE /api/education/:id
// @access  Private/Admin
const deleteEducation = async (req, res, next) => {
    try {
        const education = await Education.findById(req.params.id);

        if (!education) {
            res.status(404);
            throw new Error('Education record not found');
        }

        await education.deleteOne();
        res.status(200).json({ message: 'Education record removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEducations,
    getEducation,
    createEducation,
    updateEducation,
    deleteEducation
};
