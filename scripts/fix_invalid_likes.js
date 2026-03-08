const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../src/models/Blog');
const User = require('../src/models/User');

dotenv.config();

const fixInvalidLikes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        const usernameSet = new Set(users.map(u => u.username));
        const fullnameToUsername = new Map();

        users.forEach(u => {
            if (u.fullname) fullnameToUsername.set(u.fullname, u.username);
            if (u.name) fullnameToUsername.set(u.name, u.username);
        });

        const blogs = await Blog.find({});
        console.log(`Checking ${blogs.length} blogs for invalid likes...`);

        let fixedCount = 0;

        for (const blog of blogs) {
            let changed = false;
            let newLikedBy = [];

            if (!blog.likedby) continue;

            for (const liker of blog.likedby) {
                if (usernameSet.has(liker)) {
                    newLikedBy.push(liker);
                } else if (fullnameToUsername.has(liker)) {
                    const corrected = fullnameToUsername.get(liker);
                    console.log(`[${blog.title}] converting '${liker}' -> '${corrected}'`);
                    newLikedBy.push(corrected);
                    changed = true;
                } else {
                    console.log(`[${blog.title}] removing unknown liker '${liker}'`);
                    changed = true;
                }
            }

            // Deduplicate
            const uniqueLikedBy = [...new Set(newLikedBy)];
            if (uniqueLikedBy.length !== newLikedBy.length) {
                console.log(`[${blog.title}] removed duplicates`);
                changed = true;
            }

            // Check count mismatch
            if (blog.like !== uniqueLikedBy.length) {
                console.log(`[${blog.title}] fixing count ${blog.like} -> ${uniqueLikedBy.length}`);
                changed = true;
            }

            if (changed) {
                blog.likedby = uniqueLikedBy;
                blog.like = uniqueLikedBy.length;
                await blog.save();
                fixedCount++;
                console.log(`Saved fix for "${blog.title}". New Count: ${blog.like}, Likes: ${JSON.stringify(blog.likedby)}`);
            }
        }

        console.log(`\nOperation complete. Fixed ${fixedCount} blogs.`);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixInvalidLikes();
