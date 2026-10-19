const mongoose = require('mongoose');

const pairingSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    createdByDevice: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    code: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now(), expires: 300 }
});

module.exports = mongoose.model('PairingCode', pairingSchema);