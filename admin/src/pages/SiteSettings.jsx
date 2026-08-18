import { useState, useEffect, useMemo } from 'react';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Toast } from '../components/ui/Toast';
import { Settings, User, Share2, Search, Palette, RotateCcw, Save, Layout, LayoutTemplate, MessageSquare } from 'lucide-react';
import * as siteSettingsService from '../services/siteSettingsService';

const TABS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'social', label: 'Social Links', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'theme', label: 'Theme', icon: Palette },
];

const PRESETS = [
    { name: 'Midnight', color: '#3b82f6' }, // Blue
    { name: 'Ocean', color: '#0ea5e9' }, // Sky
    { name: 'Emerald', color: '#10b981' }, // Emerald
    { name: 'Violet', color: '#8b5cf6' }, // Violet
    { name: 'Sunset', color: '#f97316' }, // Orange
    { name: 'Minimal', color: '#737373' } // Neutral
];

const initialFormState = {
    siteTitle: '',
    description: '',
    profileInformation: '',
    socialLinks: {
        github: '',
        linkedin: '',
        twitter: ''
    },
    resumeUrl: '',
    contactInformation: {
        email: '',
        phone: ''
    },
    seoSettings: {
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
    },
    themeSettings: {
        primaryColor: '#3b82f6',
        mode: 'dark'
    }
};

const SiteSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('general');
    
    // Data states
    const [savedData, setSavedData] = useState(initialFormState);
    const [formData, setFormData] = useState(initialFormState);
    
    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await siteSettingsService.getSettings();
            
            // Merge with defaults to ensure all nested structures exist
            const mergedData = {
                ...initialFormState,
                ...data,
                socialLinks: { ...initialFormState.socialLinks, ...(data?.socialLinks || {}) },
                contactInformation: { ...initialFormState.contactInformation, ...(data?.contactInformation || {}) },
                seoSettings: { ...initialFormState.seoSettings, ...(data?.seoSettings || {}) },
                themeSettings: { ...initialFormState.themeSettings, ...(data?.themeSettings || {}) }
            };

            setSavedData(mergedData);
            setFormData(mergedData);
        } catch (err) {
            setError('Unable to load site settings.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(savedData) !== JSON.stringify(formData);
    }, [savedData, formData]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const handleReset = () => {
        setFormData(savedData);
        showToast('Restored last saved settings.');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updatedData = await siteSettingsService.updateSettings(formData);
            
            const mergedData = {
                ...initialFormState,
                ...updatedData,
                socialLinks: { ...initialFormState.socialLinks, ...(updatedData?.socialLinks || {}) },
                contactInformation: { ...initialFormState.contactInformation, ...(updatedData?.contactInformation || {}) },
                seoSettings: { ...initialFormState.seoSettings, ...(updatedData?.seoSettings || {}) },
                themeSettings: { ...initialFormState.themeSettings, ...(updatedData?.themeSettings || {}) }
            };

            setSavedData(mergedData);
            setFormData(mergedData);
            showToast('Settings saved successfully.');
        } catch (err) {
            showToast('Unable to save settings.', 'error');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <p className="text-red-500 font-medium">{error}</p>
                <Button onClick={fetchSettings}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background relative -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl w-full mx-auto space-y-6 pb-24">
                
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border sticky top-0 z-10 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-text">Site Settings</h1>
                        <p className="text-sm text-muted">Manage global configuration and themes</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasUnsavedChanges && (
                            <span className="text-sm text-yellow-500 font-medium hidden sm:inline-block">Unsaved changes</span>
                        )}
                        <Button variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges || saving}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                        <Button onClick={handleSave} disabled={!hasUnsavedChanges || saving}>
                            {saving ? <Loader size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 shrink-0">
                        <div className="bg-surface border border-border rounded-xl p-2 sticky top-24 flex flex-row lg:flex-col overflow-x-auto">
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                            isActive 
                                            ? 'bg-primary/10 text-primary' 
                                            : 'text-text/70 hover:bg-background hover:text-text'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 bg-surface border border-border rounded-xl p-6 shadow-sm min-h-[500px]">
                        
                        {/* GENERAL SETTINGS */}
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-text mb-4">General Configuration</h2>
                                    <div className="space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Site Title</label>
                                            <Input 
                                                name="siteTitle" 
                                                value={formData.siteTitle} 
                                                onChange={handleFormChange} 
                                                placeholder="E.g., John Doe - Portfolio"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Description</label>
                                            <textarea 
                                                name="description" 
                                                value={formData.description} 
                                                onChange={handleFormChange} 
                                                rows={4}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                                placeholder="A short description of the site"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PROFILE SETTINGS */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-text mb-4">Profile Information</h2>
                                    <div className="space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Professional Title / Info</label>
                                            <Input 
                                                name="profileInformation" 
                                                value={formData.profileInformation} 
                                                onChange={handleFormChange} 
                                                placeholder="E.g., Full Stack Developer based in NY"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Resume URL</label>
                                            <Input 
                                                name="resumeUrl" 
                                                type="url"
                                                value={formData.resumeUrl} 
                                                onChange={handleFormChange} 
                                                placeholder="https://link-to-resume.pdf"
                                            />
                                        </div>
                                        <div className="pt-4 border-t border-border">
                                            <h3 className="text-md font-bold text-text mb-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-text mb-1">Email Address</label>
                                                    <Input 
                                                        type="email"
                                                        value={formData.contactInformation.email} 
                                                        onChange={(e) => handleNestedChange('contactInformation', 'email', e.target.value)} 
                                                        placeholder="contact@example.com"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-text mb-1">Phone Number</label>
                                                    <Input 
                                                        type="tel"
                                                        value={formData.contactInformation.phone} 
                                                        onChange={(e) => handleNestedChange('contactInformation', 'phone', e.target.value)} 
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SOCIAL LINKS */}
                        {activeTab === 'social' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-text mb-4">Social Links</h2>
                                    <div className="space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">GitHub URL</label>
                                            <Input 
                                                type="url"
                                                value={formData.socialLinks.github} 
                                                onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)} 
                                                placeholder="https://github.com/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">LinkedIn URL</label>
                                            <Input 
                                                type="url"
                                                value={formData.socialLinks.linkedin} 
                                                onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)} 
                                                placeholder="https://linkedin.com/in/username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Twitter / X URL</label>
                                            <Input 
                                                type="url"
                                                value={formData.socialLinks.twitter} 
                                                onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)} 
                                                placeholder="https://twitter.com/username"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SEO SETTINGS */}
                        {activeTab === 'seo' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold text-text mb-4">SEO Configuration</h2>
                                    <div className="space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Meta Title</label>
                                            <Input 
                                                value={formData.seoSettings.metaTitle} 
                                                onChange={(e) => handleNestedChange('seoSettings', 'metaTitle', e.target.value)} 
                                                placeholder="Overrides global site title for search engines"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Meta Description</label>
                                            <textarea 
                                                value={formData.seoSettings.metaDescription} 
                                                onChange={(e) => handleNestedChange('seoSettings', 'metaDescription', e.target.value)} 
                                                rows={3}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                                                placeholder="Appears in search engine results"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-1">Meta Keywords</label>
                                            <Input 
                                                value={formData.seoSettings.metaKeywords} 
                                                onChange={(e) => handleNestedChange('seoSettings', 'metaKeywords', e.target.value)} 
                                                placeholder="portfolio, developer, react (comma separated)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* THEME SETTINGS */}
                        {activeTab === 'theme' && (
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-xl font-bold text-text mb-4">Theme Customization</h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text mb-3">Color Presets</label>
                                            <div className="flex flex-wrap gap-3">
                                                {PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        type="button"
                                                        onClick={() => handleNestedChange('themeSettings', 'primaryColor', preset.color)}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                                                            formData.themeSettings.primaryColor === preset.color
                                                            ? 'border-primary bg-primary/10'
                                                            : 'border-border hover:border-text/30 bg-background'
                                                        }`}
                                                    >
                                                        <span 
                                                            className="w-4 h-4 rounded-full border border-black/20 dark:border-white/20" 
                                                            style={{ backgroundColor: preset.color }}
                                                        />
                                                        <span className="text-sm font-medium text-text">{preset.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                            <div>
                                                <label className="block text-sm font-medium text-text mb-1">Primary Color (Custom)</label>
                                                <div className="flex items-center gap-3">
                                                    <input 
                                                        type="color" 
                                                        value={formData.themeSettings.primaryColor || '#3b82f6'} 
                                                        onChange={(e) => handleNestedChange('themeSettings', 'primaryColor', e.target.value)}
                                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                                    />
                                                    <Input 
                                                        value={formData.themeSettings.primaryColor || ''} 
                                                        onChange={(e) => handleNestedChange('themeSettings', 'primaryColor', e.target.value)}
                                                        placeholder="#000000"
                                                        className="font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-text mb-1">Color Mode</label>
                                                <select
                                                    value={formData.themeSettings.mode || 'dark'}
                                                    onChange={(e) => handleNestedChange('themeSettings', 'mode', e.target.value)}
                                                    className="w-full h-12 bg-background border border-border text-text rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent block p-2.5"
                                                >
                                                    <option value="dark">Dark Mode</option>
                                                    <option value="light">Light Mode</option>
                                                </select>
                                                <p className="text-xs text-muted mt-2">Sets the default mode for the public portfolio.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-border pt-8">
                                    <h3 className="text-lg font-bold text-text mb-4">Live Preview</h3>
                                    <p className="text-sm text-muted mb-6">See how your theme configuration looks in an isolated component.</p>
                                    
                                    {/* Isolated Live Preview */}
                                    <div 
                                        className={`rounded-2xl border ${formData.themeSettings.mode === 'light' ? 'bg-white' : 'bg-gray-950'} p-8 max-w-3xl overflow-hidden relative shadow-lg`}
                                        style={{ 
                                            '--color-primary': formData.themeSettings.primaryColor,
                                        }}
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
                                        
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-2xl font-bold ${formData.themeSettings.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                                    Portfolio Heading
                                                </h4>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                    Badge Component
                                                </span>
                                            </div>
                                            
                                            <p className={`text-sm leading-relaxed ${formData.themeSettings.mode === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                This is an isolated live preview demonstrating how the selected primary color and mode affect various components. 
                                                The public portfolio will inherit these exact styles to ensure a consistent digital experience.
                                            </p>
                                            
                                            <div className="flex gap-3">
                                                <button className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
                                                    Primary CTA
                                                </button>
                                                <button className={`px-5 py-2.5 rounded-lg border font-medium text-sm transition-colors ${
                                                    formData.themeSettings.mode === 'light' 
                                                    ? 'border-gray-200 text-gray-700 hover:bg-gray-50' 
                                                    : 'border-gray-800 text-gray-300 hover:bg-gray-900'
                                                }`}>
                                                    Secondary Button
                                                </button>
                                            </div>
                                            
                                            <div className={`p-4 rounded-xl border ${formData.themeSettings.mode === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-gray-900 border-gray-800'} flex items-start gap-4`}>
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                                    <Palette className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <h5 className={`font-semibold mb-1 ${formData.themeSettings.mode === 'light' ? 'text-gray-900' : 'text-white'}`}>Interactive Element</h5>
                                                    <p className={`text-xs ${formData.themeSettings.mode === 'light' ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        Cards and interactive elements will use transparent primary backgrounds for hover states and active indicators.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
};

export default SiteSettings;
