const express = require('express');
const router = express.Router();
const { createPassenger, getAllPassengers, getPassengersByBooking } = require('../../controllers/flight/passenger.controller');

router.post('/', createPassenger);
router.get('/', getAllPassengers);
router.get('/booking/:bookingId', getPassengersByBooking);

module.exports = router;
