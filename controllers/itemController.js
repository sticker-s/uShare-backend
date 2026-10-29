const Item = require('../models/Item');
const { generatePresignedUploadUrl, deleteFromCloud } = require('../utils/s3');
const path = require('path');

const calculateExpiresAt = (preset = 'id') => {
    const now = Date.now();
    const durations = {
        '2m': 2 * 60 * 1000,
        '10m': 10 * 60 * 1000,
        '30m': 30 * 60 * 1000,
        '1h': 1 * 60 * 60 * 1000,
        '2h': 2 * 60 * 60 * 1000,
        '3h': 3 * 60 * 60 * 1000,
        '1d': 1 * 24 * 60 * 60 * 1000,
        '2d': 2 * 24 * 60 * 60 * 1000,
        '3d': 3 * 24 * 60 * 60 * 1000,
    };

    const durationMs = durations[preset] || durations['1d'];
    return new Date(now + durationMs);
};

// share text or link
exports.shareTextOrLink = async (req, res) => {
    try {
        const { type, content, expiry, isEncrypted, iv, authTag } = req.body;

        if (!['text', 'link'].includes(type)) {
            return res.status(400).json({
                success: false, error: "Type must be 'text' or 'link"
            });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({
                success: false, error: 'Content cannot be empty'
            });
        }

        const expiresAt = calculateExpiresAt(expiry);

        const newItem = await Item.create({
            roomId: req.roomId,
            senderDeviceId: req.device._id,
            type,
            content: content.trim(),
            isEncrypted: Boolean(isEncrypted),
            encryptionMeta: isEncrypted ? { iv, authTag } : undefined,
            expiresAt
        });

        await newItem.populate('senderDeviceId', 'name role');
        res.status(201).json({ success: true, item: newItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// direct upload step 1: generate presigned cloudflare upload URL
exports.getPresignedUploadUrl = async (req, res) => {
    try {
        const { originalName, mimeType, size, caption, expiry, isEncrypted, iv, authTag } = req.body;

        if (!originalName || !mimeType) {
            return res.status(400).json({ success: false, error: 'originalName or mimeType are required' });
        }

        const ext = path.extname(originalName) || '.bin';
        const cloudKey = `room-${req.roomId}/${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

        const { uploadUrl, publicUrl } = await generatePresignedUploadUrl(cloudKey, mimeType);
        const expiresAt = calculateExpiresAt(expiry);

        const newItem = await Item.create({
            roomId: req.roomId,
            senderDeviceId: req.device._id,
            type: 'file',
            content: caption || originalName,
            isEncrypted: Boolean(isEncrypted),
            encryptionMeta: isEncrypted ? { iv, authTag } : undefined,
            fileData: {
                originalName,
                mimeType,
                size: size || 0,
                cloudKey,
                url: publicUrl
            },
            expiresAt,
            status: 'pending_upload'
        });

        res.status(201).json({
            success: true,
            itemId: newItem._id,
            uploadUrl,
            publicUrl,
            cloudKey
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// direct upload step 2: confirm direct upload complete
exports.confirmUploadComplete = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findOne({ _id: itemId, roomId: req.roomId });

        if (!item) {
            return res.status(404).json({
                success: false, error: 'Item record not found'
            });
        }

        item.status = 'active';
        await item.save();
        await item.populate('senderDeviceId', 'name role');

        res.status(200).json({ success: true, item });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// get room items
exports.getRoomItems = async (req, res) => {
    try {
        const items = await Item.find({
            roomId: req.roomId,
            status: { $ne: 'pending_upload' },
            expiresAt: { $gt: new Date() }
        })
            .populate('senderDeviceId', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: items.length, items });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// detele item
exports.deleteItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findOne({ _id: itemId, roomId: req.roomId });

        if (!item) {
            return res.status(404).json({ success: false, error: 'Item not found in the room' });
        }

        const isSender = item.senderDeviceId.toString() === req.device._id.toString();
        const isOwner = req.device.role === 'owner';

        if (!isSender && !isOwner) {
            return res.status(403).json({ success: false, error: 'Permission Denied' });
        }
        if (item.type === 'file' && item.fileData && item.fileData.cloudKey) {
            await deleteFromCloud(item.fileData.cloudKey);
        }

        await Item.findByIdAndDelete(itemId);
        res.status(200).json({ success: true, message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

