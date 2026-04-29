const mongoose = require('mongoose');

const flightRefundSchema = new mongoose.Schema({
    refundId: { type: String, unique: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightBooking', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    },
    paymentMode: { type: String, default: 'Original Method' },
    processedDate: { type: Date },
    adminRemark: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightRefund', flightRefundSchema);
