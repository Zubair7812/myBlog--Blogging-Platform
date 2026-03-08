const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../src/models/Blog');

dotenv.config();

const fixLikes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');
        console.log('Connected to MongoDB');

        const blogs = await Blog.find({});
        console.log(`Found ${blogs.length} blogs. Checking for like count discrepancies...`);

        let fixedCount = 0;

        for (const blog of blogs) {
            const actualLikes = blog.likedby ? blog.likedby.length : 0;

            if (blog.like !== actualLikes) {
                console.log(`Fixing blog "${blog.title}":`);
                console.log(`  Current like count: ${blog.like}`);
                console.log(`  Actual likedby length: ${actualLikes}`);

                blog.like = actualLikes;
                await blog.save();
                fixedCount++;
                console.log(`  -> Fixed.`);
            }
        }

        console.log(`\nOperation complete. Fixed ${fixedCount} blogs.`);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixLikes();
