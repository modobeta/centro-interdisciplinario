/** Registra todos los modelos sobre una única conexión antes de aplicar sus asociaciones. */
const sequelize = require('../sequelize');
const associate = require('../associations');

const models = {
  Rol: require('./Rol')(sequelize), Usuario: require('./Usuario')(sequelize), Sesion: require('./Sesion')(sequelize), Servicio: require('./Servicio')(sequelize),
  UsuarioServicio: require('./UsuarioServicio')(sequelize), Paciente: require('./Paciente')(sequelize), Tutor: require('./Tutor')(sequelize),
  UsuarioPaciente: require('./UsuarioPaciente')(sequelize), Consultorio: require('./Consultorio')(sequelize), Turno: require('./Turno')(sequelize),
  TipoInforme: require('./TipoInforme')(sequelize), Informe: require('./Informe')(sequelize), Asunto: require('./Asunto')(sequelize),
  Conversacion: require('./Conversacion')(sequelize), ConversacionParticipante: require('./ConversacionParticipante')(sequelize),
  Mensaje: require('./Mensaje')(sequelize), AuditoriaEvento: require('./AuditoriaEvento')(sequelize)
};

associate(models);

module.exports = { sequelize, ...models };
