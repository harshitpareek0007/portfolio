const SiteSettings = require('../models/SiteSettings');

// Default settings if none exist
const defaultSettings = {
    siteTitle: 'My Portfolio',
    description: 'A showcase of my work and experience.',
    profileInformation: 'Full Stack Developer',
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
        metaTitle: 'My Portfolio',
        metaDescription: 'Welcome to my professional portfolio',
        metaKeywords: 'portfolio, developer'
    },
    themeSettings: {
        primaryColor: '#3b82f6',
        mode: 'dark'
    }
};

// @desc    Get site settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res, next) => {
    try {
        let settings = await SiteSettings.findOne({});

        // If no settings document exists, create one with defaults
        if (!settings) {
            settings = await SiteSettings.create(defaultSettings);
        }

        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

// @desc    Update site settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res, next) => {
    try {
        const { 
            siteTitle, 
            description, 
            profileInformation, 
            socialLinks, 
            resumeUrl, 
            contactInformation, 
            seoSettings, 
            themeSettings 
        } = req.body;

        let settings = await SiteSettings.findOne({});

        if (!settings) {
            settings = new SiteSettings(defaultSettings);
        }

        // Only update fields that are provided
        if (siteTitle !== undefined) settings.siteTitle = siteTitle;
        if (description !== undefined) settings.description = description;
        if (profileInformation !== undefined) settings.profileInformation = profileInformation;
        
        if (socialLinks !== undefined) {
            settings.socialLinks = {
                ...settings.socialLinks,
                ...socialLinks
            };
        }
        
        if (resumeUrl !== undefined) settings.resumeUrl = resumeUrl;
        
        if (contactInformation !== undefined) {
            settings.contactInformation = {
                ...settings.contactInformation,
                ...contactInformation
            };
        }
        
        if (seoSettings !== undefined) {
            settings.seoSettings = {
                ...settings.seoSettings,
                ...seoSettings
            };
        }
        
        if (themeSettings !== undefined) {
            settings.themeSettings = {
                ...settings.themeSettings,
                ...themeSettings
            };
        }

        const updatedSettings = await settings.save();
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    updateSettings
};
