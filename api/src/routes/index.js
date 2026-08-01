const express = require('express');
const { sequelize } = require('../shared/database/models');

const router = express.Router();
router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.get('/ready', async (_req, res) => {
  try { await sequelize.authenticate(); res.json({ status: 'ready' }); }
  catch { res.status(503).json({ status: 'not_ready' }); }
});
router.use('/api/v1', require('./public.routes'));
router.use('/api/v1', require('./private.routes'));
module.exports = router;
