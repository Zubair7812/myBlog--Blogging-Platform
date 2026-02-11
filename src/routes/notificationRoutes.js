const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const User = require("../models/User");

const { protect } = require("../middleware/authMiddleware");

// Middleware
// const checkAuth = (req, res, next) => {
//     if (req.session.username) next();
//     else res.status(401).json({ error: "Unauthorized" });
// };

// Get Notifications
router.get("/notifications", protect, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.user.username });
        const notifications = await Notification.find({ recipient: currentUser._id })
            .populate('sender', 'username dp')
            .populate('postId', 'title')
            .sort({ createdAt: -1 });

        // Mark as read
        await Notification.updateMany({ recipient: currentUser._id, read: false }, { $set: { read: true } });

        res.json({
            notifications,
            user: req.user.username,
            userType: req.user.type
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching notifications" });
    }
});

// Get Unread Count (API for Badge)
router.get("/notifications/unread", protect, async (req, res) => {
    if (!req.user || !req.user.username) return res.json({ count: 0 });
    try {
        const currentUser = await User.findOne({ username: req.user.username });
        if (!currentUser) return res.json({ count: 0 });

        const count = await Notification.countDocuments({ recipient: currentUser._id, read: false });
        res.json({ count });
    } catch (err) { res.json({ count: 0 }); }
});

module.exports = router;
