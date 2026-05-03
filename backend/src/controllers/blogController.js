const Blog = require("../models/Blog");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// @desc    Create a new blog post
// @route   POST /api/blogs/compose
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const newPost = new Blog({
        title: req.body.postTitle,
        content: req.body.postBody,
        author: req.user.username,
        thumbnail: req.file ? req.file.filename : "default.jpg",
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        date: new Date()
    });
    await newPost.save();
    res.status(201).json({ message: "Post created", post: newPost });
});

// @desc    Get all posts for the home feed
// @route   GET /api/blogs/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
    const posts = await Blog.find({}).sort({ date: -1 }).lean();
    const sortedPosts = await Blog.find({}).sort({ like: -1 }).limit(5).lean();
    res.json({ posts, sortedPosts });
});

// @desc    Get a specific post with its comments and author data
// @route   GET /api/blogs/posts/:id
// @access  Private
const getPostById = asyncHandler(async (req, res) => {
    const post = await Blog.findById(req.params.id).lean();
    const comments = await Comment.find({ postId: req.params.id }).sort({ date: -1 }).lean();

    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const authorUser = await User.findOne({ username: post.author }).lean();

    let currentUserId = null;
    if (req.user && req.user.username) {
        const currentUser = await User.findOne({ username: req.user.username }).lean();
        currentUserId = currentUser ? currentUser._id : null;
    }

    res.json({
        post: post,
        comments: comments,
        user: req.user.username,
        userType: req.user.type,
        authorUser: authorUser,
        currentUserId: currentUserId
    });
});

// @desc    Add a comment to a post
// @route   POST /api/blogs/posts/:id/comment
// @access  Private
const addComment = asyncHandler(async (req, res) => {
    const newComment = new Comment({
        postId: req.params.id,
        username: req.user.username,
        content: req.body.comment
    });
    await newComment.save();

    // Notify Post Author
    const post = await Blog.findById(req.params.id);
    const senderUser = await User.findOne({ username: req.user.username });
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
});

// @desc    Toggle like on a post
// @route   POST /api/blogs/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
    const post = await Blog.findById(req.params.id);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    const user = req.user.username;

    if (post.likedby.includes(user)) {
        // Unlike
        post.likedby = post.likedby.filter(u => u !== user);
        post.like = post.likedby.length;
        await post.save();
        res.json({ status: 'unliked', likes: post.like });
    } else {
        // Like
        post.likedby.push(user);
        post.like = post.likedby.length;
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
});

// @desc    Update an existing post
// @route   POST /api/blogs/update/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
    const updateData = {
        title: req.body.postTitle,
        content: req.body.postBody,
        tags: req.body.tags ? JSON.parse(req.body.tags) : []
    };
    if (req.file) updateData.thumbnail = req.file.filename;

    const updatedPost = await Blog.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!updatedPost) {
        res.status(404);
        throw new Error("Post not found");
    }

    res.json({ message: "Post updated", post: updatedPost });
});

// @desc    Delete a post and its comments
// @route   DELETE /api/blogs/delete/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
    const post = await Blog.findById(req.params.id);
    
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }

    if (post.author === req.user.username || req.user.type === 'admin') {
        await Blog.findByIdAndDelete(req.params.id);
        await Comment.deleteMany({ postId: req.params.id });
        res.json({ message: "Post deleted" });
    } else {
        res.status(403);
        throw new Error("Unauthorized to delete this post");
    }
});

module.exports = {
    createPost,
    getPosts,
    getPostById,
    addComment,
    toggleLike,
    updatePost,
    deletePost
};
