const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteTitle: { type: String },
    description: { type: String },
    profileInformation: { type: String },
    socialLinks: {
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String }
    },
    resumeUrl: { type: String },
    contactInformation: {
        email: { type: String },
        phone: { type: String }
    },
    seoSettings: {
        metaTitle: { type: String },
        metaDescription: { type: String },
        metaKeywords: { type: String }
    },
    themeSettings: {
        primaryColor: { type: String },
        mode: { type: String, enum: ['light', 'dark'], default: 'dark' }
    }
}, { 
    timestamps: true,
    collection: 'personal details' 
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
