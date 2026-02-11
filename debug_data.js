const mongoose = require('mongoose');
const User = require('./src/models/User');
const Blog = require('./src/models/Blog');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const users = await User.find({}, 'username email name _id');
        console.log('--- Users ---');
        users.forEach(u => console.log(`ID: ${u._id}, Username: "${u.username}", Email: "${u.email}", Name: "${u.name}"`));

        const blogs = await Blog.find({}, 'title author');
        console.log('--- Blogs ---');
        blogs.forEach(b => console.log(`ID: ${b._id}, Title: "${b.title}", Author: "${b.author}"`));

        // Check for mismatch
        const usernames = new Set(users.map(u => u.username));
        const blogsWithMissingAuthors = blogs.filter(b => !usernames.has(b.author));

        if (blogsWithMissingAuthors.length > 0) {
            console.log('--- Blogs with Missing Authors (Mismatch) ---');
            blogsWithMissingAuthors.forEach(b => console.log(`Title: "${b.title}", Author: "${b.author}"`));

            // Suggest potential matches (case-insensitive)
            blogsWithMissingAuthors.forEach(b => {
                const match = users.find(u => u.username && u.username.toLowerCase() === b.author.toLowerCase());
                if (match) {
                    console.log(`Potential match for blog "${b.title}" (author: ${b.author}): User ${match.username} (ID: ${match._id})`);
                }
            });
        } else {
            console.log('All blogs have valid authors linked by username.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
};
run();
