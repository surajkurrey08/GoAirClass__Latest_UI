const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomType: {
        type: String,
        enum: ['Standard', 'Deluxe', 'Suite', 'Executive', 'Family', 'Single', 'Double'],
        default: 'Standard'
    },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number },
    discountPrice: { type: Number },
    capacity: { type: Number, default: 2 },
    totalRooms: { type: Number, default: 1 },
    availableRooms: { type: Number },
    size: { type: String, default: '' },
    bedType: { type: String, default: '' },
    view: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    status: {
        type: String,
        enum: ['available', 'unavailable', 'Sold Out'],
        default: 'available'
    },
}, { timestamps: true });


module.exports = mongoose.model('Room', roomSchema);

