const express = require('express');
const router = express.Router();
const { 
    createFlightBooking, 
    getAllBookings, 
    getBookingById, 
    updateBookingStatus, 
    getUserBookings,
    getBookingByPNR,
    updateBookingStatusByPNR,
    cancelFlightBooking
} = require('../../controllers/flight/booking.controller');
const { authMiddleware, optionalAuth } = require('../../middleware/authMiddleware');

router.post('/create', optionalAuth, createFlightBooking);  // guest-friendly but captures user if logged in

router.get('/user', authMiddleware, getUserBookings);
router.post('/cancel', cancelFlightBooking);
router.get('/pnr/:pnr', getBookingByPNR);
router.patch('/status/:pnr', updateBookingStatusByPNR);
router.get('/:bookingId', getBookingById);
router.get('/', getAllBookings);
router.put('/:id/status', updateBookingStatus);

module.exports = router;
