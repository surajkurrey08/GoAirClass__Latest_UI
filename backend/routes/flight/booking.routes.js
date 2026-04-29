const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/flight/booking.controller');
const { optionalAuth, authMiddleware } = require('../../middleware/authMiddleware');

router.post('/create-session', optionalAuth, bookingController.createBookingSession);
router.post('/lock-price', optionalAuth, bookingController.lockPrice);
router.get('/session/:sessionId', bookingController.getSessionDetails);
router.post('/create', optionalAuth, bookingController.createBooking);
router.get('/:bookingId', bookingController.getBookingDetails);
router.get('/pnr/:pnr', bookingController.getBookingByPNR);
router.get('/user/all', authMiddleware, bookingController.getUserBookings);

module.exports = router;
