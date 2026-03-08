const express = require("express");
const router = express.Router();

// Middleware
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

// Controllers
const {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getAdminData,
    removeUser
} = require("../controllers/userController");

// Routes
router.get("/profile/:username", protect, getUserProfile);
router.post("/editprofile/:username", protect, upload.single("image"), updateProfile);
router.post("/follow/:id", protect, followUser);
router.post("/unfollow/:id", protect, unfollowUser);

// Admin Routes
router.get("/admin", protect, getAdminData);
router.delete("/removeuser/:id", protect, removeUser);

module.exports = router;
