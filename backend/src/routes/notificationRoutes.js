const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getNotifications, getUnreadCount } = require("../controllers/notificationController");

// Get Notifications
router.get("/notifications", protect, getNotifications);

// Get Unread Count (API for Badge)
router.get("/notifications/unread", protect, getUnreadCount);

module.exports = router;
