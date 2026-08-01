const { Op } = require('sequelize');
const { Consultorio, Paciente, Servicio, Turno, Usuario } = require('../../shared/database/models');

const activeFuture = () => ({ estado: { [Op.in]: ['pendiente', 'confirmado'] }, inicioAt: { [Op.gt]: new Date() } });
const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort();
const lockRows = (model, ids, transaction) => ids.length ? model.findAll({ where: { id: { [Op.in]: ids } }, attributes: ['id'], order: [['id', 'ASC']], transaction, lock: transaction.LOCK.UPDATE }) : [];

const lockRelatedTo = async (field, id, transaction) => {
  const turns = await Turno.findAll({ where: { ...activeFuture(), [field]: id }, attributes: ['pacienteId', 'prestadorId', 'servicioId', 'consultorioId'], transaction });
  const ids = {
    pacienteId: uniqueSorted([...turns.map((turn) => turn.pacienteId), field === 'pacienteId' ? id : null]),
    prestadorId: uniqueSorted([...turns.map((turn) => turn.prestadorId), field === 'prestadorId' ? id : null]),
    servicioId: uniqueSorted([...turns.map((turn) => turn.servicioId), field === 'servicioId' ? id : null]),
    consultorioId: uniqueSorted([...turns.map((turn) => turn.consultorioId), field === 'consultorioId' ? id : null])
  };
  await lockRows(Paciente, ids.pacienteId, transaction);
  await lockRows(Usuario, ids.prestadorId, transaction);
  await lockRows(Servicio, ids.servicioId, transaction);
  await lockRows(Consultorio, ids.consultorioId, transaction);
};

module.exports = { activeFuture, lockRelatedTo };
