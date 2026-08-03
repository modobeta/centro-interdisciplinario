/** Configura el servicio común con los campos propios de tipos de informe. */
const { TipoInforme } = require('../../shared/database/models'); const factory = require('../catalogos/catalogo.service-factory'); module.exports = factory({ model: TipoInforme, resource: 'tipo_informe', notFoundCode: 'TIPO_INFORME_NO_ENCONTRADO', fields: ['nombre', 'descripcion'] });
