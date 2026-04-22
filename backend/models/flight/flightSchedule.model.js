const mongoose = require('mongoose');

const flightScheduleSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, trim: true },
    airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    fromAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    toAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    
    // Time in 24h format HH:mm
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    duration: { type: String, required: true },
    
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    operatingDays: [{ type: Number, required: true }],
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    
    aircraftType: { type: String, default: 'Airbus A320' },
    
    configuration: {
        economy: {
            seats: { type: Number, default: 150 },
            price: { type: Number, default: 0 }
        },
        business: {
            seats: { type: Number, default: 12 },
            price: { type: Number, default: 0 }
        }
    },
    
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Expired'],
        default: 'Active'
    },
    
    lastGeneratedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('FlightSchedule', flightScheduleSchema);
