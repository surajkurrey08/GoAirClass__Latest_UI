const express = require('express');
const router = express.Router();
const {
    getOtp,
    resendOtp,
    verifyOtp,
    loginWithOtp,
    verifyLoginOtp,
    sendRegistrationOtp,
    verifyRegistrationOtp,
    sendRegisterEmailOtp,
    verifyRegisterEmailOtp,
    sendLoginEmailOtp,
    verifyLoginEmailOtp,
    getDashboardStats,
    submitAdminRequest,
    getAdminRequests,
    getAdminNotifications,
    updateAdminRequestStatus,
    adminLogin,
    adminLoginStep1,
    adminLoginVerifyOtp,
    getAllAdmins,
    setAdminPassword,
    deleteAdmin,
    verifyActivationToken,
    forgotPassword,
    resetPassword
} = require('./auth.controller');

const { authMiddleware, checkRole } = require('../../middleware/auth.middleware');

router.post('/get-otp', getOtp);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin-login', adminLogin);

router.post('/admin/login', adminLoginStep1);
router.post('/admin/verify-otp', adminLoginVerifyOtp);
router.get('/verify-activation/:token', verifyActivationToken);
router.post('/set-admin-password', setAdminPassword);

router.post('/login', loginWithOtp);
router.post('/send-otp', getOtp);
router.post('/resend-otp', resendOtp);
router.post('/verify-login-otp', verifyLoginOtp);

router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);

router.post('/register/send-otp', sendRegisterEmailOtp);
router.post('/register/verify-otp', verifyRegisterEmailOtp);
router.post('/login/send-otp', sendLoginEmailOtp);
router.post('/login/verify-otp', verifyLoginEmailOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/dashboard-stats', authMiddleware, checkRole(['admin', 'superadmin']), getDashboardStats);
router.post('/admin-request', submitAdminRequest);
router.get('/admin-requests', authMiddleware, checkRole(['superadmin']), getAdminRequests);
router.get('/admins', authMiddleware, checkRole(['superadmin']), getAllAdmins);
router.delete('/admin/:id', authMiddleware, checkRole(['superadmin']), deleteAdmin);
router.get('/admin-notifications', authMiddleware, checkRole(['superadmin']), getAdminNotifications);
router.put('/update-request-status', authMiddleware, checkRole(['superadmin']), updateAdminRequestStatus);

module.exports = router;
