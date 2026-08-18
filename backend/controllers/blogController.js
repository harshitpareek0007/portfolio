const Blog = require('../models/Blog');

// Helper to generate a slug from a title
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric except spaces and hyphens
        .trim()
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-');         // Avoid consecutive hyphens
};

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public (only published), Admin (all)
const getBlogs = async (req, res, next) => {
    try {
        let query = {};
        
        // If not an admin, only return published blogs
        if (!req.user || req.user.role !== 'admin') {
            query.published = true;
        }

        const blogs = await Blog.find(query).sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public (if published), Admin
const getBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }

        // If not an admin and the blog is not published, return 404
        if (!blog.published && (!req.user || req.user.role !== 'admin')) {
            res.status(404);
            throw new Error('Blog not found');
        }

        res.status(200).json(blog);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private/Admin
const createBlog = async (req, res, next) => {
    try {
        let { title, slug, excerpt, content, coverImage, tags, published, author } = req.body;

        title = title ? title.trim() : '';
        content = content ? content.trim() : '';

        if (!title) {
            res.status(400);
            throw new Error('Title is required');
        }

        // Generate slug if empty
        slug = slug ? slug.trim() : generateSlug(title);
        
        if (!slug) {
            res.status(400);
            throw new Error('Valid slug is required');
        }

        // Ensure unique slug
        const existingBlog = await Blog.findOne({ slug });
        if (existingBlog) {
            res.status(400);
            throw new Error('A blog with this slug already exists. Please choose another.');
        }

        // Ensure content is provided if published
        if (published && !content) {
            res.status(400);
            throw new Error('Content is required for a published blog');
        }

        const publishedAt = published ? new Date() : null;

        const blog = await Blog.create({
            title,
            slug,
            excerpt,
            content,
            coverImage,
            tags: tags || [],
            published: !!published,
            publishedAt,
            author
        });

        res.status(201).json(blog);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
const updateBlog = async (req, res, next) => {
    try {
        let { title, slug, excerpt, content, coverImage, tags, published, author } = req.body;

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }

        if (title !== undefined) {
            title = title.trim();
            if (!title) {
                res.status(400);
                throw new Error('Title cannot be empty');
            }
            blog.title = title;
        }

        if (slug !== undefined) {
            slug = slug.trim() || generateSlug(title || blog.title);
            if (!slug) {
                res.status(400);
                throw new Error('Valid slug is required');
            }
            // Check uniqueness against other blogs
            const existingBlog = await Blog.findOne({ slug, _id: { $ne: blog._id } });
            if (existingBlog) {
                res.status(400);
                throw new Error('A blog with this slug already exists. Please choose another.');
            }
            blog.slug = slug;
        }

        if (content !== undefined) blog.content = content.trim();
        if (excerpt !== undefined) blog.excerpt = excerpt;
        if (coverImage !== undefined) blog.coverImage = coverImage;
        if (tags !== undefined) blog.tags = tags;
        if (author !== undefined) blog.author = author;

        if (published !== undefined) {
            const isPublishing = published && !blog.published;
            blog.published = published;
            
            // Set publishedAt if it's newly published and doesn't have one
            if (isPublishing && !blog.publishedAt) {
                blog.publishedAt = new Date();
            }
            
            // Ensure content is provided if published
            if (blog.published && !blog.content) {
                res.status(400);
                throw new Error('Content is required for a published blog');
            }
        }

        const updatedBlog = await blog.save();
        res.status(200).json(updatedBlog);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
const deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            res.status(404);
            throw new Error('Blog not found');
        }

        await blog.deleteOne();
        res.status(200).json({ message: 'Blog removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
};
