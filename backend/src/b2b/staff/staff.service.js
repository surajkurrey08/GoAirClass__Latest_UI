const bcrypt = require('bcryptjs');

const User = require('../../legacy/models/User');
const AgencyUser = require('../../core/models/b2b/AgencyUser');
const AgencyAuditLog = require('../../core/models/b2b/AgencyAuditLog');
const {
    AGENCY_USER_ROLES,
    AGENCY_USER_STATUSES
} = require('../../core/models/b2b/b2b.constants');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => String(phone || '').trim();

const listStaff = async (agencyId) => {
    const staff = await AgencyUser.find({ agencyId })
        .populate('userId', 'fullName email mobileNumber role isBlocked')
        .sort({ createdAt: 1 });

    return staff;
};

const findUserByEmailOrPhone = async ({ email, phone }) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedPhone = normalizePhone(phone);

    let user = await User.findOne({
        $or: [
            { email: normalizedEmail },
            { mobileNumber: normalizedPhone }
        ]
    });

    if (!user) {
        user = await User.AppUser.findOne({
            $or: [
                { email: normalizedEmail },
                { mobileNumber: normalizedPhone }
            ]
        });
    }

    return user;
};

const createStaff = async ({ agencyId, invitedBy, payload }) => {
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);
    let user = await findUserByEmailOrPhone({ email, phone });

    if (user && user.role !== 'agent') {
        const error = new Error('This user cannot be added as agency staff');
        error.statusCode = 409;
        throw error;
    }

    if (!user) {
        user = await User.create({
            fullName: payload.fullName,
            email,
            mobileNumber: phone,
            password: await bcrypt.hash(payload.password, 10),
            role: 'agent',
            registrationSource: 'B2B'
        });
    }

    const existingMembership = await AgencyUser.findOne({ agencyId, userId: user._id });
    if (existingMembership) {
        const error = new Error('User is already part of this agency');
        error.statusCode = 409;
        throw error;
    }

    const agencyUser = await AgencyUser.create({
        agencyId,
        userId: user._id,
        role: payload.role,
        status: AGENCY_USER_STATUSES.ACTIVE,
        invitedBy,
        permissions: []
    });

    await AgencyAuditLog.create({
        agencyId,
        actorUserId: invitedBy,
        actorType: 'AGENCY_USER',
        action: 'STAFF_ADDED',
        metadata: {
            agencyUserId: agencyUser._id,
            userId: user._id,
            role: payload.role
        }
    });

    return AgencyUser.findById(agencyUser._id).populate('userId', 'fullName email mobileNumber role isBlocked');
};

const ensureCanModifyStaff = async ({ agencyId, agencyUserId }) => {
    const agencyUser = await AgencyUser.findOne({ _id: agencyUserId, agencyId });
    if (!agencyUser) {
        const error = new Error('Staff member not found');
        error.statusCode = 404;
        throw error;
    }
    return agencyUser;
};

const ensureNotLastOwner = async ({ agencyId, agencyUser }) => {
    if (agencyUser.role !== AGENCY_USER_ROLES.AGENCY_OWNER) return;

    const ownerCount = await AgencyUser.countDocuments({
        agencyId,
        role: AGENCY_USER_ROLES.AGENCY_OWNER,
        status: AGENCY_USER_STATUSES.ACTIVE
    });

    if (ownerCount <= 1) {
        const error = new Error('Cannot remove or demote the last active agency owner');
        error.statusCode = 422;
        throw error;
    }
};

const updateStaffRole = async ({ agencyId, actorUserId, agencyUserId, role }) => {
    const agencyUser = await ensureCanModifyStaff({ agencyId, agencyUserId });
    await ensureNotLastOwner({ agencyId, agencyUser });

    const previousRole = agencyUser.role;
    agencyUser.role = role;
    await agencyUser.save();

    await AgencyAuditLog.create({
        agencyId,
        actorUserId,
        actorType: 'AGENCY_USER',
        action: 'STAFF_ROLE_UPDATED',
        metadata: {
            agencyUserId,
            previousRole,
            role
        }
    });

    return AgencyUser.findById(agencyUser._id).populate('userId', 'fullName email mobileNumber role isBlocked');
};

const setStaffStatus = async ({ agencyId, actorUserId, agencyUserId, status }) => {
    const agencyUser = await ensureCanModifyStaff({ agencyId, agencyUserId });

    if (status !== AGENCY_USER_STATUSES.ACTIVE) {
        await ensureNotLastOwner({ agencyId, agencyUser });
    }

    const previousStatus = agencyUser.status;
    agencyUser.status = status;
    await agencyUser.save();

    await AgencyAuditLog.create({
        agencyId,
        actorUserId,
        actorType: 'AGENCY_USER',
        action: status === AGENCY_USER_STATUSES.ACTIVE ? 'STAFF_REACTIVATED' : 'STAFF_DEACTIVATED',
        metadata: {
            agencyUserId,
            previousStatus,
            status
        }
    });

    return AgencyUser.findById(agencyUser._id).populate('userId', 'fullName email mobileNumber role isBlocked');
};

module.exports = {
    listStaff,
    createStaff,
    updateStaffRole,
    setStaffStatus
};
