const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Blog = require('../src/models/Blog');
const Comment = require('../src/models/Comment');

dotenv.config();

const fixAuthors = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/myBlog');
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Checking for legacy author names...`);

        for (const user of users) {
            // console.log(`Checking user: ${user.username} (Name: ${user.name}, Fullname: ${user.fullname})`);

            // Fix Blogs
            // Find blogs where author is the user's NAME or FULLNAME but NOT their USERNAME
            const legacyBlogs = await Blog.find({
                $or: [
                    { author: user.name },
                    { author: user.fullname }
                ],
                author: { $ne: user.username }
            });

            if (legacyBlogs.length > 0) {
                console.log(`Found ${legacyBlogs.length} blogs for user '${user.username}' with legacy names.`);
                const res = await Blog.updateMany(
                    {
                        $or: [
                            { author: user.name },
                            { author: user.fullname }
                        ]
                    },
                    { author: user.username }
                );
                console.log(`Updated ${res.modifiedCount} blogs to author: ${user.username}`);
            }

            // Fix Comments
            const legacyComments = await Comment.find({
                $or: [
                    { username: user.name },
                    { username: user.fullname }
                ],
                username: { $ne: user.username }
            });

            if (legacyComments.length > 0) {
                console.log(`Found ${legacyComments.length} comments for user '${user.username}' with legacy names.`);
                const res = await Comment.updateMany(
                    {
                        $or: [
                            { username: user.name },
                            { username: user.fullname }
                        ]
                    },
                    { username: user.username }
                );
                console.log(`Updated ${res.modifiedCount} comments to username: ${user.username}`);
            }
        }

        console.log('Migration complete.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixAuthors();
