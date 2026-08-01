const projectAuditEvent = (event) => ({
  id: event.id,
  usuario: event.usuario ? { id: event.usuario.id, nombre: event.usuario.nombre, apellido: event.usuario.apellido } : null,
  accion: event.accion,
  recurso: event.recurso,
  recursoId: event.recursoId,
  resultado: event.resultado,
  metadata: event.metadata || null,
  ip: event.ip || null,
  correlationId: event.correlationId,
  createdAt: event.createdAt
});

module.exports = { projectAuditEvent };
