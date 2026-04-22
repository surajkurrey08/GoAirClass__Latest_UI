const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/hotel/hotelCouponController');

// Define routes
router.get('/available', couponController.getAvailableCoupons);
router.post('/validate', couponController.validateCoupon);
router.post('/create', couponController.createCoupon);
router.get('/hotel/:hotelId', couponController.getCouponsByHotel);
router.put('/:id/status', couponController.updateCouponStatus);
router.delete('/:id', couponController.deleteCoupon);

module.exports = router;
