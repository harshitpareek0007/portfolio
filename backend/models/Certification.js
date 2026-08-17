const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: Date, required: true },
    credentialUrl: { type: String },
    credentialId: { type: String },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Certification', certificationSchema);
