const { authMiddleware } = require('./auth.middleware');
const Agency = require('../core/models/b2b/Agency');
const AgencyUser = require('../core/models/b2b/AgencyUser');
const {
    AGENCY_STATUSES,
    AGENCY_USER_STATUSES
} = require('../core/models/b2b/b2b.constants');

const attachB2BContext = async (req, res, next) => {
    try {
        if (req.user?.channel !== 'B2B') {
            return res.status(403).json({ success: false, message: 'B2B access token required' });
        }

        const agencyUser = await AgencyUser.findOne({
            userId: req.user.id,
            status: AGENCY_USER_STATUSES.ACTIVE
        }).sort({ createdAt: 1 });

        if (!agencyUser) {
            return res.status(403).json({ success: false, message: 'No active agency membership found' });
        }

        const agency = await Agency.findById(agencyUser.agencyId);
        if (!agency) {
            return res.status(404).json({ success: false, message: 'Agency not found' });
        }

        if ([AGENCY_STATUSES.BLOCKED].includes(agency.status)) {
            return res.status(403).json({ success: false, message: 'Agency is blocked' });
        }

        req.b2b = {
            userId: agencyUser.userId,
            agencyId: agency._id,
            agencyRole: agencyUser.role,
            agencyStatus: agency.status,
            verificationStatus: agency.verificationStatus,
            agencyUserId: agencyUser._id,
            agency,
            agencyUser
        };

        next();
    } catch (error) {
        console.error('B2B auth context error:', error);
        res.status(500).json({ success: false, message: 'Failed to resolve B2B context' });
    }
};

const b2bAuthMiddleware = (req, res, next) => {
    authMiddleware(req, res, () => attachB2BContext(req, res, next));
};

const requireApprovedAgency = (req, res, next) => {
    if (req.b2b?.agencyStatus !== AGENCY_STATUSES.APPROVED) {
        return res.status(403).json({
            success: false,
            message: 'Agency approval required',
            agencyStatus: req.b2b?.agencyStatus
        });
    }
    next();
};

const requireAgencyRoles = (roles) => (req, res, next) => {
    if (!roles.includes(req.b2b?.agencyRole)) {
        return res.status(403).json({ success: false, message: 'Insufficient agency role' });
    }
    next();
};

const requireAgencyNotSuspended = (req, res, next) => {
    if ([AGENCY_STATUSES.SUSPENDED, AGENCY_STATUSES.BLOCKED].includes(req.b2b?.agencyStatus)) {
        return res.status(403).json({
            success: false,
            message: 'Agency is not active',
            agencyStatus: req.b2b?.agencyStatus
        });
    }
    next();
};

module.exports = {
    b2bAuthMiddleware,
    requireApprovedAgency,
    requireAgencyRoles,
    requireAgencyNotSuspended
};
