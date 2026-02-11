const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");

const { protect } = require("../middleware/authMiddleware");

// Main Search Route
router.get("/search", protect, async (req, res) => {
    const query = req.query.q;
    const filter = req.query.filter || 'all'; // 'all', 'posts', 'people'

    if (!query) return res.status(400).json({ error: "No query provided" });

    try {
        let posts = [];
        let users = [];

        if (filter === 'all' || filter === 'posts') {
            posts = await Blog.find({
                title: { $regex: query, $options: "i" }
            });
        }

        if (filter === 'all' || filter === 'people') {
            users = await User.find({
                fullname: { $regex: query, $options: "i" }
            });
        }

        res.json({
            query: query,
            posts: posts,
            users: users,
            filter: filter,
            user: req.user.username,
            userType: req.user.type
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error searching" });
    }
});

module.exports = router;
