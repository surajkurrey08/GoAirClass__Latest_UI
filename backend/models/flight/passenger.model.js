const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightBooking', required: true },
    flightId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    name:      { type: String, required: true, trim: true },
    age:       { type: Number, required: true },
    gender:    { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    seatNumber:{ type: String, default: '' },
    passportNumber: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Passenger', passengerSchema);
