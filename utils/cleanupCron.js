const Item = require('../models/Item');
const { deleteFromCloudinary } = require('../utils/cloudinary');

const startCleanupTask = () => {
    setInterval(async () => {
        try {
            const now = new Date();
            const expiredItems = await Item.find({
                expiresAt: { $lte: now }
            });
            for (const item of expiredItems) {
                if (item.type === 'file' && item.fileData) {
                  const publicId = item.fileData.publicId || item.fileData.cloudinaryPublicId;
                  if (publicId) {
                    const resourceType = item.fileData.mimeType?.startsWith('image/') ? 'image' : 'raw';
                    await deleteFromCloudinary(item.fileData.publicId, resourceType);
                    console.log(`[Cleanup] Purged expired cloud asset: ${publicId}`);
                  }
                }
                await Item.findByIdAndDelete(item._id);
            }
        } catch (error) {
            console.error('[cleanup error]: ', error.message);
        }
    }, 60 * 1000);
};


module.exports = startCleanupTask;
