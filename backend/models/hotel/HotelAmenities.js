const mongoose = require('mongoose');

const hotelAmenitiesSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    amenityName: { type: String, required: true },
    icon: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HotelAmenities', hotelAmenitiesSchema);
