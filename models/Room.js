const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: { type: String, default: "My Room" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);