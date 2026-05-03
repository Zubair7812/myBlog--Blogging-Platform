const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const inspectUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');

        const users = await User.find({});
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            console.log(`Username: '${user.username}', Fullname: '${user.fullname || user.name}', Email: '${user.email}'`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectUsers();
