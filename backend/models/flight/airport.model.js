const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    airportName: { type: String, required: true, trim: true },
    airportCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    city: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Airport', airportSchema);
