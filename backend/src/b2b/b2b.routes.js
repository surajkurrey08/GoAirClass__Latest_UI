const express = require('express');
const router = express.Router();

const authRoutes = require('./auth/agent-auth.routes');
const agencyRoutes = require('./agencies/agency.routes');
const staffRoutes = require('./staff/staff.routes');
const documentRoutes = require('./documents/document.routes');
const dashboardRoutes = require('./dashboard/dashboard.routes');

router.use('/auth', authRoutes);
router.use('/agency', agencyRoutes);
router.use('/staff', staffRoutes);
router.use('/documents', documentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
