const mongoose = require('mongoose');

const flightOfferSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    couponCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ['Percentage', 'Flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('FlightOffer', flightOfferSchema);
