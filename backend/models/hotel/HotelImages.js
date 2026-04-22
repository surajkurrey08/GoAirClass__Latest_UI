const mongoose = require('mongoose');

const hotelImagesSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    imageUrl: { type: String, required: true },
    caption: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('HotelImages', hotelImagesSchema);
