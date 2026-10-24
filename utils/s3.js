const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }

});

// yo upload memory directly to cloud
const uploadToCloud = async (fileBuffer, fileName, mimeType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType
    });

    await s3Client.send(command);
    return `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;
};

// delete from cloud
const deleteFromCloud = async (fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName
    });

    await s3Client.send(command);
};

module.exports = { uploadToCloud, deleteFromCloud };