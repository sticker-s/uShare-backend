const PairingCode = require('../models/PairingCode');
const PairingRequest = require('../models/PairingRequest');
const Device = require('../models/Device');
const { generateRawToken, hashToken } = require('../utils/cryptoUtils');

const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// owner generating the code.
exports.generateCode = async (req, res) => {
    try {
        if (req.device.role !== 'owner') {
            return res.status(403).json({
                success: false, error: 'Only the room owner can generate the pairing code'
            });
        }
        //* this deactivates the prev unlogged codes.
        await PairingCode.deleteMany({ roomId: req.roomId });

        // generates a unique code everytime.
        let code = generate6DigitCode();
        let exists = await PairingCode.findOne({ code });
        while (exist) {
            code = generate6DigitCode();
            exists = await PairingCode.findOne({ code });
        }
        // store the new code
        const newPairingCode = await PairingCode.create({
            roomId: req.roomId,
            createdByDevice: req.device._id,
            code
        });

        res.status(201).json({
            success: true,
            code: newPairingCode.code,
            expiresInSeconds: 300
        })

    } catch (error) {
        res.status(500).json({ success: false, error: 'server Error in generating code: ' + error.message });
    }
};

// new device submits the code.
exports.requestJoin = async (req, res) => {
    try {
        const { code, deviceName } = req.body;
        if (!code || !deviceName) {
            return res.status(400).json({
                success: false, error: 'Pairing code and device name is required'
            });
        }

        const pairingCode = await PairingCode.findOne({ code, used: false });
        if (!pairingCode) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or Expired code'
            });
        }

        const request = await PairingRequest.create({
            roomId: pairingCode.roomId,
            deviceName: deviceName.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Pairing request sent. waiting for owner to check',
            requestId: request._id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error on sending join request :' + error.message });
    }
};

// owner only . list all pending requests 
exports.getPendingRequests = async (req, res) => {
    try {
        if (req.device.role !== 'owner') {
            return res.status(403).json({
                success: false, error: 'Only room owners can access requests'
            });
        }

        const requests = await PairingRequest.find({
            roomId: req.roomId,
            status: 'pending'
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: requests.length, requests });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error in fetching requests: ' + error.message });
    }
};

// owner only. approve / excommunicado
exports.respondToRequest = async (req, res) => {
    try {
        if (req.device.role !== 'owner') {
            return res.status(403).json({
                success: false, error: 'Only room Owners can accept/ reject'
            });
        }

        const { requestId } = req.params;
        const { action } = req.body;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false, error: "The action must be 'approve' or 'reject'"
            });
        }

        // verify if the request is present or resolved.
        const request = await PairingRequest.findOne({
            _id: requestId,
            roomId: req.roomId,
            status: 'pending'
        });
        if (!request) {
            return res.status(404).json({
                success: false, error: 'Pending request not found or already resolved'
            });
        }

        //simply handle reject
        if (action === 'reject') {
            request.status = 'rejected';
            await request.save();

            return res.status(200).json({ success: true, message: 'successfully rejected' });
        }

        // for accept. add the new device to the room. also assign its token no.
        const rawToken = generateRawToken();
        const tokenHash = hashToken(rawToken);

        const newDevice = await Device.create({
            roomId: req.roomId,
            name: request.deviceName,
            tokenHash: tokenHash,
            role: 'member'
        });

        request.status = 'approved';
        request.issuedToken = rawToken;
        request.newDeviceId = newDevice._id;
        await request.save();

        res.status(200).json({ success: true, message: 'Device added to room', deviceId: newDevice._id });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error on handling request :' + error.message });
    }
};

exports.checkRequestStatus = async (req, res) => {
    try {

        const { requestId } = req.params;
        const request = await PairingRequest.findById({ requestId });
        if (!request) {
            return res.status(404).json({ success: false, error: 'Request expired or not found' });
        }

        if (request.status === 'pending') {
            return res.status(200).json({ success: true, status: 'pending' });
        }
        if (request.status === 'rejected') {
            return res.status(200).json({ success: true, status: 'rejected', message: 'owner rejected your request' });
        }

        return res.status(200).json({
            success: true, status: 'approved', roomId: request.roomId, deviceId: request.newDeviceId, deviceToken: request.issuedToken
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'server error on fetching status: ' + error.message });
    }
};