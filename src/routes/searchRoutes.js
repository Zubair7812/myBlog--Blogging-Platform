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
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { content: { $regex: query, $options: "i" } }
                ]
            }).limit(20);
        }

        if (filter === 'all' || filter === 'people') {
            users = await User.find({
                $or: [
                    { fullname: { $regex: query, $options: "i" } },
                    { username: { $regex: query, $options: "i" } }
                ]
            }).limit(10);
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
