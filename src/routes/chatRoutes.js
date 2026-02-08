const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");

// Middleware
const checkAuth = (req, res, next) => {
    if (req.session.username) next();
    else res.redirect("/");
};

// Chat Dashboard (Recent Conversations)
router.get("/chat", checkAuth, async (req, res) => {
    try {
        const currentUser = await User.findOne({ username: req.session.username });

        // Find distinct users who have chatted with current user
        const messages = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

        const contactsMap = new Map();
        messages.forEach(msg => {
            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg
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

        const contactsMap = new Map();
        messagesAll.forEach(msg => {
            const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
            if (!contactsMap.has(partner.username)) {
                contactsMap.set(partner.username, {
                    user: partner,
                    lastMessage: msg
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
router.post("/api/chat/send", checkAuth, async (req, res) => {
    try {
        const { recipientUsername, content, type, metadata } = req.body;
        const currentUser = await User.findOne({ username: req.session.username });
        const recipientUser = await User.findOne({ username: recipientUsername });

        if (!recipientUser) return res.status(404).json({ error: "User not found" });

        const newMessage = await Message.create({
            sender: currentUser._id,
            recipient: recipientUser._id,
            content: content,
            type: type || 'text',
            metadata: metadata || {}
        });

        res.json({ status: 'sent', message: newMessage });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to send" });
    }
});

// API: Get New Messages (Polling)
router.get("/api/chat/:username/poll", checkAuth, async (req, res) => {
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

module.exports = router;
