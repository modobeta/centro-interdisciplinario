/** Mantiene estable la forma pública de un consultorio aunque cambie el modelo interno. */
const projectConsultorio = (row) => ({ id: row.id, nombre: row.nombre, descripcion: row.descripcion, ubicacion: row.ubicacion, capacidad: row.capacidad, activo: row.activo, createdAt: row.createdAt, updatedAt: row.updatedAt }); module.exports = { projectConsultorio };
