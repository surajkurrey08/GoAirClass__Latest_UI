
const mongoose = require('mongoose');

const flightSeatMappingSchema = new mongoose.Schema({
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    aircraftType: { type: String, required: true },
    seatTiers: [
        {
            name: { type: String, required: true },
            rows: String, // e.g. "1-5"
            price: { type: Number, default: 0 },
            type: { type: String, enum: ['Window', 'Aisle', 'Middle', 'Extra Legroom', 'Standard'] }
        }
    ],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightSeatMapping', flightSeatMappingSchema);
