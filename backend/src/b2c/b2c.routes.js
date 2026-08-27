const express = require('express');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./users/user.routes');
const flightRoutes = require('./flights/flight.routes');
const hotelRoutes = require('./hotels/hotel.routes');
const bookingRoutes = require('./bookings/booking.routes');
const paymentRoutes = require('./payments/payment.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/flights', flightRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
