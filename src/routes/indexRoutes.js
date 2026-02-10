const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// Get all posts (Home feed)
router.get('/posts', async (req, res) => {
    try {
        const posts = await Blog.find({}).sort({ date: -1 }); // Recent first
        const sortedPosts = await Blog.find({}).sort({ like: -1 }); // Popular

        res.json({
            posts,
            sortedPosts,
            user: req.session.user || null
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error fetching posts" });
    }
});

module.exports = router;
