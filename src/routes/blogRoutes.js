const express = require("express");
const router = express.Router();

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Controllers
const {
    createPost,
    getPosts,
    getPostById,
    addComment,
    toggleLike,
    updatePost,
    deletePost
} = require("../controllers/blogController");

// Routes
router.post("/compose", protect, upload.single("image"), createPost);
router.get("/posts", getPosts);
router.get("/posts/:id", protect, getPostById);
router.post("/posts/:id/comment", protect, addComment);
router.post("/posts/:id/like", protect, toggleLike);
router.post("/update/:id", protect, upload.single("image"), updatePost);
router.delete("/delete/:id", protect, deletePost);

module.exports = router;
