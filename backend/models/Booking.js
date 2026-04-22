const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: String },
    gender: { type: String },
    seatNumber: { type: String }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pnrNumber: { type: String, unique: true, sparse: true },
    // Passenger info
    passengerName: { type: String },
    passengerEmail: { type: String },
    passengerMobile: { type: String },
    passengers: { type: [passengerSchema], default: [] },

    // explicit contact object based on new payload
    contactDetails: {
        phone: String,
        email: String,
        state: String
    },

    // Bus / schedule references (ObjectId when available)
    bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },

    // Journey details
    travelDate: { type: String },   // "YYYY-MM-DD"
    boardingPoint: { type: String },
    droppingPoint: { type: String },
    boarding: {
        point: { type: String },
        time: { type: String }
    },
    dropping: {
        point: { type: String },
        time: { type: String }
    },
    seatNumbers: { type: [String], default: [] },   // e.g. ["L1", "U3"]
    seatNumber: { type: String },                  // kept for backward compat
    seatDetails: [{
        seatNumber: String,
        seatType: String,
        price: Number
    }],

    // Fare
    baseFare: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalFare: { type: Number, default: 0 },
    couponCode: { type: String, default: '' },

    // Detailed Coupon Funding (for analytics)
    discountBreakdown: {
        adminFunded: { type: Number, default: 0 },
        operatorFunded: { type: Number, default: 0 }
    },

    // Fraud Prevention & Tracking
    deviceId: { type: String },
    ipAddress: { type: String },

    // Payment
    status: { type: String, enum: ['Confirmed', 'Cancelled', 'Pending'], default: 'Confirmed' },
    paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Cancelled'], default: 'Completed' },
    paymentMethod: { type: String, default: 'razorpay' },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },

    bookingDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
