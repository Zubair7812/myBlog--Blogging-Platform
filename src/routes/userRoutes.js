const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Blog = require("../models/Blog");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");

// Middleware to check auth
const { protect } = require("../middleware/authMiddleware");

// Middleware to check auth
// const checkAuth = (req, res, next) => {
//     if (req.session.username) {
//         next();
//     } else {
//         res.status(401).json({ error: "Unauthorized" });
//     }
// };

// Multer for Profile Pics
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "public/thumbnails"); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });

// Profile Page
router.get("/profile/:username", protect, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.status(404).json({ error: "User not found" });

        const posts = await Blog.find({ author: user.username }).sort({ date: -1 });

        // Identify current user ID
        let currentUserId = null;
        if (req.user && req.user.username) {
            const currentUser = await User.findOne({ username: req.user.username });
            currentUserId = currentUser ? currentUser._id : null;
        }

        res.json({
            username: req.user ? req.user.username : null, // Logged in user's username
            userdata: user, // Profile owner's data
            posts: posts,
            userType: req.user ? req.user.type : null,
            currentUserId: currentUserId
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching profile" });
    }
});

// Edit Profile Routes
router.post("/editprofile/:username", protect, upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            fullname: req.body.fullname,
            bio: req.body.bio,
            facebook: req.body.fb,
            twitter: req.body.tw,
            instagram: req.body.insta
        };
        if (req.file) updateData.dp = req.file.filename;

        await User.findOneAndUpdate({ username: req.user.username }, updateData);
        res.json({ message: "Profile updated" });
    } catch (err) {
        res.status(500).json({ error: "Error updating profile" });
    }
});

// Follow User
router.post("/follow/:id", protect, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findOne({ username: req.user.username });

        if (!targetUser || !currentUser) return res.status(400).json({ status: 'error' });

        // Add to following
        if (!currentUser.following.includes(targetUser._id)) {
            currentUser.following.push(targetUser._id);
            await currentUser.save();
        }

        // Add to followers
        if (!targetUser.followers.includes(currentUser._id)) {
            targetUser.followers.push(currentUser._id);
            await targetUser.save();

            // Create Notification
            if (!targetUser._id.equals(currentUser._id)) {
                await Notification.create({
                    recipient: targetUser._id,
                    sender: currentUser._id,
                    type: 'follow'
                });
            }
        }

        res.json({ status: 'followed', followersCount: targetUser.followers.length });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error' });
    }
});

// Unfollow User
router.post("/unfollow/:id", protect, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findOne({ username: req.user.username });

        if (!targetUser || !currentUser) return res.status(400).json({ status: 'error' });

        // Remove from following
        currentUser.following = currentUser.following.filter(id => !id.equals(targetUser._id));
        await currentUser.save();

        // Remove from followers
        targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUser._id));
        await targetUser.save();

        res.json({ status: 'unfollowed', followersCount: targetUser.followers.length });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error' });
    }
});

// Admin Dashboard Data
router.get("/admin", protect, async (req, res) => {
    if (req.user.type === 'admin') {
        try {
            const profiles = await User.find({});
            const posts = await Blog.find({});
            res.json({ profiles, posts });
        } catch (err) {
            res.status(500).json({ error: "Error fetching admin data" });
        }
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
});

// Remove User (Admin)
router.delete("/removeuser/:id", protect, async (req, res) => {
    if (req.user.type === 'admin') {
        const user = await User.findById(req.params.id);
        if (user) {
            await Blog.deleteMany({ author: user.username });
            await User.findByIdAndDelete(req.params.id);
            res.json({ message: "User removed" });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } else {
        res.status(403).json({ error: "Unauthorized" });
    }
});

module.exports = router;
