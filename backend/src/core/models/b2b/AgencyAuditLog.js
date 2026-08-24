const mongoose = require('mongoose');

const agencyAuditLogSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true,
        index: true
    },
    actorUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actorType: {
        type: String,
        enum: ['ADMIN', 'AGENCY_USER', 'SYSTEM'],
        default: 'SYSTEM'
    },
    action: {
        type: String,
        required: true,
        trim: true
    },
    fromStatus: {
        type: String,
        trim: true
    },
    toStatus: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('AgencyAuditLog', agencyAuditLogSchema);
