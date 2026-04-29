const mongoose = require('mongoose');

const priceLockSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lockedPrice: {
        type: Number,
        required: true
    },
    lockFee: {
        type: Number,
        default: 249
    },
    expiresAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['LOCKED', 'REDEEMED', 'EXPIRED'],
        default: 'LOCKED'
    }
}, { timestamps: true });

module.exports = mongoose.model('PriceLock', priceLockSchema);
