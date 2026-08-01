# AGENTS.md — Vínculos

## 1. Alcance y precedencia

Estas instrucciones se aplican a:

```text
api/src/modules/vinculos/
```

También deben respetarse al modificar componentes relacionados:

```text
api/src/modules/pacientes/
api/src/modules/usuarios/
api/src/modules/turnos/
api/src/modules/informes/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/permissions/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`. Antes de modificar Vínculos,
consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/modules/pacientes/AGENTS.md
api/src/modules/usuarios/AGENTS.md
api/src/modules/turnos/AGENTS.md
api/src/modules/informes/AGENTS.md
api/src/modules/auditoria/AGENTS.md
api/src/shared/database/AGENTS.md
```

Si alguno no existe en el checkout, no inventar su contenido. Aplicar las
decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. este archivo especializado;
4. `api/AGENTS.md`.

Ante una contradicción, detener únicamente la parte afectada y solicitar una
decisión. No cambiar el contrato, el modelo o la matriz de permisos para
justificar una implementación incompatible.

---

## 2. Comandos habituales

Ejecutar desde `api/` y comprobar primero que cada script exista en
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
- crear el esquema de pruebas mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- usar usuarios, pacientes, UUID, turnos y motivos completamente ficticios;
- no imprimir bodies, nombres personales, datos clínicos ni modelos completos;
- probar acceso directo por UUID para detectar IDOR;
- probar rollback en altas y cierres transaccionales;
- probar la unicidad parcial con solicitudes simultáneas reales;
- probar la carrera entre desvinculación y creación de turno;
- no afirmar seguridad concurrente solo a partir de pruebas secuenciales;
- no rediseñar Pacientes, Usuarios, Turnos o Informes como parte incidental de
  una tarea de Vínculos.

---

## 3. Decisiones obligatorias del MVP

```text
Relación:                    prestador-paciente
Prestadores permitidos:     coordinacion y profesional
Paciente receptor:          activo al crear
Prestador receptor:         activo al crear
Alta:                       manual o automática autorizada
Duración:                   permanente hasta cierre autorizado
Historial:                  múltiples períodos por pareja
Vínculo activo por pareja:  exactamente cero o uno
Desvinculación manual:      admin, coordinacion o secretaria
Motivo de cierre:           obligatorio
Eliminación física:         no existe
```

Reglas centrales:

- Vínculos no es un CRUD genérico.
- Un vínculo activo concede al profesional acceso al paciente dentro de las
  policies de los módulos que lo consultan.
- Coordinación también es prestador, aunque posea alcance operativo global.
- Administrador y secretaría nunca son prestadores.
- El vínculo puede originarse por alta manual, alta de paciente realizada por
  un profesional o creación autorizada de un turno.
- El vínculo no expira al completar, cancelar o marcar ausente un turno.
- El vínculo automático es permanente hasta una desvinculación o cierre
  autorizado.
- Un profesional no puede auto-vincularse a un paciente ajeno mediante el
  endpoint manual.
- Un profesional ya vinculado puede sumar a otro prestador activo.
- Solo administrador, coordinación o secretaría pueden desvincular manualmente.
- La desvinculación exige motivo y ausencia de turnos futuros `pendiente` o
  `confirmado` entre esa pareja.
- Cerrar un vínculo elimina el acceso dependiente de él de forma inmediata.
- Cerrar no elimina ni sobrescribe la fila histórica.
- Un período histórico cerrado no se reactiva ni se reutiliza.
- La reanudación posterior crea una nueva fila y un nuevo período.
- Los permisos del frontend no sustituyen las policies del backend.

> Decisión contraintuitiva: un profesional vinculado puede incorporar a otro
> prestador, pero no puede desvincular a ninguno, ni siquiera a sí mismo.

> Decisión contraintuitiva: crear o completar un turno no determina la vida del
> vínculo. El turno puede originarlo, pero nunca lo cierra automáticamente.

> Decisión contraintuitiva: el historial admite varias filas para la misma
> pareja; la unicidad se aplica solo al vínculo activo.

No ampliar el módulo con prestador principal, porcentajes, prioridades,
vencimiento, solicitudes pendientes, invitaciones, aprobaciones, derivaciones,
reasignación automática, acceso temporal ni eliminación física sin una decisión
contractual previa.

---

## 4. Responsabilidad y límites del módulo

`vinculos` es dueño de:

- consulta de vínculos activos e históricos autorizados;
- alta manual de una relación prestador-paciente;
- creación automática reutilizable desde casos de uso autorizados;
- cierre manual de un vínculo;
- cierre interno solicitado por el caso de uso de Usuarios;
- conservación de períodos históricos;
- validación de unicidad activa;
- funciones internas para exigir o comprobar vínculo activo;
- policies y proyección de la relación;
- coordinación con Pacientes, Usuarios, Turnos y Auditoría;
- traducción de constraints conocidas a errores contractuales;
- emisión de eventos funcionales propios.

`vinculos` no es dueño de:

- la creación o edición de pacientes y tutores;
- la activación o desactivación de pacientes;
- el ciclo de vida, rol o sesiones de usuarios;
- la creación, edición o transición de turnos;
- la autoría o el contenido de informes;
- permisos de mensajería;
- servicios habituales del prestador;
- autenticación o autorización HTTP transversal.

Distribución de responsabilidades:

```text
Vínculos  -> relación, historial, existencia activa y cierre
Pacientes -> alta de ficha y vínculo automático del profesional creador
Turnos    -> caso de uso del turno y solicitud de vínculo automático
Usuarios  -> desactivación/cambio de rol y solicitud de cierre masivo
Informes  -> exige vínculo activo según actor y operación
Auditoría -> valida, sanitiza y persiste eventos
```

No duplicar reglas o consultas en otros módulos. Exponer funciones internas
pequeñas, explícitas y transaccionales.

---

## 5. Estructura orientativa

Crear únicamente archivos con responsabilidad real:

```text
src/modules/vinculos/
├── vinculo.routes.js
├── vinculo.validation.js
├── vinculo.controller.js
├── vinculo.service.js
├── vinculo.policy.js
├── vinculo.projection.js
├── vinculo.constants.js
└── AGENTS.md
```

El modelo Sequelize `UsuarioPaciente` permanece centralizado en:

```text
src/shared/database/models/
```

No definir modelos paralelos dentro del módulo ni agregar un Repository aislado
salvo adopción formal del patrón en todo el backend.

---

## 6. Responsabilidades por capa

### Routes

- declaran únicamente métodos y rutas contractuales;
- componen autenticación, autorización, validación y controller;
- no consultan modelos;
- no construyen proyecciones;
- no agregan aliases, `DELETE` ni endpoints globales por usuario;
- mantienen las rutas anidadas bajo el paciente.

### Validation

- valida path, query y body;
- rechaza propiedades inesperadas;
- valida UUID y booleanos;
- exige únicamente `usuarioId` en el alta manual;
- exige únicamente `motivo` al desvincular;
- aplica límites sintácticos al motivo;
- no consulta PostgreSQL;
- no decide si el actor está vinculado;
- no decide si el destinatario es prestador;
- no comprueba turnos futuros.

### Controllers

- reciben datos HTTP ya validados;
- pasan al service valores primitivos y contexto confiable del actor;
- construyen status y envelope contractuales;
- no contienen reglas de acceso, historial o transacción;
- no serializan instancias Sequelize directamente.

### Services

- aplican policies y reglas dependientes de datos;
- consultan los modelos centralizados;
- reciben y propagan transacciones externas cuando el caso de uso pertenece a
  otro módulo;
- abren la transacción cuando Vínculos es dueño del caso de uso;
- coordinan Pacientes, Usuarios, Turnos y Auditoría mediante interfaces
  acotadas;
- traducen constraints conocidas a errores funcionales;
- devuelven datos aptos para la proyección autorizada;
- nunca reciben `req` ni `res`.

### Policies

- autorizan acción, paciente y alcance del actor;
- distinguen roles globales, coordinación y profesional vinculado;
- verifican vínculo activo desde PostgreSQL;
- impiden auto-vinculación manual sin acceso previo;
- impiden que query o body amplíen el scope;
- son explícitas, testeables e independientes del frontend.

### Proyecciones

- construyen objetos nuevos mediante listas positivas;
- transforman nombres `snake_case` a contrato `camelCase`;
- incluyen únicamente el resumen autorizado del prestador;
- excluyen actores internos de alta y cierre;
- no serializan asociaciones completas por conveniencia;
- no parten de un objeto amplio para eliminar campos después.

---

## 7. Endpoints contractuales

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/v1/pacientes/:pacienteId/vinculos` | Roles globales o profesional vinculado. |
| `POST` | `/api/v1/pacientes/:pacienteId/vinculos` | Roles globales o profesional ya vinculado. |
| `PATCH` | `/api/v1/pacientes/:pacienteId/vinculos/:usuarioId/desvincular` | Administrador, coordinación o secretaría. |

No existen en el MVP:

```text
GET    /api/v1/vinculos
GET    /api/v1/vinculos/:id
PUT    /api/v1/vinculos/:id
PATCH  /api/v1/vinculos/:id
DELETE /api/v1/vinculos/:id

GET    /api/v1/usuarios/:id/pacientes
POST   /api/v1/usuarios/:id/pacientes
DELETE /api/v1/pacientes/:pacienteId/vinculos/:usuarioId
```

Las funciones de creación automática y cierre masivo son interfaces internas,
no endpoints adicionales.

---

## 8. Proyección contractual

La proyección de vínculo es:

```json
{
  "id": "uuid",
  "pacienteId": "uuid",
  "prestador": {
    "id": "uuid",
    "nombre": "Ana",
    "apellido": "Pérez",
    "titulo": "Lic.",
    "especialidad": "Psicopedagogía",
    "fotoUrl": null
  },
  "activo": true,
  "fechaInicio": "2026-08-01T12:00:00.000Z",
  "fechaFin": null,
  "motivoDesvinculacion": null
}
```

Reglas:

- la respuesta activa usa `fechaFin=null` y
  `motivoDesvinculacion=null`;
- una fila histórica cerrada usa `activo=false`, fecha de fin y motivo;
- el profesional solo consulta vínculos activos, por lo que no recibe motivo ni
  cierre histórico;
- los roles globales pueden recibir la misma forma completa para activos e
  históricos;
- `vinculadoPor`, `desvinculadoPor`, timestamps administrativos y datos
  internos no forman parte de la proyección contractual;
- no incluir paciente completo, tutor, turnos, informes, servicios habituales,
  email, DNI, teléfono o bio del prestador.

Nunca devolver nombres de persistencia como:

```text
usuario_id
paciente_id
fecha_inicio
fecha_fin
vinculado_por
desvinculado_por
motivo_desvinculacion
created_at
updated_at
```

---

## 9. Roles y policies

### 9.1 Roles globales para este módulo

`administrador`, `coordinacion` y `secretaria` pueden:

- consultar vínculos activos de cualquier paciente;
- solicitar historial;
- crear vínculos manuales;
- desvincular con motivo cuando no existen turnos futuros bloqueantes.

El alcance global de coordinación no elimina su condición adicional de
prestador.

### 9.2 Profesional

El profesional puede:

- consultar vínculos activos solo si él mismo mantiene vínculo activo con el
  paciente;
- crear un vínculo para otro prestador solo si ya está vinculado;
- no solicitar historial;
- no desvincular a otro prestador;
- no desvincularse a sí mismo;
- no utilizar el endpoint manual para conseguir acceso inicial.

Policy mínima para consulta o alta manual profesional:

```text
actor.rol = profesional
AND existe usuarios_pacientes activo
    con usuario_id = actor.id
    y paciente_id = pacienteId
```

El `usuarioId` del body identifica al prestador destinatario, nunca al actor ni
al paciente.

No aceptar permisos desde body, query, claims arbitrarios o cachés sin una
estrategia de invalidación aprobada. Aplicar el scope en SQL, no filtrar en
memoria después de cargar relaciones fuera de alcance.

Ante acceso a un paciente fuera del scope, utilizar consistentemente:

```text
403 PACIENTE_ACCESO_DENEGADO
```

o el ocultamiento general aprobado mediante:

```text
404 PACIENTE_NO_ENCONTRADO
```

No variar la respuesta según la existencia real del UUID.

---

## 10. Consulta de vínculos

`GET /pacientes/:pacienteId/vinculos` acepta únicamente:

```text
activo
incluirHistorial
```

Reglas:

- `activo` es boolean y su default es `true`;
- `incluirHistorial` es boolean y su default es `false`;
- solo administrador, coordinación o secretaría pueden solicitar historial;
- un profesional recibe únicamente vínculos activos;
- el profesional no puede usar `activo=false` ni
  `incluirHistorial=true`;
- los filtros prohibidos deben rechazarse, no degradarse silenciosamente;
- la respuesta es no paginada;
- el orden debe ser determinista;
- no incluir asociaciones que multipliquen filas;
- comprobar primero el acceso al paciente y luego proyectar los vínculos.

La combinación exacta de `activo=false` e `incluirHistorial` debe seguir el
contrato y los schemas vigentes. Si la semántica no está definida de forma
unívoca, no inventar si `activo=false` significa solo cerrados o todos los
períodos; resolver la decisión antes de implementar ese caso.

---

## 11. Alta manual

`POST /pacientes/:pacienteId/vinculos` recibe:

```json
{
  "usuarioId": "uuid"
}
```

Validaciones obligatorias:

- el actor supera la policy de creación;
- el paciente existe y está activo;
- el usuario destinatario existe y está activo;
- el destinatario tiene rol `coordinacion` o `profesional`;
- no existe otro vínculo activo para la misma pareja;
- el cliente no fija estado, fechas, actores ni motivo;
- el backend genera el UUID y la fecha de inicio;
- `vinculado_por` recibe al actor autenticado;
- responder `201` con la proyección contractual;
- registrar `PRESTADOR_VINCULADO` en la misma transacción.

Patrón:

```text
BEGIN
  autorizar acceso del actor al paciente
  exigir paciente activo
  exigir destinatario activo y prestador
  crear nuevo período activo
  registrar PRESTADOR_VINCULADO
COMMIT
```

No reactivar una fila histórica mediante `UPDATE`. Una relación reanudada crea
un nuevo período.

---

## 12. Creación automática autorizada

La creación automática es una interfaz interna del módulo, no una excepción
general de seguridad.

Orígenes aprobados:

1. alta de paciente realizada por un profesional;
2. creación de turno por administrador, coordinación o secretaría cuando falta
   el vínculo con el prestador objetivo;
3. creación de turno propio de coordinación cuando falta su vínculo.

Reglas:

- el alta de paciente vincula únicamente al profesional creador;
- el profesional que crea un turno propio necesita vínculo previo;
- un profesional no obtiene acceso inicial mediante creación de turno;
- administrador y secretaría crean el vínculo para el prestador objetivo, no
  para sí mismos;
- coordinación puede originar un vínculo para sí misma o para otro prestador
  dentro del caso de uso autorizado de Turnos;
- paciente y prestador deben estar activos;
- si ya existe vínculo activo, devolverlo o indicar que no fue creado según el
  contrato interno; nunca duplicarlo;
- no reabrir una fila histórica;
- registrar `PRESTADOR_VINCULADO_AUTOMATICAMENTE` solo cuando se insertó una
  nueva fila;
- la operación principal, el vínculo y sus eventos comparten una única
  transacción;
- una falla del caso de uso principal revierte el vínculo nuevo;
- el vínculo confirmado no expira por el resultado posterior del turno.

Firma conceptual, no normativa:

```text
ensureAutomaticLinkWhenAllowed({
  pacienteId,
  prestadorId,
  actor,
  origen,
  correlationId,
  transaction
})
```

`origen` debe ser un valor técnico cerrado definido en constantes internas; no
aceptarlo desde el cliente ni persistir texto libre por intuición.

Vínculos valida la relación. Pacientes o Turnos conservan la propiedad de su
caso de uso y abren la transacción externa.

---

## 13. Modelo e invariantes de persistencia

Tabla:

```text
usuarios_pacientes
```

Campos:

| Campo | Regla |
|---|---|
| `id` | UUID, PK. |
| `usuario_id` | Prestador; FK a `usuarios`. |
| `paciente_id` | FK a `pacientes`. |
| `activo` | Boolean; `true` al crear. |
| `fecha_inicio` | TIMESTAMPTZ; inicio del período. |
| `fecha_fin` | Null mientras está activo; obligatoria al cerrar. |
| `vinculado_por` | Actor de alta; FK nullable por historia. |
| `desvinculado_por` | Actor de cierre; null mientras está activo. |
| `motivo_desvinculacion` | Null activo; obligatorio al cerrar; máximo 500. |
| `created_at`, `updated_at` | Administrados por el sistema. |

Índice obligatorio:

```sql
CREATE UNIQUE INDEX usuarios_pacientes_activo_uq
ON usuarios_pacientes (usuario_id, paciente_id)
WHERE activo = true;
```

Constraint de coherencia obligatoria:

```sql
ALTER TABLE usuarios_pacientes
ADD CONSTRAINT usuarios_pacientes_estado_chk
CHECK (
  (activo = true
    AND fecha_fin IS NULL
    AND desvinculado_por IS NULL
    AND motivo_desvinculacion IS NULL)
  OR
  (activo = false
    AND fecha_fin IS NOT NULL
    AND motivo_desvinculacion IS NOT NULL)
);
```

PostgreSQL es la última defensa de unicidad y coherencia. Una comprobación
previa en JavaScript mejora el feedback, pero no sustituye las constraints.

Traducir únicamente la violación identificada del índice activo a:

```text
409 VINCULO_YA_EXISTE
```

No exponer nombres de constraints, SQL ni parámetros.

---

## 14. Historial y reapertura

Cada fila representa un período de acceso:

```text
inicio ------------------------------ fin
activo=true, fin=null   -> período vigente
activo=false, fin!=null -> período histórico
```

Reglas:

- puede haber varios períodos históricos para la misma pareja;
- solo puede existir un período activo;
- un cierre no cambia `fecha_inicio`;
- una nueva vinculación posterior inserta una fila nueva;
- no borrar o modificar períodos anteriores para simular continuidad;
- no copiar el motivo anterior al período nuevo;
- reactivar un usuario o paciente no reabre relaciones históricas;
- completar, cancelar o marcar ausente un turno no cierra el período;
- la historia conserva referencias aunque el actor de alta o cierre pase a
  `null` por una operación técnica permitida de FK.

No implementar `upsert` que convierta silenciosamente una fila histórica en
activa.

---

## 15. Desvinculación manual

`PATCH /pacientes/:pacienteId/vinculos/:usuarioId/desvincular` recibe:

```json
{
  "motivo": "Cambio de profesional responsable."
}
```

Acceso:

```text
administrador
coordinacion
secretaria
```

Reglas:

- `pacienteId` y `usuarioId` identifican la pareja activa;
- el profesional no puede invocar esta operación;
- el motivo es obligatorio, no vacío y máximo 500 caracteres;
- no aceptar estado, fechas, IDs de actor ni campos adicionales;
- localizar únicamente el vínculo activo de la pareja;
- si no existe, responder `404 VINCULO_NO_ENCONTRADO`;
- comprobar turnos futuros `pendiente` o `confirmado` entre el mismo paciente y
  prestador;
- si existen, responder `409 VINCULO_TIENE_TURNOS_FUTUROS`;
- no cancelar, completar, reasignar ni editar turnos automáticamente;
- cerrar mediante `activo=false`, `fecha_fin`, `desvinculado_por` y motivo;
- la pérdida de acceso dependiente del vínculo es inmediata;
- registrar `PRESTADOR_DESVINCULADO` en la misma transacción;
- responder `200` con la proyección histórica cerrada.

Patrón:

```text
BEGIN
  cargar y bloquear/validar vínculo activo
  comprobar turnos futuros bloqueantes de la pareja
  cerrar el período con actor y motivo
  registrar PRESTADOR_DESVINCULADO
COMMIT
```

No usar `DELETE`, soft delete genérico, `paranoid`, actualización sin condición
de estado ni reapertura del último período.

---

## 16. Turnos futuros bloqueantes

Para una desvinculación manual, solo bloquean los turnos que cumplen
simultáneamente:

```text
turno.paciente_id = pacienteId
turno.profesional_id = usuarioId
turno.estado IN ('pendiente', 'confirmado')
turno pertenece al horizonte futuro según la convención temporal compartida
```

No bloquean por sí solos:

```text
completado
cancelado
ausente
turnos de otro prestador
turnos de otro paciente
```

Reglas:

- consultar dentro de la misma unidad transaccional del cierre;
- no ampliar el bloqueo a cualquier turno del paciente;
- no ampliar el bloqueo a cualquier turno del prestador;
- no interpretar un turno histórico como vínculo activo;
- no permitir que una creación concurrente confirme un turno futuro sobre una
  pareja que acaba de cerrarse;
- no declarar resuelta la carrera sin pruebas concurrentes reales.

La frontera temporal exacta de “futuro” debe reutilizar la convención aprobada
por Turnos. No definir una comparación distinta dentro de Vínculos.

---

## 17. Cierres solicitados por Usuarios

Usuarios puede solicitar el cierre de vínculos activos cuando:

- desactiva a un prestador;
- cambia su rol de prestador a un rol no prestador, según la regla aprobada.

El caso de uso pertenece a Usuarios:

```text
BEGIN en Usuarios
  validar usuario y turnos futuros bloqueantes
  cambiar estado o rol
  revocar sesiones cuando corresponda
  solicitar a Vínculos el cierre de relaciones activas
  registrar evento funcional de Usuarios
COMMIT
```

Reglas para la interfaz interna de cierre:

- recibir y utilizar la transacción de Usuarios;
- no abrir una transacción independiente;
- cerrar todas las relaciones activas afectadas;
- conservar cada fila histórica;
- completar fecha de fin y motivo técnico aprobado;
- no cancelar o reasignar turnos;
- no reabrir relaciones al reactivar el usuario;
- no emitir `PRESTADOR_DESVINCULADO` por cada fila salvo decisión expresa del
  catálogo de auditoría;
- no duplicar `USUARIO_DESACTIVADO` ni otros eventos propios de Usuarios.

El texto canónico del motivo técnico para cierres automáticos y el contrato de
auditoría por lote son decisiones pendientes. No persistir motivo vacío ni
inventar variantes libres.

---

## 18. Estado de paciente y prestador

Para crear un vínculo, ambos recursos deben estar activos:

```text
paciente.activo = true
prestador.activo = true
prestador.rol IN ('coordinacion', 'profesional')
```

Errores contractuales:

```text
422 PACIENTE_INACTIVO
422 USUARIO_INACTIVO
422 USUARIO_NO_ES_PRESTADOR
```

Reglas:

- un paciente inactivo no admite nuevos vínculos;
- reactivar un paciente no reabre vínculos históricos;
- un usuario inactivo no recibe vínculos;
- activar un usuario no reconstruye relaciones cerradas;
- cambiar un rol no transforma el historial ni reasigna pacientes;
- administrador y secretaría no pueden convertirse en destinatarios por tener
  alcance global;
- coordinación es destinatario válido aun cuando su especialidad sea `null`.

La documentación vigente no ordena cerrar automáticamente todos los vínculos
al desactivar un paciente. No agregar ese efecto sin decisión expresa y sin
definir motivo, auditoría y tratamiento concurrente.

---

## 19. Efecto sobre autorizaciones

El vínculo activo es una condición de acceso, no una copia de permisos.

Lo consumen, entre otros:

- Pacientes, para listar, consultar y editar dentro del scope profesional;
- Informes, para listar, leer o crear según actor y contrato;
- Turnos, para la creación propia de un profesional;
- Vínculos, para permitir consulta o incorporación por un profesional.

Reglas:

- comprobar la relación vigente en PostgreSQL;
- no confiar en una lista de pacientes enviada por el cliente;
- no almacenar UUID de pacientes autorizados dentro del token;
- no conservar acceso por haber existido un vínculo histórico;
- no conceder acceso solo por ser autor de un turno o informe, salvo policy
  expresa del módulo dueño;
- no asumir que una conversación asociada al paciente depende del vínculo;
- una conversación preexistente se rige por sus participantes, no por este
  módulo.

Cerrar la relación impide nuevas operaciones dependientes del vínculo desde el
commit. El tratamiento de una operación que ya estaba en curso requiere la
estrategia concurrente aprobada de cada caso de uso.

---

## 20. Funciones internas recomendadas

Las interfaces internas deben ser pequeñas y explícitas. Ejemplos conceptuales:

```text
hasActiveLink({ pacienteId, prestadorId, transaction })
requireActiveLink({ pacienteId, prestadorId, transaction })
createManualLink({ pacienteId, prestadorId, actor, correlationId })
ensureAutomaticLinkWhenAllowed({ ..., transaction })
closeActiveLink({ pacienteId, prestadorId, actor, motivo, correlationId })
closeAllForProvider({ prestadorId, actor, motivoTecnico, transaction })
```

Reglas:

- no exportar controllers, routes o modelos como interfaz de dominio;
- distinguir comprobación booleana de exigencia que lanza error;
- exigir contexto de actor en acciones que deciden permisos o auditoría;
- exigir transacción en funciones que participan de un caso de uso externo;
- no aceptar un flag genérico como `skipAuthorization`;
- no aceptar `automatic=true` sin un origen cerrado y una policy interna;
- no ocultar escrituras o auditoría en getters.

Los nombres definitivos deben seguir la convención del proyecto. No crear todas
las funciones si todavía no existe un consumidor real.

---

## 21. Transacciones y concurrencia

| Operación | Dueño de transacción | Unidad funcional |
|---|---|---|
| Alta manual | Vínculos | Vínculo y auditoría. |
| Alta por paciente | Pacientes | Paciente, tutor, vínculo y eventos. |
| Alta por turno | Turnos | Vínculo, turno y eventos. |
| Desvinculación manual | Vínculos | Validación, cierre y auditoría. |
| Cierre por usuario | Usuarios | Usuario/rol, sesiones, vínculos y auditoría. |

Reglas:

- propagar una única instancia `{ transaction }`;
- no crear transacciones internas independientes cuando otro módulo es dueño;
- no confirmar un vínculo si falla el caso de uso principal;
- no confirmar un cierre si falla su evento exitoso obligatorio;
- no ocultar escrituras críticas en hooks;
- no confiar solo en `findOne` antes de crear;
- traducir únicamente constraints identificadas;
- mantener la transacción breve;
- no agregar locks, nivel de aislamiento, advisory locks o reintentos por
  intuición.

Carreras mínimas a contemplar:

1. dos altas manuales simultáneas para la misma pareja;
2. alta manual y alta automática simultáneas;
3. dos turnos que intentan crear el mismo vínculo;
4. desvinculación frente a creación de turno futuro;
5. cierre masivo por desactivación frente a alta nueva;
6. reanudación posterior frente a una fila histórica.

El índice parcial garantiza como máximo un vínculo activo por pareja, pero no
resuelve por sí solo la carrera entre cerrar y crear un turno. Si la estrategia
exacta no está aprobada, detener esa parte y documentar la decisión pendiente.

---

## 22. Auditoría y privacidad

Eventos canónicos:

```text
PRESTADOR_VINCULADO
PRESTADOR_VINCULADO_AUTOMATICAMENTE
PRESTADOR_DESVINCULADO
```

Uso:

| Evento | Origen |
|---|---|
| `PRESTADOR_VINCULADO` | Alta manual confirmada. |
| `PRESTADOR_VINCULADO_AUTOMATICAMENTE` | Inserción automática confirmada desde Pacientes o Turnos. |
| `PRESTADOR_DESVINCULADO` | Desvinculación manual confirmada. |

No crear códigos alternativos como:

```text
VINCULO_CREADO
VINCULO_ACTIVADO
VINCULO_CERRADO
PACIENTE_ASIGNADO
PROFESIONAL_ASIGNADO
```

sin ampliar previamente el catálogo normativo.

Metadata permitida mediante lista positiva, cuando el evento la declare:

- UUID del vínculo;
- UUID del paciente;
- UUID del prestador;
- origen técnico cerrado de un vínculo automático;
- estado anterior y nuevo;
- indicador técnico de creación automática;
- cantidad de vínculos cerrados en una operación por lote si se aprueba.

El motivo administrativo completo de desvinculación no debe copiarse a
metadata por conveniencia. Persiste en la relación histórica; Auditoría puede
recibir como máximo un código técnico o indicador expresamente aprobado.

Nunca registrar:

- nombres, apellidos, DNI, email o teléfono;
- diagnóstico, observaciones o datos del tutor;
- contenido de informes;
- detalles, notas o motivos completos de turnos;
- motivo libre completo de desvinculación en metadata o logs;
- requests, responses, bodies o modelos completos;
- SQL, parámetros, constraints o stacks.

Los eventos exitosos comparten transacción y `correlationId` con la operación
funcional. Seguir `api/src/modules/auditoria/AGENTS.md`.

---

## 23. Errores contractuales

```text
400 VALIDATION_ERROR
401 UNAUTHORIZED
403 FORBIDDEN
403 FORBIDDEN_FILTER
403 PACIENTE_ACCESO_DENEGADO
403 VINCULO_CREACION_DENEGADA
404 PACIENTE_NO_ENCONTRADO
404 USUARIO_NO_ENCONTRADO
404 VINCULO_NO_ENCONTRADO
409 VINCULO_YA_EXISTE
409 VINCULO_TIENE_TURNOS_FUTUROS
422 USUARIO_NO_ES_PRESTADOR
422 USUARIO_INACTIVO
422 PACIENTE_INACTIVO
422 MOTIVO_DESVINCULACION_REQUERIDO
```

Reglas:

- usar el envelope general del backend;
- incluir `correlationId` según el contrato;
- no revelar pacientes fuera del scope;
- no revelar si existe un vínculo fuera del scope;
- no incluir datos personales o clínicos en errores;
- no devolver mensajes crudos de PostgreSQL;
- no mapear una violación desconocida a `VINCULO_YA_EXISTE`;
- no convertir ausencia de vínculo en creación automática fuera de un caso de
  uso autorizado.

No agregar `VINCULO_ESTADO_SIN_CAMBIOS` ni otros códigos por analogía si el
contrato no los define.

---

## 24. Integración con otros módulos

### Pacientes

- Pacientes solicita el vínculo automático solo cuando el actor creador es
  profesional.
- Pacientes abre y propaga la transacción del alta conjunta.
- Vínculos no crea ni actualiza paciente o tutor.
- Un paciente inactivo no recibe vínculos nuevos.
- Reactivar un paciente no reabre historial.

### Usuarios

- Usuarios determina si una cuenta activa puede actuar como prestador.
- Solo `coordinacion` y `profesional` son destinatarios válidos.
- Usuarios es dueño de desactivar, cambiar rol y revocar sesiones.
- Vínculos ejecuta el cierre interno dentro de la transacción recibida.
- Activar un usuario no reconstruye relaciones.

### Turnos

- El profesional requiere vínculo previo para crear su turno.
- Administrador, coordinación y secretaría pueden originar el vínculo
  automático permitido por el contrato de Turnos.
- Turnos abre la transacción de vínculo, turno y eventos.
- Vínculos consulta turnos futuros antes de una desvinculación manual.
- Completar o cancelar un turno no cierra el vínculo.
- No cancelar ni reasignar turnos como efecto colateral.

### Informes

- Informes consulta el vínculo activo para el scope profesional.
- Vínculos no crea, edita, finaliza ni proyecta informes.
- Terminar un vínculo no elimina informes históricos.
- El acceso del autor tras finalizar el vínculo sigue la policy aprobada de
  Informes; no se decide desde Vínculos.

### Mensajería

- Vínculos no autoriza participantes ni mensajes.
- Crear una conversación asociada a un paciente no exige vínculo según el
  contrato vigente.
- Una conversación preexistente continúa por reglas de participación.

### Auditoría

- Vínculos determina sus acciones funcionales canónicas.
- Auditoría valida, sanitiza y persiste.
- No copiar la relación completa a metadata.

Evitar dependencias circulares. No importar controllers, routes ni componentes
privados de otro módulo.

---

## 25. Pruebas mínimas

### Unitarias

- validación de UUID y propiedades inesperadas;
- validación del motivo obligatorio y máximo 500;
- policy global;
- policy de profesional vinculado;
- profesional no vinculado no consulta ni crea;
- profesional no desvincula;
- destinatarios válidos e inválidos por rol;
- proyección por lista positiva;
- mapping `snake_case` a `camelCase`;
- historial no visible para profesional;
- funciones internas exigen transacción cuando corresponde.

### Integración

- roles globales listan vínculos activos de cualquier paciente;
- roles globales solicitan historial;
- profesional vinculado lista únicamente activos;
- profesional no puede solicitar historial;
- profesional vinculado suma otro prestador;
- profesional no vinculado recibe denegación;
- profesional no puede auto-vincularse sin acceso previo;
- administrador, coordinación y secretaría crean vínculo manual;
- paciente inactivo rechaza alta;
- usuario inactivo rechaza alta;
- administrador o secretaría como destinatario se rechaza;
- duplicado activo devuelve `VINCULO_YA_EXISTE`;
- reanudación crea una fila nueva y conserva la anterior;
- alta manual registra `PRESTADOR_VINCULADO`;
- alta automática registra el evento automático solo si insertó;
- alta de paciente por profesional comparte rollback;
- turno autorizado crea vínculo y revierte ambos si falla;
- turno profesional sin vínculo previo se rechaza;
- desvinculación exige motivo;
- desvinculación con turno futuro bloqueante falla;
- desvinculación sin bloqueo cierra y conserva la fila;
- pérdida de acceso ocurre tras el commit;
- desactivar usuario cierra vínculos en la misma transacción;
- reactivar usuario o paciente no reabre vínculos;
- no existen rutas globales, `PUT` ni `DELETE`.

### Seguridad y concurrencia

- acceso directo por UUID no filtra existencia;
- body no fija actor, estado o fechas;
- listado no expone DNI, email, teléfono ni datos del paciente;
- logs y auditoría no contienen datos sensibles o motivo libre;
- dos altas simultáneas dejan un solo vínculo activo;
- alta manual y automática simultáneas dejan uno solo;
- dos turnos simultáneos no duplican la relación;
- desvinculación y turno futuro no dejan un estado contradictorio;
- cierre masivo y alta simultánea no dejan vínculo activo inválido;
- errores de constraints se traducen sin detalles internos.

---

## 26. Acciones prohibidas

No:

- convertir Vínculos en un CRUD global;
- crear `DELETE /vinculos`;
- eliminar físicamente períodos;
- reutilizar o reactivar una fila histórica;
- permitir dos vínculos activos para la misma pareja;
- admitir como prestador a administrador o secretaría;
- permitir auto-vinculación manual sin acceso previo;
- permitir desvinculación al profesional;
- aceptar actor, estado o fechas desde el cliente;
- aceptar motivo de cierre durante el alta;
- cerrar el vínculo al completar, cancelar o marcar ausente un turno;
- usar el turno histórico como sustituto del vínculo activo;
- cancelar o reasignar turnos al desvincular;
- desvincular con turnos futuros bloqueantes;
- reabrir vínculos al activar usuario o paciente;
- cerrar todos los vínculos al desactivar paciente sin decisión aprobada;
- inventar motivos técnicos de cierre automático;
- duplicar eventos del caso de uso de Usuarios;
- copiar motivos libres o datos personales a logs o auditoría;
- filtrar relaciones fuera de scope en memoria;
- serializar modelos Sequelize directamente;
- utilizar `sequelize.sync()`;
- resolver carreras únicamente con un `findOne` previo;
- agregar endpoints, campos o códigos no contractuales;
- resolver decisiones pendientes por intuición.

---

## 27. Procedimiento de trabajo

Antes de implementar:

1. identificar si el caso es consulta, alta manual, alta automática o cierre;
2. determinar qué módulo es dueño de la transacción;
3. revisar contrato, matriz, modelo y AGENTS relacionados;
4. distinguir alcance global de profesional vinculado;
5. validar estado y rol del destinatario;
6. definir si se consulta vínculo activo o historial;
7. enumerar efectos sobre permisos, turnos, informes y auditoría;
8. verificar constraints y traducción de errores;
9. construir la proyección mediante lista positiva;
10. agregar pruebas de autorización, rollback y privacidad;
11. agregar pruebas simultáneas si se afirma resolver una carrera;
12. actualizar documentación antes de ampliar el contrato.

Si la tarea exige una decisión no aprobada, detener esa parte y solicitarla.

---

## 28. Definition of Done

Un cambio está completo solo si:

- respeta los tres endpoints contractuales;
- limita destinatarios a coordinación y profesional activos;
- exige paciente activo para toda alta;
- aplica alcance global o vínculo activo según el rol;
- impide auto-vinculación manual sin acceso previo;
- conserva un único vínculo activo por pareja;
- conserva todos los períodos históricos;
- nunca reutiliza una fila cerrada;
- diferencia alta manual y automática;
- comparte transacción con Pacientes, Turnos o Usuarios cuando corresponde;
- bloquea desvinculación con turnos futuros aplicables;
- elimina el acceso dependiente del vínculo después del cierre;
- utiliza proyección y metadata mediante listas positivas;
- registra únicamente eventos canónicos y sanitizados;
- traduce constraints conocidas a errores funcionales;
- incluye pruebas unitarias, integración, seguridad y concurrencia pertinentes;
- no incorpora alcance excluido;
- actualiza documentación cuando cambia una decisión;
- informa qué validaciones se ejecutaron y cuáles no.

---

## 29. Decisiones pendientes

Los agentes no deben resolver por intuición:

1. semántica exacta al combinar `activo=false` e
   `incluirHistorial=true` en el listado;
2. orden contractual de vínculos activos e históricos;
3. frontera temporal exacta utilizada por “turno futuro” si la convención
   compartida aún no está cerrada;
4. estrategia concurrente entre desvinculación y creación de turno;
5. estrategia concurrente entre cierre masivo y alta de vínculo;
6. texto o código canónico del motivo técnico al cerrar por desactivación o
   cambio de rol;
7. si el cierre masivo emite eventos por vínculo, un único evento agregado o
   solo el evento funcional de Usuarios;
8. si desactivar un paciente debe cerrar vínculos activos y con qué motivo;
9. tratamiento del acceso de un autor a informes cuando termina su vínculo;
10. comportamiento ante una fila histórica corrupta que no cumple la
    constraint de estado;
11. límites o retención adicional del motivo de desvinculación;
12. contrato cerrado de valores para el origen técnico de vínculos automáticos.

Hasta contar con una decisión expresa:

- conservar el comportamiento mínimo del contrato;
- no permitir historial al profesional;
- no reactivar períodos cerrados;
- no cerrar relaciones al desactivar un paciente;
- no inventar motivos ni eventos de cierre masivo;
- no declarar resueltas carreras sin estrategia y pruebas;
- no añadir tablas, endpoints, campos o efectos colaterales.
