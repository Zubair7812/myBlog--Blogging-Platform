const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/thumbnails");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage: storage });

// Middleware to check auth
const checkAuth = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
};

// Create Post
router.post("/compose", checkAuth, upload.single("image"), async (req, res) => {
    try {
        const newPost = new Blog({
            title: req.body.postTitle,
            content: req.body.postBody,
            author: req.session.username,
            thumbnail: req.file ? req.file.filename : "default.jpg",
            date: new Date()
        });
        await newPost.save();
        res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error creating post" });
    }
});

// View Post
router.get("/posts/:id", async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        const comments = await Comment.find({ postId: req.params.id }).sort({ date: -1 });

        if (!post) return res.status(404).json({ error: "Post not found" });

        const authorUser = await User.findOne({ username: post.author });

        let currentUserId = null;
        if (req.session.username) {
            const currentUser = await User.findOne({ username: req.session.username });
            currentUserId = currentUser ? currentUser._id : null;
        }

        res.json({
            post: post,
            comments: comments,
            user: req.session.username,
            userType: req.session.type,
            authorUser: authorUser,
            currentUserId: currentUserId
        });
    } catch (err) {
        res.status(500).json({ error: "Error fetching post" });
    }
});

// Add Comment
router.post("/posts/:id/comment", checkAuth, async (req, res) => {
    try {
        const newComment = new Comment({
            postId: req.params.id,
            username: req.session.username,
            content: req.body.comment
        });
        await newComment.save();

        // Notify Post Author
        const post = await Blog.findById(req.params.id);
        const senderUser = await User.findOne({ username: req.session.username });
        const authorUser = await User.findOne({ username: post.author });

        if (authorUser && !authorUser._id.equals(senderUser._id)) {
            await Notification.create({
                recipient: authorUser._id,
                sender: senderUser._id,
                type: 'comment',
                postId: post._id
            });
        }

        res.status(201).json({ message: "Comment added", comment: newComment });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Error adding comment" });
    }
});

// Like Post
router.post("/posts/:id/like", checkAuth, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        const user = req.session.username;

        if (post.likedby.includes(user)) {
            post.like -= 1;
            post.likedby = post.likedby.filter(u => u !== user);
            await post.save();
            res.json({ status: 'unliked', likes: post.like });
        } else {
            post.like += 1;
            post.likedby.push(user);
            await post.save();

            // Notify Author
            const senderUser = await User.findOne({ username: user });
            const authorUser = await User.findOne({ username: post.author });

            if (authorUser && !authorUser._id.equals(senderUser._id)) {
                await Notification.create({
                    recipient: authorUser._id,
                    sender: senderUser._id,
                    type: 'like',
                    postId: post._id
                });
            }

            res.json({ status: 'liked', likes: post.like });
        }
    } catch (err) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// Update Post
router.post("/update/:id", checkAuth, upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            title: req.body.postTitle,
            content: req.body.postBody
        };
        if (req.file) updateData.thumbnail = req.file.filename;

        await Blog.findByIdAndUpdate(req.params.id, updateData);
        res.json({ message: "Post updated" });
    } catch (err) {
        res.status(500).json({ error: "Error updating post" });
    }
});

// Delete Post
router.delete("/delete/:id", checkAuth, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (post.author === req.session.username || req.session.type === 'admin') {
            await Blog.findByIdAndDelete(req.params.id);
            await Comment.deleteMany({ postId: req.params.id });
            res.json({ message: "Post deleted" });
        } else {
            res.status(403).json({ error: "Unauthorized" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error deleting post" });
    }
});

module.exports = router;
