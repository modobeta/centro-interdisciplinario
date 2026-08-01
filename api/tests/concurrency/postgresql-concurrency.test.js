const { createHash, randomBytes, randomUUID } = require('node:crypto');
const enabled = process.env.RUN_DATABASE_TESTS === 'true';

(enabled ? describe : describe.skip)('concurrencia PostgreSQL', () => {
  const models = require('../../src/shared/database/models');
  const auth = require('../../src/modules/auth/auth.service');
  const users = require('../../src/modules/usuarios/usuario.service');
  const messages = require('../../src/modules/mensajeria/conversacion.service');
  const { sequelize, Rol, Usuario, Sesion, Servicio, Paciente, Consultorio, Turno, TipoInforme, Informe, Asunto, Conversacion, ConversacionParticipante, Mensaje } = models;
  const request = { correlationId: randomUUID(), ip: '127.0.0.1', get: () => 'jest' };
  let roles;

  const makeUser = (rol, suffix = randomUUID()) => Usuario.create({ rolId: roles[rol].id, nombre: 'Test', apellido: suffix.slice(0, 8), dni: randomBytes(8).toString('hex'), email: `${suffix}@example.test`, passwordHash: 'hash', activo: true });
  const seedRoles = async () => {
    roles = {};
    for (const codigo of ['administrador', 'coordinacion', 'secretaria', 'profesional']) roles[codigo] = await Rol.create({ codigo, nombre: codigo });
  };

  beforeAll(async () => {
    await sequelize.authenticate();
    const [[database]] = await sequelize.query('SELECT current_database() AS name');
    if (!/test/i.test(database.name)) throw new Error('Las pruebas destructivas requieren una base cuyo nombre contenga test.');
  });
  beforeEach(async () => { await sequelize.truncate({ cascade: true, restartIdentity: true }); await seedRoles(); });
  afterAll(async () => sequelize.close());

  test.each(['prestador', 'paciente', 'consultorio'])('el constraint de %s admite un solo turno solapado', async (resource) => {
    const providers = [await makeUser('profesional'), await makeUser('profesional')];
    const patients = [await Paciente.create({ nombre: 'A', apellido: 'Paciente', fechaNacimiento: '2010-01-01' }), await Paciente.create({ nombre: 'B', apellido: 'Paciente', fechaNacimiento: '2011-01-01' })];
    const rooms = [await Consultorio.create({ nombre: `Sala ${randomUUID()}`, activo: true }), await Consultorio.create({ nombre: `Sala ${randomUUID()}`, activo: true })];
    const service = await Servicio.create({ nombre: `Servicio ${randomUUID()}`, descripcion: 'Test', activo: true });
    const start = new Date(Date.now() + 86400000); const end = new Date(start.getTime() + 3600000);
    const base = { prestadorId: providers[0].id, pacienteId: patients[0].id, consultorioId: rooms[0].id, servicioId: service.id, inicioAt: start, finAt: end, duracionMinutos: 60, estado: 'pendiente' };
    const other = { ...base, prestadorId: resource === 'prestador' ? providers[0].id : providers[1].id, pacienteId: resource === 'paciente' ? patients[0].id : patients[1].id, consultorioId: resource === 'consultorio' ? rooms[0].id : rooms[1].id };
    const results = await Promise.allSettled([Turno.create(base), Turno.create(other)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason.parent.code).toBe('23P01');
  });

  test('expectedVersion permite una única actualización de informe', async () => {
    const author = await makeUser('profesional'); const patient = await Paciente.create({ nombre: 'Informe', apellido: 'Paciente', fechaNacimiento: '2010-01-01' }); const type = await TipoInforme.create({ nombre: 'Tipo', activo: true });
    const report = await Informe.create({ pacienteId: patient.id, autorId: author.id, tipoInformeId: type.id, titulo: 'Inicial', resumen: 'Resumen', contenido: 'Contenido', estado: 'borrador', version: 1 });
    const updates = await Promise.all([Informe.update({ titulo: 'Uno', version: sequelize.literal('version + 1') }, { where: { id: report.id, version: 1 } }), Informe.update({ titulo: 'Dos', version: sequelize.literal('version + 1') }, { where: { id: report.id, version: 1 } })]);
    expect(updates.flat().reduce((total, count) => total + count, 0)).toBe(1);
  });

  test('dos refresh simultáneos detectan reutilización y revocan la sesión', async () => {
    const user = await makeUser('profesional'); const sessionId = randomUUID(); const secret = randomBytes(32).toString('base64url'); const hash = createHash('sha256').update(secret).digest();
    await Sesion.create({ id: sessionId, usuarioId: user.id, refreshTokenHash: hash, expiresAt: new Date(Date.now() + 86400000) });
    const results = await Promise.allSettled([auth.refresh(`${sessionId}.${secret}`, request), auth.refresh(`${sessionId}.${secret}`, request)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason.code).toBe('REFRESH_REUTILIZADO');
    expect((await Sesion.findByPk(sessionId)).revokedAt).toBeInstanceOf(Date);
  });

  test('la protección serializada conserva un administrador activo', async () => {
    const actor = await makeUser('secretaria'); const first = await makeUser('administrador'); const second = await makeUser('administrador');
    const fakeRequest = { ...request, correlationId: randomUUID() };
    const results = await Promise.allSettled([users.changeState({ id: actor.id, rol: 'administrador' }, first.id, false, fakeRequest), users.changeState({ id: actor.id, rol: 'administrador' }, second.id, false, fakeRequest)]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((result) => result.status === 'rejected').reason.code).toBe('ULTIMO_ADMINISTRADOR_REQUERIDO');
  });

  test('el puntero de lectura no retrocede', async () => {
    const user = await makeUser('profesional'); const subject = await Asunto.create({ codigo: 'test', nombre: 'Test', activo: true }); const conversation = await Conversacion.create({ asuntoId: subject.id, titulo: 'Test', creadoPor: user.id }); await ConversacionParticipante.create({ conversacionId: conversation.id, usuarioId: user.id, joinedAt: new Date() }); const old = await Mensaje.create({ conversacionId: conversation.id, remitenteId: user.id, contenido: 'Anterior', createdAt: new Date(Date.now() - 1000) }); const latest = await Mensaje.create({ conversacionId: conversation.id, remitenteId: user.id, contenido: 'Último', createdAt: new Date() });
    await messages.markRead({ id: user.id, rol: 'profesional' }, conversation.id, latest.id);
    await expect(messages.markRead({ id: user.id, rol: 'profesional' }, conversation.id, old.id)).rejects.toMatchObject({ code: 'LECTURA_NO_PUEDE_RETROCEDER' });
  });
});
