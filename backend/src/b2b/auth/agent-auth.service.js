const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../legacy/models/User');
const Otp = require('../../legacy/models/Otp');
const { sendOtpEmail } = require('../../core/notifications/emailService');
const Agency = require('../../core/models/b2b/Agency');
const AgencyUser = require('../../core/models/b2b/AgencyUser');
const AgencySettings = require('../../core/models/b2b/AgencySettings');
const AgencyAuditLog = require('../../core/models/b2b/AgencyAuditLog');
const {
    AGENCY_STATUSES,
    AGENCY_USER_ROLES,
    AGENCY_USER_STATUSES
} = require('../../core/models/b2b/b2b.constants');

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => String(phone || '').trim();

const generate6DigitOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateAgencyCode = async () => {
    const counter = await AgencySettings.findOneAndUpdate(
        { key: 'agencyCode' },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return `GAC-AG-${String(counter.sequence).padStart(6, '0')}`;
};

const signB2BToken = ({ userId, agencyId, agencyRole }) => jwt.sign(
    {
        id: userId,
        role: 'agent',
        channel: 'B2B',
        agencyId,
        agencyRole
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '30d' }
);

const createEmailOtp = async (email, purpose) => {
    const otp = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.deleteMany({ email, purpose });
    await Otp.create({ email, otp, purpose, expiresAt });
    await sendOtpEmail(email, otp);
};

const registerAgent = async (payload) => {
    const email = normalizeEmail(payload.email);
    const phone = normalizePhone(payload.phone);

    const existingByEmail = await User.findOne({ email });
    const existingAppByEmail = existingByEmail ? null : await User.AppUser.findOne({ email });
    if (existingByEmail || existingAppByEmail) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
    }

    const existingByPhone = await User.findOne({ mobileNumber: phone });
    const existingAppByPhone = existingByPhone ? null : await User.AppUser.findOne({ mobileNumber: phone });
    if (existingByPhone || existingAppByPhone) {
        const error = new Error('Phone number already registered');
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
        fullName: payload.fullName,
        email,
        mobileNumber: phone,
        password: hashedPassword,
        role: 'agent',
        registrationSource: 'B2B'
    });

    const agency = await Agency.create({
        agencyCode: await generateAgencyCode(),
        businessName: payload.businessName,
        legalName: payload.legalName,
        email,
        phone,
        businessType: payload.businessType,
        panNumber: payload.panNumber,
        gstNumber: payload.gstNumber,
        address: payload.address || {},
        ownerUserId: user._id,
        status: AGENCY_STATUSES.DRAFT,
        verificationStatus: AGENCY_STATUSES.DRAFT
    });

    const agencyUser = await AgencyUser.create({
        agencyId: agency._id,
        userId: user._id,
        role: AGENCY_USER_ROLES.AGENCY_OWNER,
        status: AGENCY_USER_STATUSES.ACTIVE,
        permissions: ['agency:manage', 'staff:manage']
    });

    await AgencyAuditLog.create({
        agencyId: agency._id,
        actorUserId: user._id,
        actorType: 'AGENCY_USER',
        action: 'AGENCY_REGISTERED',
        toStatus: agency.status
    });

    await createEmailOtp(email, 'register');

    const token = signB2BToken({
        userId: user._id,
        agencyId: agency._id,
        agencyRole: agencyUser.role
    });

    return { user, agency, agencyUser, token };
};

const loginAgent = async ({ email, password }) => {
    const normalizedEmail = normalizeEmail(email);
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        user = await User.AppUser.findOne({ email: normalizedEmail });
    }

    if (!user || user.role !== 'agent' || !user.password) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    if (user.isBlocked) {
        const error = new Error('Account is blocked');
        error.statusCode = 403;
        throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const agencyUser = await AgencyUser.findOne({
        userId: user._id,
        status: AGENCY_USER_STATUSES.ACTIVE
    }).sort({ createdAt: 1 });

    if (!agencyUser) {
        const error = new Error('No active agency membership found');
        error.statusCode = 403;
        throw error;
    }

    const agency = await Agency.findById(agencyUser.agencyId);
    if (!agency) {
        const error = new Error('Agency not found');
        error.statusCode = 404;
        throw error;
    }

    if ([AGENCY_STATUSES.BLOCKED].includes(agency.status)) {
        const error = new Error('Agency is blocked');
        error.statusCode = 403;
        throw error;
    }

    const token = signB2BToken({
        userId: user._id,
        agencyId: agency._id,
        agencyRole: agencyUser.role
    });

    return { user, agency, agencyUser, token };
};

const verifyAgentOtp = async ({ email, otp }) => {
    const normalizedEmail = normalizeEmail(email);
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'register' }).sort({ createdAt: -1 });

    if (!otpRecord) {
        const error = new Error('No OTP found. Please request a new OTP.');
        error.statusCode = 400;
        throw error;
    }

    if (new Date() > otpRecord.expiresAt) {
        await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });
        const error = new Error('OTP expired. Please request a new one.');
        error.statusCode = 400;
        throw error;
    }

    if (otpRecord.otp !== otp) {
        const error = new Error('Invalid OTP. Please try again.');
        error.statusCode = 400;
        throw error;
    }

    const user = await User.findOneAndUpdate(
        { email: normalizedEmail, role: 'agent' },
        { isEmailVerified: true },
        { new: true }
    );

    if (!user) {
        const error = new Error('Agent account not found');
        error.statusCode = 404;
        throw error;
    }

    await Otp.deleteMany({ email: normalizedEmail, purpose: 'register' });

    return user;
};

const requestPasswordReset = async ({ email }) => {
    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail, role: 'agent' });
    if (!user) {
        const error = new Error('Agent account not found');
        error.statusCode = 404;
        throw error;
    }

    await createEmailOtp(normalizedEmail, 'forgot-password');
};

module.exports = {
    registerAgent,
    loginAgent,
    verifyAgentOtp,
    requestPasswordReset,
    signB2BToken
};
