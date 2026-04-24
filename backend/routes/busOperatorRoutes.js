const express = require('express');
const router = express.Router();
const { 
    getLiveBookings, 
    updateBoardingStatus, 
    changeSeat, 
    cancelBooking 
} = require('../controllers/busOperatorController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// All routes require operator role
router.use(authMiddleware);
router.use(checkRole(['bus_operator']));

router.get('/live-bookings', getLiveBookings);
router.patch('/boarding-status', updateBoardingStatus);
router.patch('/change-seat', changeSeat);
router.post('/cancel-booking', cancelBooking);

module.exports = router;
