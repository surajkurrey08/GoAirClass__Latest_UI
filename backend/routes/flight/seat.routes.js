const express = require('express');
const router = express.Router();
const { getFlightSeats, lockSeat, releaseSeat } = require('../../controllers/flight/seat.controller');

router.get('/:flightId', getFlightSeats);
router.post('/lock', lockSeat);
router.post('/release', releaseSeat);

module.exports = router;
