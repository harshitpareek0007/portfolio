import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, FileText, Calendar, Eye, Save, ArrowLeft, Tag as TagIcon, Image as ImageIcon, Link } from 'lucide-react';
import * as blogService from '../services/blogService';

const initialFormState = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    tags: '',
    published: false,
    author: ''
};

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [view, setView] = useState('list'); // 'list', 'edit', 'preview'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // All, Published, Draft
    const [filterTag, setFilterTag] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, titleAsc, titleDesc
    
    // Editor & Data states
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    // Modal state for deletion
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await blogService.getBlogs();
            setBlogs(data);
        } catch (err) {
            setError('Unable to load blogs.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormError('');
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateView = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setFormError('');
        setView('edit');
    };

    const openEditView = (blog) => {
        setFormData({
            ...blog,
            tags: blog.tags ? blog.tags.join(', ') : ''
        });
        setEditingId(blog._id);
        setFormError('');
        setView('edit');
    };

    const openPreview = () => {
        setFormError('');
        if (!formData.title || !formData.content) {
            setFormError('Title and content are required to preview.');
            return;
        }
        setView('preview');
    };

    const closeEditor = () => {
        setView('list');
    };

    const openDeleteModal = (id) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setFormError('');
        setIsSubmitting(true);
        try {
            const tagsArray = formData.tags
                ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
                : [];
            
            let finalSlug = formData.slug ? formData.slug.trim() : generateSlug(formData.title);

            const payload = {
                ...formData,
                slug: finalSlug,
                tags: tagsArray
            };

            if (editingId) {
                await blogService.updateBlog(editingId, payload);
                showToast(payload.published ? 'Blog published successfully.' : 'Blog saved as draft.');
            } else {
                await blogService.createBlog(payload);
                showToast(payload.published ? 'Blog published successfully.' : 'Blog created successfully.');
            }
            setView('list');
            fetchBlogs();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await blogService.deleteBlog(deletingId);
            showToast('Blog deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchBlogs();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    // Extract dynamic tags for filter
    const dynamicTags = useMemo(() => {
        const tagsSet = new Set();
        blogs.forEach(b => {
            if (b.tags) b.tags.forEach(t => tagsSet.add(t));
        });
        return Array.from(tagsSet).sort();
    }, [blogs]);

    const filteredAndSortedBlogs = useMemo(() => {
        let result = [...blogs];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(b => 
                b.title.toLowerCase().includes(q) || 
                b.slug.toLowerCase().includes(q) ||
                (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
                (b.tags && b.tags.some(t => t.toLowerCase().includes(q)))
            );
        }

        // Status Filter
        if (filterStatus !== 'All') {
            const isPublished = filterStatus === 'Published';
            result = result.filter(b => b.published === isPublished);
        }

        // Tag Filter
        if (filterTag !== 'All') {
            result = result.filter(b => b.tags && b.tags.includes(filterTag));
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'titleAsc') return a.title.localeCompare(b.title);
            if (sortBy === 'titleDesc') return b.title.localeCompare(a.title);
            return 0;
        });

        return result;
    }, [blogs, searchQuery, filterStatus, filterTag, sortBy]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading && blogs.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && blogs.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchBlogs}>Retry</Button>
            </div>
        );
    }

    if (view === 'edit' || view === 'preview') {
        return (
            <div className="flex flex-col h-full bg-background relative -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="max-w-4xl w-full mx-auto space-y-6">
                    {/* Header Action Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border sticky top-0 z-10 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => view === 'preview' ? setView('edit') : closeEditor()} className="p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <div>
                                <h2 className="text-lg font-bold text-text">
                                    {view === 'preview' ? 'Preview Blog' : (editingId ? 'Edit Blog' : 'Create Blog')}
                                </h2>
                                <p className="text-sm text-muted">
                                    {formData.published ? 'Status: Published' : 'Status: Draft'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {view === 'edit' && (
                                <Button variant="outline" onClick={openPreview}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </Button>
                            )}
                            {view === 'preview' && (
                                <Button variant="outline" onClick={() => setView('edit')}>
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                            <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
                                {isSubmitting ? <Loader size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {formData.published ? 'Publish Blog' : 'Save Draft'}
                            </Button>
                        </div>
                    </div>

                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
                            {formError}
                        </div>
                    )}

                    {view === 'edit' && (
                        <div className="bg-surface border border-border rounded-xl p-6 space-y-6 shadow-sm">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Title *</label>
                                    <Input 
                                        name="title" 
                                        value={formData.title} 
                                        onChange={handleFormChange} 
                                        placeholder="Enter blog title..."
                                        className="text-lg font-medium py-3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1 flex items-center gap-2">
                                        <Link className="w-4 h-4" /> Slug
                                    </label>
                                    <Input 
                                        name="slug" 
                                        value={formData.slug} 
                                        onChange={handleFormChange} 
                                        placeholder="auto-generated-from-title"
                                    />
                                    <p className="text-xs text-muted mt-1">Leave empty to auto-generate from title. Must be unique.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text mb-1">Content *</label>
                                <textarea 
                                    name="content" 
                                    value={formData.content} 
                                    onChange={handleFormChange} 
                                    rows={15}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-y"
                                    placeholder="Write your blog content here..."
                                    required={formData.published}
                                />
                                {formData.published && !formData.content && (
                                    <p className="text-xs text-red-500 mt-1">Content is required before publishing.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-text mb-1">Excerpt</label>
                                    <textarea 
                                        name="excerpt" 
                                        value={formData.excerpt} 
                                        onChange={handleFormChange} 
                                        rows={4}
                                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                        placeholder="Short summary for blog cards..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1 flex items-center gap-2">
                                            <TagIcon className="w-4 h-4" /> Tags
                                        </label>
                                        <Input 
                                            name="tags" 
                                            value={formData.tags} 
                                            onChange={handleFormChange} 
                                            placeholder="react, web development, tutorial (comma separated)"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text mb-1 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" /> Cover Image URL
                                        </label>
                                        <Input 
                                            name="coverImage" 
                                            value={formData.coverImage} 
                                            onChange={handleFormChange} 
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-6 flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="published" 
                                        checked={formData.published} 
                                        onChange={handleFormChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-border peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ml-3 text-sm font-medium text-text">
                                        {formData.published ? 'Published (Visible to public)' : 'Draft (Hidden from public)'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    {view === 'preview' && (
                        <div className="bg-surface border border-border rounded-xl p-8 min-h-[500px]">
                            {formData.coverImage && (
                                <img src={formData.coverImage} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" />
                            )}
                            <h1 className="text-4xl font-bold text-text mb-4">{formData.title}</h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-8 pb-8 border-b border-border">
                                <div className="flex items-center gap-1 text-primary">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${formData.published ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                                        {formData.published ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                </div>
                                <span>{formatDate(new Date())}</span>
                                {formData.tags && (
                                    <div className="flex gap-2">
                                        {formData.tags.split(',').map((t, i) => t.trim() && (
                                            <span key={i} className="px-2 py-0.5 bg-background border border-border rounded-md">
                                                #{t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-invert max-w-none text-text">
                                <p className="whitespace-pre-wrap leading-relaxed text-lg">{formData.content}</p>
                            </div>
                        </div>
                    )}
                </div>
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Blogs</h1>
                    <p className="text-muted">Manage your articles and writings</p>
                </div>
                <Button onClick={openCreateView}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search blogs..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]"
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                    <select 
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]"
                    >
                        <option value="All">All Tags</option>
                        {dynamicTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[140px]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="titleAsc">Title A-Z</option>
                        <option value="titleDesc">Title Z-A</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedBlogs.length === 0 ? (
                    <EmptyState 
                        title="No Blogs Found" 
                        description={searchQuery || filterStatus !== 'All' || filterTag !== 'All' 
                            ? "No blogs match your filters." 
                            : "You haven't written any blog posts yet."}
                        action={!searchQuery && filterStatus === 'All' && filterTag === 'All' ? (
                            <Button onClick={openCreateView}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create your first post
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAndSortedBlogs.map(blog => (
                            <div key={blog._id} className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-primary/50 transition-colors shadow-sm group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                                        blog.published 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                                    }`}>
                                        {blog.published ? 'Published' : 'Draft'}
                                    </span>
                                    <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="sm" onClick={() => openEditView(blog)} className="h-8 w-8 p-0">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openDeleteModal(blog._id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-text mb-2 line-clamp-2" title={blog.title}>
                                    {blog.title}
                                </h3>
                                
                                <div className="text-sm text-muted flex items-center gap-2 mb-3">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{blog.publishedAt ? formatDate(blog.publishedAt) : formatDate(blog.createdAt)}</span>
                                </div>
                                
                                {blog.excerpt && (
                                    <p className="text-sm text-text/80 line-clamp-3 mb-4">
                                        {blog.excerpt}
                                    </p>
                                )}
                                
                                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                    {blog.tags && blog.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-background border border-border rounded-md text-xs text-muted">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => !isSubmitting && setIsDeleteModalOpen(false)} 
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-text">
                        Are you sure you want to delete this blog post? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="button" 
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600 text-white border-transparent"
                        >
                            {isSubmitting ? <Loader size="sm" className="mr-2" /> : null}
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
        </div>
    );
};

export default Blogs;
