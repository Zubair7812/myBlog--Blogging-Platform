const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['text', 'image', 'link'], default: 'text' },
    metadata: { type: Object } // For shared content details
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
