const mongoose = require('mongoose');

const hotelCouponSchema = new mongoose.Schema({
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    couponCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minBookingAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number,
        default: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: 0
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

// Ensure a hotel doesn't have duplicate codes
hotelCouponSchema.index({ hotelId: 1, couponCode: 1 }, { unique: true });

module.exports = mongoose.model('HotelCoupon', hotelCouponSchema);
