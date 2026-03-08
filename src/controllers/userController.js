const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const asyncHandler = require("express-async-handler");

// @desc    Get user profile data including their posts
// @route   GET /api/users/profile/:username
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const posts = await Blog.find({ author: user.username }).sort({ date: -1 }).lean();

    // Identify current user ID
    let currentUserId = null;
    if (req.user && req.user.username) {
        const currentUser = await User.findOne({ username: req.user.username }).lean();
        currentUserId = currentUser ? currentUser._id : null;
    }

    res.json({
        username: req.user ? req.user.username : null, // Logged in user's username
        userdata: user, // Profile owner's data
        posts: posts,
        userType: req.user ? req.user.type : null,
        currentUserId: currentUserId
    });
});

// @desc    Update user profile details
// @route   POST /api/users/editprofile/:username
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, username, bio, fb, tw, insta } = req.body;
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
        res.status(404);
        throw new Error("User not found");
    }

    // Check availability if username is changing
    if (username && username !== currentUser.username) {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400);
            throw new Error("Username already taken");
        }
    }

    const updateData = {
        name: fullname || currentUser.name, // Keep name in sync
        fullname: fullname || currentUser.fullname,
        username: username || currentUser.username,
        bio: bio,
        facebook: fb,
        twitter: tw,
        instagram: insta
    };
    if (req.file) updateData.dp = req.file.filename;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });

    // If username changed, update all Blogs and Comments by this user
    if (username && username !== currentUser.username) {
        await Blog.updateMany({ author: currentUser.username }, { author: username });
        await Comment.updateMany({ username: currentUser.username }, { username: username });
    }

    res.json({ message: "Profile updated", user: updatedUser });
});

// @desc    Follow a user
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findOne({ username: req.user.username });

    if (!targetUser || !currentUser) {
        res.status(400);
        throw new Error("Invalid users");
    }

    // Add to following
    if (!currentUser.following.includes(targetUser._id)) {
        currentUser.following.push(targetUser._id);
        await currentUser.save();
    }

    // Add to followers
    if (!targetUser.followers.includes(currentUser._id)) {
        targetUser.followers.push(currentUser._id);
        await targetUser.save();

        // Create Notification
        if (!targetUser._id.equals(currentUser._id)) {
            await Notification.create({
                recipient: targetUser._id,
                sender: currentUser._id,
                type: 'follow'
            });
        }
    }

    res.json({ status: 'followed', followersCount: targetUser.followers.length });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findOne({ username: req.user.username });

    if (!targetUser || !currentUser) {
        res.status(400);
        throw new Error("Invalid users");
    }

    // Remove from following
    currentUser.following = currentUser.following.filter(id => !id.equals(targetUser._id));
    await currentUser.save();

    // Remove from followers
    targetUser.followers = targetUser.followers.filter(id => !id.equals(currentUser._id));
    await targetUser.save();

    res.json({ status: 'unfollowed', followersCount: targetUser.followers.length });
});

// @desc    Get admin dashboard data
// @route   GET /api/users/admin
// @access  Private (Admin only)
const getAdminData = asyncHandler(async (req, res) => {
    if (req.user.type !== 'admin') {
        res.status(403);
        throw new Error("Unauthorized");
    }

    const profiles = await User.find({}).lean();
    const posts = await Blog.find({}).lean();
    res.json({ profiles, posts });
});

// @desc    Remove a user (Admin only)
// @route   DELETE /api/users/removeuser/:id
// @access  Private (Admin only)
const removeUser = asyncHandler(async (req, res) => {
    if (req.user.type !== 'admin') {
        res.status(403);
        throw new Error("Unauthorized");
    }

    const user = await User.findById(req.params.id);
    if (user) {
        await Blog.deleteMany({ author: user.username });
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User removed" });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});

module.exports = {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getAdminData,
    removeUser
};
