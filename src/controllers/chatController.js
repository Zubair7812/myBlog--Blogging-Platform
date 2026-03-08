const Message = require("../models/Message");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Get chat contacts (Sidebar Polling)
// @route   GET /api/chat/contacts
// @access  Private
const getContacts = asyncHandler(async (req, res) => {
    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) {
        res.status(404);
        throw new Error("Current user not found");
    }

    // Find distinct users who have chatted with current user
    const messages = await Message.find({
        $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
    }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname').lean();

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
});

// @desc    Get Global Unread Count
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
    const currentUser = await User.findOne({ username: req.user.username });
    if (!currentUser) return res.json({ count: 0 });

    const count = await Message.countDocuments({
        recipient: currentUser._id,
        read: false
    });
    res.json({ count });
});

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
    const { recipientUsername, content, type, metadata } = req.body;
    const currentUser = await User.findOne({ username: req.user.username });
    const recipientUser = await User.findOne({ username: recipientUsername });

    if (!currentUser) {
        res.status(401);
        throw new Error("User session invalid");
    }
    if (!recipientUser) {
        res.status(404);
        throw new Error("Recipient not found");
    }

    const newMessage = await Message.create({
        sender: currentUser._id,
        recipient: recipientUser._id,
        content: content,
        type: type || 'text',
        metadata: metadata || {}
    });

    const populatedMsg = await newMessage.populate('sender recipient', 'username dp fullname');

    res.json({ status: 'sent', message: populatedMsg });
});

// @desc    Mark messages as read
// @route   POST /api/chat/mark-read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
    const { senderUsername } = req.body;
    const currentUser = await User.findOne({ username: req.user.username });
    const sender = await User.findOne({ username: senderUsername });

    if (sender && currentUser) {
        await Message.updateMany(
            { sender: sender._id, recipient: currentUser._id, read: false },
            { $set: { read: true } }
        );
    }
    res.json({ status: 'ok' });
});

// @desc    Get Specific Chat
// @route   GET /api/chat/:username
// @access  Private
const getChat = asyncHandler(async (req, res) => {
    const currentUser = await User.findOne({ username: req.user.username });
    const targetUser = await User.findOne({ username: req.params.username });

    if (!targetUser) {
        res.status(404);
        throw new Error("User not found");
    }

    // Messages for this specific chat
    const chatMessages = await Message.find({
        $or: [
            { sender: currentUser._id, recipient: targetUser._id },
            { sender: targetUser._id, recipient: currentUser._id }
        ]
    }).sort({ createdAt: 1 }).populate('sender recipient', 'username dp fullname').lean();

    res.json({
        user: req.user.username,
        userType: req.user.type,
        activeChat: targetUser,
        messages: chatMessages,
        currentUserDetails: currentUser
    });
});

// @desc    Poll New Messages
// @route   GET /api/chat/:username/poll
// @access  Private
const pollMessages = asyncHandler(async (req, res) => {
    const lastId = req.query.lastId; // Pass last received message ID
    const currentUser = await User.findOne({ username: req.user.username });
    const targetUser = await User.findOne({ username: req.params.username });

    if (!currentUser || !targetUser) return res.json({ messages: [] });

    const query = {
        $or: [
            { sender: currentUser._id, recipient: targetUser._id },
            { sender: targetUser._id, recipient: currentUser._id }
        ]
    };

    if (lastId) {
        query._id = { $gt: lastId };
    }

    const newMessages = await Message.find(query).sort({ createdAt: 1 }).lean();
    res.json({ messages: newMessages });
});

module.exports = {
    getContacts,
    getUnreadCount,
    sendMessage,
    markAsRead,
    getChat,
    pollMessages
};
