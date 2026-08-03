/** Registra intentos fallidos relevantes sin reemplazar el error original que recibirá el cliente. */
const audit = require('../../modules/auditoria/auditoria.service');

const rules = [
  ['POST', /^\/api\/v1\/usuarios$/, 'USUARIO_CREADO', 'usuario'], ['PUT', /^\/api\/v1\/usuarios\/[^/]+$/, 'USUARIO_EDITADO', 'usuario'],
  ['PATCH', /\/usuarios\/[^/]+\/estado$/, 'USUARIO_DESACTIVADO', 'usuario'], ['PATCH', /\/usuarios\/[^/]+\/restablecer-acceso$/, 'ACCESO_RESTABLECIDO', 'usuario'],
  ['PUT', /\/usuarios\/[^/]+\/foto$/, 'USUARIO_FOTO_ACTUALIZADA', 'usuario'], ['DELETE', /\/usuarios\/[^/]+\/foto$/, 'USUARIO_FOTO_ELIMINADA', 'usuario'],
  ['POST', /\/usuarios\/[^/]+\/servicios$/, 'SERVICIO_ASIGNADO', 'usuario_servicio'], ['DELETE', /\/usuarios\/[^/]+\/servicios\/[^/]+$/, 'SERVICIO_QUITADO', 'usuario_servicio'],
  ['POST', /^\/api\/v1\/pacientes$/, 'PACIENTE_CREADO', 'paciente'], ['PUT', /\/pacientes\/[^/]+$/, 'PACIENTE_EDITADO', 'paciente'], ['PATCH', /\/pacientes\/[^/]+\/estado$/, 'PACIENTE_DESACTIVADO', 'paciente'],
  ['POST', /\/pacientes\/[^/]+\/vinculos$/, 'PRESTADOR_VINCULADO', 'vinculo'], ['PATCH', /\/vinculos\/[^/]+\/desvincular$/, 'PRESTADOR_DESVINCULADO', 'vinculo'],
  ['POST', /^\/api\/v1\/turnos$/, 'TURNO_CREADO', 'turno'], ['PATCH', /\/turnos\/[^/]+\/confirmar$/, 'TURNO_CONFIRMADO', 'turno'],
  ['PATCH', /\/turnos\/[^/]+\/cancelar$/, 'TURNO_CANCELADO', 'turno'], ['PATCH', /\/turnos\/[^/]+\/completar$/, 'TURNO_COMPLETADO', 'turno'],
  ['PATCH', /\/turnos\/[^/]+\/ausente$/, 'TURNO_AUSENTE', 'turno'], ['PATCH', /\/turnos\/[^/]+\/observacion-administrativa$/, 'TURNO_OBSERVACION_EDITADA', 'turno'],
  ['PATCH', /\/turnos\/[^/]+\/notas-internas$/, 'TURNO_NOTA_INTERNA_EDITADA', 'turno'], ['GET', /\/informes\/[^/]+$/, 'INFORME_VISUALIZADO', 'informe'],
  ['POST', /^\/api\/v1\/informes$/, 'INFORME_CREADO', 'informe'], ['PUT', /\/informes\/[^/]+$/, 'INFORME_EDITADO', 'informe'], ['PATCH', /\/informes\/[^/]+\/finalizar$/, 'INFORME_FINALIZADO', 'informe'],
  ['POST', /^\/api\/v1\/conversaciones$/, 'CONVERSACION_CREADA', 'conversacion'], ['POST', /\/conversaciones\/[^/]+\/mensajes$/, 'MENSAJE_ENVIADO', 'mensaje'],
  ['POST', /\/conversaciones\/[^/]+\/participantes$/, 'PARTICIPANTE_AGREGADO', 'conversacion'], ['PATCH', /\/conversaciones\/[^/]+\/archivar$/, 'CONVERSACION_ARCHIVADA', 'conversacion'],
  ['PATCH', /\/conversaciones\/[^/]+\/desarchivar$/, 'CONVERSACION_DESARCHIVADA', 'conversacion'],
  ['PUT', /\/servicios\/[^/]+\/imagen$/, 'SERVICIO_IMAGEN_ACTUALIZADA', 'servicio'], ['DELETE', /\/servicios\/[^/]+\/imagen$/, 'SERVICIO_IMAGEN_ELIMINADA', 'servicio'],
  ['POST', /^\/api\/v1\/(servicios|consultorios|asuntos|tipos-informe)$/, 'CATALOGO_CREADO', 'catalogo'],
  ['PUT', /^\/api\/v1\/(servicios|consultorios|asuntos|tipos-informe)\/[^/]+$/, 'CATALOGO_EDITADO', 'catalogo'],
  ['PATCH', /^\/api\/v1\/(servicios|consultorios|asuntos|tipos-informe)\/[^/]+\/estado$/, 'CATALOGO_DESACTIVADO', 'catalogo']
];
const uuid = /^[0-9a-f]{8}-[0-9a-f-]{27}$/i;

module.exports = async (req, cause) => {
  if (!req.actor) return;
  const path = req.originalUrl.split('?')[0];
  const rule = rules.find(([method, pattern]) => method === req.method && pattern.test(path));
  if (!rule) return;
  let [, , action, resource] = rule;
  if (req.body?.activo === true) action = action.replace('DESACTIVADO', 'ACTIVADO');
  if (resource === 'catalogo') resource = path.split('/')[3];
  const candidate = req.params?.id || req.params?.pacienteId;
  await audit.recordFailureBestEffort({ actorId: req.actor.id, action, resource, resourceId: uuid.test(candidate || '') ? candidate : null, metadata: { causa: cause }, context: { correlationId: req.correlationId, ip: req.ip, userAgent: req.get('user-agent') } });
};
