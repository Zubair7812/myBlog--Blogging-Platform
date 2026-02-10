const mongoose = require('mongoose');
const User = require('./src/models/User');
const Message = require('./src/models/Message');
const connectDB = require('./src/db');

require('dotenv').config();

const verify = async () => {
    await connectDB();

    console.log("--- Users ---");
    const users = await User.find({});
    users.forEach(u => console.log(`User: ${u.username}, ID: ${u._id}`));

    console.log("\n--- Messages ---");
    const messages = await Message.find({}).sort({ createdAt: -1 }).limit(10).populate('sender recipient', 'username');

    messages.forEach(msg => {
        console.log(`Msg: ${msg.content}`);
        console.log(`  Sender: ${msg.sender ? msg.sender.username : 'NULL'} (${msg.sender ? msg.sender._id : 'N/A'})`);
        console.log(`  Recipient: ${msg.recipient ? msg.recipient.username : 'NULL'} (${msg.recipient ? msg.recipient._id : 'N/A'})`);
    });

    if (users.length > 0) {
        const currentUser = users[0]; // Pick first user to test logic
        console.log(`\n--- Testing Logic for User: ${currentUser.username} ---`);

        const userMessages = await Message.find({
            $or: [{ sender: currentUser._id }, { recipient: currentUser._id }]
        }).populate('sender recipient');

        console.log(`Found ${userMessages.length} messages for ${currentUser.username}`);

        userMessages.forEach(msg => {
            const isSender = msg.sender && msg.sender._id.equals(currentUser._id);
            const partner = isSender ? msg.recipient : msg.sender;
            console.log(`  Partner: ${partner ? partner.username : 'NULL'}`);
        });
    }

    process.exit();
};

verify();
