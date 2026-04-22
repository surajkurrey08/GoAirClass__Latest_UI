const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    availableRooms: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('RoomAvailability', availabilitySchema);
