const express = require('express');
const router = express.Router();
const { getDashboardStats, getRecentBookings, getBookingTrend } = require('../../controllers/flight/dashboard.controller');

router.get('/', getDashboardStats);
router.get('/recent-bookings', getRecentBookings);
router.get('/trend', getBookingTrend);

module.exports = router;
