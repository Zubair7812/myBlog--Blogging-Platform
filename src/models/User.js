const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6
    },
    // Keep existing fields for backward compatibility if needed, or remove if strict strict Phase 2 only
    username: { type: String }, // Mapped from name if needed or kept for old data
    fullname: String,
    dp: String,
    bio: String,
    weblink: String,
    facebook: String,
    whatsapp: String,
    twitter: String,
    instagram: String,
    phoneno: String,
    type: {
        type: String,
        default: 'user'
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
