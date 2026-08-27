const AgencyUser = require('../../core/models/b2b/AgencyUser');
const AgencyDocument = require('../../core/models/b2b/AgencyDocument');
const { buildRequiredDocumentStatus } = require('../agencies/agency.service');
const { REQUIRED_DOCUMENT_TYPES } = require('../../core/models/b2b/b2b.constants');

const calculateProfileCompletion = ({ agency, requiredDocuments }) => {
    const checks = [
        Boolean(agency.businessName),
        Boolean(agency.email),
        Boolean(agency.phone),
        Boolean(agency.businessType),
        Boolean(agency.address?.city),
        Boolean(agency.panNumber),
        ...requiredDocuments.map((item) => item.submitted)
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
};

const getDashboard = async ({ agency, agencyUser }) => {
    const [staffCount, documents] = await Promise.all([
        AgencyUser.countDocuments({ agencyId: agency._id }),
        AgencyDocument.find({ agencyId: agency._id }).sort({ createdAt: -1 })
    ]);

    const requiredDocuments = buildRequiredDocumentStatus(documents);

    return {
        agency: {
            id: agency._id,
            agencyCode: agency.agencyCode,
            businessName: agency.businessName,
            status: agency.status,
            verificationStatus: agency.verificationStatus,
            rejectionReason: agency.rejectionReason || null
        },
        agencyUser: {
            id: agencyUser._id,
            role: agencyUser.role,
            status: agencyUser.status
        },
        staffCount,
        profileCompletion: calculateProfileCompletion({ agency, requiredDocuments }),
        requiredDocuments,
        requiredDocumentTypes: REQUIRED_DOCUMENT_TYPES
    };
};

module.exports = {
    getDashboard
};
