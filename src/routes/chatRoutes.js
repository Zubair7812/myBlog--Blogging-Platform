const express = require("express");
const router = express.Router();

// Middleware
const { protect } = require("../middleware/authMiddleware");

// Controllers
const {
    getContacts,
    getUnreadCount,
    sendMessage,
    markAsRead,
    getChat,
    pollMessages
} = require("../controllers/chatController");

// --- Static Routes (Must come before dynamic :username) ---

// API: Get Contacts & Global Unread
router.get("/chat/contacts", protect, getContacts);
router.get("/chat/unread-count", protect, getUnreadCount);

// API: Actions
router.post("/chat/send", protect, sendMessage);
router.post("/chat/mark-read", protect, markAsRead);

// Chat Dashboard fallback
router.get("/chat", protect, (req, res) => {
    res.json({ message: "Use /chat/contacts for dashboard data" });
});

// --- Dynamic Routes (Must come last) ---
router.get("/chat/:username", protect, getChat);
router.get("/chat/:username/poll", protect, pollMessages);

module.exports = router;
