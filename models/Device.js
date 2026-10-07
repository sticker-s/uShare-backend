const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    name: { type: String, required: true },
    tokenHash: { type: String, required: true, index: true },
    role: { type: String, enum: ['owner', 'member'], default: 'member' },
    lastSeen: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model('Device', deviceSchema);