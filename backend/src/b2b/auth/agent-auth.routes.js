const express = require('express');
const router = express.Router();
const controller = require('./agent-auth.controller');
const {
    validateRegister,
    validateLogin,
    validateVerifyOtp,
    validateForgotPassword
} = require('./agent-auth.validation');

router.post('/register', validateRegister, controller.register);
router.post('/login', validateLogin, controller.login);
router.post('/verify-otp', validateVerifyOtp, controller.verifyOtp);
router.post('/forgot-password', validateForgotPassword, controller.forgotPassword);

module.exports = router;
