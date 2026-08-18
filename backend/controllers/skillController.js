const Skill = require('../models/Skill');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res, next) => {
    try {
        const skills = await Skill.find({}).sort({ order: 1, name: 1 });
        res.status(200).json(skills);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Public
const getSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findById(req.params.id);
        
        if (!skill) {
            res.status(404);
            throw new Error('Skill not found');
        }

        res.status(200).json(skill);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private/Admin
const createSkill = async (req, res, next) => {
    try {
        let { name, category, level, icon, order } = req.body;

        name = name ? name.trim() : '';
        category = category ? category.trim() : '';
        level = Number(level);

        if (!name || !category) {
            res.status(400);
            throw new Error('Name and category are required');
        }

        if (isNaN(level) || level < 1 || level > 100) {
            res.status(400);
            throw new Error('Level must be a number between 1 and 100');
        }
        
        const existingSkill = await Skill.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            category: { $regex: new RegExp(`^${category}$`, 'i') } 
        });

        if (existingSkill) {
            res.status(400);
            throw new Error('This skill already exists in the specified category');
        }

        const skill = await Skill.create({
            name,
            category,
            level,
            icon,
            order: order !== undefined ? Number(order) : 0
        });

        res.status(201).json(skill);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
const updateSkill = async (req, res, next) => {
    try {
        let { name, category, level, icon, order } = req.body;

        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            res.status(404);
            throw new Error('Skill not found');
        }
        
        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                res.status(400);
                throw new Error('Name cannot be empty');
            }
            skill.name = name;
        }

        if (category !== undefined) {
            category = category.trim();
            if (!category) {
                res.status(400);
                throw new Error('Category cannot be empty');
            }
            skill.category = category;
        }

        if (level !== undefined) {
            const parsedLevel = Number(level);
            if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 100) {
                res.status(400);
                throw new Error('Level must be a number between 1 and 100');
            }
            skill.level = parsedLevel;
        }
        
        if (icon !== undefined) skill.icon = icon;
        if (order !== undefined) skill.order = Number(order);

        // Check for duplicates before updating
        if (name !== undefined || category !== undefined) {
            const checkName = name || skill.name;
            const checkCategory = category || skill.category;
            
            const existingSkill = await Skill.findOne({ 
                _id: { $ne: skill._id },
                name: { $regex: new RegExp(`^${checkName}$`, 'i') }, 
                category: { $regex: new RegExp(`^${checkCategory}$`, 'i') } 
            });

            if (existingSkill) {
                res.status(400);
                throw new Error('This skill already exists in the specified category');
            }
        }

        const updatedSkill = await skill.save();
        res.status(200).json(updatedSkill);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = async (req, res, next) => {
    try {
        const skill = await Skill.findById(req.params.id);

        if (!skill) {
            res.status(404);
            throw new Error('Skill not found');
        }

        await skill.deleteOne();
        res.status(200).json({ message: 'Skill removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill
};
