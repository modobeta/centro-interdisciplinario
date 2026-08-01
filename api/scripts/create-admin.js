const Joi = require('joi');
const bcrypt = require('bcrypt');
const env = require('../src/config/env');
const logger = require('../src/config/logger');
const { sequelize, Rol, Usuario } = require('../src/shared/database/models');
const { normalizeDni, normalizeEmail } = require('../src/shared/utils/sanitize');

const schema = Joi.object({
  nombre: Joi.string().trim().max(100).required(), apellido: Joi.string().trim().max(100).required(),
  dni: Joi.string().custom((value) => normalizeDni(value)).pattern(/^\d{7,20}$/).required(), email: Joi.string().email().max(254).required()
});

const main = async () => {
  const { value, error } = schema.validate(env.admin, { abortEarly: false });
  if (error) throw new Error(`Datos del administrador inválidos: ${error.details.map((detail) => detail.message).join('; ')}`);
  await sequelize.authenticate();
  const role = await Rol.findOne({ where: { codigo: 'administrador' } });
  if (!role) throw new Error('Ejecutá los seeders antes de crear el administrador.');
  const dni = normalizeDni(value.dni);
  const passwordHash = await bcrypt.hash(dni, env.bcryptRounds);
  const [user, created] = await Usuario.unscoped().findOrCreate({
    where: { email: normalizeEmail(value.email) },
    defaults: { rolId: role.id, nombre: value.nombre, apellido: value.apellido, dni, email: normalizeEmail(value.email), passwordHash, activo: true }
  });
  logger.info({ userId: user.id, created }, created ? 'Administrador inicial creado' : 'El administrador ya existía');
};

main().catch((error) => { logger.error({ err: error }, 'No se pudo crear el administrador'); process.exitCode = 1; }).finally(() => sequelize.close());
