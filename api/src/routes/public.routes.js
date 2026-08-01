const express = require('express');
const router = express.Router();
router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/public', require('../modules/public/public.routes'));
module.exports = router;
