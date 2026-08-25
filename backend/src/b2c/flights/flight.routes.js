const express = require('express');
const router = express.Router();
const flightController = require('./flight.controller');
const { authMiddleware, optionalAuth } = require('../../middleware/auth.middleware');

router.post('/login', flightController.loginFlight);
router.post('/search', flightController.searchFlights);
router.get('/airports/search', flightController.searchAirports);
router.post('/fare-calendar', flightController.getFareCalendar);
router.post('/session', flightController.createSession);
router.post('/preview', flightController.flightPreview);
router.post('/fetch-ancillaries', flightController.fetchAncillaries);
router.post('/hold', flightController.holdFlight);
router.post('/book', authMiddleware, flightController.bookFlight);
router.get('/cancel-reasons/:tripId', flightController.getCancelReasons);
router.post('/cancel', authMiddleware, flightController.cancelFlightBooking);
router.get('/cancel-refund-info/:tripId/:reasonCode', authMiddleware, flightController.getFlightCancelRefundInfo);
router.get('/refund-info/:tripId', authMiddleware, flightController.getFlightRefundInfo);
router.post('/benefits/bulk', flightController.getBulkBenefits);
router.post('/benefits', flightController.getBenefits);
router.get('/trip/:tripId', optionalAuth, flightController.getTripDetails);
router.get('/my-bookings', authMiddleware, flightController.getUserFlightBookings);
router.get('/my-trips', authMiddleware, flightController.getUserFlightBookings);
router.get('/bookings', flightController.getAllFlightBookings);

module.exports = router;
