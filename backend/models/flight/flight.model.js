const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flightNumber: { type: String, required: true, trim: true },
    airlineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    fromAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    toAirport: { type: mongoose.Schema.Types.ObjectId, ref: 'Airport', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    duration: { type: String, required: true },
    totalSeats: { type: Number, required: true, min: 0 },
    availableSeats: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    baggageInfo: {
        cabin: { type: String, default: '7 kg' },
        checkIn: { type: String, default: '15 kg' }
    },
    mealIncluded: { type: Boolean, default: false },
    isRefundable: { type: Boolean, default: true },
    aircraftType: { type: String, default: 'Airbus A320' },
    stops: { type: String, default: 'Non-Stop' },
    
    // Add schedule reference
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightSchedule' },
    
    // Enhanced configuration
    configuration: {
        economy: {
            totalSeats: { type: Number, default: 150 },
            availableSeats: { type: Number, default: 150 },
            price: { type: Number, default: 0 }
        },
        business: {
            totalSeats: { type: Number, default: 0 },
            availableSeats: { type: Number, default: 0 },
            price: { type: Number, default: 0 }
        }
    },

    status: {
        type: String,
        enum: ['Scheduled', 'Delayed', 'Cancelled', 'Completed'],
        default: 'Scheduled'
    },
}, { timestamps: true });

module.exports = mongoose.model('Flight', flightSchema);
