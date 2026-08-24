const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const sendValidationError = (res, message) => res.status(400).json({ success: false, message });

const validateRegister = (req, res, next) => {
    const { fullName, email, phone, password, businessName } = req.body;

    if (!fullName || !email || !phone || !password || !businessName) {
        return sendValidationError(res, 'Full name, email, phone, password, and business name are required');
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

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendValidationError(res, 'Email and password are required');
    }

    if (!emailRegex.test(email)) {
        return sendValidationError(res, 'Invalid email format');
    }

    next();
};

const validateVerifyOtp = (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return sendValidationError(res, 'Email and OTP are required');
    }

    if (!emailRegex.test(email)) {
        return sendValidationError(res, 'Invalid email format');
    }

    next();
};

const validateForgotPassword = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return sendValidationError(res, 'Email is required');
    }

    if (!emailRegex.test(email)) {
        return sendValidationError(res, 'Invalid email format');
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateVerifyOtp,
    validateForgotPassword,
    emailRegex,
    phoneRegex
};
