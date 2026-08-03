/** Presenta consultas administrativas de auditoría sin permitir modificar eventos históricos. */
const service = require('./auditoria.service');
const list = async (req, res) => res.json(await service.list(req.query));
module.exports = { list };
