const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Middleware for Views
const checkAuth = (req, res, next) => {
    if (req.session.username) next();
    else res.redirect("/");
};

// Middleware for APIs
const checkAuthApi = (req, res, next) => {
    if (req.session.username) next();
    else res.status(401).json({ error: "Unauthorized. Please login again." });
};

// Chat Dashboard (Recent Conversations)
router.get("/chat", checkAuth, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });

        // Find distinct users who have chatted with current user
        const messages = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

        // Calculate unread counts per sender
        const unreadStats = await Message.aggregate([
            { $match: { recipient: currentUser._id, read: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        const unreadMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));

        const contactsMap = new Map();
        messages.forEach(msg => {
            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: unreadMap.get(partner._id.toString()) || 0
                });
            }
        });

        const contacts = Array.from(contactsMap.values());

        res.render("chat", {
            user: req.session.username,
            userType: req.session.type,
            activeChat: null,
            contacts: contacts
        });
    } catch (err) {
        console.log(err);
        res.redirect("/home");
    }
});

// Specific Chat
router.get("/chat/:username", checkAuth, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });
        const targetUser = await User.findOne({ username: req.params.username });

        if (!targetUser) return res.redirect("/chat");

        // Same Logic for contacts list
        const messagesAll = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

        // Calculate unread counts per sender
        const unreadStats = await Message.aggregate([
            { $match: { recipient: currentUser._id, read: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        const unreadMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));

        const contactsMap = new Map();
        messagesAll.forEach(msg => {
            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: unreadMap.get(partner._id.toString()) || 0
                });
            }
        });
        const contacts = Array.from(contactsMap.values());

        // Get messages for this specific chat
        const chatMessages = await Message.find({
            $or: [
                { sender: currentUser._id, recipient: targetUser._id },
                { sender: targetUser._id, recipient: currentUser._id }
            ]
        }).sort({ createdAt: 1 });

        res.render("chat", {
            user: req.session.username,
            userType: req.session.type,
            activeChat: targetUser,
            messages: chatMessages,
            contacts: contacts,
            currentUserDetails: currentUser
        });
    } catch (err) {
        console.log(err);
        res.redirect("/chat");
    }
});

// API: Send Message
router.post("/api/chat/send", checkAuthApi, async (req, res) => {
    try {
        const { recipientUsername, content, type, metadata } = req.body;
        const currentUser = await User.findOne({ username: req.session.username });
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

// API: Get New Messages (Polling)
router.get("/api/chat/:username/poll", checkAuthApi, async (req, res) => {
    try {
        const lastId = req.query.lastId; // Pass last received message ID
        const currentUser = await User.findOne({ username: req.session.username });
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

// API: Get Global Unread Count
router.get("/api/chat/unread-count", checkAuthApi, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });
        const count = await Message.countDocuments({
            recipient: currentUser._id,
            read: false
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ count: 0 });
    }
});

// API: Mark messages as read
router.post("/api/chat/mark-read", checkAuthApi, async (req, res) => {
    try {
        const { senderUsername } = req.body;
        const currentUser = await User.findOne({ username: req.session.username });
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

// API: Get Contacts (Sidebar Polling)
router.get("/api/chat/contacts", checkAuthApi, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });

        // Find distinct users who have chatted with current user
        const messages = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

        // Calculate unread counts per sender
        const unreadStats = await Message.aggregate([
            { $match: { recipient: currentUser._id, read: false } },
            { $group: { _id: "$sender", count: { $sum: 1 } } }
        ]);
        const unreadMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));

        const contactsMap = new Map();
        messages.forEach(msg => {
            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg,
                    unreadCount: unreadMap.get(partner._id.toString()) || 0
                });
            }
        });

        const contacts = Array.from(contactsMap.values());
        res.json({ contacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ contacts: [] });
    }
});

module.exports = router;
