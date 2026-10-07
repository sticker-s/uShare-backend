const Room = require('../models/Room');
const Device = require('../models/Device');
const { generateToken, hashToken } = require('../utils/cryptoUtils');

exports.createRoom = async (req, res) => {
    try {
        const { roomName, deviceName } = req.body;
        //* create room
        const newRoom = await Room.create({ name: roomName || 'My Room' });

        //* generate token
        const rawToken = generateToken();
        const tokenHash = hashToken(rawToken);

        //* save the owner device record
        const ownerDevice = await Device.create({
            roomId: newRoom._id,
            name: deviceName || 'host device',
            tokenHash: tokenHash,
            role: 'owner'
        });

        //* return the raw secret token(only sent once!!!)
        res.status(201).json({
            success: true,
            roomId: newRoom._id,
            deviceId: ownerDevice._id,
            deviceToken: rawToken
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};