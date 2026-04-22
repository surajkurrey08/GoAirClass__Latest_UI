const mongoose = require('mongoose');

const hotelOfferSchema = new mongoose.Schema({
    offerTitle: { type: String, required: true },
    discountPercentage: { type: Number, required: true, min: 0, max: 100 },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', default: null },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
}, { timestamps: true });

module.exports = mongoose.model('HotelOffer', hotelOfferSchema);
