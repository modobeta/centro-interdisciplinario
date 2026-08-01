# AGENTS.md — Turnos y agenda

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/turnos/
```

También deben respetarse al modificar piezas relacionadas ubicadas fuera del
módulo, especialmente:

```text
api/src/modules/vinculos/
api/src/modules/pacientes/
api/src/modules/usuarios/
api/src/modules/servicios/
api/src/modules/consultorios/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/utils/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend ni las instrucciones especializadas de persistencia.

Antes de modificar Turnos, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/shared/database/AGENTS.md
```

Si `docs/modelo-datos.md`, `api/AGENTS.md` o el `AGENTS.md` de base de datos
todavía no existen en el checkout, no inventar su contenido. Utilizar únicamente
las decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. `docs/contrato-api.md` y `docs/matriz-permisos.md` vigentes;
4. este archivo especializado;
5. `api/AGENTS.md`.

Ante una contradicción, detener solo la parte afectada, documentar la
inconsistencia y solicitar una decisión. No modificar documentación normativa
para justificar una implementación incompatible.

---

## 2. Comandos habituales

Ejecutar desde `api/` y comprobar primero que los scripts existan en
`package.json`:

```bash
npm test
npm run test:coverage
npm run test:integration
npm run test:concurrency
npm run lint
npm run db:migrate
```

Reglas operativas:

- utilizar PostgreSQL real y una base exclusiva para integración;
- crear el esquema de test mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- no asumir que un script existe solo porque aparece en esta lista;
- no registrar datos personales, clínicos, observaciones o notas durante las
  pruebas;
- probar los tres antisolapamientos con solicitudes simultáneas reales;
- informar los comandos ejecutados, sus resultados y cualquier validación no
  realizada.

---

## 3. Decisiones obligatorias del MVP

```text
Zona funcional:             America/Argentina/Cordoba
Persistencia de instantes:  UTC mediante TIMESTAMPTZ
Días habilitados:           lunes a sábado
Franja operativa:           08:00–21:00
Duraciones:                 30, 45, 60, 90 o 120 minutos
Estado inicial:             pendiente
Estados bloqueantes:        pendiente, confirmado
Estados terminales:         completado, cancelado, ausente
Semántica de intervalo:     [inicio, fin)
Alcance máximo de agenda:   31 días
Reprogramación:             no existe
Eliminación física:         no existe
```

PostgreSQL es la autoridad final para evitar solapamientos simultáneos de:

- prestador responsable;
- paciente;
- consultorio.

La comprobación previa de disponibilidad mejora el feedback, pero no reserva el
horario ni garantiza integridad.

Un turno puede utilizar cualquier servicio activo. La asignación habitual de
servicios al prestador es informativa y organizativa; no autoriza ni restringe
la creación.

### Decisión contraintuitiva: servicio no asignado

Documentos anteriores conservan la expresión “servicio activo y asignado”. Esa
regla fue reemplazada por el contrato consolidado vigente:

```text
El servicio solo debe existir y estar activo.
```

Por lo tanto:

- no exigir una fila en `usuarios_servicios`;
- no rechazar un servicio activo por no ser habitual;
- no crear el error `SERVICIO_NO_ASIGNADO` en Turnos;
- no filtrar el selector backend a servicios habituales;
- se permite ordenar los habituales primero sin excluir los demás activos.

No “restaurar” la regla anterior al modificar validaciones, services, pruebas o
documentación.

---

## 4. Responsabilidad del módulo

`turnos` es dueño de:

- consulta de agenda;
- consulta orientativa de disponibilidad;
- detalle autorizado del turno;
- creación de turnos;
- reglas de horario y duración;
- transiciones de estado;
- cancelación y liberación de horario;
- observación administrativa;
- notas internas del turno;
- coordinación transaccional del vínculo automático;
- detección y traducción de conflictos temporales;
- proyecciones de evento y detalle;
- auditoría funcional propia del turno.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/turnos/
├── turno.routes.js
├── turno.validation.js
├── turno.controller.js
├── turno.service.js
├── turno.policy.js
├── turno.projection.js
├── turno.constants.js
└── AGENTS.md
```

Los modelos Sequelize permanecen centralizados en
`src/shared/database/models/`. El módulo Turnos no define un modelo paralelo ni
un Repository genérico.

---

## 5. Responsabilidades por capa

### Routes

- declaran método y ruta;
- componen autenticación, permiso general, Joi y controller;
- mantienen visible el orden de middlewares;
- no consultan modelos ni deciden acceso al turno concreto.

### Validation

- valida `params`, `query` y `body`;
- limita UUID, enums, fechas, horas, duraciones, paginación y ordenamiento;
- rechaza propiedades inesperadas;
- respeta nulabilidad contractual;
- no consulta PostgreSQL;
- no resuelve vínculos, estados persistidos ni solapamientos.

### Controllers

- reciben entradas ya validadas;
- obtienen al actor autenticado;
- invocan un caso de uso del service;
- devuelven status y envelope contractuales;
- no abren transacciones;
- no aplican reglas por rol o recurso;
- no serializan instancias Sequelize completas.

### Services

- aplican negocio y policies por recurso;
- cargan recursos activos y autorizados;
- convierten fecha y hora local a instantes;
- calculan `finAt` en backend;
- abren y propagan transacciones;
- coordinan vínculo, turno y auditoría;
- traducen errores de PostgreSQL a códigos funcionales;
- seleccionan la proyección autorizada;
- no reciben `req`, `res` ni status HTTP.

### Policies

- distinguen permiso general, alcance de filas, recurso concreto y campo;
- verifican si el profesional es el prestador responsable;
- protegen acceso directo por UUID contra IDOR;
- deciden lectura y escritura de notas internas;
- no se sustituyen con controles del frontend.

### Proyecciones

- utilizan listas positivas de atributos;
- separan evento de agenda y detalle;
- omiten campos no autorizados en la consulta, no solo en el JSON final;
- no utilizan `model.toJSON()` como respuesta;
- evitan includes globales y ciclos de serialización.

---

## 6. Terminología y nombres contractuales

El prestador responsable puede tener rol:

```text
profesional
coordinacion
```

El administrador y la secretaría operan agendas, pero no son prestadores.

La API v1 conserva estos nombres diferentes:

| Contexto | Nombre | Significado |
|---|---|---|
| Crear turno | `profesionalId` | Prestador responsable. |
| Filtro y disponibilidad | `prestadorId` | Prestador consultado. |
| PostgreSQL | `profesional_id` | FK al usuario prestador. |
| Respuesta | `prestador` | Proyección del responsable. |

No renombrar unilateralmente `profesionalId` en el body de creación ni agregar
aliases alternativos. Un cambio de nombre exige versionado o actualización
contractual explícita.

---

## 7. Endpoints permitidos

| Método | Ruta | Acceso resumido |
|---|---|---|
| `GET` | `/api/v1/turnos` | Todos; scope global o propio. |
| `GET` | `/api/v1/turnos/disponibilidad` | Cualquier autenticado. |
| `GET` | `/api/v1/turnos/:id` | Roles globales o responsable. |
| `POST` | `/api/v1/turnos` | Admin, coordinación, secretaría, profesional. |
| `PATCH` | `/api/v1/turnos/:id/confirmar` | Roles globales o responsable. |
| `PATCH` | `/api/v1/turnos/:id/cancelar` | Roles globales o responsable. |
| `PATCH` | `/api/v1/turnos/:id/completar` | Roles globales o responsable. |
| `PATCH` | `/api/v1/turnos/:id/ausente` | Roles globales o responsable. |
| `PATCH` | `/api/v1/turnos/:id/observacion-administrativa` | Roles globales o responsable. |
| `PATCH` | `/api/v1/turnos/:id/notas-internas` | Coordinación o responsable. |

No incorporar rutas alternativas, aliases ni endpoints genéricos.

En particular, no existen:

```text
PUT    /api/v1/turnos/:id
PATCH  /api/v1/turnos/:id/reprogramar
DELETE /api/v1/turnos/:id
```

El endpoint vigente de ausencia es:

```text
PATCH /api/v1/turnos/:id/ausente
```

No utilizar la variante heredada `/marcar-ausente`.

---

## 8. Fechas, horarios e intervalos

La fecha civil y la hora recibidas al crear se interpretan en:

```text
America/Argentina/Cordoba
```

Reglas:

- persistir `inicio_at` y `fin_at` como `TIMESTAMPTZ`;
- tratar los instantes persistidos como UTC;
- devolverlos en ISO 8601 UTC;
- centralizar la conversión en una utilidad testeada;
- no usar la zona local del servidor como regla del negocio;
- no concatenar manualmente strings de fecha y hora;
- recalcular `finAt` en backend desde inicio y duración;
- no aceptar `inicioAt` o `finAt` elegidos directamente por el cliente al crear;
- rechazar un comienzo o intervalo pasado según la semántica contractual;
- admitir solo lunes a sábado;
- exigir inicio igual o posterior a las 08:00;
- exigir fin igual o anterior a las 21:00;
- admitir únicamente 30, 45, 60, 90 o 120 minutos.

Los rangos usan inicio inclusivo y fin exclusivo:

```text
[inicio, fin)
```

Por lo tanto, son válidos dos turnos consecutivos cuando el primero termina
exactamente al comenzar el segundo.

No agregar por intuición:

- tolerancias de llegada;
- intervalos de descanso;
- redondeo obligatorio de inicio;
- horarios propios por prestador;
- feriados automáticos;
- excepciones de agenda.

---

## 9. Consulta de agenda

`GET /turnos` aplica el siguiente alcance:

- administrador, coordinación y secretaría: global;
- profesional: únicamente `profesional_id = actor.id`.

Filtros permitidos:

```text
desde
hasta
prestadorId
pacienteId
consultorioId
servicioId
estado
page
limit
sort
order
```

Reglas:

- `desde` es inclusivo;
- `hasta` es exclusivo;
- para agenda visual deben enviarse juntos;
- el rango visual no supera 31 días;
- fechas civiles se interpretan en la zona del centro;
- default de paginación: página 1 y límite 20;
- límite máximo: 100;
- `sort` solo admite `inicioAt`, `estado` o `createdAt`;
- el orden inicial de agenda es `inicioAt asc`;
- un profesional no puede ampliar su scope con `prestadorId`;
- los filtros fuera de scope se rechazan conforme al contrato con
  `FORBIDDEN_FILTER`; no deben ignorarse silenciosamente si eso contradice la
  especificación vigente;
- todas las listas se construyen con columnas e includes explícitos.

La agenda consulta solo el intervalo solicitado. No cargar todo el historial
para filtrar en memoria.

### Proyección de evento

El listado contiene solamente:

- `id`;
- `inicioAt`, `finAt`, `duracionMinutos`;
- `estado`;
- paciente con `id` y `nombreCompleto`;
- prestador con `id` y `nombreCompleto`;
- servicio con `id` y `nombre`;
- consultorio con `id` y `nombre`.

El listado nunca contiene:

- `observacionAdministrativa`;
- `notasInternas`;
- autoría de creación;
- cancelación;
- timestamps de sistema.

---

## 10. Disponibilidad orientativa

`GET /turnos/disponibilidad` requiere:

- `fecha`;
- `duracionMinutos`;
- al menos uno entre `prestadorId` y `consultorioId`.

Puede recibir ambos identificadores. La disponibilidad:

- respeta lunes a sábado y la franja 08:00–21:00;
- considera los estados bloqueantes vigentes;
- devuelve intervalos locales legibles;
- no crea reservas temporales;
- no abre una transacción de creación;
- no garantiza que el paciente esté disponible;
- no reemplaza la comprobación completa de `POST /turnos`;
- puede quedar obsoleta inmediatamente por otra solicitud.

Si se proporcionan prestador y consultorio, no inventar precedencia ni semántica
de combinación mientras no esté documentada. Tampoco inventar la granularidad
de comienzos disponibles. La duración admitida no define por sí sola saltos de
15, 30 o 60 minutos.

---

## 11. Creación de turnos

### Entrada

```json
{
  "pacienteId": "uuid",
  "profesionalId": "uuid",
  "servicioId": "uuid",
  "consultorioId": "uuid",
  "fecha": "2026-08-01",
  "horaInicio": "10:30",
  "duracionMinutos": 60,
  "observacionAdministrativa": "Traer documentación.",
  "notasInternas": null
}
```

El cliente no puede enviar:

- `id`;
- `estado`;
- `inicioAt` o `finAt`;
- actores de creación o cancelación;
- timestamps;
- nombres o proyecciones anidadas.

El estado inicial siempre es `pendiente`.

### Validaciones de negocio

Aplicar, sin depender únicamente de su orden:

1. actor autorizado;
2. paciente existente y activo;
3. prestador existente, activo y con rol `profesional` o `coordinacion`;
4. servicio existente y activo;
5. consultorio existente y activo;
6. fecha y hora no pasadas;
7. día entre lunes y sábado;
8. intervalo dentro de 08:00–21:00;
9. duración permitida;
10. policy del vínculo prestador-paciente;
11. permiso de escritura por campo;
12. ausencia orientativa de solapamientos;
13. escritura final protegida por PostgreSQL.

No confiar en el UUID para autorizar ni revelar si un recurso ajeno existe
cuando el criterio contractual exige ocultarlo.

### Reglas del actor

#### Profesional

- solo crea un turno propio;
- `profesionalId` debe ser `actor.id`;
- necesita vínculo activo previo con el paciente;
- no puede crear automáticamente ese vínculo desde Turnos;
- puede elegir cualquier servicio activo;
- puede escribir `notasInternas` únicamente en su propio turno.

#### Coordinación

- puede crear turnos propios o ajenos;
- puede actuar como prestador;
- crea automáticamente el vínculo si falta;
- puede escribir `notasInternas`.

#### Administrador y secretaría

- crean para cualquier prestador activo;
- no se asignan a sí mismos como prestadores;
- crean automáticamente el vínculo si falta;
- no pueden escribir `notasInternas`, ni siquiera en un turno ajeno que
  administran.

Si un actor sin permiso envía `notasInternas`, incluso explícitamente como
`null`, no eliminar silenciosamente el campo. Aplicar
`TURNO_NOTAS_INTERNAS_DENEGADAS` conforme al contrato y sus schemas vigentes.

---

## 12. Vínculo prestador-paciente

El vínculo automático es parte del caso de uso de creación del turno.

Reglas:

- profesional: exige vínculo activo ya existente;
- administrador, coordinación y secretaría: crean el vínculo si falta;
- no duplicar un vínculo activo;
- no reactivar ni sobrescribir historial sin la regla aprobada del módulo
  Vínculos;
- el vínculo creado automáticamente no expira al completar o cancelar el turno;
- vínculo, turno y auditoría utilizan la misma transacción;
- si el turno falla por cualquier motivo, el vínculo nuevo también se revierte;
- registrar `PRESTADOR_VINCULADO_AUTOMATICAMENTE` sin datos sensibles cuando se
  crea el vínculo.

Turnos debe coordinar una función pública y acotada de Vínculos. No duplicar su
lógica interna ni importar sus controllers.

---

## 13. Estados y transiciones

Estados válidos:

```text
pendiente
confirmado
completado
cancelado
ausente
```

Transiciones permitidas:

```text
pendiente  → confirmado
pendiente  → cancelado
confirmado → completado
confirmado → ausente
confirmado → cancelado
```

Todo lo demás produce:

```text
409 TURNO_TRANSICION_INVALIDA
```

Reglas:

- el estado no se edita directamente;
- cada transición posee un endpoint específico;
- `completado`, `cancelado` y `ausente` son terminales;
- una transición terminal no se revierte;
- completar o marcar ausente exige que `inicioAt` ya haya ocurrido;
- confirmar no cambia el intervalo ni crea un nuevo turno;
- confirmar conserva el bloqueo de agenda;
- cancelar libera el intervalo porque el estado deja de participar en la
  exclusión temporal.

### Cancelación

Cancelar exige:

- estado actual `pendiente` o `confirmado`;
- motivo no vacío dentro del límite contractual;
- actor autenticado;
- instante automático;
- auditoría en la misma operación.

Persistir de forma coherente:

```text
estado = cancelado
cancelado_at
cancelado_por
motivo_cancelacion
```

No eliminar el turno cancelado ni borrar sus relaciones históricas.

---

## 14. Sin edición estructural ni reprogramación

No se modifican después de crear:

- paciente;
- prestador;
- servicio;
- consultorio;
- fecha;
- hora;
- duración;
- `inicioAt`;
- `finAt`.

Para cambiar cualquiera de esos datos:

1. cancelar el turno original con motivo;
2. crear un turno nuevo con otro UUID;
3. conservar ambos historiales;
4. auditar ambas operaciones.

No agregar `turnoOrigenId`, endpoint genérico, drag-and-drop, resize ni una
actualización directa como solución incidental. La correlación explícita entre
turnos no forma parte del MVP.

---

## 15. Observación administrativa y notas internas

### Observación administrativa

Puede verla y editarla:

- administrador;
- coordinación;
- secretaría;
- prestador responsable.

Solo se modifica mediante el endpoint específico y mientras el turno no sea
terminal. Puede establecerse en `null`.

### Notas internas

Puede verlas y editarlas únicamente:

- coordinación;
- prestador responsable.

Reglas:

- nunca aparecen en listados;
- se omiten por completo para administrador y secretaría;
- no enviarlas como `null` a un actor no autorizado;
- no seleccionarlas desde PostgreSQL si la proyección no las permite;
- no incluirlas en logs, auditoría, JWT, métricas ni mensajes de error;
- no permitir que un profesional lea o modifique notas de un turno ajeno;
- solo se modifican mientras el turno no sea terminal.

Los cambios se auditan mediante el tipo de evento, no copiando el contenido.

---

## 16. Permisos por acción, fila y campo

| Acción | Administrador | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Consultar agenda | Global | Global | Global | Propia |
| Consultar disponibilidad | Global | Global | Global | Global |
| Ver detalle | Global | Global | Global | Propio |
| Crear para cualquier prestador | Sí | Sí | Sí | No |
| Crear turno propio | N/A | Sí | N/A | Sí |
| Confirmar | Global | Global | Global | Propio |
| Cancelar | Global | Global | Global | Propio |
| Completar | Global | Global | Global | Propio |
| Marcar ausente | Global | Global | Global | Propio |
| Editar observación | Global | Global | Global | Propio |
| Leer/editar notas internas | No | Global | No | Propio |

“Global” no elimina la policy del recurso ni la proyección de campos.

Un permiso general como `appointments.manageOwn` no demuestra que el turno
consultado pertenezca al actor. El service debe verificar el recurso concreto.

Filtros, includes, ordenamiento y acceso directo por UUID deben conservar el
mismo scope. No cargar el recurso sin scope para decidir luego en el controller.

---

## 17. Proyección de detalle

El detalle autorizado agrega a la proyección de evento:

- `observacionAdministrativa`;
- `notasInternas` solo cuando corresponde;
- `creadoPor` con proyección mínima;
- `cancelacion` cuando corresponde;
- `createdAt`;
- `updatedAt`.

La cancelación expone únicamente:

- motivo;
- `canceladoAt`;
- `canceladoPor` con proyección mínima.

No incluir ficha clínica, diagnóstico, observaciones del paciente, datos de
contacto del tutor, DNI, email ni teléfono dentro del evento o detalle del
turno. Si la interfaz necesita la ficha, debe consultar el recurso Paciente con
su policy propia.

---

## 18. Integridad temporal en PostgreSQL

Los estados bloqueantes son:

```text
pendiente
confirmado
```

Los estados que no bloquean son:

```text
completado
cancelado
ausente
```

La base debe impedir intervalos superpuestos `[inicio_at, fin_at)` para el mismo:

- `profesional_id`;
- `paciente_id`;
- `consultorio_id`.

Utilizar constraints de exclusión PostgreSQL con el mecanismo y extensiones
aprobados por el modelo de datos y las migraciones vigentes.

Además, PostgreSQL debe sostener al menos:

- estado válido;
- duración permitida;
- `fin_at > inicio_at`;
- coherencia entre fin, inicio y duración;
- integridad de claves foráneas;
- coherencia de los campos de cancelación.

No:

- reemplazar exclusiones con consultas previas;
- eliminar constraints para hacer pasar pruebas;
- utilizar locks globales como sustituto automático;
- usar `constraints: false`;
- permitir que hooks oculten la transición;
- suponer que una transacción sola evita el solapamiento.

Los nombres y expresiones exactos deben coincidir con migraciones y
`modelo-datos.md`. No inventarlos si esos archivos aún no los definen.

---

## 19. Concurrencia al crear

Flujo obligatorio:

1. validar forma y permisos;
2. comprobar recursos y disponibilidad para ofrecer errores claros;
3. abrir la transacción del caso de uso;
4. crear el vínculo automático cuando corresponda;
5. intentar insertar el turno;
6. dejar que PostgreSQL aplique las exclusiones;
7. registrar auditoría dentro de la misma transacción;
8. confirmar todo o revertir todo;
9. traducir el conflicto conocido a `409`.

Conflictos contractuales:

```text
TURNO_CONFLICTO_PROFESIONAL
TURNO_CONFLICTO_PACIENTE
TURNO_CONFLICTO_CONSULTORIO
```

La clasificación interna puede utilizar el código PostgreSQL y un nombre de
constraint controlado. Nunca devolver al cliente:

- nombre del constraint;
- SQL;
- tabla o columnas;
- parámetros;
- mensaje crudo de Sequelize/PostgreSQL;
- stack trace.

Una inserción puede violar conceptualmente más de una exclusión. Mientras no se
apruebe una prioridad contractual, no prometer cuál de los tres códigos se
devuelve primero en ese escenario.

---

## 20. Concurrencia en transiciones

Dos solicitudes simultáneas no pueden producir transiciones incompatibles ni
auditorías parciales sobre el mismo turno.

La implementación debe garantizar de forma atómica que:

- la transición parte del estado esperado;
- solo una transición incompatible resulta exitosa;
- el estado y su auditoría se confirman juntos;
- una cancelación registra todos sus campos o ninguno;
- completar y marcar ausente comprueban el inicio con un reloj consistente.

La estrategia exacta —bloqueo de fila, actualización condicional u otra opción
equivalente— debe estar aprobada antes de implementarse. No cambiar globalmente
el nivel de aislamiento ni agregar locks por intuición.

Agregar pruebas simultáneas para, como mínimo:

- confirmar frente a cancelar;
- completar frente a ausente;
- dos cancelaciones;
- edición de campo frente a transición terminal.

---

## 21. Transacciones

El service dueño del caso de uso abre la transacción y pasa la misma instancia
a todas las operaciones relacionadas.

Casos obligatorios:

- vínculo automático + turno + auditoría;
- transición de estado + auditoría;
- cancelación + datos de cancelación + auditoría;
- edición de observación + auditoría;
- edición de nota interna + auditoría.

Reglas:

- no abrir transacciones independientes dentro de otra;
- no confirmar resultados parciales;
- no capturar un error para continuar silenciosamente;
- mantener la transacción breve;
- no realizar llamadas externas irreversibles dentro de ella;
- respetar un orden consistente de adquisición de recursos;
- permitir rollback completo ante cualquier error.

---

## 22. Auditoría

Eventos mínimos:

```text
TURNO_CREADO
TURNO_CONFIRMADO
TURNO_CANCELADO
TURNO_COMPLETADO
TURNO_AUSENTE
TURNO_OBSERVACION_EDITADA
TURNO_NOTA_INTERNA_EDITADA
```

La auditoría registra actor, acción, recurso, resultado, instante, correlation ID
y metadatos mínimos sanitizados.

No registrar:

- contenido de `observacionAdministrativa`;
- contenido de `notasInternas`;
- motivo completo de cancelación salvo aprobación normativa específica;
- datos clínicos o del tutor;
- cuerpos HTTP;
- SQL o errores crudos.

La auditoría exitosa comparte transacción con el cambio. El tratamiento de
intentos fallidos sigue la estrategia transversal aprobada y no debe romper el
rollback.

---

## 23. Errores funcionales

Utilizar exactamente los códigos documentados en `docs/contrato-api.md`.

Casos centrales:

```text
TURNO_NO_ENCONTRADO
TURNO_ACCESO_DENEGADO
TURNO_PRESTADOR_AJENO
TURNO_NOTAS_INTERNAS_DENEGADAS
TURNO_CONFLICTO_PROFESIONAL
TURNO_CONFLICTO_PACIENTE
TURNO_CONFLICTO_CONSULTORIO
TURNO_HORARIO_INVALIDO
TURNO_FECHA_INVALIDA
TURNO_DURACION_INVALIDA
TURNO_TRANSICION_INVALIDA
TURNO_TERMINAL_INMUTABLE
TURNO_AUN_NO_COMENZO
MOTIVO_CANCELACION_REQUERIDO
PACIENTE_NO_VINCULADO
```

También pueden corresponder errores de existencia o estado de paciente,
prestador, servicio y consultorio.

Reglas:

- `409` para solapamiento o conflicto de estado;
- `422` para reglas de negocio sintácticamente válidas;
- `403` o `404` según el criterio contractual de ocultación;
- `500 INTERNAL_ERROR` para una violación inesperada;
- no depender únicamente del texto humano del motor;
- no exponer información interna.

No crear `SERVICIO_NO_ASIGNADO` para Turnos.

---

## 24. Consultas e índices

Las consultas deben:

- seleccionar columnas autorizadas;
- aplicar scope desde el inicio;
- incluir solo relaciones requeridas;
- evitar N+1;
- paginar listados;
- limitar el rango de agenda;
- utilizar listas blancas para `sort` y `order`;
- cancelar o ignorar correctamente resultados obsoletos en consumidores, sin
  relajar el contrato backend;
- parametrizar cualquier SQL literal.

Antes de agregar un índice, identificar el endpoint, filtros, joins,
ordenamiento, selectividad y volumen que lo justifican.

Revisar especialmente consultas por:

- inicio;
- prestador + inicio;
- paciente + inicio;
- consultorio + inicio;
- estado + inicio;
- servicio + inicio.

No duplicar índices provistos por constraints ni agregar GiST, GIN o índices
parciales sin la justificación aprobada. Verificar planes en un entorno
controlado y recordar que `EXPLAIN ANALYZE` ejecuta la consulta.

---

## 25. Datos sensibles y logging

Turnos puede relacionarse con información personal y clínica, pero la agenda
solo expone su proyección contractual mínima.

Está prohibido registrar:

- nombres completos de pacientes en logs ordinarios;
- contenido de observaciones o notas;
- datos del tutor;
- diagnósticos;
- cuerpos completos;
- SQL con valores;
- IDs combinados con contenido sensible cuando no sean necesarios.

Los logs técnicos pueden incluir ruta normalizada, status, duración,
`correlationId` y código funcional sanitizado.

No utilizar datos reales en seeders, fixtures, capturas, planes de consulta o
pruebas.

---

## 26. Exclusiones del MVP

No agregar:

- vista mensual como regla del backend;
- horarios personalizados por prestador;
- recurrencia;
- reservas públicas;
- acceso de pacientes o tutores;
- bloqueos manuales de agenda;
- feriados automáticos;
- listas de espera;
- sobreturnos;
- drag-and-drop;
- resize;
- edición estructural;
- reprogramación;
- eliminación física;
- relación `turno_origen_id`;
- notificaciones automáticas por email, WhatsApp o push.

Una petición de frontend no autoriza a ampliar el dominio backend.

---

## 27. Pruebas obligatorias

### Horarios y fechas

- lunes a sábado válidos;
- domingo rechazado;
- fecha/hora pasada rechazada;
- inicio antes de 08:00 rechazado;
- fin después de 21:00 rechazado;
- cinco duraciones permitidas;
- otras duraciones rechazadas;
- conversión local a UTC;
- `finAt` calculado por backend;
- dos intervalos consecutivos aceptados.

### Permisos y alcance

- roles globales consultan cualquier agenda;
- profesional solo consulta y administra la propia;
- profesional no fuerza `profesionalId` ajeno;
- acceso directo por UUID ajeno se rechaza;
- filtros no amplían scope;
- administrador y secretaría no reciben notas internas;
- profesional ajeno no recibe ni modifica notas;
- coordinación y responsable acceden según policy;
- profesional necesita paciente vinculado;
- roles autorizados crean vínculo automático.

### Creación

- recursos activos aceptados;
- recursos inexistentes e inactivos traducidos;
- servicio activo habitual aceptado;
- servicio activo no habitual aceptado;
- `SERVICIO_NO_ASIGNADO` ausente;
- estado inicial `pendiente`;
- campos derivados no aceptados;
- permiso de `notasInternas` aplicado incluso con `null` explícito;
- rollback del vínculo si falla el turno;
- auditoría atómica y sanitizada.

### Estados

- todas las transiciones válidas;
- todas las transiciones inválidas;
- completar y ausente antes del inicio rechazados;
- cancelación sin motivo rechazada;
- cancelación registra actor e instante;
- cancelar libera el intervalo;
- terminales inmutables;
- no existe endpoint de reprogramación ni edición genérica.

### Agenda y proyecciones

- `desde` inclusivo y `hasta` exclusivo;
- rango mayor a 31 días rechazado;
- paginación y orden contractual;
- proyección de listado mínima;
- detalle omite campos no autorizados;
- ausencia de datos clínicos y del tutor;
- disponibilidad no crea reservas;
- combinaciones aprobadas de filtros.

### Concurrencia con PostgreSQL real

- dos turnos simultáneos solapan prestador;
- dos turnos simultáneos solapan paciente;
- dos turnos simultáneos solapan consultorio;
- turnos consecutivos no se bloquean;
- turno cancelado no bloquea;
- vínculo automático revierte al perder la carrera;
- transiciones simultáneas incompatibles no producen resultados parciales;
- errores se traducen sin exponer constraints.

No reemplazar estas pruebas con mocks de Sequelize ni con dos operaciones
secuenciales.

---

## 28. Acciones prohibidas

No realizar ninguna de estas acciones:

- utilizar `sequelize.sync()`;
- sustituir PostgreSQL por SQLite en integración;
- verificar disponibilidad solo en JavaScript;
- eliminar o debilitar exclusiones temporales;
- permitir solapamiento deliberado sin decisión normativa;
- exigir servicio habitual;
- emitir `SERVICIO_NO_ASIGNADO`;
- permitir que el profesional cree para otro prestador;
- crear automáticamente un vínculo para un profesional sin acceso previo;
- devolver notas internas a administrador o secretaría;
- incluir notas internas en listados;
- devolver instancias Sequelize completas;
- autorizar por UUID o por datos del cliente;
- aceptar estado, inicio, fin o actores derivados desde el body;
- editar estructura de un turno existente;
- agregar reprogramación o eliminación;
- revertir estados terminales;
- cancelar sin motivo;
- registrar contenido sensible en logs o auditoría;
- realizar SQL dinámico no parametrizado;
- exponer nombres de constraints o SQL;
- inventar granularidad o precedencia de disponibilidad;
- declarar segura la concurrencia sin pruebas simultáneas reales.

---

## 29. Procedimiento de trabajo

### Antes del cambio

1. Leer `api/AGENTS.md` y este archivo.
2. Consultar arquitectura, contrato, matriz y modelo de datos.
3. Leer instrucciones de base de datos y del módulo relacionado.
4. Inspeccionar migraciones, modelo Turno, asociaciones y tests existentes.
5. Identificar endpoint, actor, scope, campos y transición afectados.
6. Revisar zona horaria, intervalo y estados bloqueantes.
7. Revisar límites transaccionales y concurrencia.
8. Comprobar si existe una decisión pendiente.
9. Detener y solicitar definición cuando corresponda.

### Durante el cambio

1. Mantener routes, validation, controller, service, policy y proyección
   separados.
2. Reutilizar utilidades temporales centralizadas.
3. Aplicar policy antes de exponer campos o modificar el recurso.
4. Usar una transacción en operaciones compuestas.
5. Conservar PostgreSQL como garantía final.
6. Traducir errores al contrato.
7. Auditar sin copiar contenido.
8. Agregar pruebas proporcionales al riesgo.
9. Actualizar únicamente la documentación afectada.

### Después del cambio

1. Ejecutar lint.
2. Ejecutar pruebas unitarias.
3. Ejecutar integración contra PostgreSQL real.
4. Ejecutar concurrencia cuando se tocó creación, estados o constraints.
5. Migrar una base de prueba desde cero si cambió el esquema.
6. Verificar proyecciones por rol y campo.
7. Inspeccionar logs y auditoría de prueba.
8. Verificar códigos y envelopes.
9. Confirmar que endpoints excluidos siguen ausentes.
10. Informar comandos, resultados y validaciones omitidas.

No declarar la tarea terminada si las validaciones relevantes no se ejecutaron.

---

## 30. Definition of Done

Un cambio de Turnos está completo solamente cuando:

- respeta los diez endpoints contractuales;
- no agrega edición, reprogramación ni eliminación;
- conserva los cinco estados y transiciones aprobadas;
- mantiene `pendiente` como estado inicial;
- usa la zona `America/Argentina/Cordoba` para interpretar entradas;
- persiste instantes UTC;
- calcula `finAt` en backend;
- respeta lunes a sábado, 08:00–21:00 y duraciones cerradas;
- mantiene intervalos `[inicio, fin)`;
- acepta cualquier servicio activo;
- no exige servicio habitual;
- aplica scope global o propio correctamente;
- protege acceso por recurso y por campo;
- no expone notas internas a administrador o secretaría;
- mantiene listado y detalle como proyecciones diferentes;
- crea vínculo automático solo para actores autorizados;
- confirma vínculo, turno y auditoría de forma atómica;
- PostgreSQL impide los tres tipos de solapamiento;
- los conflictos internos se traducen a códigos funcionales;
- las transiciones concurrentes no generan resultados parciales;
- los terminales permanecen inmutables;
- la cancelación conserva historia y libera el horario;
- logs y auditoría no contienen datos sensibles;
- pruebas relevantes pasan contra PostgreSQL real;
- concurrencia se prueba cuando corresponde;
- lint pasa;
- documentación, migraciones, modelos y tests afectados están sincronizados;
- toda decisión pendiente continúa visible y no fue inventada.

---

## 31. Decisiones pendientes

No resolver por cuenta propia:

1. precedencia o intersección exacta cuando disponibilidad recibe a la vez
   `prestadorId` y `consultorioId`;
2. granularidad de los comienzos ofrecidos por disponibilidad;
3. alineación obligatoria de `horaInicio`, si existiera, a intervalos de 15 o
   30 minutos;
4. prioridad del código funcional cuando una creación entra en conflicto
   simultáneamente por más de un recurso;
5. estrategia exacta para serializar transiciones concurrentes;
6. política sobre correcciones administrativas excepcionales de un turno
   terminal;
7. incorporación futura de horarios propios, descansos, feriados o bloqueos;
8. límites definitivos de longitud de observaciones y notas si no aparecen en
   el contrato/modelo vigente;
9. nombres definitivos de constraints si aún no están fijados en migraciones y
   `modelo-datos.md`;
10. comportamiento exacto de disponibilidad cuando solo se filtra consultorio
    y existen múltiples prestadores posibles;
11. reloj o abstracción temporal común para pruebas de transiciones;
12. estrategia de auditoría de intentos fallidos sin romper rollback.

Cuando una tarea dependa de uno de estos puntos:

1. detener únicamente la parte afectada;
2. explicar el riesgo y las opciones;
3. señalar contrato, modelo, permisos y pruebas que cambiarían;
4. solicitar una decisión explícita;
5. no completar el vacío con una convención personal, del ORM o de la librería
   de calendario.
