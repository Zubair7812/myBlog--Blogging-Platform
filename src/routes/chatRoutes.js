const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Middleware for APIs
const { protect } = require("../middleware/authMiddleware");

// Middleware for APIs
// const checkAuth = (req, res, next) => {
//     if (req.session.username) next();
//     else res.status(401).json({ error: "Unauthorized" });
// };

// --- Static Routes (Must come before dynamic :username) ---

// API: Get Contacts (Sidebar Polling)
router.get("/chat/contacts", protect, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.user.username });
        console.log(`Fetching contacts for: ${req.user.username}, ID: ${currentUser?._id}`);

        // Find distinct users who have chatted with current user
        const messages = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

        console.log(`Found ${messages.length} messages for user.`);

        // Calculate unread counts per sender
        const unreadStats = await Message.aggregate([
            { $match: { recipient: currentUser._id, read: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        const unreadMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));

        const contactsMap = new Map();
        messages.forEach(msg => {
            if (!msg.sender || !msg.recipient) return; // Skip if user deleted

            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;

            // Debug log
            // console.log(`Processing msg: ${msg._id}, Partner: ${partner.username}`);

            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: unreadMap.get(partner._id.toString()) || 0
                });
            }
        });

        const contacts = Array.from(contactsMap.values());
        console.log(`Returning ${contacts.length} contacts.`);

        res.json({ contacts });
    } catch (err) {
        console.error("Error in /api/chat/contacts:", err);
        res.status(500).json({ contacts: [] });
    }
});

// API: Get Global Unread Count
router.get("/chat/unread-count", protect, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.user.username });
        const count = await Message.countDocuments({
            recipient: currentUser._id,
            read: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ count: 0 });
    }
});

// API: Send Message
router.post("/chat/send", protect, async (req, res) => {
    try {
        const { recipientUsername, content, type, metadata } = req.body;
        const currentUser = await User.findOne({ username: req.user.username });
        const recipientUser = await User.findOne({ username: recipientUsername });

        if (!currentUser) return res.status(401).json({ error: "User session invalid" });
        if (!recipientUser) return res.status(404).json({ error: "Recipient not found" });

        const newMessage = await Message.create({
            sender: currentUser._id,
            recipient: recipientUser._id,
            content: content,
            type: type || 'text',
            metadata: metadata || {}
        });

        const populatedMsg = await newMessage.populate('sender recipient', 'username dp fullname');

        res.json({ status: 'sent', message: populatedMsg });
    } catch (err) {
        console.error("Send Message Error:", err);
        res.status(500).json({ error: "Failed to send", details: err.message });
    }
});

// API: Mark messages as read
router.post("/chat/mark-read", protect, async (req, res) => {
    try {
        const { senderUsername } = req.body;
        const currentUser = await User.findOne({ username: req.user.username });
        const sender = await User.findOne({ username: senderUsername });

        if (sender) {
            await Message.updateMany(
                { sender: sender._id, recipient: currentUser._id, read: false },
                { $set: { read: true } }
            );
        }
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
});

// Chat Dashboard (Recent Conversations) - Redundant with contacts, but kept for legacy if needed
// router.get("/chat", ... ) -> This is likely not used by React implementation, skipping or keeping simple.
router.get("/chat", protect, (req, res) => {
    res.json({ message: "Use /chat/contacts for dashboard data" });
});


// --- Dynamic Routes (Must come last) ---

// Specific Chat
router.get("/chat/:username", protect, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.user.username });
        const targetUser = await User.findOne({ username: req.params.username });

        if (!targetUser) return res.status(404).json({ error: "User not found" });

        // Messages for this specific chat
        const chatMessages = await Message.find({
            $or: [
                { sender: currentUser._id, recipient: targetUser._id },
                { sender: targetUser._id, recipient: currentUser._id }
            ]
        }).sort({ createdAt: 1 }).populate('sender recipient', 'username dp fullname');

        res.json({
            user: req.user.username,
            userType: req.user.type,
            activeChat: targetUser,
            messages: chatMessages,
            currentUserDetails: currentUser
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching chat" });
    }
});

// API: Get New Messages (Polling)
router.get("/chat/:username/poll", protect, async (req, res) => {
    try {
        const lastId = req.query.lastId; // Pass last received message ID
        const currentUser = await User.findOne({ username: req.user.username });
        const targetUser = await User.findOne({ username: req.params.username });

        const query = {
            $or: [
                { sender: currentUser._id, recipient: targetUser._id },
                { sender: targetUser._id, recipient: currentUser._id }
            ]
        };

        if (lastId) {
            query._id = { $gt: lastId };
        }

        const newMessages = await Message.find(query).sort({ createdAt: 1 });
        res.json({ messages: newMessages });

    } catch (err) { res.json({ messages: [] }); }
});

module.exports = router;
