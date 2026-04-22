const mongoose = require('mongoose');

const seatInventorySchema = new mongoose.Schema({
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    seatNumber: { type: String, required: true },
    type: {
        type: String,
        enum: ['Free', 'Standard', 'Premium', 'Extra Legroom'],
        default: 'Standard'
    },
    price: { type: Number, default: 0 },
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date },
    lockedBy: { type: String }, // Session ID or User ID
    isBooked: { type: Boolean, default: false },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightBooking' }
}, { timestamps: true });

// Unique index to prevent duplicate seats for the same flight
seatInventorySchema.index({ flightId: 1, seatNumber: 1 }, { unique: true });

// Index for auto-unlocking seats after 5 minutes (300 seconds)
seatInventorySchema.index({ lockedAt: 1 }, { expireAfterSeconds: 300, partialFilterExpression: { isLocked: true, isBooked: false } });

// Index for fast seat lookup by lock status
seatInventorySchema.index({ isLocked: 1 });

module.exports = mongoose.model('SeatInventory', seatInventorySchema);
