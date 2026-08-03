/** Aplica límites y protección de origen antes de operaciones sensibles de sesión. */
const express = require('express');
const asyncHandler = require('../../shared/utils/asyncHandler');
const validate = require('../../shared/middlewares/validate');
const authenticate = require('../../shared/middlewares/authenticate');
const originGuard = require('../../shared/middlewares/originGuard');
const { loginLimiter, refreshLimiter } = require('../../shared/middlewares/rateLimit');
const validation = require('./auth.validation');
const controller = require('./auth.controller');

const router = express.Router();
router.post('/login', originGuard, loginLimiter, validate(validation.login), asyncHandler(controller.login));
router.post('/refresh', originGuard, refreshLimiter, asyncHandler(controller.refresh));
router.post('/logout', authenticate, originGuard, asyncHandler(controller.logout));
router.post('/logout-todas', authenticate, originGuard, asyncHandler(controller.logoutAll));
module.exports = router;
