'use strict';

const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');
const env = require('../src/config/env');

const users = [
  { rol: 'administrador', nombre: 'Martin', apellido: 'Juncos', dni: '25609038', email: 'prof.mcjuncos@gmail.com' },
  { rol: 'coordinacion', nombre: 'Lucía', apellido: 'Bordon', dni: '11111111', email: 'coordinacion@mail.com', funcionPublica: 'Coordinación institucional', bio: 'Profesional a cargo de la coordinación institucional, orientada a la organización general del centro, la articulación entre las distintas áreas de trabajo y el acompañamiento de los procesos de atención. Su labor se basa en la comunicación con las familias, el seguimiento de las dinámicas interdisciplinarias y la planificación organizada de cada recorrido, favoreciendo una atención integral, cercana y coherente con las necesidades de cada niño.', visiblePublicamente: true, ordenPublico: 0 },
  { rol: 'secretaria', nombre: 'Claudia', apellido: 'Zini', dni: '22222222', email: 'secretaria@mail.com', funcionPublica: 'Administración y gestión institucional', bio: 'Profesional dedicada a la administración y gestión de centros educativos, con experiencia en la organización de procesos institucionales, la coordinación de tareas administrativas y el acompañamiento cotidiano de familias y equipos de trabajo. Su labor se orienta a facilitar una atención ordenada, clara y cercana, promoviendo una comunicación efectiva, el seguimiento responsable de la documentación y el funcionamiento articulado de las distintas áreas del centro.', visiblePublicamente: true, ordenPublico: 1 },
  { rol: 'profesional', nombre: 'Ana', apellido: 'Martínez', dni: '33333333', email: 'ana@mail.com', titulo: 'Psicopedagoga', especialidad: 'Psicopedagogía', funcionPublica: 'Psicopedagogía', bio: 'Profesional de Psicopedagogía orientada al acompañamiento de niños en sus procesos de aprendizaje, desarrollo cognitivo y fortalecimiento de habilidades. Su trabajo se centra en la observación de las singularidades de cada niño, promoviendo estrategias personalizadas y articuladas con la familia y el equipo interdisciplinario.', visiblePublicamente: true, ordenPublico: 2 },
  { rol: 'profesional', nombre: 'Mariana', apellido: 'López', dni: '44444444', email: 'marina@mail.com', titulo: 'Psicóloga', especialidad: 'Psicología', funcionPublica: 'Psicología', bio: 'Psicóloga infantil dedicada al acompañamiento emocional, vincular y conductual de niños y niñas. Su labor se orienta a favorecer el bienestar subjetivo, la expresión emocional y la construcción de vínculos saludables, brindando también orientación y contención a las familias.', visiblePublicamente: true, ordenPublico: 3 },
  { rol: 'profesional', nombre: 'Gabriela', apellido: 'Díaz', dni: '66666666', email: 'gabriela@mail.com', titulo: 'Profesional de Educación Especial', especialidad: 'Educación Especial', funcionPublica: 'Educación Especial', bio: 'Profesional de Educación Especial orientada al diseño de propuestas pedagógicas inclusivas y adaptadas a las necesidades de cada niño. Acompaña trayectorias de desarrollo desde una mirada respetuosa, favoreciendo la participación, el aprendizaje y la construcción de apoyos significativos.', visiblePublicamente: true, ordenPublico: 4 },
  { rol: 'profesional', nombre: 'Sofía', apellido: 'Ramírez', dni: '77777777', email: 'sofia@mail.com', titulo: 'Fonoaudióloga', especialidad: 'Fonoaudiología', funcionPublica: 'Fonoaudiología', bio: 'Profesional de Fonoaudiología enfocada en el desarrollo del lenguaje, la comunicación y el habla en la infancia. Trabaja con estrategias adaptadas a las necesidades de cada niño, promoviendo avances en la expresión, la comprensión y las habilidades comunicativas en un entorno de confianza y acompañamiento.', visiblePublicamente: true, ordenPublico: 5 },
  { rol: 'profesional', nombre: 'Camila', apellido: 'Tevez', dni: '88888888', email: 'camila@mail.com', titulo: 'Psicopedagoga', especialidad: 'Psicopedagogía', funcionPublica: 'Psicopedagogía', bio: 'Psicopedagoga dedicada al acompañamiento integral de niños y niñas en sus procesos de aprendizaje y desarrollo. Su trabajo se orienta a identificar necesidades, potenciar habilidades y diseñar estrategias personalizadas que favorezcan la atención, la comprensión, la organización y la autonomía.', visiblePublicamente: true, ordenPublico: 6 },
  { rol: 'profesional', nombre: 'Natalia', apellido: 'Acosta', dni: '99999999', email: 'natalia@mail.com', titulo: 'Especialista en Educación Especial', especialidad: 'Educación Especial', funcionPublica: 'Educación Especial', bio: 'Especialista en Educación Especial, comprometida con el acompañamiento de niños que requieren estrategias específicas para potenciar su desarrollo. Su labor se centra en la inclusión, la adaptación pedagógica y la construcción de oportunidades reales de aprendizaje.', visiblePublicamente: true, ordenPublico: 7 }
];

const services = [
  ['Psicología', 'Acompañamiento emocional, vincular y conductual.', 0],
  ['Psicopedagogía', 'Acompañamiento de procesos de aprendizaje y desarrollo cognitivo.', 1],
  ['Fonoaudiología', 'Abordaje del lenguaje, el habla y la comunicación.', 2],
  ['Educación Especial', 'Propuestas pedagógicas inclusivas y apoyos personalizados.', 3]
];
const rooms = [['Consultorio 1', 'Planta baja', 3], ['Consultorio 2', 'Planta baja', 3], ['Sala interdisciplinaria', 'Primer piso', 8]];
const reportTypes = [['Informe de evolución', 'Seguimiento periódico del proceso de atención.'], ['Informe interdisciplinario', 'Síntesis elaborada con aportes de distintas áreas.'], ['Informe para institución educativa', 'Documento destinado a una institución educativa.']];

module.exports = {
  async up(queryInterface) {
    if (env.nodeEnv !== 'development') return;

    await queryInterface.sequelize.transaction(async (transaction) => {
      const roles = await queryInterface.sequelize.query('SELECT id, codigo FROM roles', { type: QueryTypes.SELECT, transaction });
      const roleIds = new Map(roles.map((role) => [role.codigo, role.id]));
      if (roleIds.size < 4) throw new Error('Faltan roles. Ejecutá primero los seeders base.');

      const now = new Date();
      const userRows = [];
      for (const user of users) {
        userRows.push({
          rol_id: roleIds.get(user.rol), nombre: user.nombre, apellido: user.apellido, dni: user.dni, email: user.email,
          password_hash: await bcrypt.hash(user.dni, env.bcryptRounds), titulo: user.titulo || null, especialidad: user.especialidad || null,
          telefono: null, bio: user.bio || null, foto_url: null, funcion_publica: user.funcionPublica || null,
          visible_publicamente: user.visiblePublicamente || false, orden_publico: user.ordenPublico ?? null, activo: true, created_at: now, updated_at: now
        });
      }
      await queryInterface.bulkInsert('usuarios', userRows, { ignoreDuplicates: true, transaction });

      await queryInterface.bulkInsert('servicios', services.map(([nombre, descripcion, orden]) => ({ nombre, descripcion, imagen_url: null, visible_publicamente: true, orden_publico: orden, activo: true, created_at: now, updated_at: now })), { ignoreDuplicates: true, transaction });
      await queryInterface.bulkInsert('consultorios', rooms.map(([nombre, ubicacion, capacidad]) => ({ nombre, descripcion: `Espacio de atención: ${nombre}.`, ubicacion, capacidad, activo: true, created_at: now, updated_at: now })), { ignoreDuplicates: true, transaction });
      await queryInterface.bulkInsert('tipos_informe', reportTypes.map(([nombre, descripcion]) => ({ nombre, descripcion, activo: true, created_at: now, updated_at: now })), { ignoreDuplicates: true, transaction });

      const providers = await queryInterface.sequelize.query("SELECT id FROM usuarios WHERE email IN ('coordinacion@mail.com','ana@mail.com','marina@mail.com','gabriela@mail.com','sofia@mail.com','camila@mail.com','natalia@mail.com')", { type: QueryTypes.SELECT, transaction });
      const serviceRows = await queryInterface.sequelize.query('SELECT id FROM servicios WHERE nombre IN (:names)', { replacements: { names: services.map(([name]) => name) }, type: QueryTypes.SELECT, transaction });
      const [administrator] = await queryInterface.sequelize.query("SELECT id FROM usuarios WHERE email = 'prof.mcjuncos@gmail.com'", { type: QueryTypes.SELECT, transaction });
      await queryInterface.bulkInsert('usuarios_servicios', providers.flatMap((provider) => serviceRows.map((service) => ({ usuario_id: provider.id, servicio_id: service.id, asignado_por: administrator.id, created_at: now }))), { ignoreDuplicates: true, transaction });
    });
  },

  async down(queryInterface) {
    if (env.nodeEnv !== 'development') return;
    const emails = users.map((user) => user.email);
    await queryInterface.sequelize.transaction(async (transaction) => {
      const userRows = await queryInterface.sequelize.query('SELECT id FROM usuarios WHERE email IN (:emails)', { replacements: { emails }, type: QueryTypes.SELECT, transaction });
      await queryInterface.bulkDelete('usuarios_servicios', { usuario_id: userRows.map((user) => user.id) }, { transaction });
      await queryInterface.bulkDelete('usuarios', { email: emails }, { transaction });
      await queryInterface.bulkDelete('servicios', { nombre: services.map(([name]) => name) }, { transaction });
      await queryInterface.bulkDelete('consultorios', { nombre: rooms.map(([name]) => name) }, { transaction });
      await queryInterface.bulkDelete('tipos_informe', { nombre: reportTypes.map(([name]) => name) }, { transaction });
    });
  }
};
