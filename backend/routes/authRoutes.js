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
    getDashboardStats, 
    submitAdminRequest, 
    getAdminRequests, 
    getAdminNotifications, 
    updateAdminRequestStatus, 
    adminLogin, 
    getAllAdmins, 
    setAdminPassword, 
    deleteAdmin,
    verifyActivationToken 
} = require('../controllers/authController');

const { authMiddleware, checkRole } = require('../middleware/authMiddleware');

router.post('/get-otp', getOtp);
router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/admin-login', adminLogin);
router.get('/verify-activation/:token', verifyActivationToken);
router.post('/set-admin-password', setAdminPassword); // Finalizing onboarding

// --- New: Registration-Check-First OTP Login ---
router.post('/login', loginWithOtp);
router.post('/send-otp', getOtp);   // Re-adding for user requirement
router.post('/resend-otp', resendOtp);
router.post('/verify-login-otp', verifyLoginOtp);

// --- New: Full Mobile + OTP Registration Flow ---
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);

// Protected Admin Routes
router.get('/dashboard-stats', authMiddleware, checkRole(['admin', 'superadmin']), getDashboardStats);
router.post('/admin-request', submitAdminRequest); // Publicly accessible to request access
router.get('/admin-requests', authMiddleware, checkRole(['superadmin']), getAdminRequests);
router.get('/admins', authMiddleware, checkRole(['superadmin']), getAllAdmins);
router.delete('/admin/:id', authMiddleware, checkRole(['superadmin']), deleteAdmin);
router.get('/admin-notifications', authMiddleware, checkRole(['superadmin']), getAdminNotifications);
router.put('/update-request-status', authMiddleware, checkRole(['superadmin']), updateAdminRequestStatus);

module.exports = router;
