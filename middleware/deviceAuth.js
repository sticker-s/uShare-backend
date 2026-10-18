const Device = require('../models/Device');
const { hashToken } = require('../utils/cryptoUtils');

const deviceAuth = async (req, res, next) => {
    try {

        // extract the raw token
        const rawToken = req.headers['x-device-token'];

        if (!rawToken) {
            return res.status(401).json({
                success: false, error: 'Authentication failed : Missing device token header (x-device-token)'
            });
        }

        const hashedIncomingToken = hashToken(rawToken);

        const device = await Device.findOne({ tokenHash: hashedIncomingToken });
        if (!device) {
            return res.status(401).json({
                success: false, error: 'Authentication failed: Invalid or revoked device token'
            })
        }

        // update the last seen record
        device.lastSeen = new Date();
        await device.save();

        // attach the device context to req body
        req.device = device;
        req.roomId = device.roomId;

        next();
    } catch (error) {
        return res.status(500).json({
            success: false, error: 'Authentication server error :' + error.message
        });
    }
};

module.exports = deviceAuth;