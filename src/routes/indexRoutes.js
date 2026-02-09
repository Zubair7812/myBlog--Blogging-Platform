const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('login'); // 'login' view serves as landing/login/signup
    }
});

router.get('/home', ensureAuthenticated, async (req, res) => {
    try {
        const posts = await Blog.find({}).sort({ date: -1 }); // Recent first
        const sortedPosts = await Blog.find({}).sort({ like: -1 }); // Popular

        res.render('home', {
            user: req.session.username,
            posts: posts,
            sposts: sortedPosts,
            date: Date.now()
        });
    } catch (err) {
        console.log(err);
        res.render('error', { error: "Error fetching posts" });
    }
});

module.exports = router;
