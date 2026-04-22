const express = require('express');
const router = express.Router();
const couponController = require('../controllers/CouponController');
const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

// Admin & Operator Shared Routes (Filters inside controller)
// Create (Used by both, logic inside controller)
router.post('/create', authMiddleware, couponController.createCoupon);

// List for Admin Panel
router.get('/admin/list', authMiddleware, checkRole(['superadmin', 'admin']), couponController.listCoupons);

// List for Operator Panel
router.get('/operator/list', authMiddleware, checkRole(['operator', 'bus_operator']), couponController.listCoupons);

// Update/Delete (Logic should check ownership if needed, but for now generic)
router.put('/update/:id', authMiddleware, couponController.updateCoupon);
router.delete('/delete/:id', authMiddleware, couponController.deleteCoupon);

// Public / Consumer Facing Routes
router.get('/public/list', couponController.getGlobalCoupons);
router.get('/bus/:busId', couponController.getCouponsByBus);
router.get('/payment/:busId', couponController.getCouponsForPayment);
router.post('/booking/apply-coupon', couponController.applyCoupon);

module.exports = router;
