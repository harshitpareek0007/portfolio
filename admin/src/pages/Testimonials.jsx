import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Star, Quote } from 'lucide-react';
import * as testimonialService from '../services/testimonialService';

const initialFormState = {
    name: '',
    role: '',
    company: '',
    avatar: '',
    content: '',
    rating: '5',
    order: 0,
    published: true
};

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState('All'); // All, 5, 4, 3, 2, 1
    const [filterCompany, setFilterCompany] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, nameAsc, nameDesc, ratingHigh, ratingLow
    
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

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await testimonialService.getTestimonials();
            setTestimonials(data);
        } catch (err) {
            setError('Unable to load testimonials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestimonials();
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

    const openEditModal = (testimonial) => {
        setFormData({
            ...testimonial,
            rating: testimonial.rating ? testimonial.rating.toString() : '5'
        });
        setEditingId(testimonial._id);
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
                rating: Number(formData.rating),
                order: Number(formData.order)
            };

            if (editingId) {
                await testimonialService.updateTestimonial(editingId, payload);
                showToast('Testimonial updated successfully.');
            } else {
                await testimonialService.createTestimonial(payload);
                showToast('Testimonial added successfully.');
            }
            setIsFormModalOpen(false);
            fetchTestimonials();
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
            await testimonialService.deleteTestimonial(deletingId);
            showToast('Testimonial deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchTestimonials();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    // Extract dynamic companies from actual data for filter
    const dynamicCompanies = useMemo(() => {
        const companies = new Set();
        testimonials.forEach(t => {
            if (t.company && t.company.trim()) {
                companies.add(t.company.trim());
            }
        });
        return Array.from(companies).sort();
    }, [testimonials]);

    const filteredAndSortedTestimonials = useMemo(() => {
        let result = [...testimonials];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => 
                t.name.toLowerCase().includes(q) || 
                (t.role && t.role.toLowerCase().includes(q)) ||
                (t.company && t.company.toLowerCase().includes(q)) ||
                t.content.toLowerCase().includes(q)
            );
        }

        // Filters
        if (filterRating !== 'All') {
            result = result.filter(t => t.rating === Number(filterRating));
        }
        if (filterCompany !== 'All') {
            result = result.filter(t => t.company === filterCompany);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
            if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
            if (sortBy === 'ratingHigh') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'ratingLow') return (a.rating || 0) - (b.rating || 0);
            return 0;
        });

        return result;
    }, [testimonials, searchQuery, filterRating, filterCompany, sortBy]);

    const renderStars = (rating) => {
        if (!rating) return null;
        const validRating = Math.max(1, Math.min(5, Math.round(rating)));
        return (
            <div className="flex gap-0.5" aria-label={`Rating: ${validRating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= validRating ? 'fill-yellow-500 text-yellow-500' : 'text-border'}`} 
                    />
                ))}
            </div>
        );
    };

    if (loading && testimonials.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && testimonials.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchTestimonials}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Testimonials</h1>
                    <p className="text-muted">Manage client and colleague endorsements</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Testimonial
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search testimonials..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
                    <select 
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[120px]"
                    >
                        <option value="All">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                    {dynamicCompanies.length > 0 && (
                        <select 
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[140px]"
                        >
                            <option value="All">All Companies</option>
                            {dynamicCompanies.map(company => (
                                <option key={company} value={company}>{company}</option>
                            ))}
                        </select>
                    )}
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 min-w-[150px]"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="ratingHigh">Highest Rating</option>
                        <option value="ratingLow">Lowest Rating</option>
                        <option value="nameAsc">Name A-Z</option>
                        <option value="nameDesc">Name Z-A</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedTestimonials.length === 0 ? (
                    <EmptyState 
                        title="No Testimonials Found" 
                        description={searchQuery || filterRating !== 'All' || filterCompany !== 'All'
                            ? "No testimonials match your filters." 
                            : "You haven't added any testimonials yet."}
                        action={!searchQuery && filterRating === 'All' && filterCompany === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first testimonial
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {filteredAndSortedTestimonials.map(testimonial => (
                            <div key={testimonial._id} className="bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-primary/50 transition-colors shadow-sm relative">
                                <Quote className="w-8 h-8 text-primary/20 absolute top-6 right-6" />
                                
                                <div className="mb-4">
                                    {renderStars(testimonial.rating)}
                                </div>
                                
                                <p className="text-text/90 italic mb-6 flex-1 whitespace-pre-wrap">
                                    "{testimonial.content}"
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                    <div className="flex items-center gap-3">
                                        {testimonial.avatar ? (
                                            <img src={testimonial.avatar} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover border border-border" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {testimonial.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-text text-sm line-clamp-1" title={testimonial.name}>{testimonial.name}</h4>
                                            {(testimonial.role || testimonial.company) && (
                                                <p className="text-xs text-muted line-clamp-1" title={`${testimonial.role}${testimonial.role && testimonial.company ? ' · ' : ''}${testimonial.company}`}>
                                                    {testimonial.role}
                                                    {testimonial.role && testimonial.company && ' · '}
                                                    {testimonial.company}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-1 ml-4 shrink-0">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(testimonial)} className="h-8 w-8 p-0">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openDeleteModal(testimonial._id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
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
                title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {formError}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Person Name *</label>
                        <Input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleFormChange} 
                            required 
                            placeholder="E.g., John Doe"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Role</label>
                            <Input 
                                name="role" 
                                value={formData.role} 
                                onChange={handleFormChange} 
                                placeholder="E.g., Engineering Manager"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Company</label>
                            <Input 
                                name="company" 
                                value={formData.company} 
                                onChange={handleFormChange} 
                                placeholder="E.g., Tech Corp"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Rating (1-5)</label>
                            <select
                                name="rating"
                                value={formData.rating}
                                onChange={handleFormChange}
                                className="w-full bg-background border border-border text-text rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                            >
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Avatar URL</label>
                            <Input 
                                type="url"
                                name="avatar" 
                                value={formData.avatar} 
                                onChange={handleFormChange} 
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Testimonial Content *</label>
                        <textarea 
                            name="content" 
                            value={formData.content} 
                            onChange={handleFormChange} 
                            rows={4}
                            required
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                            placeholder="Amazing work and excellent communication throughout..."
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
                            {editingId ? 'Save Changes' : 'Add Testimonial'}
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
                        Are you sure you want to delete this testimonial? This action cannot be undone.
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

export default Testimonials;
