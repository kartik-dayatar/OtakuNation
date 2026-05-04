const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, "Please provide your name"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Please provide your email"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address',
        ],
    },
    message: {
        type: String,
        required: [true, "Please provide a message"],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
