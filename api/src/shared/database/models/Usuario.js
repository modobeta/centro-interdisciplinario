const { DataTypes, Model } = require('sequelize');

class Usuario extends Model {}
module.exports = (sequelize) => Usuario.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 }, rolId: { type: DataTypes.UUID, allowNull: false, field: 'rol_id' },
  nombre: { type: DataTypes.STRING(100), allowNull: false }, apellido: { type: DataTypes.STRING(100), allowNull: false }, dni: { type: DataTypes.STRING(20), allowNull: false },
  email: { type: DataTypes.STRING(254), allowNull: false }, passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  titulo: DataTypes.STRING(120), especialidad: DataTypes.STRING(150), telefono: DataTypes.STRING(40), bio: DataTypes.TEXT,
  fotoUrl: { type: DataTypes.TEXT, field: 'foto_url' }, funcionPublica: { type: DataTypes.STRING(150), field: 'funcion_publica' },
  visiblePublicamente: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'visible_publicamente' },
  ordenPublico: { type: DataTypes.INTEGER, field: 'orden_publico' }, activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { sequelize, modelName: 'Usuario', tableName: 'usuarios', underscored: true, timestamps: true, defaultScope: { attributes: { exclude: ['passwordHash'] } }, scopes: { withPassword: { attributes: { include: ['passwordHash'] } } } });
