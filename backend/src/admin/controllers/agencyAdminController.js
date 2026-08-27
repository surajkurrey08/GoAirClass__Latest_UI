const mongoose = require('mongoose');

const Agency = require('../../core/models/b2b/Agency');
const AgencyUser = require('../../core/models/b2b/AgencyUser');
const AgencyDocument = require('../../core/models/b2b/AgencyDocument');
const AgencyAuditLog = require('../../core/models/b2b/AgencyAuditLog');
const {
    AGENCY_STATUSES,
    DOCUMENT_STATUSES,
    REQUIRED_DOCUMENT_TYPES
} = require('../../core/models/b2b/b2b.constants');

const ensureObjectId = (id, label = 'id') => {
    if (!mongoose.isValidObjectId(id)) {
        const error = new Error(`Invalid ${label}`);
        error.statusCode = 400;
        throw error;
    }
};

const getAgencyOrFail = async (agencyId) => {
    ensureObjectId(agencyId, 'agency id');
    const agency = await Agency.findById(agencyId);
    if (!agency) {
        const error = new Error('Agency not found');
        error.statusCode = 404;
        throw error;
    }
    return agency;
};

const writeAudit = ({ agencyId, adminId, action, fromStatus, toStatus, notes, metadata }) => AgencyAuditLog.create({
    agencyId,
    actorUserId: adminId,
    actorType: 'ADMIN',
    action,
    fromStatus,
    toStatus,
    notes,
    metadata: metadata || {}
});

const listAgencies = async (req, res) => {
    try {
        const query = {};
        if (req.query.status) query.status = req.query.status;
        if (req.query.verificationStatus) query.verificationStatus = req.query.verificationStatus;

        const agencies = await Agency.find(query)
            .populate('ownerUserId', 'fullName email mobileNumber role')
            .sort({ createdAt: -1 });

        res.json({ success: true, agencies });
    } catch (error) {
        console.error('Admin B2B agency list error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const listPendingAgencies = async (req, res) => {
    req.query.status = AGENCY_STATUSES.PENDING_VERIFICATION;
    return listAgencies(req, res);
};

const getAgencyDetails = async (req, res) => {
    try {
        const agency = await getAgencyOrFail(req.params.id);
        const [staff, documents, auditLogs] = await Promise.all([
            AgencyUser.find({ agencyId: agency._id })
                .populate('userId', 'fullName email mobileNumber role isBlocked')
                .sort({ createdAt: 1 }),
            AgencyDocument.find({ agencyId: agency._id }).sort({ createdAt: -1 }),
            AgencyAuditLog.find({ agencyId: agency._id })
                .populate('actorUserId', 'fullName email role')
                .sort({ createdAt: -1 })
                .limit(50)
        ]);

        res.json({ success: true, agency, staff, documents, auditLogs });
    } catch (error) {
        console.error('Admin B2B agency detail error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const ensureSubmittedDocuments = async (agencyId) => {
    const documents = await AgencyDocument.find({ agencyId });
    const missing = REQUIRED_DOCUMENT_TYPES.filter((documentType) => (
        !documents.find((item) => item.documentType === documentType)
    ));

    if (missing.length) {
        const error = new Error(`Missing required documents: ${missing.join(', ')}`);
        error.statusCode = 422;
        throw error;
    }

    const rejected = documents.filter((item) => item.status === DOCUMENT_STATUSES.REJECTED);
    if (rejected.length) {
        const error = new Error('Agency has rejected documents');
        error.statusCode = 422;
        throw error;
    }
};

const approveAgency = async (req, res) => {
    try {
        const agency = await getAgencyOrFail(req.params.id);
        await ensureSubmittedDocuments(agency._id);

        const fromStatus = agency.status;
        agency.status = AGENCY_STATUSES.APPROVED;
        agency.verificationStatus = AGENCY_STATUSES.APPROVED;
        agency.approvedAt = new Date();
        agency.approvedBy = req.user.id;
        agency.rejectionReason = undefined;
        await agency.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'AGENCY_APPROVED',
            fromStatus,
            toStatus: agency.status,
            notes: req.body.notes
        });

        res.json({ success: true, message: 'Agency approved', agency });
    } catch (error) {
        console.error('Admin B2B agency approve error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const rejectAgency = async (req, res) => {
    try {
        if (!req.body.reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const agency = await getAgencyOrFail(req.params.id);
        const fromStatus = agency.status;
        agency.status = AGENCY_STATUSES.REJECTED;
        agency.verificationStatus = AGENCY_STATUSES.REJECTED;
        agency.rejectionReason = req.body.reason;
        await agency.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'AGENCY_REJECTED',
            fromStatus,
            toStatus: agency.status,
            notes: req.body.reason
        });

        res.json({ success: true, message: 'Agency rejected', agency });
    } catch (error) {
        console.error('Admin B2B agency reject error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const suspendAgency = async (req, res) => {
    try {
        const agency = await getAgencyOrFail(req.params.id);
        const fromStatus = agency.status;
        agency.status = AGENCY_STATUSES.SUSPENDED;
        agency.suspendedAt = new Date();
        agency.suspendedBy = req.user.id;
        await agency.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'AGENCY_SUSPENDED',
            fromStatus,
            toStatus: agency.status,
            notes: req.body.reason || req.body.notes
        });

        res.json({ success: true, message: 'Agency suspended', agency });
    } catch (error) {
        console.error('Admin B2B agency suspend error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const activateAgency = async (req, res) => {
    try {
        const agency = await getAgencyOrFail(req.params.id);
        const fromStatus = agency.status;
        agency.status = AGENCY_STATUSES.APPROVED;
        agency.verificationStatus = AGENCY_STATUSES.APPROVED;
        agency.suspendedAt = undefined;
        agency.suspendedBy = undefined;
        await agency.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'AGENCY_REACTIVATED',
            fromStatus,
            toStatus: agency.status,
            notes: req.body.notes
        });

        res.json({ success: true, message: 'Agency reactivated', agency });
    } catch (error) {
        console.error('Admin B2B agency activate error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const approveDocument = async (req, res) => {
    try {
        const agency = await getAgencyOrFail(req.params.id);
        ensureObjectId(req.params.documentId, 'document id');

        const document = await AgencyDocument.findOne({ _id: req.params.documentId, agencyId: agency._id });
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        document.status = DOCUMENT_STATUSES.APPROVED;
        document.verifiedAt = new Date();
        document.verifiedBy = req.user.id;
        document.rejectionReason = undefined;
        await document.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'DOCUMENT_APPROVED',
            metadata: { documentId: document._id, documentType: document.documentType }
        });

        res.json({ success: true, message: 'Document approved', document });
    } catch (error) {
        console.error('Admin B2B document approve error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

const rejectDocument = async (req, res) => {
    try {
        if (!req.body.reason) {
            return res.status(400).json({ success: false, message: 'Rejection reason is required' });
        }

        const agency = await getAgencyOrFail(req.params.id);
        ensureObjectId(req.params.documentId, 'document id');

        const document = await AgencyDocument.findOne({ _id: req.params.documentId, agencyId: agency._id });
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        document.status = DOCUMENT_STATUSES.REJECTED;
        document.verifiedAt = new Date();
        document.verifiedBy = req.user.id;
        document.rejectionReason = req.body.reason;
        await document.save();

        await writeAudit({
            agencyId: agency._id,
            adminId: req.user.id,
            action: 'DOCUMENT_REJECTED',
            notes: req.body.reason,
            metadata: { documentId: document._id, documentType: document.documentType }
        });

        res.json({ success: true, message: 'Document rejected', document });
    } catch (error) {
        console.error('Admin B2B document reject error:', error);
        res.status(error.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
    }
};

module.exports = {
    listAgencies,
    listPendingAgencies,
    getAgencyDetails,
    approveAgency,
    rejectAgency,
    suspendAgency,
    activateAgency,
    approveDocument,
    rejectDocument
};
