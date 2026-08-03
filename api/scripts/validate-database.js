/** Comprueba que una base migrada conserve tablas, columnas, índices y restricciones críticas. */
const { QueryTypes } = require('sequelize');
const logger = require('../src/config/logger');
const { sequelize } = require('../src/shared/database/models');

const expectedTables = ['roles', 'usuarios', 'sesiones', 'servicios', 'usuarios_servicios', 'pacientes', 'tutores', 'usuarios_pacientes', 'consultorios', 'turnos', 'tipos_informe', 'informes', 'asuntos', 'conversaciones', 'conversaciones_participantes', 'mensajes', 'auditoria_eventos'];

const main = async () => {
  const rows = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'", { type: QueryTypes.SELECT });
  const actual = new Set(rows.map((row) => row.table_name));
  const missing = expectedTables.filter((table) => !actual.has(table));
  if (missing.length) throw new Error(`Faltan tablas: ${missing.join(', ')}`);
  const unexpected = [...actual].filter((table) => table !== 'SequelizeMeta' && !expectedTables.includes(table));
  if (unexpected.length) throw new Error(`Existen tablas no normativas: ${unexpected.join(', ')}`);
  const constraints = await sequelize.query("SELECT conname FROM pg_constraint WHERE conname IN ('turnos_prestador_no_overlap','turnos_paciente_no_overlap','turnos_consultorio_no_overlap','conversaciones_participantes_ultimo_mensaje_fk')", { type: QueryTypes.SELECT });
  if (constraints.length !== 4) throw new Error('Faltan constraints críticos de concurrencia o lectura.');
  const requiredColumns = [['sesiones', 'previous_refresh_token_hash'], ['turnos', 'prestador_id'], ['informes', 'version']];
  const columns = await sequelize.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'", { type: QueryTypes.SELECT });
  const columnSet = new Set(columns.map((column) => `${column.table_name}.${column.column_name}`));
  const missingColumns = requiredColumns.filter(([table, column]) => !columnSet.has(`${table}.${column}`));
  if (missingColumns.length) throw new Error(`Faltan columnas críticas: ${missingColumns.map((item) => item.join('.')).join(', ')}`);
  const requiredIndexes = ['usuarios_pacientes_paciente_activo_idx', 'usuarios_pacientes_paciente_historial_idx', 'informes_listado_global_idx', 'mensajes_conversacion_cursor_idx'];
  const indexes = await sequelize.query("SELECT indexname FROM pg_indexes WHERE schemaname = 'public'", { type: QueryTypes.SELECT });
  const indexSet = new Set(indexes.map((index) => index.indexname));
  const missingIndexes = requiredIndexes.filter((index) => !indexSet.has(index));
  if (missingIndexes.length) throw new Error(`Faltan índices críticos: ${missingIndexes.join(', ')}`);
  logger.info({ tableCount: expectedTables.length }, 'Esquema validado');
};

main().catch((error) => { logger.error({ err: error }, 'Validación de esquema fallida'); process.exitCode = 1; }).finally(() => sequelize.close());
