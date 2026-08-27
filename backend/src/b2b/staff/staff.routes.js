const express = require('express');
const router = express.Router();
const controller = require('./staff.controller');
const { validateCreateStaff, validateRoleUpdate } = require('./staff.validation');
const {
    b2bAuthMiddleware,
    requireApprovedAgency,
    requireAgencyRoles
} = require('../../middleware/b2b-auth.middleware');
const { AGENCY_USER_ROLES } = require('../../core/models/b2b/b2b.constants');

router.use(b2bAuthMiddleware);
router.use(requireApprovedAgency);

router.get(
    '/',
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER, AGENCY_USER_ROLES.AGENCY_MANAGER]),
    controller.listStaff
);

router.post(
    '/',
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    validateCreateStaff,
    controller.createStaff
);

router.patch(
    '/:id/role',
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    validateRoleUpdate,
    controller.updateRole
);

router.patch(
    '/:id/deactivate',
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    controller.deactivateStaff
);

router.patch(
    '/:id/activate',
    requireAgencyRoles([AGENCY_USER_ROLES.AGENCY_OWNER]),
    controller.reactivateStaff
);

module.exports = router;
