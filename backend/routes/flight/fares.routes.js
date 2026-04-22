const express = require('express');
const router = express.Router();
const { getFlightFares } = require('../../controllers/flight/flight.controller');

router.get('/', getFlightFares);

module.exports = router;
