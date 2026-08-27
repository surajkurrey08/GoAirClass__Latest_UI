const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateProfileImage } = require('./user.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);
router.post('/profile/image', authMiddleware, upload.single('profileImage'), updateProfileImage);

module.exports = router;
