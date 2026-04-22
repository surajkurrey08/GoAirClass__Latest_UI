const Razorpay = require('razorpay');
const crypto = require('crypto');
const FlightBooking = require('../../models/flight/flightBooking.model');
const SeatInventory = require('../../models/flight/seatInventory.model');
const { generatePNR, generateTicketNumber } = require('../../utils/flightIdentifiers');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_5Wf3Xf3Xf3Xf3X',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'Xf3Xf3Xf3Xf3Xf3X'
});

const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency,
            receipt
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId
        } = req.body;

        console.log('Verifying payment for booking:', bookingId);
        console.log('Razorpay Order ID:', razorpay_order_id);

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'Xf3Xf3Xf3Xf3Xf3X')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            console.log('✅ Signature verified');
            // Payment verified
            const booking = await FlightBooking.findOne({ bookingId });
            if (!booking) {
                console.error('❌ Booking not found:', bookingId);
                return res.status(404).json({ success: false, message: 'Booking not found' });
            }

            // 1. Update Payment Status first
            booking.paymentStatus = 'PAID';

            // 2. Update Booking and Ticket Statuses
            booking.bookingStatus = 'CONFIRMED';
            booking.ticketStatus = 'ISSUED';

            // 3. Generate Identifiers if missing
            if (!booking.pnr) booking.pnr = generatePNR();
            if (!booking.ticketNumber) booking.ticketNumber = generateTicketNumber();

            // 4. Record Razorpay metadata
            booking.razorpayOrderId = razorpay_order_id;
            booking.razorpayPaymentId = razorpay_payment_id;
            booking.razorpaySignature = razorpay_signature;

            await booking.save();
            console.log('✅ Booking confirmed with PNR:', booking.pnr);

            // Mark seats as booked
            const seatNumbers = booking.passengers.map(p => p.seatNumber).filter(Boolean);
            if (seatNumbers.length > 0) {
                await SeatInventory.updateMany(
                    { flightId: booking.flightId, seatNumber: { $in: seatNumbers } },
                    { isBooked: true, isLocked: false, bookingId: booking._id }
                );
                console.log('✅ Seats marked as booked:', seatNumbers);
            }

            res.json({ success: true, message: 'Payment verified and booking confirmed', pnr: booking.pnr, ticketNumber: booking.ticketNumber });
        } else {
            console.error('❌ Invalid signature');
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (err) {
        console.error('❌ Verification error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
