const mongoose = require('mongoose');
const { AGENCY_USER_ROLES, AGENCY_USER_STATUSES } = require('./b2b.constants');

const agencyUserSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(AGENCY_USER_ROLES),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(AGENCY_USER_STATUSES),
        default: AGENCY_USER_STATUSES.ACTIVE,
        index: true
    },
    permissions: {
        type: [String],
        default: []
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

agencyUserSchema.index({ agencyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('AgencyUser', agencyUserSchema);
