const Device = require('../models/Device');

exports.getRoomDevices = async (req, res) => {
    try {
        const devices = await Device.find({ roomId: req.roomId }).select('-tokenHash').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: devices.length, devices });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error to fetch devices : ' + error.message });
    }
};

exports.renameDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { name } = req.body;

        if (!name || !deviceId) {
            return res.status(400).json({ success: false, error: 'Device name is required' });
        }

        const device = await Device.findOne({ _id: deviceId, roomId: req.roomId });
        if (!device) {
            return res.status(400).json({ success: false, error: 'Device not found on this room' });
        }

        // allow if the caller is the room owner or device themself
        if (req.device.role !== 'owner' && req.device._id.toString() !== deviceId) {
            return res.status(403).json({ success: false, error: 'Permission Denied' });
        }

        device.name = name.trim();
        await device.save();

        res.status(200).json({
            success: true, message: 'Device renamed !', device: { _id: device._id, name: device.name, role: device.role }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error on renaming device' + error.message });
    }
};

exports.revokeDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const targetDevice = await Device.findOne({ _id: deviceId, roomId: req.roomId });

        if (!targetDevice) {
            return res.status(404).json({ success: false, error: 'Device not found  in this room' });
        }

        const isSelf = req.device._id.toString() === deviceId;
        const isOwner = req.device.role === 'owner';

        if (!isSelf && !isOwner) {
            return res.status(403).json({
                success: false, error: 'Only the owners can remove devices'
            });
        }

        // now delete it
        await Device.findByIdAndDelete(deviceId);

        res.status(200).json({
            success: true, message: isSelf ? 'Successfully left the room' : 'Device revoked successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error on revoking: ' + error.message });
    }
};



