const Blog = require("../models/Blog");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

// @desc    Search posts and users
// @route   GET /api/search
// @access  Private
const searchPlatform = asyncHandler(async (req, res) => {
    const query = req.query.q;
    const filter = req.query.filter || 'all'; // 'all', 'posts', 'people'

    if (!query) {
        res.status(400);
        throw new Error("No query provided");
    }

    let posts = [];
    let users = [];

    // Search Posts
    if (filter === 'all' || filter === 'posts') {
        posts = await Blog.find({
            $or: [
                { title: { $regex: query, $options: "i" } },
                { content: { $regex: query, $options: "i" } },
                { tags: { $in: [new RegExp(query, "i")] } }
            ]
        }).limit(20).lean();
    }

    // Search Users
    if (filter === 'all' || filter === 'people') {
        users = await User.find({
            $or: [
                { fullname: { $regex: query, $options: "i" } },
                { username: { $regex: query, $options: "i" } }
            ]
        }).limit(10).lean();
    }

    res.json({
        query: query,
        posts: posts,
        users: users,
        filter: filter,
        user: req.user.username,
        userType: req.user.type
    });
});

module.exports = {
    searchPlatform
};
