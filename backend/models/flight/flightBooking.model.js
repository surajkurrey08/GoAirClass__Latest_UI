const mongoose = require('mongoose');
const { generatePNR, generateTicketNumber } = require('../../utils/flightIdentifiers');

const flightBookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    flightId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: true
    },
    flightDetails: {
        airline: String,
        flightNumber: String,
        departureAirport: String,
        arrivalAirport: String,
        departureCity: String,
        arrivalCity: String,
        departureTime: { type: Date, required: true },
        arrivalTime: Date, // Calculated automatically
        durationMinutes: { type: Number, required: true },
        aircraft: String,
        terminal: String,
        gate: { type: String, default: 'G1' },
        boardingTime: Date // Calculated based on departure
    },
    passengers: [{
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        dateOfBirth: { type: Date, required: true },
        nationality: { type: String, default: 'Indian' },
        passportNumber: { type: String },
        passportExpiry: { type: Date },
        seatNumber: { type: String, required: true },
        seatType: { type: String },
        seatPrice: { type: Number, default: 0 },
        baggage: { type: String, default: '15kg' },
        meal: { type: String, default: 'Veg' }
    }],
    contactDetails: {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        phone: {
            type: String,
            required: true,
            match: [/^\+[1-9]\d{1,14}$/, 'Please fill a valid international phone number (e.g. +918767605792)']
        }
    },
    fareDetails: {
        baseFare: { type: Number, default: 0 },
        taxes: { type: Number, default: 0 },
        seatFee: { type: Number, default: 0 },
        addons: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 } // Calculated automatically
    },
    currency: {
        type: String,
        default: 'INR'
    },
    pnr: {
        type: String,
        unique: true,
        sparse: true
    },
    ticketNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    bookingId: {
        type: String,
        unique: true
    },
    paymentMethod: { type: String, default: 'Razorpay' },
    paymentStatus: {
        type: String,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
        default: 'PENDING'
    },
    bookingStatus: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'],
        default: 'PENDING'
    },
    ticketStatus: {
        type: String,
        enum: ['PENDING', 'ISSUED', 'CANCELLED'],
        default: 'PENDING'
    },
    checkinStatus: {
        type: String,
        enum: ['NOT_CHECKED_IN', 'CHECKED_IN'],
        default: 'NOT_CHECKED_IN'
    },
    cancellationDetails: {
        isCancelled: { type: Boolean, default: false },
        cancelledAt: { type: Date },
        refundAmount: { type: Number, default: 0 },
        cancellationCharges: { type: Number, default: 0 },
        refundStatus: {
            type: String,
            enum: ['PENDING', 'PROCESSED', 'FAILED', 'NOT_APPLICABLE'],
            default: 'NOT_APPLICABLE'
        }
    },
    bookingSource: {
        type: String,
        default: 'WEB'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
}, { timestamps: true });

// Pre-validate hook for transformations & calculations
// Runs before built-in validators, ensuring +91 prefix and fare calculations pass
flightBookingSchema.pre('validate', async function () {
    // 1. Format Phone Number (if missing + and is 10 digits)
    if (this.contactDetails.phone && !this.contactDetails.phone.startsWith('+')) {
        if (this.contactDetails.phone.length === 10) {
            this.contactDetails.phone = `+91${this.contactDetails.phone}`;
        }
    }

    // 2. Calculate Arrival Time & Boarding Time
    if (this.flightDetails.departureTime && this.flightDetails.durationMinutes) {
        const depTime = new Date(this.flightDetails.departureTime);
        this.flightDetails.arrivalTime = new Date(
            depTime.getTime() + (this.flightDetails.durationMinutes * 60000)
        );
        // Set boarding time 1 hour before departure
        this.flightDetails.boardingTime = new Date(
            depTime.getTime() - (60 * 60000)
        );
    }

    // 3. Calculate Total Amount
    const { baseFare = 0, taxes = 0, seatFee = 0, addons = 0, discount = 0 } = this.fareDetails || {};
    this.fareDetails.totalAmount = (baseFare + taxes + seatFee + addons) - discount;

    // 4. Generate PNR if missing
    if (!this.pnr) {
        this.pnr = generatePNR();
    }

    // 5. Generate Ticket Number if missing
    if (!this.ticketNumber) {
        this.ticketNumber = generateTicketNumber();
    }
});

module.exports = mongoose.model('FlightBooking', flightBookingSchema);
