
const express = require('express');
const router = express.Router();
const baggageController = require('../../controllers/flight/baggageMapping.controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:flightId', baggageController.getBaggageMapping);
router.post('/:flightId', baggageController.saveBaggageMapping);

module.exports = router;
