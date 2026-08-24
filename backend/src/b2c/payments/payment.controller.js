const paymentService = require('./payment.service');

const createOrder = async (req, res) => {
    try {
        const { amount, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const order = await paymentService.createPaymentOrder(amount, notes);
        res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment order', error: error.message });
    }
};

const verifyPayment = (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
        }

        if (paymentService.verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
            res.json({ success: true, message: 'Payment verified', paymentId: razorpay_payment_id });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
