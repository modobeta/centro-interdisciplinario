/** Garantiza en PostgreSQL que el puntero leído pertenezca a la misma conversación. */
'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint('mensajes', { fields: ['conversacion_id', 'id'], type: 'unique', name: 'mensajes_conversacion_id_id_uq' });
    await queryInterface.sequelize.query('ALTER TABLE conversaciones_participantes ADD CONSTRAINT conversaciones_participantes_ultimo_mensaje_fk FOREIGN KEY (conversacion_id, ultimo_mensaje_leido_id) REFERENCES mensajes (conversacion_id, id) ON DELETE SET NULL (ultimo_mensaje_leido_id)');
  },
  async down(queryInterface) {
    await queryInterface.removeConstraint('conversaciones_participantes', 'conversaciones_participantes_ultimo_mensaje_fk');
    await queryInterface.removeConstraint('mensajes', 'mensajes_conversacion_id_id_uq');
  }
};
