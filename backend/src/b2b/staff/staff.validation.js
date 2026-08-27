const { AGENCY_USER_ROLES } = require('../../core/models/b2b/b2b.constants');
const { emailRegex, phoneRegex } = require('../auth/agent-auth.validation');

const staffRoles = [
    AGENCY_USER_ROLES.AGENCY_MANAGER,
    AGENCY_USER_ROLES.BOOKING_STAFF,
    AGENCY_USER_ROLES.ACCOUNTANT
];

const sendValidationError = (res, message) => res.status(400).json({ success: false, message });

const validateCreateStaff = (req, res, next) => {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !phone || !password || !role) {
        return sendValidationError(res, 'Full name, email, phone, password, and role are required');
    }

    if (!emailRegex.test(email)) {
        return sendValidationError(res, 'Invalid email format');
    }

    if (!phoneRegex.test(phone)) {
        return sendValidationError(res, 'Valid 10-digit phone number is required');
    }

    if (password.length < 8) {
        return sendValidationError(res, 'Password must be at least 8 characters long');
    }

    if (!staffRoles.includes(role)) {
        return sendValidationError(res, 'Invalid staff role');
    }

    next();
};

const validateRoleUpdate = (req, res, next) => {
    const { role } = req.body;

    if (!role || !staffRoles.includes(role)) {
        return sendValidationError(res, 'Valid staff role is required');
    }

    next();
};

module.exports = {
    validateCreateStaff,
    validateRoleUpdate,
    staffRoles
};
