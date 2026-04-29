
const mongoose = require('mongoose');

const seatMasterSchema = new mongoose.Schema({
    aircraftType: { 
        type: String, 
        required: true, 
        unique: true, 
        enum: ['Airbus A320', 'Airbus A321', 'Boeing 737', 'Boeing 777', 'ATR 72']
    },
    totalRows: { type: Number, required: true, default: 30 },
    layout: { type: String, default: '3-3' }, // e.g. 3-3, 2-2, 3-3-3
    tiers: [
        {
            name: { type: String, required: true }, // e.g. "Prime Seats", "Emergency Exit"
            rows: [Number], // e.g. [1, 2, 3, 12, 13]
            price: { type: Number, required: true },
            color: { type: String, default: '#3b82f6' }, // Hex color for UI
            type: { type: String, enum: ['Window', 'Aisle', 'Middle', 'Extra Legroom', 'Standard'], default: 'Standard' }
        }
    ],
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SeatMaster', seatMasterSchema);
