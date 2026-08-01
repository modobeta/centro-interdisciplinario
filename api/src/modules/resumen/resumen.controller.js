const service = require('./resumen.service'); const get = async (req, res) => res.json({ data: { cards: await service.getSummary(req.actor) } }); module.exports = { get };
