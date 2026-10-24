const multer = require('multer');

// store the file in the memory ram buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 mb max file
});

module.exports = upload;