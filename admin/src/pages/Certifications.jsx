import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2, Award, ExternalLink, Building2, Calendar, FileText } from 'lucide-react';
import * as certificationService from '../services/certificationService';

const initialFormState = {
    name: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
    credentialId: '',
    description: ''
};

const Certifications = () => {
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterIssuer, setFilterIssuer] = useState('All');
    const [sortBy, setSortBy] = useState('newest'); // newest, oldest, nameAsc, nameDesc, issuerAsc
    
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

    const fetchCertifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await certificationService.getCertifications();
            setCertifications(data);
        } catch (err) {
            setError('Unable to load certifications.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertifications();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormError('');
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openCreateModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setFormError('');
        setIsFormModalOpen(true);
    };

    const openEditModal = (cert) => {
        setFormData({
            ...cert,
            issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString().split('T')[0] : ''
        });
        setEditingId(cert._id);
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
        
        if (formData.credentialUrl) {
            try {
                new URL(formData.credentialUrl);
            } catch (_) {
                setFormError('Please enter a valid HTTP/HTTPS URL for the credential.');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (!payload.credentialUrl) delete payload.credentialUrl;
            if (!payload.credentialId) delete payload.credentialId;
            if (!payload.description) delete payload.description;

            if (editingId) {
                await certificationService.updateCertification(editingId, payload);
                showToast('Certification updated successfully.');
            } else {
                await certificationService.createCertification(payload);
                showToast('Certification added successfully.');
            }
            setIsFormModalOpen(false);
            fetchCertifications();
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
            await certificationService.deleteCertification(deletingId);
            showToast('Certification deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchCertifications();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    // Extract dynamic issuers from actual data for filter
    const dynamicIssuers = useMemo(() => {
        const issuers = new Set(certifications.map(c => c.issuer));
        return Array.from(issuers).sort();
    }, [certifications]);

    const filteredAndSortedCertifications = useMemo(() => {
        let result = [...certifications];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c => 
                c.name.toLowerCase().includes(q) || 
                c.issuer.toLowerCase().includes(q) ||
                (c.credentialId && c.credentialId.toLowerCase().includes(q))
            );
        }

        // Filters
        if (filterIssuer !== 'All') {
            result = result.filter(c => c.issuer === filterIssuer);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.issueDate) - new Date(a.issueDate);
            if (sortBy === 'oldest') return new Date(a.issueDate) - new Date(b.issueDate);
            if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
            if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
            if (sortBy === 'issuerAsc') return a.issuer.localeCompare(b.issuer);
            return 0;
        });

        return result;
    }, [certifications, searchQuery, filterIssuer, sortBy]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading && certifications.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && certifications.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchCertifications}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Certifications</h1>
                    <p className="text-muted">Manage your professional achievements</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search certifications..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <select 
                        value={filterIssuer}
                        onChange={(e) => setFilterIssuer(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="All">All Issuers</option>
                        {dynamicIssuers.map(issuer => (
                            <option key={issuer} value={issuer}>{issuer}</option>
                        ))}
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="nameAsc">Name A-Z</option>
                        <option value="nameDesc">Name Z-A</option>
                        <option value="issuerAsc">Issuer A-Z</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredAndSortedCertifications.length === 0 ? (
                    <EmptyState 
                        title="No Certifications Found" 
                        description={searchQuery || filterIssuer !== 'All' 
                            ? "No certifications match your filters." 
                            : "You haven't added any certifications yet."}
                        action={!searchQuery && filterIssuer === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first certification
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedCertifications.map(cert => (
                            <div key={cert._id} className="bg-surface border border-border rounded-xl p-5 flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                                    <Award className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-text mb-2 line-clamp-2" title={cert.name}>
                                    {cert.name}
                                </h3>
                                
                                <div className="space-y-2 mb-6 flex-1">
                                    <div className="flex items-start gap-2 text-sm text-muted">
                                        <Building2 className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span className="line-clamp-1" title={cert.issuer}>{cert.issuer}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-muted">
                                        <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>Issued: {formatDate(cert.issueDate)}</span>
                                    </div>
                                    {cert.credentialId && (
                                        <div className="flex items-start gap-2 text-sm text-muted">
                                            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
                                            <span className="line-clamp-1 font-mono text-xs mt-0.5" title={cert.credentialId}>
                                                ID: {cert.credentialId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                                    <div>
                                        {cert.credentialUrl && (
                                            <a 
                                                href={cert.credentialUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                                            >
                                                View Credential <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => openEditModal(cert)} className="h-8 w-8 p-0">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => openDeleteModal(cert._id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
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
                title={editingId ? 'Edit Certification' : 'Add Certification'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {formError}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Certification Name *</label>
                        <Input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleFormChange} 
                            required 
                            placeholder="E.g., AWS Certified Solutions Architect"
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Issuer *</label>
                            <Input 
                                name="issuer" 
                                value={formData.issuer} 
                                onChange={handleFormChange} 
                                required 
                                placeholder="E.g., Amazon Web Services"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Issue Date *</label>
                            <Input 
                                type="date"
                                name="issueDate" 
                                value={formData.issueDate} 
                                onChange={handleFormChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Credential URL</label>
                        <Input 
                            type="url"
                            name="credentialUrl" 
                            value={formData.credentialUrl} 
                            onChange={handleFormChange} 
                            placeholder="https://www.credly.com/badges/..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Credential ID</label>
                        <Input 
                            name="credentialId" 
                            value={formData.credentialId} 
                            onChange={handleFormChange} 
                            placeholder="E.g., ABC123XYZ"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Description</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleFormChange} 
                            rows={3}
                            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                            placeholder="Briefly describe what this certification covers..."
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
                            {editingId ? 'Save Changes' : 'Add Certification'}
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
                        Are you sure you want to delete this certification? This action cannot be undone.
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

export default Certifications;
