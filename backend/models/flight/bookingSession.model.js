const mongoose = require('mongoose');

const bookingSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    fareKey: {
        type: String,
        required: true
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    priceSnapshot: {
        baseFare: Number,
        taxes: Number,
        total: Number,
        currency: { type: String, default: 'INR' }
    },
    searchData: {
        from: String,
        to: String,
        date: Date,
        passengers: Number
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Document will be deleted when expiresAt is reached
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'BOOKED', 'EXPIRED'],
        default: 'ACTIVE'
    }
}, { timestamps: true });

module.exports = mongoose.model('BookingSession', bookingSessionSchema);
