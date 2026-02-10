const mongoose = require('mongoose');
const User = require('./src/models/User');
const Message = require('./src/models/Message');
const connectDB = require('./src/db');

require('dotenv').config();

const debug = async () => {
    await connectDB();

    // Hardcoded user from verify_db.js output
    const username = "Mohammed Zubair";

    console.log(`--- Debugging Contacts for: ${username} ---`);

    const currentUser = await User.findOne({ username: username });
    if (!currentUser) {
        console.error("User not found!");
        process.exit(1);
    }
    console.log(`User ID: ${currentUser._id}`);

    // LOGIC FROM ROUTE
    const messages = await Message.find({
        $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
    }).sort({ createdAt: -1 }).populate('sender recipient', 'username dp fullname');

    console.log(`Found ${messages.length} messages.`);

    if (messages.length > 0) {
        console.log("Sample Message 0:", messages[0]);
        console.log("Sample Message 0 sender type:", typeof messages[0].sender);
        console.log("Sample Message 0 sender _id:", messages[0].sender?._id);
    }

    const unreadStats = await Message.aggregate([
        { $match: { recipient: currentUser._id, read: false } },
        { $group: { _id: "$sender", count: { $sum: 1 } } }
    ]);
    const unreadMap = new Map(unreadStats.map(s => [s._id.toString(), s.count]));
    console.log("Unread Stats:", unreadStats);

    const contactsMap = new Map();
    messages.forEach((msg, index) => {
        if (!msg.sender || !msg.recipient) {
            console.log(`Msg ${index} missing sender/recipient`);
            return;
        }

        const partner = msg.sender._id.equals(currentUser._id) ? msg.recipient : msg.sender;
        // console.log(`Msg ${index} partner: ${partner.username}`);

        if (!contactsMap.has(partner.username)) {
            contactsMap.set(partner.username, {
                user: partner,
                lastMessage: msg,
                unreadCount: unreadMap.get(partner._id.toString()) || 0
            });
        }
    });

    const contacts = Array.from(contactsMap.values());
    console.log(`Generated ${contacts.length} contacts.`);
    contacts.forEach(c => console.log(` - Contact: ${c.user.username}, LastMsg: ${c.lastMessage.content}`));

    process.exit();
};

debug();
