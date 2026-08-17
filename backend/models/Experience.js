const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    currentlyWorking: { type: Boolean, default: false },
    technologies: [{ type: String }],
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
