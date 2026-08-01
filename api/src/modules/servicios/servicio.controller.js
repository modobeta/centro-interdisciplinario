const service = require('./servicio.service');
module.exports = {
  list: async (req, res) => res.json(await service.list(req.actor, req.query)), get: async (req, res) => res.json({ data: await service.get(req.actor, req.params.id) }),
  create: async (req, res) => res.status(201).json({ data: await service.create(req.actor, req.body, req) }), update: async (req, res) => res.json({ data: await service.update(req.actor, req.params.id, req.body, req) }),
  state: async (req, res) => res.json({ data: await service.changeState(req.actor, req.params.id, req.body.activo, req) }), image: async (req, res) => res.json({ data: { imagenUrl: await service.setImage(req.actor, req.params.id, req.file, req) } }),
  deleteImage: async (req, res) => { await service.deleteImage(req.actor, req.params.id, req); res.json({ data: { imagenUrl: null } }); }
};
