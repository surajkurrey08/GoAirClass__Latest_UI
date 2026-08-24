const Agency = require('../../core/models/b2b/Agency');
const AgencyDocument = require('../../core/models/b2b/AgencyDocument');
const AgencyAuditLog = require('../../core/models/b2b/AgencyAuditLog');
const {
    AGENCY_STATUSES,
    REQUIRED_DOCUMENT_TYPES,
    DOCUMENT_STATUSES
} = require('../../core/models/b2b/b2b.constants');

const buildRequiredDocumentStatus = (documents) => REQUIRED_DOCUMENT_TYPES.map((documentType) => {
    const document = documents.find((item) => item.documentType === documentType);
    return {
        documentType,
        submitted: Boolean(document),
        status: document?.status || null,
        rejectionReason: document?.rejectionReason || null
    };
});

const getAgencyProfile = async (agencyId) => {
    const agency = await Agency.findById(agencyId);
    if (!agency) {
        const error = new Error('Agency not found');
        error.statusCode = 404;
        throw error;
    }

    const documents = await AgencyDocument.find({ agencyId }).sort({ createdAt: -1 });

    return {
        agency,
        documents,
        requiredDocuments: buildRequiredDocumentStatus(documents)
    };
};

const updateBusinessInfo = async ({ agencyId, userId, payload }) => {
    const agency = await Agency.findById(agencyId);
    if (!agency) {
        const error = new Error('Agency not found');
        error.statusCode = 404;
        throw error;
    }

    if ([AGENCY_STATUSES.SUSPENDED, AGENCY_STATUSES.BLOCKED].includes(agency.status)) {
        const error = new Error('Agency cannot be edited in current state');
        error.statusCode = 422;
        throw error;
    }

    agency.businessName = payload.businessName;
    agency.legalName = payload.legalName;
    agency.email = payload.email;
    agency.phone = payload.phone;
    agency.businessType = payload.businessType;
    agency.panNumber = payload.panNumber;
    agency.gstNumber = payload.gstNumber;
    agency.address = payload.address || {};

    if (agency.status === AGENCY_STATUSES.REJECTED) {
        agency.status = AGENCY_STATUSES.DRAFT;
        agency.verificationStatus = AGENCY_STATUSES.DRAFT;
        agency.rejectionReason = undefined;
    }

    await agency.save();

    await AgencyAuditLog.create({
        agencyId,
        actorUserId: userId,
        actorType: 'AGENCY_USER',
        action: 'BUSINESS_INFO_UPDATED',
        toStatus: agency.status
    });

    return agency;
};

const submitApplication = async ({ agencyId, userId }) => {
    const agency = await Agency.findById(agencyId);
    if (!agency) {
        const error = new Error('Agency not found');
        error.statusCode = 404;
        throw error;
    }

    if (![AGENCY_STATUSES.DRAFT, AGENCY_STATUSES.REJECTED].includes(agency.status)) {
        const error = new Error('Agency cannot be submitted in current state');
        error.statusCode = 422;
        throw error;
    }

    const missingBusinessFields = [];
    if (!agency.businessName) missingBusinessFields.push('businessName');
    if (!agency.email) missingBusinessFields.push('email');
    if (!agency.phone) missingBusinessFields.push('phone');

    if (missingBusinessFields.length) {
        const error = new Error(`Missing business fields: ${missingBusinessFields.join(', ')}`);
        error.statusCode = 422;
        throw error;
    }

    const documents = await AgencyDocument.find({ agencyId });
    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter((documentType) => (
        !documents.find((item) => item.documentType === documentType)
    ));

    if (missingDocuments.length) {
        const error = new Error(`Missing required documents: ${missingDocuments.join(', ')}`);
        error.statusCode = 422;
        throw error;
    }

    const rejectedDocuments = documents.filter((item) => item.status === DOCUMENT_STATUSES.REJECTED);
    if (rejectedDocuments.length) {
        const error = new Error('Rejected documents must be re-uploaded before submission');
        error.statusCode = 422;
        throw error;
    }

    const fromStatus = agency.status;
    agency.status = AGENCY_STATUSES.PENDING_VERIFICATION;
    agency.verificationStatus = AGENCY_STATUSES.PENDING_VERIFICATION;
    agency.submittedAt = new Date();
    agency.rejectionReason = undefined;
    await agency.save();

    await AgencyAuditLog.create({
        agencyId,
        actorUserId: userId,
        actorType: 'AGENCY_USER',
        action: 'APPLICATION_SUBMITTED',
        fromStatus,
        toStatus: agency.status
    });

    return agency;
};

module.exports = {
    getAgencyProfile,
    updateBusinessInfo,
    submitApplication,
    buildRequiredDocumentStatus
};
