const mongoose = require('mongoose');
const { DOCUMENT_TYPES, DOCUMENT_STATUSES } = require('./b2b.constants');

const agencyDocumentSchema = new mongoose.Schema({
    agencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agency',
        required: true,
        index: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentType: {
        type: String,
        enum: Object.values(DOCUMENT_TYPES),
        required: true
    },
    documentNumber: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(DOCUMENT_STATUSES),
        default: DOCUMENT_STATUSES.PENDING,
        index: true
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: Date,
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

agencyDocumentSchema.index({ agencyId: 1, documentType: 1 }, { unique: true });

module.exports = mongoose.model('AgencyDocument', agencyDocumentSchema);
