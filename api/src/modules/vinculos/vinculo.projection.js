const project = (row) => ({
  id: row.id,
  pacienteId: row.pacienteId,
  prestador: {
    id: row.prestador.id,
    nombre: row.prestador.nombre,
    apellido: row.prestador.apellido,
    titulo: row.prestador.titulo,
    especialidad: row.prestador.especialidad,
    fotoUrl: row.prestador.fotoUrl
  },
  activo: row.activo,
  fechaInicio: row.fechaInicio,
  fechaFin: row.fechaFin,
  motivoDesvinculacion: row.motivoDesvinculacion
});

module.exports = { project };
