const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Blog = require('../models/Blog');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Multer Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/thumbnails");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});
const upload = multer({ storage: storage });

// --- Compose (Create) ---
router.get('/compose', ensureAuthenticated, (req, res) => {
    res.render('compose', { user: req.session.username });
});

router.post('/compose', ensureAuthenticated, upload.single("image"), async (req, res) => {
    const { postTitle, postBody } = req.body;
    const thumbnail = req.file ? req.file.filename : 'default-image.png';

    const newPost = new Blog({
        author: req.session.username,
        title: postTitle,
        content: postBody,
        thumbnail: thumbnail,
        like: 0
    });

    await newPost.save();
    res.redirect('/home');
});

// --- Read Single Post ---
router.get('/posts/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (!post) return res.render('notfound');

        res.render('posts', {
            user: req.session.username,
            posts: post,
            date: Date.now(),
            id: req.params.id
        });
    } catch (err) {
        res.render('notfound');
    }
});

// --- Like/Dislike ---
router.post('/posts/:id/like', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        const username = req.session.username;

        if (post.likedby.includes(username)) {
            // Unlike
            await Blog.findByIdAndUpdate(req.params.id, { $pull: { likedby: username }, $inc: { like: -1 } });
            res.json({ status: 'unliked' });
        } else {
            // Like
            await Blog.findByIdAndUpdate(req.params.id, { $push: { likedby: username }, $inc: { like: 1 } });
            res.json({ status: 'liked' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error processing like' });
    }
});

// --- Edit Post ---
router.get('/update/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (req.session.username === post.author || req.session.type === "admin") {
            res.render('edit-post', { user: req.session.username, post: post });
        } else {
            res.render('notfound');
        }
    } catch (err) {
        res.render('notfound');
    }
});

router.post('/update/:id', ensureAuthenticated, upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            title: req.body.postTitle,
            content: req.body.postBody
        };
        if (req.file) {
            updateData.thumbnail = req.file.filename;
        }

        await Blog.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/posts/' + req.params.id);
    } catch (err) {
        console.log(err);
        res.redirect('/home');
    }
});

// --- Delete Post ---
router.get('/delete/:id', ensureAuthenticated, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (req.session.username === post.author || req.session.type === "admin") {
            await Blog.findByIdAndRemove(req.params.id);
            if (req.session.type === "admin") res.redirect('/admin');
            else res.redirect('/home');
        } else {
            res.render('notfound');
        }
    } catch (err) {
        res.render('notfound');
    }
});

module.exports = router;
