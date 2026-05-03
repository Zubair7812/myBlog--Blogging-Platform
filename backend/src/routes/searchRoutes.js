const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { searchPlatform } = require("../controllers/searchController");

// Main Search Route
router.get("/search", protect, searchPlatform);

module.exports = router;
