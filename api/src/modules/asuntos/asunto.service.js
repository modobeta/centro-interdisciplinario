/** Configura el servicio común de catálogos con las reglas propias de los asuntos. */
const { Asunto } = require('../../shared/database/models'); const factory = require('../catalogos/catalogo.service-factory'); module.exports = factory({ model: Asunto, resource: 'asunto', notFoundCode: 'ASUNTO_NO_ENCONTRADO', fields: ['codigo', 'nombre'], searchFields: ['codigo', 'nombre'] });
