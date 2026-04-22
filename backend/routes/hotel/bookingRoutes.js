const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middleware/authMiddleware');
const { getAllHotelBookings, getBookingsByHotel, cancelBooking, createBooking, checkRoomAvailability, getUserHotelBookings, generateInvoice, getHotelBookingById, migrateBookingIds } = require('../../controllers/hotel/bookingController');

router.get('/user', authMiddleware, getUserHotelBookings);
router.get('/availability', checkRoomAvailability);
router.get('/details/:id', getHotelBookingById);
router.get('/', getAllHotelBookings);
router.post('/create', authMiddleware, createBooking);
router.put('/cancel/:id', authMiddleware, cancelBooking);
router.get('/:bookingId/invoice', generateInvoice);
router.get('/:hotelId', getBookingsByHotel);
router.post('/migrate-booking-ids', migrateBookingIds);

module.exports = router;
