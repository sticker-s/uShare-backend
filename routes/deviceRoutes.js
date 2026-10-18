const express = require('express');
const router = express.Router();
const deviceAuth = require('../middleware/deviceAuth');
const deviceController = require('../controllers/deviceController');

router.use(deviceAuth);

router.get('/', deviceController.getRoomDevices);
router.patch('/:deviceId', deviceController.renameDevice);
router.delete('/:deviceId', deviceController.revokeDevice);

module.exports = router;