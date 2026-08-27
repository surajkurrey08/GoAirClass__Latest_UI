const mongoose = require('mongoose');
const { AGENCY_STATUSES } = require('./b2b.constants');

const addressSchema = new mongoose.Schema({
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' }
}, { _id: false });

const agencySchema = new mongoose.Schema({
    agencyCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    legalName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        trim: true
    },
    panNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    gstNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    address: {
        type: addressSchema,
        default: {}
    },
    ownerUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(AGENCY_STATUSES),
        default: AGENCY_STATUSES.DRAFT,
        index: true
    },
    verificationStatus: {
        type: String,
        enum: Object.values(AGENCY_STATUSES),
        default: AGENCY_STATUSES.DRAFT,
        index: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    submittedAt: Date,
    approvedAt: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    suspendedAt: Date,
    suspendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

agencySchema.index({ email: 1 });
agencySchema.index({ phone: 1 });
agencySchema.index({ ownerUserId: 1, status: 1 });

module.exports = mongoose.model('Agency', agencySchema);
