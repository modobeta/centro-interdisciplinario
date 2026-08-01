const express = require('express');
const authenticate = require('../shared/middlewares/authenticate');

const router = express.Router();
const mount = (path, routes) => router.use(path, authenticate, routes);
mount('/resumen', require('../modules/resumen/resumen.routes'));
mount('/usuarios', require('../modules/usuarios/usuario.routes'));
mount('/pacientes/:pacienteId/vinculos', require('../modules/vinculos/vinculo.routes'));
mount('/pacientes', require('../modules/pacientes/paciente.routes'));
mount('/turnos', require('../modules/turnos/turno.routes'));
mount('/informes', require('../modules/informes/informe.routes'));
mount('/conversaciones', require('../modules/mensajeria/conversacion.routes'));
mount('/servicios', require('../modules/servicios/servicio.routes'));
mount('/consultorios', require('../modules/consultorios/consultorio.routes'));
mount('/asuntos', require('../modules/asuntos/asunto.routes'));
mount('/tipos-informe', require('../modules/tipos-informe/tipo-informe.routes'));
mount('/auditoria', require('../modules/auditoria/auditoria.routes'));

module.exports = router;
