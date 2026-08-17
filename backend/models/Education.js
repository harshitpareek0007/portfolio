const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    field: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String },
    grade: { type: String },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
