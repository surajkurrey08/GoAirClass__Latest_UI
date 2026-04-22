const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    hotelName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    description: { type: String, default: '' },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    operatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Operator', default: null },
    operatorName: { type: String, default: 'N/A' },
    starRating: { type: Number, default: 3, min: 1, max: 5 },
    pricePerNight: { type: Number, default: 0 },
    totalRooms: { type: Number, default: 0 },
    latitude: { type: Number },
    longitude: { type: Number },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isBlocked: { type: Boolean, default: false },
    rejectionReason: { type: String, default: '' },
}, { timestamps: true });


module.exports = mongoose.model('Hotel', hotelSchema);
