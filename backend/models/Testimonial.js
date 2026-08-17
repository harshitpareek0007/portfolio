const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String },
    company: { type: String },
    avatar: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
