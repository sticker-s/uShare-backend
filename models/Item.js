const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    senderDeviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    type: { type: String, enum: ['text', 'link', 'file'], required: true },
    content: { type: String, required: true },
    fileData: {
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        path: { type: String },
        url: { type: String }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);