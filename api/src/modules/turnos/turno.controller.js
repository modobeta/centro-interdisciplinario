/** Traduce acciones de agenda a transiciones explícitas en lugar de aceptar estados libres. */
const service = require('./turno.service');
exports.list = async (req, res) => { const result = await service.list(req.actor, req.query); res.json(result); };
exports.availability = async (req, res) => res.json({ data: await service.availability(req.query) });
exports.get = async (req, res) => res.json({ data: await service.get(req.actor, req.params.id) });
exports.create = async (req, res) => res.status(201).json({ data: await service.create(req.actor, req.body, req) });
exports.confirm = async (req, res) => res.json({ data: await service.transition(req.actor, req.params.id, 'confirmar', req) });
exports.cancel = async (req, res) => res.json({ data: await service.transition(req.actor, req.params.id, 'cancelar', req, req.body.motivo) });
exports.complete = async (req, res) => res.json({ data: await service.transition(req.actor, req.params.id, 'completar', req) });
exports.absent = async (req, res) => res.json({ data: await service.transition(req.actor, req.params.id, 'ausente', req) });
exports.administrativeNote = async (req, res) => res.json({ data: await service.updateNote(req.actor, req.params.id, 'observacionAdministrativa', req.body.observacionAdministrativa, req) });
exports.internalNote = async (req, res) => res.json({ data: await service.updateNote(req.actor, req.params.id, 'notasInternas', req.body.notasInternas, req) });
