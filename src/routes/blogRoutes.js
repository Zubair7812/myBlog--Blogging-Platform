const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const User = require("../models/User");
const Comment = require("../models/Comment");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth"); // Assuming you can extract this if needed, or inline check

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
        res.redirect("/");
    }
};

// Compose Page
router.get("/compose", checkAuth, (req, res) => {
    res.render("compose", {
        username: req.session.username,
        userType: req.session.type
    });
});

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
        res.redirect("/home");
    } catch (err) {
        console.log(err);
        res.redirect("/home");
    }
});

// View Post
router.get("/posts/:id", async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        const comments = await Comment.find({ postId: req.params.id }).sort({ date: -1 }); // Get comments

        if (!post) return res.render("notfound");

        const authorUser = await User.findOne({ username: post.author });

        let currentUserId = null;
        if (req.session.username) {
            const currentUser = await User.findOne({ username: req.session.username });
            currentUserId = currentUser ? currentUser._id : null;
        }

        res.render("posts", {
            posts: post,
            comments: comments,
            user: req.session.username,
            userType: req.session.type,
            authorUser: authorUser,
            currentUserId: currentUserId
        });
    } catch (err) {
        res.redirect("/home");
    }
});

const Notification = require("../models/Notification");
// ... imports

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

        res.redirect("/posts/" + req.params.id);
    } catch (err) {
        console.log(err);
        res.redirect("/posts/" + req.params.id);
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

// Update Post Pages... (kept simple for brevity, logic exists in edit-post)
router.get("/update/:id", checkAuth, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (post.author === req.session.username || req.session.type === 'admin') {
            res.render("edit-post", { post: post, user: req.session.username });
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    } catch (err) { res.redirect("/home"); }
});

router.post("/update/:id", checkAuth, upload.single("image"), async (req, res) => {
    try {
        const updateData = {
            title: req.body.postTitle,
            content: req.body.postBody
        };
        if (req.file) updateData.thumbnail = req.file.filename;

        await Blog.findByIdAndUpdate(req.params.id, updateData);
        res.redirect("/posts/" + req.params.id);
    } catch (err) { res.redirect("/home"); }
});

router.get("/delete/:id", checkAuth, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);
        if (post.author === req.session.username || req.session.type === 'admin') {
            await Blog.findByIdAndDelete(req.params.id);
            await Comment.deleteMany({ postId: req.params.id }); // Delete associated comments
            res.redirect("/home");
        } else {
            res.redirect("/home");
        }
    } catch (err) { res.redirect("/home"); }
});

module.exports = router;
