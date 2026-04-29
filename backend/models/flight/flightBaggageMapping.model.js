
const mongoose = require('mongoose');

const flightBaggageMappingSchema = new mongoose.Schema({
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    cabinBaggage: { type: String, default: '7 kg' },
    checkInBaggage: { type: String, default: '15 kg' },
    isExtraAllowed: { type: Boolean, default: true },
    extraTiers: [
        {
            code: { type: String, required: true }, // e.g. "XB5"
            label: { type: String, required: true }, // e.g. "Extra 5kg"
            weight: { type: Number, required: true }, // 5
            price: { type: Number, required: true } // 2500
        }
    ],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightBaggageMapping', flightBaggageMappingSchema);
