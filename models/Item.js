const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    senderDeviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    type: { type: String, enum: ['text', 'link', 'file'], required: true },
    content: { type: String, required: true },

    isEncrypted: { type: Boolean, default: false },
    encryptionMeta: {
        iv: { type: String, default: null }, //  initialization vector
        authTag: { type: String, default: null } //  Auth tag
    },
    fileData: {
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        cloudinaryPublidId: { type: String },
        url: { type: String }
    },
    status: { type: String, enum: ['pending_upload', 'active'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }
});

//TTL index: to cleanup after expires
itemSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('Item', itemSchema);