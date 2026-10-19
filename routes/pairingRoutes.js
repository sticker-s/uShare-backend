const express = require('express');
const router = express.Router();
const deviceAuth = require('../middleware/deviceAuth');
const pairingController = require('../controllers/pairingController');

// public endpoints (new device)
router.post('/request', pairingController.requestJoin);
router.get('/status/:requestId', pairingController.checkRequestStatus);

// owner endpoints
router.post('/generate', deviceAuth, pairingController.generateCode);
router.get('/requests', deviceAuth, pairingController.getPendingRequests);
router.post('/respond/:requestId', deviceAuth, pairingController.respondToRequest);

module.exports = router;
