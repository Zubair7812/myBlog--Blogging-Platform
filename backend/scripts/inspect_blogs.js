const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../src/models/Blog');

dotenv.config();

const inspectBlogs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');

        const blogs = await Blog.find({});
        console.log(`Found ${blogs.length} blogs.`);

        for (const blog of blogs) {
            console.log('--------------------------------------------------');
            console.log(`Title: ${blog.title}`);
            console.log(`ID: ${blog._id}`);
            console.log(`Author: ${blog.author}`);
            console.log(`Like Count (DB Field): ${blog.like}`);
            console.log(`Liked By (Array):`, blog.likedby);
            console.log(`Liked By Length: ${blog.likedby ? blog.likedby.length : 0}`);
            console.log('--------------------------------------------------');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

inspectBlogs();
