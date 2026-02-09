const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: String,
    like: {
        type: Number,
        default: 0
    },
    likedby: [String],
    date: {
        type: Date,
        default: Date.now
    },
    isAiGenerated: {
        type: Boolean,
        default: false
    }
}, { collection: 'Blogs', timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
