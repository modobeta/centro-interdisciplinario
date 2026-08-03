/** Mantiene transporte, archivos y respuestas separados de las reglas de cuentas y roles. */
const service = require('./usuario.service');
const list = async (req, res) => res.json(await service.list(req.actor, req.query));
const get = async (req, res) => res.json({ data: await service.get(req.actor, req.params.id) });
const create = async (req, res) => res.status(201).json({ data: await service.create(req.actor, req.body, req) });
const update = async (req, res) => res.json({ data: await service.update(req.actor, req.params.id, req.body, req) });
const state = async (req, res) => res.json({ data: await service.changeState(req.actor, req.params.id, req.body.activo, req) });
const resetAccess = async (req, res) => { await service.resetAccess(req.actor, req.params.id, req); res.status(204).end(); };
const photo = async (req, res) => res.json({ data: { fotoUrl: await service.setPhoto(req.actor, req.params.id, req.file, req) } });
const deletePhoto = async (req, res) => { await service.deletePhoto(req.actor, req.params.id, req); res.json({ data: { fotoUrl: null } }); };
const listServices = async (req, res) => { const data = await service.listServices(req.actor, req.params.id, req.query.activo); res.json({ data, meta: { count: data.length } }); };
const addService = async (req, res) => { const link = await service.addService(req.actor, req.params.id, req.body.servicioId, req); res.status(201).json({ data: { usuarioId: link.usuarioId, servicioId: link.servicioId, createdAt: link.createdAt } }); };
const removeService = async (req, res) => { await service.removeService(req.actor, req.params.id, req.params.servicioId, req); res.status(204).end(); };
module.exports = { list, get, create, update, state, resetAccess, photo, deletePhoto, listServices, addService, removeService };
