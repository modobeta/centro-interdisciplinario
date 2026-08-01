const projectService = (service) => ({ id: service.id, nombre: service.nombre, descripcion: service.descripcion, imagenUrl: service.imagenUrl, visiblePublicamente: service.visiblePublicamente, ordenPublico: service.ordenPublico, activo: service.activo, createdAt: service.createdAt, updatedAt: service.updatedAt });
module.exports = { projectService };
