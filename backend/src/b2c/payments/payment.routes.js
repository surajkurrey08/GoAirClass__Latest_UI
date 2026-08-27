const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
