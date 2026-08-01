const selector = (user) => ({ id: user.id, nombre: user.nombre, apellido: user.apellido, titulo: user.titulo, funcionPublica: user.funcionPublica, fotoUrl: user.fotoUrl });
const directory = (user) => ({ ...selector(user), rol: user.rol?.codigo || user.rol, especialidad: user.especialidad });
const administrative = (user) => ({
  id: user.id, nombre: user.nombre, apellido: user.apellido, dni: user.dni, email: user.email, rol: user.rol?.codigo || user.rol,
  titulo: user.titulo, especialidad: user.especialidad, telefono: user.telefono, bio: user.bio, fotoUrl: user.fotoUrl,
  funcionPublica: user.funcionPublica, visiblePublicamente: user.visiblePublicamente, ordenPublico: user.ordenPublico,
  activo: user.activo, createdAt: user.createdAt, updatedAt: user.updatedAt
});
const projectUser = (user, projection) => ({ selector, directory, administrative }[projection] || directory)(user);
module.exports = { selector, directory, administrative, projectUser };
