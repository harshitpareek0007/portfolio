import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, ExternalLink, Github, Image as ImageIcon } from 'lucide-react';
import * as projectService from '../services/projectService';

const initialFormState = {
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    image: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    featured: false,
    published: true,
    order: 0
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPublished, setFilterPublished] = useState('All');
    const [filterFeatured, setFilterFeatured] = useState('All');
    const [sortBy, setSortBy] = useState('order'); // order, newest, oldest, title
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Form & Data states
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (err) {
            setError('Unable to load projects.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-generate slug from title if slug is empty or user is typing title in create mode
    const handleTitleChange = (e) => {
        const title = e.target.value;
        if (!editingId) {
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, title, slug }));
        } else {
            setFormData(prev => ({ ...prev, title }));
        }
    };

    const openCreateModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (project) => {
        setFormData({
            ...project,
            technologies: project.technologies ? project.technologies.join(', ') : ''
        });
        setEditingId(project._id);
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
                order: Number(formData.order)
            };

            if (editingId) {
                await projectService.updateProject(editingId, payload);
                showToast('Project updated successfully.');
            } else {
                await projectService.createProject(payload);
                showToast('Project created successfully.');
            }
            setIsFormModalOpen(false);
            fetchProjects();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        try {
            await projectService.deleteProject(deletingId);
            showToast('Project deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchProjects();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    const filteredAndSortedProjects = useMemo(() => {
        let result = [...projects];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.title.toLowerCase().includes(q) || 
                p.slug.toLowerCase().includes(q) ||
                (p.technologies && p.technologies.some(t => t.toLowerCase().includes(q)))
            );
        }

        // Filters
        if (filterPublished !== 'All') {
            const isPub = filterPublished === 'Published';
            result = result.filter(p => p.published === isPub);
        }
        if (filterFeatured !== 'All') {
            const isFeat = filterFeatured === 'Featured';
            result = result.filter(p => p.featured === isFeat);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'order') return a.order - b.order;
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            return 0;
        });

        return result;
    }, [projects, searchQuery, filterPublished, filterFeatured, sortBy]);

    if (loading && projects.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && projects.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchProjects}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Projects</h1>
                    <p className="text-muted">Manage your portfolio projects</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search projects..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <select 
                        value={filterPublished}
                        onChange={(e) => setFilterPublished(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                    <select 
                        value={filterFeatured}
                        onChange={(e) => setFilterFeatured(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="All">All Types</option>
                        <option value="Featured">Featured</option>
                        <option value="Normal">Normal</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="order">Sort by Order</option>
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="title">Title A-Z</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedProjects.length === 0 ? (
                    <EmptyState 
                        title="No Projects Found" 
                        description={searchQuery || filterPublished !== 'All' || filterFeatured !== 'All' 
                            ? "No projects match your filters." 
                            : "You haven't created any projects yet."}
                        action={!searchQuery && filterPublished === 'All' && filterFeatured === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create your first project
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedProjects.map((project) => (
                            <div key={project._id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-primary/50 transition-colors">
                                <div className="aspect-video bg-background relative border-b border-border">
                                    {project.image ? (
                                        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        {project.featured && (
                                            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow">
                                                Featured
                                            </span>
                                        )}
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full shadow ${project.published ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                                            {project.published ? 'Published' : 'Draft'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-text line-clamp-1 mb-1">{project.title}</h3>
                                    <p className="text-sm text-muted line-clamp-2 mb-4 flex-1">
                                        {project.shortDescription || project.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {project.technologies?.slice(0, 3).map((tech, i) => (
                                            <span key={i} className="bg-background text-muted text-xs px-2 py-1 rounded border border-border">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies?.length > 3 && (
                                            <span className="bg-background text-muted text-xs px-2 py-1 rounded border border-border">
                                                +{project.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                        <div className="flex gap-2">
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-text" title="GitHub">
                                                    <Github className="w-4 h-4" />
                                                </a>
                                            )}
                                            {project.liveUrl && (
                                                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-muted hover:text-text" title="Live Site">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(project)} className="h-8 px-2">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteModal(project._id)} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Form Modal */}
            <Modal 
                isOpen={isFormModalOpen} 
                onClose={() => !isSubmitting && setIsFormModalOpen(false)} 
                title={editingId ? 'Edit Project' : 'Add Project'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Title *</label>
                            <Input 
                                name="title" 
                                value={formData.title} 
                                onChange={handleTitleChange} 
                                required 
                                placeholder="E.g., My Awesome App"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Slug *</label>
                            <Input 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="my-awesome-app"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Short Description</label>
                        <Input 
                            name="shortDescription" 
                            value={formData.shortDescription} 
                            onChange={handleFormChange} 
                            placeholder="Brief summary for cards"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Description *</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleFormChange} 
                            required
                            rows={4}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                            placeholder="Detailed explanation of the project..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Image URL</label>
                        <Input 
                            name="image" 
                            value={formData.image} 
                            onChange={handleFormChange} 
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Technologies</label>
                        <Input 
                            name="technologies" 
                            value={formData.technologies} 
                            onChange={handleFormChange} 
                            placeholder="React, Node.js, MongoDB (comma separated)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">GitHub URL</label>
                            <Input 
                                name="githubUrl" 
                                value={formData.githubUrl} 
                                onChange={handleFormChange} 
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Live URL</label>
                            <Input 
                                name="liveUrl" 
                                value={formData.liveUrl} 
                                onChange={handleFormChange} 
                                placeholder="https://myapp.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="published"
                                name="published" 
                                checked={formData.published} 
                                onChange={handleFormChange} 
                                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                            />
                            <label htmlFor="published" className="text-sm font-medium text-text">Published</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="featured"
                                name="featured" 
                                checked={formData.featured} 
                                onChange={handleFormChange} 
                                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                            />
                            <label htmlFor="featured" className="text-sm font-medium text-text">Featured</label>
                        </div>
                        <div className="space-y-1 flex items-center gap-3">
                            <label className="text-sm font-medium text-text whitespace-nowrap">Order</label>
                            <Input 
                                type="number" 
                                name="order" 
                                value={formData.order} 
                                onChange={handleFormChange} 
                                className="w-20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsFormModalOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader size="sm" className="mr-2" /> : null}
                            {editingId ? 'Save Changes' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={isDeleteModalOpen} 
                onClose={() => !isSubmitting && setIsDeleteModalOpen(false)} 
                title="Confirm Deletion"
            >
                <div className="space-y-4">
                    <p className="text-text">
                        Are you sure you want to delete this project? This action cannot be undone.
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

export default Projects;
