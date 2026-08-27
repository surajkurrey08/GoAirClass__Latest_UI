const path = require('path');

const AgencyDocument = require('../../core/models/b2b/AgencyDocument');
const AgencyAuditLog = require('../../core/models/b2b/AgencyAuditLog');
const {
    DOCUMENT_TYPES,
    DOCUMENT_STATUSES
} = require('../../core/models/b2b/b2b.constants');

const validateDocumentInput = ({ documentType }) => {
    if (!documentType || !Object.values(DOCUMENT_TYPES).includes(documentType)) {
        const error = new Error('Valid document type is required');
        error.statusCode = 400;
        throw error;
    }
};

const uploadDocument = async ({ agencyId, userId, payload, file }) => {
    validateDocumentInput(payload);

    if (!file) {
        const error = new Error('Document file is required');
        error.statusCode = 400;
        throw error;
    }

    const fileName = path.basename(file.path);
    const fileUrl = `/uploads/b2b/documents/${fileName}`;

    const document = await AgencyDocument.findOneAndUpdate(
        { agencyId, documentType: payload.documentType },
        {
            agencyId,
            uploadedBy: userId,
            documentType: payload.documentType,
            documentNumber: payload.documentNumber,
            fileUrl,
            filePath: file.path,
            status: DOCUMENT_STATUSES.PENDING,
            rejectionReason: undefined,
            uploadedAt: new Date(),
            verifiedAt: undefined,
            verifiedBy: undefined
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await AgencyAuditLog.create({
        agencyId,
        actorUserId: userId,
        actorType: 'AGENCY_USER',
        action: 'DOCUMENT_UPLOADED',
        metadata: {
            documentId: document._id,
            documentType: document.documentType
        }
    });

    return document;
};

const listDocuments = (agencyId) => AgencyDocument.find({ agencyId }).sort({ createdAt: -1 });

module.exports = {
    uploadDocument,
    listDocuments
};
