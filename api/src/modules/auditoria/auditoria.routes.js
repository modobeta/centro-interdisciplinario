const express = require('express');
const asyncHandler = require('../../shared/utils/asyncHandler');
const validate = require('../../shared/middlewares/validate');
const authorize = require('../../shared/middlewares/authorize');
const { PERMISSIONS } = require('../../shared/constants/permissions');
const validation = require('./auditoria.validation');
const controller = require('./auditoria.controller');

const router = express.Router();
router.get('/', authorize(PERMISSIONS.AUDIT_READ), validate(validation.list), asyncHandler(controller.list));
module.exports = router;
