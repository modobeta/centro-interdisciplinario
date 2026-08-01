const express = require('express');
const asyncHandler = require('../../shared/utils/asyncHandler');
const authorize = require('../../shared/middlewares/authorize');
const validate = require('../../shared/middlewares/validate');
const { PERMISSIONS } = require('../../shared/constants/permissions');
const controller = require('./vinculo.controller');
const validation = require('./vinculo.validation');

const router = express.Router({ mergeParams: true });
router.get('/', authorize(PERMISSIONS.PATIENTS_READ_ALL, PERMISSIONS.PATIENTS_READ_LINKED), validate(validation.list), asyncHandler(controller.list));
router.post('/', authorize(PERMISSIONS.PATIENTS_MANAGE_LINKS, PERMISSIONS.PATIENTS_LINK_FROM_LINKED), validate(validation.create), asyncHandler(controller.create));
router.patch('/:usuarioId/desvincular', authorize(PERMISSIONS.PATIENTS_MANAGE_LINKS), validate(validation.unlink), asyncHandler(controller.unlink));

module.exports = router;
