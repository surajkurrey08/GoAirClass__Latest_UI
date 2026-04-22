const express = require('express');
const router = express.Router();
const HotelBooking = require('../../models/hotel/HotelBooking');
const Hotel = require('../../models/hotel/Hotel');
const { verifyHotelOperator } = require('../../middleware/hotelOperatorAuth');

router.use(verifyHotelOperator);

// GET /api/hotel-operator/bookings — all bookings for operator's hotels
router.get('/', async (req, res) => {
    try {
        const hotels = await Hotel.find({ operatorId: req.hotelOperator._id }, '_id');
        const hotelIds = hotels.map(h => h._id);
        const bookings = await HotelBooking
            .find({ hotelId: { $in: hotelIds } })
            .populate('hotelId', 'hotelName city')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/hotel-operator/bookings/:id — single booking detail
router.get('/:id', async (req, res) => {
    try {
        const booking = await HotelBooking.findById(req.params.id).populate('hotelId', 'hotelName city address');
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });

        // Verify ownership
        const hotel = await Hotel.findOne({ _id: booking.hotelId._id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Access denied.' });

        res.json({ success: true, booking });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/hotel-operator/bookings/:id/cancel
router.put('/:id/cancel', async (req, res) => {
    try {
        const booking = await HotelBooking.findById(req.params.id).populate('hotelId');
        if (!booking) return res.status(404).json({ error: 'Booking not found.' });

        const hotel = await Hotel.findOne({ _id: booking.hotelId._id, operatorId: req.hotelOperator._id });
        if (!hotel) return res.status(403).json({ error: 'Access denied.' });

        booking.status = 'cancelled';
        await booking.save();
        res.json({ success: true, booking });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
