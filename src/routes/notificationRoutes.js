const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

// Middleware
const checkAuth = (req, res, next) => {
    if (req.session.username) next();
    else res.redirect("/");
};

// Get Notifications (API or View)
router.get("/notifications", checkAuth, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });
        const notifications = await Notification.find({ recipient: currentUser._id })
            .populate('sender', 'username dp')
            .populate('postId', 'title')
            .sort({ createdAt: -1 });

        // Mark as read (optional logic: mark when viewed)
        // Mark as read (optional logic: mark when viewed)
        await Notification.updateMany({ recipient: currentUser._id, read: false }, { $set: { read: true } });

        res.render("notifications", {
            notifications,
            user: req.session.username,
            userType: req.session.type
        });
    } catch (err) {
        console.log(err);
        res.redirect("/home");
    }
});

// Get Unread Count (API for Badge)
router.get("/api/notifications/unread", async (req, res) => {
    if (!req.session.username) return res.json({ count: 0 });
    try {
        const currentUser = await User.findOne({ username: req.session.username });
        if (!currentUser) return res.json({ count: 0 });

        const count = await Notification.countDocuments({ recipient: currentUser._id, read: false });
        res.json({ count });
    } catch (err) { res.json({ count: 0 }); }
});

module.exports = router;
