const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// --- Signup ---
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ $or: [{ email }, { username: name }] });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: name,
            fullname: name,
            email,
            password: hashedPassword,
            type: 'user'
        });

        await newUser.save();

        // Auto-login
        req.session.user = newUser;
        req.session.username = newUser.username;
        req.session.type = newUser.type;
        req.session.useremail = newUser.email;

        res.status(201).json({ message: 'User created and logged in', user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Login Logic
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        req.session.user = user;
        req.session.username = user.username;
        req.session.type = user.type;
        req.session.useremail = user.email;

        res.json({ message: 'Logged in successfully', user: user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

// --- Logout ---
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: 'Could not log out' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Check Auth Status
router.get('/check-auth', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;
