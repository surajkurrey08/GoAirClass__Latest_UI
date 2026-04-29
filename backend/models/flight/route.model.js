const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    from: { type: String, required: true, uppercase: true }, // IATA Code (DEL)
    to: { type: String, required: true, uppercase: true },   // IATA Code (BOM)
    fromCity: { type: String, required: true },
    toCity: { type: String, required: true },
    routeCode: { type: String, required: true, unique: true }, // DEL-BOM
    distance: { type: Number, default: 0 },
    duration: { type: String }, // e.g., "02:15"
    status: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    priority: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique routes (e.g., DEL-BOM)
routeSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('FlightRoute', routeSchema);
