const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const getEndPoint = () => 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com';
const s3Client = new S3Client({
    region: 'auto',
    endpoint: getEndPoint(),
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }

});

// to upload memory directly to cloud
const generatePresignedUploadUrl = async (fileName, mimeType) => {
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName,
        ContentType: mimeType
    });

    //generate signle-use presigned put url (15 mins validity)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileName}`;

    return { uploadUrl, publicUrl };
};

// delete from cloud
const deleteFromCloud = async (fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileName
    });

    await s3Client.send(command);
};

module.exports = { generatePresignedUploadUrl, deleteFromCloud };