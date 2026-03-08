const Notification = require("../models/Notification");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Get all notifications and mark as read
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) {
        res.status(404);
        throw new Error("User not found");
    }

    const notifications = await Notification.find({ recipient: currentUser._id })
        .populate('sender', 'username dp')
        .populate('postId', 'title')
        .sort({ createdAt: -1 })
        .lean();

    // Mark as read
    await Notification.updateMany(
        { recipient: currentUser._id, read: false },
        { $set: { read: true } }
    );

    res.json({
        notifications,
        user: req.user.username,
        userType: req.user.type
    });
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    if (!req.user || !req.user.username) return res.json({ count: 0 });

    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) return res.json({ count: 0 });

    const count = await Notification.countDocuments({ recipient: currentUser._id, read: false });
    res.json({ count });
});

module.exports = {
    getNotifications,
    getUnreadCount
};
