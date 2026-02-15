const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Full Name
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    // Login Handle
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true
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
    fullname: String, // Deprecated in favor of 'name', but keeping for now or mapping. PROPOSAL: Use 'name' as Full Name and 'username' as Handle. 
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
