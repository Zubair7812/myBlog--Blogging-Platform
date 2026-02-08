const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");

// Main Search Route
router.get("/search", async (req, res) => {
    const query = req.query.q;
    const filter = req.query.filter || 'all'; // 'all', 'posts', 'people'

    if (!query) return res.redirect("/home");

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

        res.render("search", {
            query: query,
            posts: posts,
            users: users,
            filter: filter,
            user: req.session.username,
            userType: req.session.type
        });

    } catch (err) {
        console.log(err);
        res.redirect("/home");
    }
});

module.exports = router;
