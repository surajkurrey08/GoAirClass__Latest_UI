const express = require('express');
const router = express.Router();
const flightController = require('../../controllers/Flight/flightController');

// Route for flight partner login
router.post('/login', flightController.loginFlight);

// Route for flight search
router.post('/search', flightController.searchFlights);

// Route for airport auto-suggest search
router.get('/airports/search', flightController.searchAirports);

// Route for flight fare calendar matrix
router.post('/fare-calendar', flightController.getFareCalendar);

module.exports = router;
