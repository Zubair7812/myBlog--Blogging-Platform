const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Blog = require("../models/Blog");
const multer = require("multer");
const path = require("path");

// Middleware to check auth
const checkAuth = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect("/");
    }
};

// Multer for Profile Pics
const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "public/thumbnails"); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); },
});
const upload = multer({ storage: storage });

// Profile Page
router.get("/profile/:username", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) return res.render("notfound");

        const posts = await Blog.find({ author: user.username }).sort({ date: -1 });

        // Identify current user ID
        let currentUserId = null;
        if (req.session.username) {
            const currentUser = await User.findOne({ username: req.session.username });
            currentUserId = currentUser ? currentUser._id : null;
        }

        res.render("profile", {
            item: user.username, // Legacy support
            username: req.session.username, // Logged in user's username
            userdata: user, // Profile owner's data
            posts: posts,
            userType: req.session.type,
            currentUserId: currentUserId
        });
    } catch (err) {
        console.log(err);
        res.redirect("/home");
    }
});

// Edit Profile Routes
router.get("/editprofile/:username", checkAuth, async (req, res) => {
    if (req.session.username !== req.params.username) return res.redirect("/profile/" + req.params.username);
    const user = await User.findOne({ username: req.params.username });
    res.render("edit-profile", { username: req.session.username, userdata: user });
});

router.post("/editprofile/:username", checkAuth, upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            fullname: req.body.fullname,
            bio: req.body.bio,
            facebook: req.body.fb,
            twitter: req.body.tw,
            instagram: req.body.insta
        };
        if (req.file) updateData.dp = req.file.filename;

        await User.findOneAndUpdate({ username: req.session.username }, updateData);
        res.redirect("/profile/" + req.session.username);
    } catch (err) { res.redirect("/home"); }
});

const Notification = require("../models/Notification");

// ... (existing imports)

// Follow User
router.post("/follow/:id", checkAuth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findOne({ username: req.session.username });

        if (!targetUser || !currentUser) return res.json({ status: 'error' });

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
router.post("/unfollow/:id", checkAuth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        const currentUser = await User.findOne({ username: req.session.username });

        if (!targetUser || !currentUser) return res.json({ status: 'error' });

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

// Remove User (Admin)
router.get("/removeuser/:id", checkAuth, async (req, res) => {
    if (req.session.type === 'admin') {
        const user = await User.findById(req.params.id);
        await Blog.deleteMany({ author: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/admin");
    } else {
        res.redirect("/home");
    }
});

module.exports = router;
