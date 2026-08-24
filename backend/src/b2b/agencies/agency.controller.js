const agencyService = require('./agency.service');

const handleError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

const getMyAgency = async (req, res) => {
    try {
        const profile = await agencyService.getAgencyProfile(req.b2b.agencyId);
        res.json({
            success: true,
            agency: profile.agency,
            membership: req.b2b.agencyUser,
            requiredDocuments: profile.requiredDocuments
        });
    } catch (error) {
        console.error('B2B agency profile error:', error);
        handleError(res, error);
    }
};

const updateBusinessInfo = async (req, res) => {
    try {
        const agency = await agencyService.updateBusinessInfo({
            agencyId: req.b2b.agencyId,
            userId: req.b2b.userId,
            payload: req.body
        });
        res.json({ success: true, message: 'Business information updated', agency });
    } catch (error) {
        console.error('B2B agency update error:', error);
        handleError(res, error);
    }
};

const submitApplication = async (req, res) => {
    try {
        const agency = await agencyService.submitApplication({
            agencyId: req.b2b.agencyId,
            userId: req.b2b.userId
        });
        res.json({ success: true, message: 'Agency application submitted', agency });
    } catch (error) {
        console.error('B2B agency submit error:', error);
        handleError(res, error);
    }
};

const getStatus = async (req, res) => {
    try {
        const profile = await agencyService.getAgencyProfile(req.b2b.agencyId);
        res.json({
            success: true,
            agencyCode: profile.agency.agencyCode,
            status: profile.agency.status,
            verificationStatus: profile.agency.verificationStatus,
            rejectionReason: profile.agency.rejectionReason || null,
            requiredDocuments: profile.requiredDocuments
        });
    } catch (error) {
        console.error('B2B agency status error:', error);
        handleError(res, error);
    }
};

module.exports = {
    getMyAgency,
    updateBusinessInfo,
    submitApplication,
    getStatus
};
