import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, GraduationCap, BookOpen, Calendar, Award } from 'lucide-react';
import * as educationService from '../services/educationService';

const initialFormState = {
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
    grade: '',
    order: 0
};

const Education = () => {
    const [educations, setEducations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // All, Current, Completed
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, instAsc, instDesc, order
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Form & Data states
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Validation
    const [formError, setFormError] = useState('');

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchEducations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await educationService.getEducations();
            setEducations(data);
        } catch (err) {
            setError('Unable to load education.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEducations();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormError('');
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setFormError('');
        setIsFormModalOpen(true);
    };

    const openEditModal = (edu) => {
        setFormData({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : '',
            endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''
        });
        setEditingId(edu._id);
        setFormError('');
        setIsFormModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                order: Number(formData.order)
            };

            // If empty end date, pass null
            if (!payload.endDate) {
                payload.endDate = null;
            }

            if (editingId) {
                await educationService.updateEducation(editingId, payload);
                showToast('Education updated successfully.');
            } else {
                await educationService.createEducation(payload);
                showToast('Education added successfully.');
            }
            setIsFormModalOpen(false);
            fetchEducations();
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
            await educationService.deleteEducation(deletingId);
            showToast('Education deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchEducations();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    const filteredAndSortedEducations = useMemo(() => {
        let result = [...educations];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e => 
                e.institution.toLowerCase().includes(q) || 
                e.degree.toLowerCase().includes(q) ||
                (e.field && e.field.toLowerCase().includes(q))
            );
        }

        // Filters (status based on endDate presence)
        if (filterStatus !== 'All') {
            if (filterStatus === 'Current') {
                result = result.filter(e => !e.endDate);
            } else if (filterStatus === 'Completed') {
                result = result.filter(e => !!e.endDate);
            }
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'order') return a.order - b.order;
            if (sortBy === 'newest') return new Date(b.startDate) - new Date(a.startDate);
            if (sortBy === 'oldest') return new Date(a.startDate) - new Date(b.startDate);
            if (sortBy === 'instAsc') return a.institution.localeCompare(b.institution);
            if (sortBy === 'instDesc') return b.institution.localeCompare(a.institution);
            return 0;
        });

        return result;
    }, [educations, searchQuery, filterStatus, sortBy]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading && educations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && educations.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchEducations}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Education</h1>
                    <p className="text-muted">Manage your academic background</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search institution, degree, field..." 
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
                        <option value="Current">Current / Present</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="instAsc">Institution A-Z</option>
                        <option value="instDesc">Institution Z-A</option>
                        <option value="order">Custom Order</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedEducations.length === 0 ? (
                    <EmptyState 
                        title="No Education Records Found" 
                        description={searchQuery || filterStatus !== 'All' 
                            ? "No records match your filters." 
                            : "You haven't added any education records yet."}
                        action={!searchQuery && filterStatus === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first record
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="space-y-6">
                        {filteredAndSortedEducations.map((edu, index) => (
                            <div key={edu._id} className="relative pl-8 sm:pl-10">
                                {/* Timeline line */}
                                {index !== filteredAndSortedEducations.length - 1 && (
                                    <div className="absolute top-8 left-[11px] sm:left-[19px] bottom-[-24px] w-[2px] bg-border" />
                                )}
                                
                                {/* Timeline dot */}
                                <div className="absolute top-6 left-0 sm:left-2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
                                    <GraduationCap className="w-3.5 h-3.5 text-primary" />
                                </div>

                                <div className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-text mb-1">{edu.degree}</h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted mb-4">
                                                <div className="flex items-center gap-1 font-medium text-text">
                                                    <BookOpen className="w-4 h-4 text-primary" />
                                                    {edu.institution}
                                                </div>
                                                {edu.field && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-border mx-1"></span>
                                                        {edu.field}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4 ml-1" />
                                                    {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : 'Present'}
                                                </div>
                                                {edu.grade && (
                                                    <div className="flex items-center gap-1 text-primary font-medium">
                                                        <Award className="w-4 h-4 ml-1" />
                                                        {edu.grade}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {edu.description && (
                                                <p className="text-text/90 whitespace-pre-wrap">
                                                    {edu.description}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(edu)} className="h-8 px-2">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => openDeleteModal(edu._id)} className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
                title={editingId ? 'Edit Education' : 'Add Education'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {formError}
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Institution *</label>
                        <Input 
                            name="institution" 
                            value={formData.institution} 
                            onChange={handleFormChange} 
                            required 
                            placeholder="E.g., Stanford University"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Degree *</label>
                            <Input 
                                name="degree" 
                                value={formData.degree} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="E.g., Bachelor of Science"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Field of Study</label>
                            <Input 
                                name="field" 
                                value={formData.field} 
                                onChange={handleFormChange} 
                                placeholder="E.g., Computer Science"
                            />
                        </div>
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
                            <label className="text-sm font-medium text-text">End Date (Leave empty if present)</label>
                            <Input 
                                type="date"
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleFormChange} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Grade / GPA</label>
                            <Input 
                                name="grade" 
                                value={formData.grade} 
                                onChange={handleFormChange} 
                                placeholder="E.g., 3.8/4.0 or First Class"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Order</label>
                            <Input 
                                type="number" 
                                name="order" 
                                value={formData.order} 
                                onChange={handleFormChange} 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleFormChange} 
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                            placeholder="Describe relevant coursework, activities, honors..."
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
                            {editingId ? 'Save Changes' : 'Add Education'}
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
                        Are you sure you want to delete this education record? This action cannot be undone.
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

export default Education;
