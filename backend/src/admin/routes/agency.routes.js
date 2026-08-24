const express = require('express');
const router = express.Router();
const agencyAdminController = require('../controllers/agencyAdminController');
const { authMiddleware, checkRole } = require('../../middleware/auth.middleware');

router.use(authMiddleware);
router.use(checkRole(['admin', 'superadmin']));

router.get('/', agencyAdminController.listAgencies);
router.get('/pending', agencyAdminController.listPendingAgencies);
router.get('/:id', agencyAdminController.getAgencyDetails);

router.post('/:id/approve', agencyAdminController.approveAgency);
router.post('/:id/reject', agencyAdminController.rejectAgency);
router.post('/:id/suspend', agencyAdminController.suspendAgency);
router.post('/:id/activate', agencyAdminController.activateAgency);

router.post('/:id/documents/:documentId/approve', agencyAdminController.approveDocument);
router.post('/:id/documents/:documentId/reject', agencyAdminController.rejectDocument);

module.exports = router;
