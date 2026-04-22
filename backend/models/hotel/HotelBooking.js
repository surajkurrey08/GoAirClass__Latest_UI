const mongoose = require('mongoose');

const hotelBookingSchema = new mongoose.Schema({
    bookingId: { type: String, unique: true },
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    inventoryRoomId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomInventory' },
    assignedRoomNumber: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    guestName: { type: String, default: 'Guest' },
    guestEmail: { type: String, default: '' },
    guestPhone: { type: String, default: '' },
    checkInDate: { type: String, required: true },
    checkOutDate: { type: String, required: true },
    guests: { type: Number, default: 1 },
    roomType: { type: String, default: '' },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    taxes: { type: Number, default: 0 },
    billingAddress: { type: String, default: '' },
    pincode: { type: String, default: '' },
    state: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'pending'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
        default: 'Pending'
    },
    razorpayPaymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    cancellationReason: { type: String, default: '' },
    cancellationDetails: {
        cancelledAt: { type: Date },
        cancellationCharge: { type: Number, default: 0 },
        serviceFee: { type: Number, default: 0 },
        refundAmount: { type: Number, default: 0 },
        refundStatus: { type: String, enum: ['Processing', 'Completed', 'N/A'], default: 'N/A' }
    }
}, { timestamps: true });

module.exports = mongoose.model('HotelBooking', hotelBookingSchema);
