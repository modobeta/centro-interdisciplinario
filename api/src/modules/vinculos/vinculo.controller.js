/** Adapta altas y cierres de vínculos sin perder el motivo ni la historia. */
const service = require('./vinculo.service');

exports.list = async (req, res) => res.json({ data: await service.list(req.actor, req.params.pacienteId, req.query) });
exports.create = async (req, res) => res.status(201).json({ data: await service.create(req.actor, req.params.pacienteId, req.body.usuarioId, req) });
exports.unlink = async (req, res) => res.json({ data: await service.unlink(req.actor, req.params.pacienteId, req.params.usuarioId, req.body.motivo, req) });
