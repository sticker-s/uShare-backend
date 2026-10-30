const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateUploadSignature = (publidId, folder) => {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const paramsToSign = {
        timestamp: timestamp,
        public_id: publidId,
        folder: folder
    };

    const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET
    );

    return {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        publidId,
        folder,
        uploadUrl: `[suspicious link removed]${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`
    };
};


const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        console.log(`[cloudinary cleanup] Delted asset: ${publicId}`);
    } catch (error) {
        console.error('[cloudinary Deletion Error]:', error.message);
    }
};

module.exports = { generateUploadSignature, deleteFromCloudinary };