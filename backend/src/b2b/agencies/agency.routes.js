const express = require('express');
const router = express.Router();
const controller = require('./agency.controller');
const { validateBusinessInfo } = require('./agency.validation');
const {
    b2bAuthMiddleware,
    requireAgencyRoles,
    requireAgencyNotSuspended
} = require('../../middleware/b2b-auth.middleware');
const { AGENCY_USER_ROLES } = require('../../core/models/b2b/b2b.constants');

router.use(b2bAuthMiddleware);

router.get('/me', controller.getMyAgency);
router.get('/status', controller.getStatus);
router.put(
    '/business-info',
    requireAgencyNotSuspended,
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    validateBusinessInfo,
    controller.updateBusinessInfo
);
router.post(
    '/submit',
    requireAgencyNotSuspended,
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    controller.submitApplication
);

module.exports = router;
