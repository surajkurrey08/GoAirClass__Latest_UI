const staffService = require('./staff.service');
const { AGENCY_USER_STATUSES } = require('../../core/models/b2b/b2b.constants');

const handleError = (res, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

const listStaff = async (req, res) => {
    try {
        const staff = await staffService.listStaff(req.b2b.agencyId);
        res.json({ success: true, staff });
    } catch (error) {
        console.error('B2B staff list error:', error);
        handleError(res, error);
    }
};

const createStaff = async (req, res) => {
    try {
        const staff = await staffService.createStaff({
            agencyId: req.b2b.agencyId,
            invitedBy: req.b2b.userId,
            payload: req.body
        });
        res.status(201).json({ success: true, message: 'Staff member added', staff });
    } catch (error) {
        console.error('B2B staff create error:', error);
        handleError(res, error);
    }
};

const updateRole = async (req, res) => {
    try {
        const staff = await staffService.updateStaffRole({
            agencyId: req.b2b.agencyId,
            actorUserId: req.b2b.userId,
            agencyUserId: req.params.id,
            role: req.body.role
        });
        res.json({ success: true, message: 'Staff role updated', staff });
    } catch (error) {
        console.error('B2B staff role update error:', error);
        handleError(res, error);
    }
};

const deactivateStaff = async (req, res) => {
    try {
        const staff = await staffService.setStaffStatus({
            agencyId: req.b2b.agencyId,
            actorUserId: req.b2b.userId,
            agencyUserId: req.params.id,
            status: AGENCY_USER_STATUSES.INACTIVE
        });
        res.json({ success: true, message: 'Staff member deactivated', staff });
    } catch (error) {
        console.error('B2B staff deactivate error:', error);
        handleError(res, error);
    }
};

const reactivateStaff = async (req, res) => {
    try {
        const staff = await staffService.setStaffStatus({
            agencyId: req.b2b.agencyId,
            actorUserId: req.b2b.userId,
            agencyUserId: req.params.id,
            status: AGENCY_USER_STATUSES.ACTIVE
        });
        res.json({ success: true, message: 'Staff member reactivated', staff });
    } catch (error) {
        console.error('B2B staff reactivate error:', error);
        handleError(res, error);
    }
};

module.exports = {
    listStaff,
    createStaff,
    updateRole,
    deactivateStaff,
    reactivateStaff
};
