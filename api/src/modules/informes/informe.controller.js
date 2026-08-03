/** Mantiene delgada la capa HTTP de informes para preservar reglas clínicas en el servicio. */
const service = require('./informe.service');
exports.list = async (req, res) => res.json(await service.list(req.actor, req.query));
exports.get = async (req, res) => res.json({ data: await service.get(req.actor, req.params.id, req) });
exports.create = async (req, res) => res.status(201).json({ data: await service.create(req.actor, req.body, req) });
exports.update = async (req, res) => res.json({ data: await service.update(req.actor, req.params.id, req.body, req) });
exports.finalize = async (req, res) => res.json({ data: await service.finalize(req.actor, req.params.id, req.body.expectedVersion, req) });
