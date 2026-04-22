const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    distance: { type: String, required: true }, // Keeping as string to support "450 KM" formats if needed, or numeric if preferred.
    travelTime: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    isPopular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
