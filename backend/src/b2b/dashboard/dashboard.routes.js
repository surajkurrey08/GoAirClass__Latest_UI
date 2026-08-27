const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const { b2bAuthMiddleware } = require('../../middleware/b2b-auth.middleware');

router.use(b2bAuthMiddleware);

router.get('/', controller.getDashboard);

module.exports = router;
