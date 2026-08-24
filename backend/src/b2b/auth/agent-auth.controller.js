const authService = require('./agent-auth.service');

const toAuthResponse = ({ user, agency, agencyUser, token }) => ({
    success: true,
    token,
    channel: 'B2B',
    user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.mobileNumber,
        role: user.role,
        isEmailVerified: user.isEmailVerified
    },
    agency: {
        id: agency._id,
        agencyCode: agency.agencyCode,
        businessName: agency.businessName,
        status: agency.status,
        verificationStatus: agency.verificationStatus
    },
    agencyUser: {
        id: agencyUser._id,
        role: agencyUser.role,
        status: agencyUser.status
    }
});

const handleError = (res, error) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

const register = async (req, res) => {
    try {
        const result = await authService.registerAgent(req.body);
        res.status(201).json({
            ...toAuthResponse(result),
            message: 'Agent registered and agency created'
        });
    } catch (error) {
        console.error('B2B register error:', error);
        handleError(res, error);
    }
};

const login = async (req, res) => {
    try {
        const result = await authService.loginAgent(req.body);
        res.json({
            ...toAuthResponse(result),
            message: 'Logged in successfully'
        });
    } catch (error) {
        console.error('B2B login error:', error);
        handleError(res, error);
    }
};

const verifyOtp = async (req, res) => {
    try {
        await authService.verifyAgentOtp(req.body);
        res.json({ success: true, message: 'OTP verified successfully' });
    } catch (error) {
        console.error('B2B verify OTP error:', error);
        handleError(res, error);
    }
};

const forgotPassword = async (req, res) => {
    try {
        await authService.requestPasswordReset(req.body);
        res.json({ success: true, message: 'Password reset OTP sent successfully' });
    } catch (error) {
        console.error('B2B forgot password error:', error);
        handleError(res, error);
    }
};

module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword
};
