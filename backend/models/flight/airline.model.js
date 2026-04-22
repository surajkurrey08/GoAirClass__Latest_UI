const mongoose = require('mongoose');

const airlineSchema = new mongoose.Schema({
    airlineName: { type: String, required: true, trim: true },
    airlineCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    country: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Airline', airlineSchema);
