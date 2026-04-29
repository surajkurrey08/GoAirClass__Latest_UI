const mongoose = require('mongoose');

const flightInventorySchema = new mongoose.Schema({
    flightNumber: { type: String, required: true },
    airline: { type: mongoose.Schema.Types.ObjectId, ref: 'Airline', required: true },
    airlineName: { type: String }, // For convenience
    airlineLogo: { type: String },
    from: { type: String, required: true }, // IATA Code
    to: { type: String, required: true },   // IATA Code
    routeCode: { type: String }, // DEL-BOM
    aircraftType: { type: String, default: 'Airbus A320-251N neo' },
    seatConfig: { type: String, default: 'Standard 3-3' },
    onTime: { type: String, default: '96% On-time' },

    departureDate: { type: Date, required: true },
    departureTime: { type: String, required: true },
    departureAirport: { type: String, default: 'Indira Gandhi Intl Airport' },
    departureTerminal: { type: String, default: 'Terminal 3' },
    departureCity: { type: String },

    arrivalTime: { type: String, required: true },
    arrivalAirport: { type: String, default: 'Chhatrapati Shivaji Intl Airport' },
    arrivalTerminal: { type: String, default: 'Terminal 2' },
    arrivalCity: { type: String },

    duration: { type: String },

    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },

    economySeats: { type: Number, default: 0 },
    businessSeats: { type: Number, default: 0 },
    firstClassSeats: { type: Number, default: 0 },

    baseFare: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    fuelCharges: { type: Number, default: 0 },
    finalPrice: { type: Number, required: true },

    baggage: {
        cabin: { type: String, default: '7kg' },
        checkin: { type: String, default: '15kg' }
    },

    refundable: { type: Boolean, default: true },
    reschedulable: { type: Boolean, default: true },
    status: { type: Boolean, default: true },

    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightInventory', flightInventorySchema);
