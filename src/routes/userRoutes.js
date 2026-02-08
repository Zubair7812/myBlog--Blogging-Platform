const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { ensureAuthenticated } = require('../middleware/auth');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/thumbnails");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// --- View Profile ---
router.get('/profile/:username', ensureAuthenticated, async (req, res) => {
    try {
        const profileUser = await User.findOne({ username: req.params.username });
        if (!profileUser) return res.render('notfound');

        const userPosts = await Blog.find({ author: req.params.username });

        res.render('profile', {
            username: req.session.username, // Logged in user
            posts: userPosts,
            userdata: profileUser, // Profile owner
            date: Date.now()
        });
    } catch (err) {
        console.log(err);
        res.render('notfound');
    }
});

// --- Edit Profile ---
router.get('/editprofile/:username', ensureAuthenticated, async (req, res) => {
    if (req.session.username !== req.params.username) {
        return res.render('notfound');
    }

    try {
        const user = await User.findOne({ username: req.session.username });
        res.render('edit-profile', {
            username: req.session.username,
            email: req.session.useremail,
            userdata: user
        });
    } catch (err) {
        res.render('notfound');
    }
});

router.post('/editprofile/:username', ensureAuthenticated, upload.single("image"), async (req, res) => {
    if (req.session.username !== req.params.username) {
        return res.redirect('/home');
    }

    try {
        const updateData = {
            fullname: req.body.fullname,
            bio: req.body.bio,
            weblink: req.body.weblink,
            facebook: req.body.fb,
            whatsapp: req.body.wa,
            twitter: req.body.tw,
            instagram: req.body.insta,
            phoneno: req.body.phno,
        };

        if (req.file) {
            updateData.dp = req.file.filename;
        }

        await User.findOneAndUpdate({ username: req.session.username }, updateData);
        res.redirect('/profile/' + req.session.username);

    } catch (err) {
        console.log(err);
        res.redirect('/home');
    }
});

module.exports = router;
