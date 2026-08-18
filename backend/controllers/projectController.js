const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public (Optionally filtered for non-admins)
const getProjects = async (req, res, next) => {
    try {
        const query = {};
        
        // If not admin, only return published projects (this logic can be adjusted later)
        // For now, if we want the admin to see all, we can check if req.admin exists.
        // Since we are using this mostly for CMS right now, let's allow query params.
        if (req.query.published !== undefined) {
            query.published = req.query.published === 'true';
        }
        if (req.query.featured !== undefined) {
            query.featured = req.query.featured === 'true';
        }
        
        // Search by title or slug
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { slug: { $regex: req.query.search, $options: 'i' } },
                { technologies: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const sortObj = {};
        if (req.query.sort) {
            if (req.query.sort === 'newest') sortObj.createdAt = -1;
            else if (req.query.sort === 'oldest') sortObj.createdAt = 1;
            else if (req.query.sort === 'title') sortObj.title = 1;
            else if (req.query.sort === 'order') sortObj.order = 1;
        } else {
            sortObj.order = 1; // default sort
        }

        const projects = await Project.find(query).sort(sortObj);
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        res.status(200).json(project);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res, next) => {
    try {
        const { title, slug, description, shortDescription, image, technologies, githubUrl, liveUrl, featured, published, order } = req.body;

        // Basic validation
        if (!title || !slug || !description) {
            res.status(400);
            throw new Error('Title, slug, and description are required');
        }

        const projectExists = await Project.findOne({ slug });

        if (projectExists) {
            res.status(400);
            throw new Error('Project with this slug already exists');
        }

        const project = await Project.create({
            title,
            slug,
            description,
            shortDescription,
            image,
            technologies,
            githubUrl,
            liveUrl,
            featured,
            published,
            order
        });

        res.status(201).json(project);
    } catch (error) {
        // Handle MongoDB duplicate key error for slug
        if (error.code === 11000) {
            res.status(400);
            return next(new Error('Project with this slug already exists'));
        }
        next(error);
    }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res, next) => {
    try {
        const { title, slug, description, shortDescription, image, technologies, githubUrl, liveUrl, featured, published, order } = req.body;

        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        // Validate slug uniqueness if changed
        if (slug && slug !== project.slug) {
            const slugExists = await Project.findOne({ slug });
            if (slugExists) {
                res.status(400);
                throw new Error('Project with this slug already exists');
            }
        }

        project.title = title !== undefined ? title : project.title;
        project.slug = slug !== undefined ? slug : project.slug;
        project.description = description !== undefined ? description : project.description;
        project.shortDescription = shortDescription !== undefined ? shortDescription : project.shortDescription;
        project.image = image !== undefined ? image : project.image;
        project.technologies = technologies !== undefined ? technologies : project.technologies;
        project.githubUrl = githubUrl !== undefined ? githubUrl : project.githubUrl;
        project.liveUrl = liveUrl !== undefined ? liveUrl : project.liveUrl;
        project.featured = featured !== undefined ? featured : project.featured;
        project.published = published !== undefined ? published : project.published;
        project.order = order !== undefined ? order : project.order;

        const updatedProject = await project.save();
        res.status(200).json(updatedProject);
    } catch (error) {
         // Handle MongoDB duplicate key error for slug
        if (error.code === 11000) {
            res.status(400);
            return next(new Error('Project with this slug already exists'));
        }
        next(error);
    }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        await project.deleteOne();
        res.status(200).json({ message: 'Project removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
};
