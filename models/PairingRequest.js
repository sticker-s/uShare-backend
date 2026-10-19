const mongoose = require('mongoose');

const pairingRequestSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    deviceName: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    issuedToken: { type: String, default: null }, //unhashed token, populated upon approaval
    newDeviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', default: null },
    createdAt: { type: Date, default: Date.now, expires: 600 }
});

module.exports = mongoose.model('PairingRequest', pairingRequestSchema);