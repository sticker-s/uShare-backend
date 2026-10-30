const Item = require('../models/Item');
const { deleteFromCloudinary } = require('../utils/cloudinary');

const startCleanupTask = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            const expiredFileItems = await Item.find({
                type: 'file',
                expiresAt: { $lte: now }
            });
            for (const item of expiredFileItems) {
                if (item.fileData && item.fileData.cloudinaryPublidId) {
                    await deleteFromCloudinary(item.fileData.cloudinaryPublidId);
                    console.log(`[CLeanup] Purged expired cloud object: ${item.fileData.cloudinaryPublidId}`);
                }
                await Item.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.error('[cleanup error]: ', error.message);
        }
    }, 60 * 1000);
};


module.exports = startCleanupTask;
