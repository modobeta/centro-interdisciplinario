# AGENTS.md — Base de datos e integridad

## 1. Alcance

Estas instrucciones se aplican a la infraestructura de persistencia ubicada en:

```text
api/src/shared/database/
```

También deben respetarse al modificar elementos relacionados ubicados fuera de esta carpeta, especialmente:

```text
api/migrations/
api/seeders/
api/tests/
```

Este archivo complementa `api/AGENTS.md`. No reemplaza las reglas generales del backend.

Antes de realizar cambios en el esquema, consultar:

```text
api/AGENTS.md
docs/modelo-datos.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
src/modules/*/AGENTS.md
```

El `AGENTS.md` del módulo funcional correspondiente define las reglas de negocio. Este archivo determina cómo representarlas y protegerlas en PostgreSQL y Sequelize.

Si una regla de negocio, asociación, nulabilidad, índice o constraint no está documentado:

1. no asumirlo;
2. identificar el vacío;
3. explicar su impacto;
4. solicitar una decisión;
5. no crear silenciosamente una estructura definitiva.

---

## 2. Comandos habituales

Ejecutar los comandos desde `api/`.

Antes de utilizarlos, comprobar que los scripts existan en `package.json`.

```bash
npm run db:migrate
npm run db:migrate:undo
npm run db:seed
npm run db:seed:undo
npm test
npm run test:coverage
npm run lint
```

Reglas operativas:

* No ejecutar migraciones destructivas en entornos compartidos sin autorización.
* No ejecutar `db:migrate:undo` en producción como procedimiento improvisado.
* No ejecutar seeders de desarrollo en producción.
* No modificar manualmente el esquema para evitar crear una migración.
* No ejecutar migraciones automáticamente desde `server.js`.
* No iniciar migraciones simultáneamente desde varias réplicas.
* No utilizar `sequelize.sync()` en ningún entorno.
* Las pruebas de integración deben construir el esquema mediante migraciones.

---

## 3. Ubicación y responsabilidades

La estructura prevista es:

```text
api/
├── migrations/                     Evolución versionada del esquema
├── seeders/                        Datos iniciales controlados
├── src/
│   └── shared/
│       └── database/
│           ├── connection.js       Instancia y conexión de Sequelize
│           ├── models/             Modelos centralizados
│           ├── associations.js     Registro de asociaciones
│           └── AGENTS.md
└── tests/                          Pruebas de integración y concurrencia
```

La ubicación efectiva de migraciones y seeders debe coincidir con `.sequelizerc`.

No mover, duplicar ni crear una segunda ubicación para migraciones, modelos o asociaciones sin aprobación.

### Responsabilidades

`connection.js`:

* crea y configura una única instancia de Sequelize;
* utiliza variables de entorno validadas;
* configura el pool según el entorno;
* no contiene reglas de negocio;
* no ejecuta migraciones;
* no utiliza `sync()`.

`models/`:

* refleja tablas, columnas, tipos y mappings;
* centraliza los modelos Sequelize;
* no implementa casos de uso completos;
* no decide permisos;
* no reemplaza constraints de PostgreSQL.

`associations.js`:

* registra las relaciones una sola vez;
* utiliza aliases y claves explícitas;
* evita dependencias circulares accidentales;
* mantiene las asociaciones alineadas con las claves foráneas reales.

`migrations/`:

* constituye la fuente de verdad del esquema físico;
* crea y modifica tablas, columnas, índices, extensiones y constraints;
* permite reproducir el esquema desde una base vacía.

`seeders/`:

* contiene únicamente datos iniciales o de desarrollo aprobados;
* nunca contiene información personal o clínica real.

---

## 4. Principios no negociables

* PostgreSQL es la garantía final de integridad.
* Las migraciones son la única fuente de verdad del esquema físico.
* Los modelos Sequelize deben coincidir con las migraciones.
* Joi valida la forma de entrada, pero no reemplaza constraints.
* Los services aplican negocio y autorización, pero no sustituyen la integridad de la base.
* Una validación previa no protege contra solicitudes concurrentes.
* Toda regla crítica expuesta a concurrencia debe respaldarse en PostgreSQL.
* Los modelos Sequelize permanecen centralizados en `src/shared/database/models/`.
* Los módulos funcionales no crean modelos Sequelize paralelos.
* Los services acceden directamente a los modelos; no agregar un Repository genérico.
* No utilizar SQLite como sustituto de PostgreSQL en pruebas de integración.
* No ocultar inconsistencias mediante hooks, scopes o valores por defecto no documentados.
* No eliminar constraints para simplificar services o hacer pasar pruebas.
* No almacenar secretos, tokens en texto plano ni datos personales reales en fixtures.
* No eliminar físicamente información histórica salvo decisión normativa explícita.

---

## 5. Convenciones de nombres y tipos

### JavaScript y Sequelize

* Modelos: `PascalCase`.
* Atributos JavaScript: `camelCase`.
* Archivos: minúsculas.
* Asociaciones: aliases estables y descriptivos.
* CommonJS: `require` y `module.exports`.

### PostgreSQL

* Tablas: `snake_case`.
* Columnas: `snake_case`.
* Índices: nombres descriptivos y estables.
* Constraints: nombres descriptivos y estables.
* Claves primarias y foráneas: UUID.
* Instantes: `TIMESTAMPTZ`.
* Fechas civiles: `DATE`.
* Horas civiles aisladas: utilizar el tipo aprobado por `modelo-datos.md`.
* Datos estructurados: no introducir `JSONB` para evitar diseñar relaciones normales.

### Mapeo

El modelo debe declarar conscientemente el mapeo entre JavaScript y PostgreSQL:

```javascript
inicioAt: {
  type: DataTypes.DATE,
  allowNull: false,
  field: 'inicio_at',
}
```

No depender de una convención global implícita si su modificación puede cambiar nombres existentes.

Los nombres de tabla, timestamps y claves foráneas deben quedar explícitos cuando exista riesgo de inferencia incorrecta.

---

## 6. Identificadores UUID

Los recursos utilizan UUID como identificadores.

Reglas:

* No reemplazar UUID por IDs incrementales.
* No generar UUID a partir de datos personales.
* No interpretar un UUID como mecanismo de autorización.
* Toda consulta por UUID debe continuar aplicando scope y policy.
* Las claves primarias y foráneas relacionadas deben utilizar tipos compatibles.
* La extensión o función PostgreSQL utilizada para generar UUID debe declararse mediante migración.
* La estrategia exacta de generación debe coincidir con `modelo-datos.md`.

El hecho de que un identificador sea difícil de adivinar no evita IDOR.

---

## 7. Migraciones

Todo cambio de esquema requiere una migración nueva.

Incluye:

* crear o eliminar tablas;
* agregar, renombrar o eliminar columnas;
* modificar tipos;
* cambiar nulabilidad;
* agregar valores por defecto;
* crear o eliminar claves foráneas;
* agregar o eliminar índices;
* agregar o eliminar constraints;
* habilitar extensiones PostgreSQL;
* realizar backfills necesarios para una evolución de esquema.

### Reglas obligatorias

* No modificar una migración aplicada en un entorno compartido.
* No reutilizar una migración anterior para un cambio nuevo.
* No alterar la base manualmente para sustituir una migración.
* No asumir el orden accidental de archivos.
* Utilizar nombres cronológicos y descriptivos.
* Implementar `up`.
* Implementar un `down` seguro cuando sea posible.
* Un `down` solo debe revertir lo creado por su propio `up`.
* Mantener migración, modelo, asociaciones, documentación y pruebas sincronizados.
* Usar SQL estático y parametrizado cuando `queryInterface` no cubra una función de PostgreSQL.
* No interpolar entradas externas en SQL.
* No introducir silenciosamente pérdida de datos.
* No ejecutar migraciones desde el arranque normal de la aplicación.

Estructura mínima:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    // Evolución del esquema.
  },

  async down(queryInterface, Sequelize) {
    // Reversión segura, cuando sea posible.
  },
};
```

### Transacción de migración

Cuando PostgreSQL lo permita, ejecutar dentro de una transacción las operaciones que deban aplicarse como una unidad:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Operaciones relacionadas.
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Reversión relacionada.
    });
  },
};
```

No envolver automáticamente una operación incompatible con transacciones, como ciertas variantes de creación concurrente de índices. En esos casos:

1. documentar la excepción;
2. evaluar el procedimiento de despliegue;
3. definir recuperación ante fallo parcial;
4. obtener aprobación si afecta un entorno compartido.

---

## 8. Cambios de esquema con datos existentes

Antes de agregar una restricción sobre una tabla con datos:

1. comprobar el estado actual de los registros;
2. identificar filas incompatibles;
3. definir el backfill o saneamiento;
4. ejecutar el cambio en fases seguras;
5. agregar el constraint;
6. validar el resultado;
7. actualizar el modelo.

Para agregar una columna obligatoria a una tabla existente, considerar:

1. agregarla inicialmente como nullable o con una estrategia aprobada;
2. completar los datos existentes;
3. verificar que no queden valores inválidos;
4. cambiarla a `NOT NULL`;
5. retirar valores por defecto transitorios cuando corresponda.

No asignar un valor ficticio solo para satisfacer `NOT NULL`.

No utilizar valores por defecto que cambien silenciosamente el significado histórico de los registros.

### Cambios destructivos

Eliminar o renombrar tablas, columnas o tipos requiere:

* confirmación explícita;
* análisis de consumidores;
* evaluación de pérdida de información;
* estrategia de despliegue compatible;
* backup cuando corresponda;
* pruebas de migración y reversión;
* actualización de contrato, modelos y documentación.

Preferir una evolución en fases cuando convivan versiones diferentes de la aplicación.

---

## 9. Modelos Sequelize

Cada modelo debe reflejar fielmente su migración:

* nombre de tabla;
* atributos;
* tipos;
* `allowNull`;
* valores por defecto;
* nombres físicos mediante `field`;
* claves primarias;
* claves foráneas;
* timestamps;
* índices representativos cuando la convención del proyecto los documente;
* comportamiento de eliminación lógica aprobado.

### Los modelos pueden

* declarar atributos y mappings;
* registrar asociaciones;
* incluir validaciones estructurales simples;
* exponer helpers pequeños que no sustituyan services;
* normalizar valores cuando la regla esté documentada.

### Los modelos no deben

* contener autorización por rol;
* acceder al contexto HTTP;
* construir respuestas de la API;
* ejecutar casos de uso completos;
* iniciar transacciones ocultas;
* crear asociaciones durante cada consulta;
* ocultar datos sensibles como único mecanismo de seguridad;
* utilizar `defaultScope` como sustituto de una proyección autorizada;
* realizar llamadas externas;
* corregir automáticamente datos inválidos sin informarlo.

No devolver instancias Sequelize completas desde controllers. Las proyecciones pertenecen a services y serializers.

### Hooks

Utilizar hooks solamente cuando exista una razón transversal, documentada y testeable.

No utilizar hooks para ocultar:

* creación de registros adicionales;
* auditorías que deben compartir una transacción explícita;
* cambios de estado;
* autorización;
* envío de mensajes;
* operaciones externas;
* reglas que el service necesita controlar.

Los hooks no deben producir escrituras inesperadas fuera de la transacción recibida.

---

## 10. Asociaciones

Todas las asociaciones deben declararse de forma centralizada y coherente con las claves foráneas creadas por migración.

Ejemplo de configuración explícita:

```javascript
Appointment.belongsTo(User, {
  as: 'professional',
  foreignKey: 'professionalId',
});

User.hasMany(Appointment, {
  as: 'appointmentsAsProfessional',
  foreignKey: 'professionalId',
});
```

### Reglas

* Definir `as` explícitamente.
* Definir `foreignKey` explícitamente.
* Mantener aliases estables porque pueden ser consumidos por includes y proyecciones.
* Declarar ambos lados cuando el proyecto necesite navegación bidireccional.
* No crear asociaciones que no tengan respaldo en una clave foránea real.
* No depender del orden accidental de imports.
* No registrar asociaciones más de una vez.
* No utilizar `constraints: false` para ocultar un diseño incorrecto.
* No realizar eager loading global.
* Cargar únicamente relaciones necesarias para cada operación.
* Evitar ciclos de serialización.
* Evitar consultas N+1.
* No incluir asociaciones sensibles sin aplicar scope y proyección.

### Relaciones muchos a muchos

Si la tabla intermedia contiene estado, fechas, autoría, permisos, historial u otros atributos propios, tratarla como un modelo de dominio explícito.

No reducir una relación con comportamiento propio a un `belongsToMany` opaco.

Las restricciones de unicidad y vigencia de la tabla intermedia deben definirse en PostgreSQL.

---

## 11. Claves foráneas e integridad referencial

Toda relación persistente debe evaluar:

* columna local;
* tabla y columna referenciada;
* nulabilidad;
* `ON UPDATE`;
* `ON DELETE`;
* índice de soporte;
* comportamiento histórico;
* posibilidad de baja lógica;
* impacto sobre asociaciones Sequelize.

### Reglas

* No utilizar `ON DELETE CASCADE` por comodidad.
* No eliminar en cascada turnos, informes, mensajes, auditorías ni otros registros históricos.
* Preferir `RESTRICT`, `NO ACTION`, `SET NULL` o baja lógica según la regla documentada.
* No usar `SET NULL` si la relación histórica debe conservarse obligatoriamente.
* No permitir referencias a registros inexistentes.
* No confiar únicamente en una validación del service para sostener una relación.
* Los tipos de la clave foránea y de la clave referenciada deben coincidir.
* Toda decisión de borrado debe documentarse en `modelo-datos.md`.

La baja lógica de un recurso no implica eliminar ni anular automáticamente sus referencias históricas.

---

## 12. Constraints

PostgreSQL debe garantizar, según corresponda:

* claves primarias;
* claves foráneas;
* nulabilidad;
* unicidad;
* rangos numéricos válidos;
* estados válidos;
* relaciones coherentes;
* integridad temporal;
* ausencia de solapamientos;
* invariantes que deban sobrevivir a concurrencia.

### Reglas

* Asignar nombres explícitos y estables.
* No depender de nombres generados automáticamente cuando el service necesite reconocer el conflicto.
* No exponer nombres de constraints en respuestas HTTP.
* Traducir violaciones conocidas a códigos funcionales del contrato.
* No duplicar un índice cuando el constraint ya crea uno equivalente.
* No sustituir un constraint por una consulta previa.
* No debilitar un constraint para permitir datos que contradicen el dominio.
* No agregar un constraint sin validar datos preexistentes.
* No utilizar triggers para reglas que puedan expresarse claramente mediante constraints, salvo justificación aprobada.

La representación exacta de estados válidos, unicidad funcional y relaciones opcionales debe provenir de `modelo-datos.md`.

---

## 13. Integridad temporal de turnos

Los turnos no pueden solaparse cuando comparten:

* prestador;
* paciente;
* consultorio.

La base de datos debe ser la autoridad final ante inserciones simultáneas.

Una consulta previa de disponibilidad solo mejora el mensaje al usuario. No garantiza integridad.

### Reglas

* Utilizar el mecanismo PostgreSQL aprobado para exclusión temporal.
* Declarar mediante migración las extensiones requeridas.
* Trabajar con instantes persistidos en UTC.
* Interpretar la agenda en `America/Argentina/Cordoba`.
* Considerar intervalos con inicio inclusivo y fin exclusivo.
* No concatenar manualmente fecha y hora para crear instantes.
* No permitir que dos solicitudes simultáneas confirmen turnos incompatibles.
* Traducir el conflicto al error funcional definido por el contrato.
* Responder normalmente con `409 Conflict` cuando corresponda.
* No devolver el nombre del constraint ni el SQL ejecutado.

No inventar:

* qué estados de turno bloquean disponibilidad;
* la expresión exacta del rango;
* excepciones de agenda;
* tratamiento de turnos cancelados;
* reglas sobre límites horarios.

Esos detalles deben estar definidos en `docs/modelo-datos.md`, `docs/contrato-api.md` y `src/modules/turnos/AGENTS.md`.

---

## 14. Índices

Todo índice debe responder a una consulta real o a una garantía de integridad.

Antes de crearlo, identificar:

* endpoint o proceso que lo utiliza;
* filtros habituales;
* condiciones de join;
* ordenamiento;
* cardinalidad;
* selectividad;
* volumen estimado;
* frecuencia de lectura y escritura;
* índice existente que pudiera cubrir la misma consulta.

### Reglas

* Revisar índices para claves foráneas utilizadas en joins o filtros.
* No asumir que PostgreSQL indexa automáticamente las claves foráneas.
* Evitar índices duplicados o redundantes.
* Considerar el orden de columnas en índices compuestos.
* Recordar que el orden determina qué prefijos pueden aprovecharse.
* Utilizar índices parciales solamente cuando el predicado coincida con consultas reales.
* No agregar un índice independiente si un constraint ya provee uno equivalente.
* No agregar GIN, GiST, trigramas o extensiones sin justificar la consulta.
* No indexar todas las columnas preventivamente.
* Evaluar el costo de escritura y almacenamiento.
* Mantener nombres estables y descriptivos.
* Documentar el endpoint o consulta que justifica el índice.

Para verificar rendimiento, utilizar herramientas de PostgreSQL en un entorno controlado.

`EXPLAIN ANALYZE` ejecuta la consulta. No utilizarlo sobre operaciones destructivas ni sobre producción sin una evaluación específica.

No copiar datos personales reales en planes, fixtures o reportes de rendimiento.

---

## 15. Fechas y zona horaria

La zona horaria funcional del centro es:

```text
America/Argentina/Cordoba
```

Reglas:

* Persistir instantes mediante `TIMESTAMPTZ`.
* Tratar los instantes almacenados como UTC.
* Utilizar `DATE` para fechas civiles sin hora.
* Convertir fecha y hora local mediante una utilidad centralizada y testeada.
* No utilizar la zona horaria del servidor como regla del negocio.
* No almacenar una fecha local ambigua como string libre.
* No remover el offset de una fecha antes de persistirla.
* Serializar instantes en ISO 8601 UTC.
* Tratar `desde` como inclusivo y `hasta` como exclusivo cuando así lo establece el contrato.

Los modelos y migraciones deben representar la misma semántica temporal.

---

## 16. Transacciones

Usar una transacción cuando varias escrituras forman una única operación funcional.

Casos obligatorios, según la documentación vigente:

* paciente, tutor y relación;
* turno y vínculo automático;
* conversación, participantes y primer mensaje;
* incorporación de participante y estado inicial de lectura;
* rotación de refresh token;
* revocación de sesiones;
* cambio de rol y cierre de relaciones;
* desactivación de usuario y revocación;
* transición de estado y auditoría;
* finalización de informe y auditoría.

### Reglas

* El service dueño del caso de uso abre la transacción.
* Pasar la misma instancia a todas las consultas y escrituras relacionadas.
* No abrir transacciones independientes dentro de una transacción existente.
* No confirmar resultados parciales.
* No capturar un error para continuar silenciosamente.
* Permitir que el error provoque rollback.
* La auditoría exitosa comparte la transacción cuando forma parte de la operación.
* No ejecutar llamadas externas irreversibles dentro de una transacción prolongada.
* Mantener las transacciones lo más breves posible.
* Definir bloqueos explícitos cuando una lectura deba proteger una escritura posterior.
* No asumir que una transacción por sí sola evita todos los conflictos.

El nivel de aislamiento o estrategia de bloqueo no debe cambiarse globalmente sin análisis y aprobación.

---

## 17. Concurrencia y bloqueos

Las operaciones expuestas a solicitudes simultáneas deben evaluarse expresamente.

Procedimiento:

1. realizar validaciones previas para ofrecer errores claros;
2. ejecutar la escritura dentro de la transacción correspondiente;
3. permitir que PostgreSQL evalúe la restricción final;
4. capturar el error conocido;
5. traducirlo a un código funcional estable;
6. no exponer información interna;
7. agregar una prueba concurrente real.

Utilizar bloqueos solamente cuando exista un recurso concreto cuya lectura deba permanecer estable durante la escritura.

No aplicar bloqueos generales ni niveles de aislamiento más estrictos sin evaluar:

* contención;
* deadlocks;
* duración;
* orden de adquisición;
* cantidad de filas;
* impacto sobre otros casos de uso.

Las operaciones deben adquirir recursos relacionados en un orden consistente cuando exista riesgo de deadlock.

---

## 18. Baja lógica e historia

Usuarios, pacientes y catálogos utilizan baja lógica cuando así lo establece la documentación.

Reglas:

* No eliminar físicamente recursos con historial.
* Conservar relaciones necesarias para interpretar eventos anteriores.
* No sobrescribir información histórica con datos ficticios.
* No reutilizar identificadores de registros inactivos.
* No confundir `activo = false` con inexistencia.
* Los services deben aplicar las reglas que impiden nuevas operaciones sobre recursos inactivos.
* Las asociaciones históricas pueden continuar siendo legibles según permisos.
* Un índice de unicidad debe considerar conscientemente si la unicidad incluye registros inactivos.

No incorporar `paranoid` de Sequelize como decisión automática. La estrategia de baja lógica debe coincidir con migraciones, consultas y documentación.

---

## 19. Datos sensibles

La base puede contener datos personales, administrativos y clínicos.

Está prohibido:

* registrar SQL con valores personales en logs ordinarios;
* almacenar contraseñas, DNI usado como credencial o refresh tokens en texto plano;
* utilizar datos reales en seeders o fixtures;
* copiar contenido clínico a auditoría;
* duplicar informes o mensajes en columnas de búsqueda sin aprobación;
* guardar cuerpos HTTP completos;
* incluir secretos dentro de migraciones;
* incorporar credenciales en `.sequelizerc`;
* exponer nombres internos de tablas o constraints mediante la API.

Los hashes deben persistirse únicamente en los campos definidos para ese propósito.

La existencia de una columna sensible no autoriza su selección. Los services deben utilizar listas positivas de atributos.

---

## 20. Seeders

Separar claramente:

* datos iniciales necesarios para operar;
* datos de demostración;
* datos de pruebas;
* datos de desarrollo local.

### Reglas

* No incluir datos personales reales.
* No incluir contenido clínico real.
* No incluir credenciales o tokens reales.
* No ejecutar datos de demostración en producción.
* Mantener IDs estables solamente cuando exista una razón documentada.
* Respetar claves foráneas y orden de dependencias.
* Implementar reversión cuando sea segura.
* No utilizar un seeder para corregir permanentemente el esquema.
* No utilizar seeders para sustituir migraciones de datos obligatorias.
* No depender de un seeder de desarrollo para que la aplicación arranque.

Los catálogos iniciales de producción deben estar aprobados y documentados.

---

## 21. Traducción de errores

Los errores de Sequelize y PostgreSQL no deben llegar directamente al cliente.

El service debe reconocer conflictos conocidos y traducirlos a códigos funcionales estables.

Ejemplos generales:

```text
duplicado                → 409
solapamiento             → 409
conflicto de estado      → 409
referencia inválida      → error contractual correspondiente
violación inesperada     → 500 INTERNAL_ERROR
```

La traducción exacta debe seguir `docs/contrato-api.md`.

No devolver:

* mensaje crudo de PostgreSQL;
* nombre del constraint;
* SQL;
* parámetros de la consulta;
* tabla afectada;
* stack trace;
* host o configuración de la base.

No depender únicamente del texto humano del error. Preferir tipo de error, código PostgreSQL y nombre interno controlado del constraint.

El nombre interno puede utilizarse dentro del backend para clasificar el error, pero nunca debe formar parte de la respuesta.

---

## 22. Consultas y rendimiento

Los services deben construir consultas explícitas.

Reglas:

* Seleccionar solamente columnas necesarias y autorizadas.
* Incluir asociaciones de manera explícita.
* No utilizar `include: { all: true }`.
* Evitar consultas N+1.
* Paginar listados.
* Respetar límites máximos del contrato.
* Aplicar filtros dentro del scope permitido.
* Utilizar listas blancas para columnas de ordenamiento.
* No aceptar nombres de columnas enviados libremente por el cliente.
* Parametrizar SQL literal.
* No utilizar interpolación de strings con entradas externas.
* No cargar contenido clínico en Resumen ni previews.
* Utilizar cursor para mensajes según el contrato.
* Limitar rangos de agenda.
* No introducir caché ni desnormalización sin medición y aprobación.

Una optimización no puede ampliar permisos ni cambiar la proyección de campos.

---

## 23. Pruebas obligatorias

Los cambios de persistencia requieren pruebas proporcionales al riesgo.

### Migraciones

Verificar:

* migración desde una base vacía;
* aplicación de todas las migraciones en orden;
* estructura resultante;
* claves foráneas;
* índices;
* constraints;
* datos iniciales necesarios;
* `down` cuando sea seguro probarlo.

### Modelos y asociaciones

Verificar:

* nombres de tablas y columnas;
* mapping `camelCase`/`snake_case`;
* nulabilidad;
* valores por defecto;
* aliases;
* claves foráneas;
* includes necesarios;
* ausencia de asociaciones duplicadas.

### Integridad

Probar contra PostgreSQL real:

* valores válidos;
* valores nulos prohibidos;
* duplicados;
* referencias inexistentes;
* eliminación o desactivación con historial;
* estados inválidos;
* rollback completo;
* traducción de errores.

### Concurrencia

Ejecutar solicitudes o transacciones simultáneas reales para:

* solapamiento de prestador;
* solapamiento de paciente;
* solapamiento de consultorio;
* duplicados protegidos por unicidad;
* operaciones de sesión cuando su estrategia esté aprobada.

No reemplazar estas pruebas con mocks de Sequelize.

### Aislamiento

* Utilizar una base exclusiva para tests.
* Crear su esquema mediante migraciones.
* No apuntar tests a development o production.
* Limpiar datos sin destruir bases ajenas.
* No utilizar `sequelize.sync({ force: true })`.
* No depender del orden de ejecución de pruebas.
* No compartir transacciones entre pruebas concurrentes.

---

## 24. Sincronización documental

Cuando cambie el esquema, revisar y actualizar únicamente lo afectado:

```text
docs/modelo-datos.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
migrations/
seeders/
src/shared/database/models/
src/shared/database/associations.js
schemas Joi
services
tests
AGENTS.md especializado
```

Actualizar `contrato-api.md` cuando cambien:

* campos aceptados;
* campos devueltos;
* nulabilidad visible;
* códigos funcionales;
* filtros;
* ordenamiento;
* paginación;
* comportamiento observable.

Actualizar `matriz-permisos.md` cuando el cambio afecte:

* acceso por rol;
* alcance de filas;
* asociaciones visibles;
* campos sensibles;
* acciones permitidas.

No modificar documentación normativa para encubrir una implementación incompatible.

---

## 25. Acciones prohibidas

No realizar ninguna de estas acciones:

* utilizar `sequelize.sync()`;
* modificar una migración aplicada;
* crear tablas manualmente en un entorno compartido;
* eliminar constraints para hacer pasar pruebas;
* sustituir PostgreSQL por SQLite en integración;
* distribuir modelos dentro de módulos funcionales;
* crear una segunda instancia no controlada de Sequelize;
* agregar `CASCADE` sin analizar historia;
* almacenar hashes, tokens o credenciales en logs;
* ejecutar migraciones desde `app.js` o `server.js`;
* crear endpoints desde modelos;
* devolver instancias Sequelize completas;
* utilizar `constraints: false` para ocultar inconsistencias;
* agregar índices sin una consulta justificante;
* crear SQL dinámico no parametrizado;
* borrar datos históricos;
* inventar decisiones ausentes de `modelo-datos.md`;
* afirmar que la integridad está validada sin probar PostgreSQL real.

---

## 26. Procedimiento de trabajo

### Antes del cambio

1. Leer `api/AGENTS.md`.
2. Leer este archivo.
3. Leer el `AGENTS.md` del módulo afectado.
4. Consultar la documentación normativa.
5. Inspeccionar migraciones, modelos y asociaciones existentes.
6. Identificar datos preexistentes.
7. Evaluar integridad, concurrencia e historia.
8. Identificar decisiones pendientes.
9. Confirmar cualquier cambio destructivo o ambiguo.

### Durante el cambio

1. Crear una migración nueva.
2. Mantener el cambio acotado.
3. Aplicar transacción cuando corresponda.
4. Actualizar el modelo.
5. Actualizar asociaciones.
6. Revisar claves foráneas.
7. Revisar índices y constraints.
8. Agregar traducción de errores.
9. Incorporar pruebas.
10. Actualizar documentación afectada.

### Después del cambio

1. Migrar una base de prueba desde cero.
2. Ejecutar pruebas de integración.
3. Ejecutar pruebas concurrentes si corresponde.
4. Ejecutar lint.
5. Comparar migraciones y modelos.
6. Verificar el `down` cuando sea seguro.
7. Revisar exposición de datos.
8. Revisar planes de consulta cuando se agregaron índices.
9. Informar comandos ejecutados y resultados.
10. Informar cualquier validación no realizada.

No declarar una tarea terminada si no se ejecutaron las validaciones correspondientes.

---

## 27. Definition of Done

Un cambio de base de datos está completo solamente cuando:

* existe una migración nueva;
* no se modificaron migraciones aplicadas;
* el modelo coincide con el esquema;
* las asociaciones coinciden con las claves foráneas;
* la nulabilidad está definida conscientemente;
* los valores por defecto son correctos;
* los constraints protegen las invariantes;
* los índices responden a consultas reales;
* la integridad histórica se conserva;
* la concurrencia fue considerada;
* las transacciones abarcan todas las escrituras relacionadas;
* los errores internos se traducen;
* no se exponen SQL ni nombres de constraints;
* no se incorporan datos sensibles;
* la base de test se crea mediante migraciones;
* las pruebas relevantes pasan contra PostgreSQL;
* lint pasa;
* la documentación afectada está actualizada;
* cualquier riesgo o decisión pendiente quedó informado.

---

## 28. Decisiones pendientes

Mientras no estén resueltas en `docs/modelo-datos.md`, no definir por cuenta propia:

* inventario definitivo de tablas y columnas;
* nombres definitivos de todos los constraints;
* estados que bloquean los solapamientos de agenda;
* representación exacta de rangos temporales;
* estrategia de unicidad para registros inactivos;
* política específica de borrado de cada clave foránea;
* representación PostgreSQL de los estados;
* extensiones adicionales;
* índices de búsqueda textual;
* retención y particionado de auditoría;
* estrategia de archivado;
* volumen esperado y umbrales de optimización;
* mantenimiento operativo de índices y tablas.

Cuando una tarea dependa de alguno de estos puntos, detener esa parte y solicitar una decisión explícita.
