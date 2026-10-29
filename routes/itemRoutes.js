const express = require('express');
const router = express.Router();
const deviceAuth = require('../middleware/deviceAuth');
const itemController = require('../controllers/itemController');

router.use(deviceAuth);

router.get('/', itemController.getRoomItems);
router.post('/text-link', itemController.shareTextOrLink);
router.post('/upload-url', itemController.getPresignedUploadUrl);
router.post('/confirm-upload/:itemId', itemController.confirmUploadComplete);
router.delete('/:itemId', itemController.deleteItem);

module.exports = router;
