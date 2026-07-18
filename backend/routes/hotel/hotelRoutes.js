const express = require('express');
const router = express.Router();
const { getLocations, triggerSync } = require('../../controllers/hotel/hotelController');

router.get('/locations', getLocations);
router.post('/sync', triggerSync);

module.exports = router;
