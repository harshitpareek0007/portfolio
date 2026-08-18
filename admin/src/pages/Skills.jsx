import { useState, useEffect, useMemo } from 'react';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { Modal } from '../components/ui/Modal';
import { Toast } from '../components/ui/Toast';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import * as skillService from '../services/skillService';

const SUGGESTED_CATEGORIES = [
    'Frontend',
    'Backend',
    'Database',
    'Programming Languages',
    'DevOps',
    'Cloud',
    'AI / ML',
    'Tools',
    'Other'
];

const initialFormState = {
    name: '',
    category: 'Frontend',
    customCategory: '',
    level: 50,
    icon: '',
    order: 0
};

const Skills = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('levelDesc'); // nameAsc, nameDesc, levelDesc, levelAsc, category, order
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Form & Data states
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form Validation state
    const [formError, setFormError] = useState('');

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchSkills = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await skillService.getSkills();
            setSkills(data);
        } catch (err) {
            setError('Unable to load skills.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormError(''); // clear any validation error on typing
        
        let newValue = type === 'checkbox' ? checked : value;
        
        // Ensure level is a valid number between 1 and 100 during typing if possible,
        // or just let them type and validate on blur/submit. We will validate on submit.
        
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleLevelChange = (e) => {
        setFormError('');
        const val = e.target.value;
        // Allow empty string to let user clear the field before typing new number
        if (val === '') {
            setFormData(prev => ({ ...prev, level: '' }));
            return;
        }
        
        const num = Number(val);
        if (!isNaN(num)) {
            setFormData(prev => ({ ...prev, level: num }));
        }
    };

    const handleLevelBlur = () => {
        let num = Number(formData.level);
        if (isNaN(num) || num < 1) num = 1;
        if (num > 100) num = 100;
        setFormData(prev => ({ ...prev, level: num }));
    };

    const openCreateModal = () => {
        setFormData(initialFormState);
        setEditingId(null);
        setFormError('');
        setIsFormModalOpen(true);
    };

    const openEditModal = (skill) => {
        const isSuggested = SUGGESTED_CATEGORIES.includes(skill.category);
        setFormData({
            ...skill,
            category: isSuggested ? skill.category : 'Other',
            customCategory: isSuggested ? '' : skill.category
        });
        setEditingId(skill._id);
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
        
        let { name, category, customCategory, level, icon, order } = formData;
        
        const finalCategory = category === 'Other' && customCategory.trim() 
            ? customCategory.trim() 
            : category;

        if (!finalCategory) {
            setFormError('Category is required');
            return;
        }

        const numericLevel = Number(level);
        if (isNaN(numericLevel) || numericLevel < 1 || numericLevel > 100) {
            setFormError('Level must be between 1 and 100');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                category: finalCategory,
                level: numericLevel,
                icon,
                order: Number(order)
            };

            if (editingId) {
                await skillService.updateSkill(editingId, payload);
                showToast('Skill updated successfully.');
            } else {
                await skillService.createSkill(payload);
                showToast('Skill added successfully.');
            }
            setIsFormModalOpen(false);
            fetchSkills();
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
            await skillService.deleteSkill(deletingId);
            showToast('Skill deleted successfully.');
            setIsDeleteModalOpen(false);
            fetchSkills();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
            setDeletingId(null);
        }
    };

    // Extract dynamic categories from actual data for filter
    const dynamicCategories = useMemo(() => {
        const cats = new Set(skills.map(s => s.category));
        return Array.from(cats).sort();
    }, [skills]);

    const filteredAndSortedSkills = useMemo(() => {
        let result = [...skills];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(s => 
                s.name.toLowerCase().includes(q) || 
                s.category.toLowerCase().includes(q)
            );
        }

        // Filters
        if (filterCategory !== 'All') {
            result = result.filter(s => s.category === filterCategory);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'nameAsc') return a.name.localeCompare(b.name);
            if (sortBy === 'nameDesc') return b.name.localeCompare(a.name);
            if (sortBy === 'levelDesc') return b.level - a.level;
            if (sortBy === 'levelAsc') return a.level - b.level;
            if (sortBy === 'category') return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
            if (sortBy === 'order') return a.order - b.order;
            return 0;
        });

        return result;
    }, [skills, searchQuery, filterCategory, sortBy]);

    // Group skills by category for display
    const groupedSkills = useMemo(() => {
        const groups = {};
        filteredAndSortedSkills.forEach(skill => {
            if (!groups[skill.category]) {
                groups[skill.category] = [];
            }
            groups[skill.category].push(skill);
        });
        
        // Sort keys (categories) alphabetically, but keep 'Other' at the end if it exists
        return Object.keys(groups).sort((a, b) => {
            if (a === 'Other') return 1;
            if (b === 'Other') return -1;
            return a.localeCompare(b);
        }).map(category => ({
            category,
            items: groups[category]
        }));
    }, [filteredAndSortedSkills]);

    if (loading && skills.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error && skills.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchSkills}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text">Skills</h1>
                    <p className="text-muted">Manage your technical skills</p>
                </div>
                <Button onClick={openCreateModal}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                </Button>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                        placeholder="Search skills..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                    <select 
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="All">All Categories</option>
                        {dynamicCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-background border border-border text-text text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                    >
                        <option value="levelDesc">Level (High to Low)</option>
                        <option value="levelAsc">Level (Low to High)</option>
                        <option value="nameAsc">Name (A to Z)</option>
                        <option value="nameDesc">Name (Z to A)</option>
                        <option value="category">Category</option>
                        <option value="order">Custom Order</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-auto pb-6">
                {groupedSkills.length === 0 ? (
                    <EmptyState 
                        title="No Skills Found" 
                        description={searchQuery || filterCategory !== 'All' 
                            ? "No skills match your filters." 
                            : "You haven't added any skills yet."}
                        action={!searchQuery && filterCategory === 'All' ? (
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add your first skill
                            </Button>
                        ) : null}
                    />
                ) : (
                    <div className="space-y-8">
                        {groupedSkills.map(group => (
                            <div key={group.category} className="space-y-4">
                                <h2 className="text-xl font-bold text-text border-b border-border pb-2">
                                    {group.category}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {group.items.map(skill => (
                                        <div key={skill._id} className="bg-surface border border-border rounded-xl p-4 flex flex-col hover:border-primary/50 transition-colors">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-bold text-text truncate pr-2" title={skill.name}>{skill.name}</h3>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditModal(skill)} className="h-7 w-7 p-0">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => openDeleteModal(skill._id)} className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-auto space-y-1.5">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <span className="text-muted">Proficiency</span>
                                                    <span className="text-primary">{skill.level}%</span>
                                                </div>
                                                <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                                                    <div 
                                                        className="bg-primary h-2 rounded-full" 
                                                        style={{ width: `${skill.level}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                title={editingId ? 'Edit Skill' : 'Add Skill'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {formError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                            {formError}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text">Skill Name *</label>
                        <Input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleFormChange} 
                            required 
                            placeholder="E.g., React"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleFormChange}
                                required
                                className="w-full bg-background border border-border text-text rounded-lg focus:ring-primary focus:border-primary block p-2.5"
                            >
                                {SUGGESTED_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        {formData.category === 'Other' && (
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-text">Custom Category *</label>
                                <Input 
                                    name="customCategory" 
                                    value={formData.customCategory} 
                                    onChange={handleFormChange} 
                                    required={formData.category === 'Other'}
                                    placeholder="Enter category name"
                                />
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-text flex justify-between">
                            <span>Proficiency Level (1-100) *</span>
                            <span className="text-primary">{formData.level || 0}%</span>
                        </label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={formData.level || 1} 
                                onChange={handleLevelChange}
                                className="flex-1 h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                                aria-label="Skill Proficiency Level"
                            />
                            <Input 
                                type="number" 
                                value={formData.level} 
                                onChange={handleLevelChange} 
                                onBlur={handleLevelBlur}
                                min="1" 
                                max="100" 
                                required
                                className="w-20 text-center"
                                aria-label="Skill Proficiency Percentage"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Icon URL (optional)</label>
                            <Input 
                                name="icon" 
                                value={formData.icon} 
                                onChange={handleFormChange} 
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-text">Order (optional)</label>
                            <Input 
                                type="number" 
                                name="order" 
                                value={formData.order} 
                                onChange={handleFormChange} 
                            />
                        </div>
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
                            {editingId ? 'Save Changes' : 'Add Skill'}
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
                        Are you sure you want to delete this skill? This action cannot be undone.
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

export default Skills;
