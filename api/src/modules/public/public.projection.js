const team = (user) => ({ id: user.id, nombre: user.nombre, apellido: user.apellido, titulo: user.titulo, especialidad: user.especialidad, funcionPublica: user.funcionPublica, bio: user.bio, fotoUrl: user.fotoUrl, ordenPublico: user.ordenPublico });
const service = (row) => ({ id: row.id, nombre: row.nombre, descripcion: row.descripcion, imagenUrl: row.imagenUrl, ordenPublico: row.ordenPublico });
module.exports = { team, service };
