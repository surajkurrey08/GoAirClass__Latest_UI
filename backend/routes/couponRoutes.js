const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Consumer Facing Routes (Bus Booking)
router.get('/', couponController.getAvailableCoupons);
router.post('/apply', couponController.applyCoupon);

// Admin & Operator Shared Routes (Management)
router.post('/create', authMiddleware, couponController.createCoupon);
router.get('/admin/list', authMiddleware, checkRole(['superadmin', 'admin']), couponController.listCoupons);
router.get('/operator/list', authMiddleware, checkRole(['operator', 'bus_operator']), couponController.listCoupons);

module.exports = router;
