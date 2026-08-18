import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Briefcase, MapPin, Calendar } from 'lucide-react';
import * as experienceService from '../services/experienceService';

const initialFormState = {
    company: '',
    role: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    technologies: '',
    order: 0
};

const Experience = () => {
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // All, Current, Previous
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, company, order
    
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

    const fetchExperiences = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await experienceService.getExperiences();
            setExperiences(data);
        } catch (err) {
            setError('Unable to load experience.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExperiences();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'currentlyWorking') {
            setFormData(prev => ({
                ...prev,
                currentlyWorking: checked,
                endDate: checked ? '' : prev.endDate
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (exp) => {
        setFormData({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
            endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
            technologies: exp.technologies ? exp.technologies.join(', ') : ''
        });
        setEditingId(exp._id);
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

            // Remove endDate if currently working
            if (payload.currentlyWorking) {
                payload.endDate = null;
            }

            if (editingId) {
                await experienceService.updateExperience(editingId, payload);
                showToast('Experience updated successfully.');
            } else {
                await experienceService.createExperience(payload);
                showToast('Experience added successfully.');
            }
            setIsFormModalOpen(false);
            fetchExperiences();
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
            await experienceService.deleteExperience(deletingId);
            showToast('Experience deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchExperiences();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    const filteredAndSortedExperiences = useMemo(() => {
        let result = [...experiences];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e => 
                e.company.toLowerCase().includes(q) || 
                e.role.toLowerCase().includes(q) ||
                (e.location && e.location.toLowerCase().includes(q)) ||
                (e.technologies && e.technologies.some(t => t.toLowerCase().includes(q)))
            );
        }

        // Filters
        if (filterStatus !== 'All') {
            const isCurrent = filterStatus === 'Current';
            result = result.filter(e => e.currentlyWorking === isCurrent);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'order') return a.order - b.order;
            if (sortBy === 'newest') return new Date(b.startDate) - new Date(a.startDate);
            if (sortBy === 'oldest') return new Date(a.startDate) - new Date(b.startDate);
            if (sortBy === 'company') return a.company.localeCompare(b.company);
            return 0;
        });

        return result;
    }, [experiences, searchQuery, filterStatus, sortBy]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading && experiences.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && experiences.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchExperiences}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Experience</h1>
                    <p className="text-muted">Manage your work history</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search experience..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="All">All Status</option>
                        <option value="Current">Current</option>
                        <option value="Previous">Previous</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="company">Company A-Z</option>
                        <option value="order">Sort by Order</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedExperiences.length === 0 ? (
                    <EmptyState 
                        title="No Experience Found" 
                        description={searchQuery || filterStatus !== 'All' 
                            ? "No experience matches your filters." 
                            : "You haven't added any experience yet."}
                        action={!searchQuery && filterStatus === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first experience
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="space-y-6">
                        {filteredAndSortedExperiences.map((exp, index) => (
                            <div key={exp._id} className="relative pl-8 sm:pl-10">
                                {/* Timeline line */}
                                {index !== filteredAndSortedExperiences.length - 1 && (
                                    <div className="absolute top-8 left-[11px] sm:left-[19px] bottom-[-24px] w-[2px] bg-border" />
                                )}
                                
                                {/* Timeline dot */}
                                <div className="absolute top-6 left-0 sm:left-2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                </div>

                                <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-text mb-1">{exp.role}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
                                                <div className="flex items-center gap-1 font-medium text-text">
                                                    <Briefcase className="w-4 h-4 text-primary" />
                                                    {exp.company}
                                                </div>
                                                {exp.location && (
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-4 h-4" />
                                                        {exp.location}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(exp.startDate)} — {exp.currentlyWorking ? 'Present' : formatDate(exp.endDate)}
                                                </div>
                                            </div>
                                            
                                            <p className="text-text/90 whitespace-pre-wrap mb-4">
                                                {exp.description}
                                            </p>
                                            
                                            {exp.technologies && exp.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {exp.technologies.map((tech, i) => (
                                                        <span key={i} className="bg-background text-muted text-xs px-2 py-1 rounded border border-border">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(exp)} className="h-8 px-2">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteModal(exp._id)} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
                title={editingId ? 'Edit Experience' : 'Add Experience'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Company *</label>
                            <Input 
                                name="company" 
                                value={formData.company} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="E.g., Google"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Role *</label>
                            <Input 
                                name="role" 
                                value={formData.role} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="Software Engineer"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Location</label>
                        <Input 
                            name="location" 
                            value={formData.location} 
                            onChange={handleFormChange} 
                            placeholder="San Francisco, CA (Remote)"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Start Date *</label>
                            <Input 
                                type="date"
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleFormChange} 
                                required 
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">End Date {formData.currentlyWorking ? '(Present)' : '*'}</label>
                            <Input 
                                type="date"
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleFormChange} 
                                required={!formData.currentlyWorking}
                                disabled={formData.currentlyWorking}
                                className={formData.currentlyWorking ? 'opacity-50 cursor-not-allowed' : ''}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 pb-2">
                        <input 
                            type="checkbox" 
                            id="currentlyWorking"
                            name="currentlyWorking" 
                            checked={formData.currentlyWorking} 
                            onChange={handleFormChange} 
                            className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                        />
                        <label htmlFor="currentlyWorking" className="text-sm font-medium text-text">
                            I currently work here
                        </label>
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
                            placeholder="Describe your responsibilities and achievements..."
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

                    <div className="space-y-1 w-1/3">
                        <label className="text-sm font-medium text-text">Order</label>
                        <Input 
                            type="number" 
                            name="order" 
                            value={formData.order} 
                            onChange={handleFormChange} 
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
                            {editingId ? 'Save Changes' : 'Add Experience'}
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
                        Are you sure you want to delete this experience entry? This action cannot be undone.
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

export default Experience;
