const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB\n");

        const users = await User.find({}).select('name email username');
        console.log(`Found ${users.length} users:\n`);

        users.forEach((u, i) => {
            console.log(`${i + 1}. Name: "${u.name}", Email: "${u.email}", Username: "${u.username}"`);
        });

        await mongoose.connection.close();
    } catch (e) {
        console.error("Error:", e.message);
        process.exit(1);
    }
}
run();
