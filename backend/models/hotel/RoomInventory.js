const mongoose = require('mongoose');

const roomInventorySchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomNumber: { type: String, required: true },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
}, { timestamps: true });

// Ensure room numbers are unique per hotel (or per room type)
roomInventorySchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('RoomInventory', roomInventorySchema);
