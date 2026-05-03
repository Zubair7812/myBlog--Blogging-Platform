const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;

    if (!username || !fullname || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists (email or username)
    const userExists = await User.findOne({
        $or: [
            { email: email.toLowerCase() },
            { username: username }
        ]
    });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists (Email or Username taken)');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name: fullname, // Map fullname to 'name' for backward compatibility
        fullname,      // Store explicitly too
        username,
        email,
        password: hashedPassword
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            dp: user.dp,
            bookmarks: user.bookmarks,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const identifier = email ? email.trim() : '';

    // Check for user by email OR username
    const user = await User.findOne({
        $or: [
            { email: identifier.toLowerCase() },
            { username: identifier } // Exact match for username, or we could use regex for case-insensitive
            // { username: new RegExp(`^${identifier}$`, 'i') } 
        ]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            dp: user.dp,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
