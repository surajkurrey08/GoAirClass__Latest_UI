const mongoose = require('mongoose');

const flightApiConfigSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        enum: ['Amadeus', 'Sabre', 'Travelport', 'Mystifly', 'TBO']
    },
    apiKey: {
        type: String,
        required: true
    },
    apiSecret: {
        type: String,
        required: true
    },
    environment: {
        type: String,
        required: true,
        enum: ['test', 'live'],
        default: 'test'
    },
    status: {
        type: String,
        enum: ['enabled', 'disabled'],
        default: 'enabled'
    },
    lastSynced: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('FlightApiConfig', flightApiConfigSchema);
