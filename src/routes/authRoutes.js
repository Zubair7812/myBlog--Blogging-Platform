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
            return res.send("<script>alert('User already exists');window.location.href = '/'</script>");
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
        req.session.user = newUser; // Store entire user object or just ID
        req.session.username = newUser.username; // Maintain backward compatibility for now
        req.session.type = newUser.type;
        req.session.useremail = newUser.email;

        res.redirect('/home');

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// --- Login ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.send("<script>alert('Wrong details');window.location.href = '/'</script>");
        }

        // Compare password
        // Check if password is hashed (legacy support check could go here if needed, but we're moving to bcrypt)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("<script>alert('Wrong Password');window.location.href = '/'</script>");
        }

        // Session setup
        req.session.user = user;
        req.session.username = user.username;
        req.session.type = user.type;
        req.session.useremail = user.email;

        if (user.type === 'admin') {
            res.redirect('admin');
        } else {
            // Update visits logic moved to middleware or specific route if needed
            res.redirect('home');
        }

    } catch (err) {
        console.error(err);
        res.send("<script>alert('Error logging in');window.location.href = '/'</script>");
    }
});

// --- Logout ---
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

module.exports = router;
