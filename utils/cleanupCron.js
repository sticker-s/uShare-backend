const Item = require('../models/Item');
const { deleteFromCloud } = require('../utils/s3');

const startCleanupTask = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            const expiredFileItems = await Item.find({
                type: 'file',
                expiresAt: { $lte: now }
            });
            for (const item of expiredFileItems) {
                if (item.fileData && item.fileData.cloudKey) {
                    await deleteFromCloud(item.fileData.cloudKey);
                    console.log(`[R2 CLeanup] Purged expired cloud object: ${item.fileData.cloudKey}`);
                }
                await Item.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.error('[R2 cleanup error]: ', error.message);
        }
    }, 60 * 1000);
};


module.exports = startCleanupTask;
