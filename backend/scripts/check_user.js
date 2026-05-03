const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');
        console.log('Connected to MongoDB');

        const email = 'mohammed.zubair.7812@gmail.com';
        console.log(`Checking for user with email: ${email}`);

        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            console.log('User FOUND:');
            console.log(`- Username: ${user.username}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- ID: ${user._id}`);
            console.log(`- Created At: ${user.createdAt || 'N/A'}`);
        } else {
            console.log('User NOT FOUND.');

            // Check by partial match or username
            const allUsers = await User.find({});
            console.log(`Total users in DB: ${allUsers.length}`);
            allUsers.forEach(u => console.log(` - ${u.username} (${u.email})`));
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
