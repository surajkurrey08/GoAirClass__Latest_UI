const express = require('express');
const router = express.Router();
const controller = require('./document.controller');
const upload = require('../../middleware/b2b-document-upload.middleware');
const {
    b2bAuthMiddleware,
    requireAgencyRoles,
    requireAgencyNotSuspended
} = require('../../middleware/b2b-auth.middleware');
const { AGENCY_USER_ROLES } = require('../../core/models/b2b/b2b.constants');

router.use(b2bAuthMiddleware);

router.get('/', controller.listDocuments);
router.post(
    '/',
    requireAgencyNotSuspended,
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER, AGENCY_USER_ROLES.AGENCY_MANAGER]),
    upload.single('document'),
    controller.uploadDocument
);

module.exports = router;
