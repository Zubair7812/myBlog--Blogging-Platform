const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Blog"
    },
    username: String, // Storing username directly for easier display
    content: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentSchema);
