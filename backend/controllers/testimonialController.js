const Testimonial = require('../models/Testimonial');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res, next) => {
    try {
        const testimonials = await Testimonial.find({}).sort({ order: 1, createdAt: -1 });
        res.status(200).json(testimonials);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
const getTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        
        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        res.status(200).json(testimonial);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
const createTestimonial = async (req, res, next) => {
    try {
        let { name, role, company, avatar, content, rating, published, order } = req.body;

        name = name ? name.trim() : '';
        content = content ? content.trim() : '';

        if (!name) {
            res.status(400);
            throw new Error('Name is required');
        }

        if (!content) {
            res.status(400);
            throw new Error('Content is required');
        }

        if (rating !== undefined && rating !== null && rating !== '') {
            const numericRating = Number(rating);
            if (![1, 2, 3, 4, 5].includes(numericRating)) {
                res.status(400);
                throw new Error('Rating must be between 1 and 5');
            }
            rating = numericRating;
        } else {
            rating = undefined;
        }

        const testimonial = await Testimonial.create({
            name,
            role,
            company,
            avatar,
            content,
            rating,
            published: published !== undefined ? published : true,
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json(testimonial);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
const updateTestimonial = async (req, res, next) => {
    try {
        let { name, role, company, avatar, content, rating, published, order } = req.body;

        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                res.status(400);
                throw new Error('Name cannot be empty');
            }
            testimonial.name = name;
        }

        if (content !== undefined) {
            content = content.trim();
            if (!content) {
                res.status(400);
                throw new Error('Content cannot be empty');
            }
            testimonial.content = content;
        }

        if (rating !== undefined) {
            if (rating === null || rating === '') {
                testimonial.rating = undefined;
            } else {
                const numericRating = Number(rating);
                if (![1, 2, 3, 4, 5].includes(numericRating)) {
                    res.status(400);
                    throw new Error('Rating must be between 1 and 5');
                }
                testimonial.rating = numericRating;
            }
        }

        if (role !== undefined) testimonial.role = role;
        if (company !== undefined) testimonial.company = company;
        if (avatar !== undefined) testimonial.avatar = avatar;
        if (published !== undefined) testimonial.published = published;
        if (order !== undefined) testimonial.order = Number(order);

        const updatedTestimonial = await testimonial.save();
        res.status(200).json(updatedTestimonial);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
const deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);

        if (!testimonial) {
            res.status(404);
            throw new Error('Testimonial not found');
        }

        await testimonial.deleteOne();
        res.status(200).json({ message: 'Testimonial removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
};
