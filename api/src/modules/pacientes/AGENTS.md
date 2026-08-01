# AGENTS.md — Pacientes

## 1. Alcance y precedencia

Estas instrucciones se aplican a:

```text
api/src/modules/pacientes/
```

También deben respetarse al modificar componentes relacionados:

```text
api/src/modules/vinculos/
api/src/modules/turnos/
api/src/modules/informes/
api/src/modules/mensajeria/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/permissions/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`. Antes de modificar Pacientes, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/modules/auditoria/AGENTS.md
api/src/modules/vinculos/AGENTS.md
api/src/modules/turnos/AGENTS.md
api/src/shared/database/AGENTS.md
```

Si alguno no existe en el checkout, no inventar su contenido. Aplicar las decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. este archivo especializado;
4. `api/AGENTS.md`.

Ante una contradicción, detener únicamente la parte afectada y solicitar una decisión. No cambiar el contrato, el modelo o la matriz de permisos para justificar una implementación incompatible.

---

## 2. Comandos habituales

Ejecutar desde `api/` y comprobar primero que cada script exista en `package.json`:

```bash
npm test
npm run test:coverage
npm run test:integration
npm run test:concurrency
npm run lint
npm run db:migrate
```

Reglas operativas:

- usar PostgreSQL real y una base exclusiva para integración;
- crear el esquema de pruebas mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- utilizar pacientes, tutores, DNI, teléfonos y correos completamente ficticios;
- no imprimir DNI, datos clínicos, datos del tutor, bodies ni modelos completos;
- probar rollback cuando una operación modifica paciente, tutor, vínculo o auditoría;
- probar accesos directos por UUID para detectar IDOR;
- no afirmar seguridad concurrente sin pruebas simultáneas reales;
- no rediseñar Vínculos o Turnos como parte incidental de una tarea de Pacientes.

---

## 3. Decisiones obligatorias del MVP

```text
Entidad principal:      paciente
Responsable adulto:     tutor único y obligatorio
Gestión del tutor:      dentro de la ficha del paciente
Alta inicial:           paciente activo
DNI del paciente:       opcional, único cuando existe
Baja:                   lógica mediante activo
Acceso global:          administrador, coordinacion, secretaria
Acceso profesional:     solo con vínculo activo
Alta por profesional:   crea vínculo automático consigo mismo
Eliminación física:     no existe
Datos clínicos:         sensibles
```

Reglas centrales:

- Pacientes no es un CRUD común.
- Paciente y tutor forman una única ficha funcional.
- El tutor no es usuario, no posee credenciales y no tiene módulo propio.
- Todo paciente debe conservar exactamente un tutor en el MVP.
- Administrador, coordinación y secretaría tienen alcance global.
- El profesional consulta y edita únicamente pacientes con vínculo activo.
- Los cuatro roles autenticados pueden crear paciente y tutor.
- El profesional que crea un paciente queda vinculado automáticamente.
- El profesional no puede activar ni desactivar pacientes.
- No se desactiva un paciente con turnos futuros `pendiente` o `confirmado`.
- Un paciente inactivo conserva la historia y no admite nuevas operaciones bloqueadas por el contrato.
- No existe eliminación física de pacientes ni tutores.
- Los permisos del frontend no sustituyen las policies del backend.

No ampliar el módulo con múltiples tutores, cuentas familiares, autogestión, contactos secundarios, adjuntos, notificaciones ni endpoints independientes de tutor.

---

## 4. Responsabilidad y estructura

`pacientes` es responsable de:

- listado y detalle dentro del alcance autorizado;
- filtros, búsqueda, orden y paginación;
- alta conjunta de paciente y tutor;
- edición conjunta de paciente y tutor;
- activación y desactivación del paciente;
- validación de DNI, fecha de nacimiento y CUD;
- advertencia no bloqueante de posibles duplicados sin DNI;
- policies y proyecciones específicas;
- transacciones de la ficha;
- coordinación con Vínculos, Turnos y Auditoría;
- emisión de eventos funcionales;
- traducción de errores conocidos a códigos contractuales.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/pacientes/
├── pacientes.routes.js
├── pacientes.validation.js
├── pacientes.controller.js
├── pacientes.service.js
├── pacientes.policy.js
├── pacientes.projection.js
├── pacientes.constants.js
└── AGENTS.md
```

Los modelos Sequelize `Paciente` y `Tutor` permanecen centralizados en:

```text
src/shared/database/models/
```

No crear:

- `src/modules/tutores/`;
- modelos paralelos dentro de Pacientes;
- un Repository aislado, salvo adopción formal del patrón en todo el backend.

---

## 5. Responsabilidades por capa

### Routes

- Declaran únicamente métodos y rutas contractuales.
- Componen autenticación, autorización, validación y controller.
- No consultan modelos.
- No construyen proyecciones.
- No incorporan aliases ni rutas de tutores.

### Validation

- Valida path, query y body.
- Rechaza propiedades inesperadas.
- Normaliza DNI mediante el helper compartido aprobado.
- Valida tipos, límites, fechas y coherencia sintáctica del CUD.
- Exige los objetos completos `paciente` y `tutor` al crear y editar.
- No consulta PostgreSQL.
- No decide si el actor está vinculado.
- No comprueba turnos futuros.

### Controllers

- Reciben datos HTTP ya validados.
- Pasan al service valores primitivos y contexto del actor.
- Construyen status y envelope contractuales.
- No contienen reglas clínicas, de vínculo o transacción.
- No serializan instancias Sequelize directamente.

### Services

- Aplican policies y reglas de negocio.
- Consultan modelos centralizados.
- Abren y propagan transacciones.
- Coordinan Vínculos, Turnos y Auditoría.
- Traducen errores de integridad a códigos funcionales.
- Devuelven datos aptos para la proyección correspondiente.
- Nunca reciben `req` ni `res`.

### Policies

- Autorizan acción, fila, filtros y alcance.
- Distinguen roles globales de profesional vinculado.
- Verifican vínculos activos en PostgreSQL.
- Impiden que los filtros amplíen el scope del actor.
- Son explícitas, testeables e independientes del frontend.

### Proyecciones

- Construyen objetos nuevos mediante listas positivas.
- Transforman nombres de persistencia a nombres contractuales.
- Separan resumen y detalle.
- No serializan asociaciones completas por conveniencia.
- No parten de un objeto amplio para eliminar campos posteriormente.

---

## 6. Endpoints contractuales

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/v1/pacientes` | Cualquier autenticado; alcance según rol y vínculo. |
| `GET` | `/api/v1/pacientes/:id` | Roles globales o profesional vinculado. |
| `POST` | `/api/v1/pacientes` | Los cuatro roles autenticados. |
| `PUT` | `/api/v1/pacientes/:id` | Roles globales o profesional vinculado. |
| `PATCH` | `/api/v1/pacientes/:id/estado` | Administrador, coordinación o secretaría. |

No existen en el MVP:

```text
PATCH  /api/v1/pacientes/:id
DELETE /api/v1/pacientes/:id

GET    /api/v1/tutores
GET    /api/v1/tutores/:id
POST   /api/v1/tutores
PUT    /api/v1/tutores/:id
PATCH  /api/v1/tutores/:id
DELETE /api/v1/tutores/:id
```

No agregar rutas para varios tutores, documentos, CUD adjunto, responsables secundarios o contacto familiar por analogía con otros sistemas.

---

## 7. Proyecciones contractuales

### 7.1 Resumen

Usar en `GET /pacientes`:

```json
{
  "id": "uuid",
  "dni": null,
  "nombre": "Juan",
  "apellido": "Gómez",
  "fechaNacimiento": "2014-06-10",
  "colegio": "Escuela ...",
  "poseeCud": true,
  "cudFechaVencimiento": "2027-04-30",
  "activo": true
}
```

No incluir en listados:

- `diagnostico`;
- `observaciones`;
- tutor o sus datos;
- fechas administrativas;
- vínculos;
- turnos;
- informes;
- conversaciones.

### 7.2 Detalle

Usar en detalle, creación, edición y cambio de estado:

```json
{
  "id": "uuid",
  "dni": null,
  "nombre": "Juan",
  "apellido": "Gómez",
  "fechaNacimiento": "2014-06-10",
  "colegio": "Escuela ...",
  "diagnostico": "...",
  "poseeCud": true,
  "cudFechaVencimiento": "2027-04-30",
  "observaciones": null,
  "activo": true,
  "tutor": {
    "id": "uuid",
    "nombre": "María",
    "apellido": "Gómez",
    "telefono": "+54 9 3777 000000",
    "parentesco": "Madre",
    "email": null,
    "direccion": null,
    "observaciones": null
  },
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

Todos los roles que superen la policy reciben la misma ficha de detalle.

No crear proyecciones clínicas parciales o administrativas sin modificar previamente el contrato y la matriz de permisos.

Nunca devolver nombres de persistencia como:

```text
fecha_nacimiento
posee_cud
cud_fecha_vencimiento
paciente_id
created_at
updated_at
```

---

## 8. Alcance y policies

### 8.1 Roles globales

`administrador`, `coordinacion` y `secretaria` pueden:

- listar pacientes activos e inactivos;
- consultar cualquier ficha;
- crear paciente y tutor;
- editar cualquier ficha;
- activar o desactivar pacientes.

### 8.2 Profesional

El profesional puede:

- listar únicamente pacientes con vínculo activo consigo mismo;
- consultar y editar únicamente fichas vinculadas;
- crear paciente y tutor;
- nunca activar ni desactivar pacientes;
- nunca forzar un `prestadorId` ajeno.

Policy mínima:

```text
actor.rol = profesional
AND existe usuarios_pacientes activo
    con usuario_id = actor.id
    y paciente_id = recurso.id
```

No aceptar el vínculo desde body, query, claims arbitrarios ni datos cacheados sin una estrategia aprobada.

Aplicar el scope en la consulta SQL. No cargar todas las fichas para filtrarlas posteriormente en memoria.

Ante acceso directo no autorizado, aplicar consistentemente la política general aprobada:

```text
403 PACIENTE_ACCESO_DENEGADO
```

o el ocultamiento mediante:

```text
404 PACIENTE_NO_ENCONTRADO
```

No variar la respuesta según la existencia real del UUID.

---

## 9. Listado, filtros y paginación

`GET /pacientes` acepta únicamente:

```text
page
limit
search
dni
activo
prestadorId
sort
order
```

Valores permitidos para `sort`:

```text
apellido
nombre
fechaNacimiento
createdAt
updatedAt
```

Valores permitidos para `order`:

```text
asc
desc
```

Reglas:

- usar la paginación general del backend;
- responder con envelope paginado de proyecciones resumidas;
- `search` opera sobre nombre, apellido y DNI dentro del scope autorizado;
- `dni` es exacto y nunca amplía la proyección o el alcance;
- `prestadorId` es exclusivo de roles globales;
- el profesional solo puede solicitar `activo=true`;
- un filtro prohibido responde `403 FORBIDDEN_FILTER`;
- no degradar silenciosamente un filtro prohibido;
- no interpolar `sort`, `order` o búsquedas directamente en SQL;
- aplicar un orden secundario estable por `id` cuando corresponda;
- evitar asociaciones que multipliquen filas o alteren `total`.

El UUID de un paciente no convierte al recurso en accesible.

---

## 10. Creación conjunta

`POST /pacientes` recibe:

```json
{
  "paciente": {
    "dni": null,
    "nombre": "Juan",
    "apellido": "Gómez",
    "fechaNacimiento": "2014-06-10",
    "colegio": "Escuela ...",
    "diagnostico": "...",
    "poseeCud": true,
    "cudFechaVencimiento": "2027-04-30",
    "observaciones": null
  },
  "tutor": {
    "nombre": "María",
    "apellido": "Gómez",
    "telefono": "+54 9 3777 000000",
    "parentesco": "Madre",
    "email": null,
    "direccion": null,
    "observaciones": null
  }
}
```

Reglas:

- ambos objetos son obligatorios;
- `activo` no se acepta;
- el paciente comienza con `activo=true`;
- el backend genera ambos UUID;
- el tutor recibe la FK del paciente recién creado;
- si el actor es profesional, se crea un vínculo activo consigo mismo;
- los roles globales no obtienen un vínculo por crear la ficha;
- paciente, tutor, vínculo automático y eventos forman una unidad atómica;
- responder `201` con la proyección de detalle;
- una advertencia de posible duplicado no cambia el status ni revierte el alta.

Patrón obligatorio:

```text
BEGIN
  validar reglas de negocio
  crear paciente activo
  crear tutor

  si actor = profesional:
    crear vínculo activo con el actor
    registrar PRESTADOR_VINCULADO_AUTOMATICAMENTE

  registrar PACIENTE_CREADO
COMMIT
```

Todos los services internos deben recibir la misma instancia `{ transaction }`.

No abrir transacciones independientes en Vínculos o Auditoría.

---

## 11. DNI y posibles duplicados

El DNI:

- es opcional;
- cuando existe, se normaliza a dígitos;
- admite entre 7 y 20 dígitos;
- debe ser único;
- no se sustituye por una cadena vacía;
- no se copia a logs, auditoría o mensajes de error.

La unicidad final depende del índice parcial de PostgreSQL:

```sql
CREATE UNIQUE INDEX pacientes_dni_uq
ON pacientes (dni)
WHERE dni IS NOT NULL;
```

Traducir una violación conocida a:

```text
409 PACIENTE_DNI_DUPLICADO
```

No exponer SQL, parámetros ni nombres de constraints.

Cuando `dni=null`, una coincidencia normalizada de:

```text
nombre + apellido + fechaNacimiento
```

genera:

```text
PACIENTE_POSIBLE_DUPLICADO
```

como advertencia no bloqueante.

No:

- impedir el alta;
- fusionar registros;
- actualizar el paciente existente;
- vincular automáticamente al actor con el registro coincidente.

La normalización exacta de nombres debe provenir de una decisión o utilidad compartida aprobada. No incorporar comparación fonética, fuzzy search o transformaciones agresivas por intuición.

---

## 12. Edición conjunta

`PUT /pacientes/:id`:

- recibe la misma estructura completa de creación;
- reemplaza los campos editables;
- no acepta `activo`, IDs o timestamps;
- actualiza paciente y tutor existente;
- nunca crea un segundo tutor;
- nunca cambia el `paciente_id` del tutor;
- conserva los UUID de paciente y tutor;
- no crea ni cierra vínculos;
- registra `PACIENTE_EDITADO`;
- responde con la ficha actualizada.

Transacción:

```text
BEGIN
  cargar paciente y tutor autorizados
  validar DNI, fecha de nacimiento y CUD
  actualizar paciente
  actualizar tutor existente
  registrar PACIENTE_EDITADO
COMMIT
```

Si falta el tutor por corrupción histórica, no crearlo silenciosamente durante un `PUT`. Revertir la operación y seguir la estrategia operativa aprobada.

La auditoría puede indicar los nombres técnicos de los campos modificados, pero nunca sus valores sensibles.

---

## 13. Tutor único y obligatorio

| Campo | Tipo | Requerido | Regla |
|---|---|:---:|---|
| `nombre` | string | Sí | Máximo 100. |
| `apellido` | string | Sí | Máximo 100. |
| `telefono` | string | Sí | Máximo 40. |
| `parentesco` | string | Sí | Máximo 80. |
| `email` | string/null | No | Máximo 254. |
| `direccion` | string/null | No | Máximo 255. |
| `observaciones` | string/null | No | Texto sensible. |

Invariantes:

- existe exactamente un tutor por paciente;
- `tutores.paciente_id` es único y obligatorio;
- el tutor no inicia sesión ni recibe rol;
- no se crea un usuario a partir de sus datos;
- no se elimina o reemplaza la fila al editar sin necesidad aprobada;
- no se permite dejar al paciente sin tutor;
- no existe historial independiente del tutor;
- no recibe notificaciones automáticas en el MVP;
- sus datos aparecen únicamente dentro de una ficha autorizada.

La constraint única es una defensa obligatoria ante carreras. No devolver su error SQL crudo.

---

## 14. Fechas, CUD y campos clínicos

| Campo | Regla |
|---|---|
| `dni` | Opcional; entre 7 y 20 dígitos normalizados. |
| `nombre` | Obligatorio; máximo 100. |
| `apellido` | Obligatorio; máximo 100. |
| `fechaNacimiento` | Obligatoria; fecha civil válida y no futura. |
| `colegio` | Opcional; máximo 200. |
| `diagnostico` | Opcional; texto clínico sensible. |
| `poseeCud` | Boolean; default funcional `false`. |
| `cudFechaVencimiento` | Obligatoria solo cuando posee CUD. |
| `observaciones` | Opcional; texto sensible. |

Coherencia obligatoria:

```text
poseeCud = false -> cudFechaVencimiento = null
poseeCud = true  -> cudFechaVencimiento != null
```

Errores:

```text
422 CUD_VENCIMIENTO_REQUERIDO
422 CUD_VENCIMIENTO_NO_PERMITIDO
422 FECHA_NACIMIENTO_INVALIDA
```

Usar `DATE` para `fechaNacimiento` y `cudFechaVencimiento`. No convertir estas fechas civiles en instantes UTC.

La fecha de nacimiento no futura se valida en el service. No agregar un `CHECK` dependiente de `CURRENT_DATE`.

---

## 15. Activación y desactivación

`PATCH /pacientes/:id/estado` acepta únicamente:

```json
{
  "activo": false
}
```

Acceso:

```text
administrador
coordinacion
secretaria
```

Antes de desactivar:

- cargar el paciente dentro de la operación autorizada;
- comprobar que actualmente esté activo;
- rechazar si tiene turnos futuros `pendiente` o `confirmado`;
- no cancelar, completar o reasignar turnos automáticamente;
- registrar `PACIENTE_DESACTIVADO` en la misma transacción.

Al activar:

- rechazar si ya se encuentra activo;
- registrar `PACIENTE_ACTIVADO` en la misma transacción;
- no reabrir vínculos históricos;
- no reconstruir vínculos, turnos, informes o conversaciones.

Usar:

```text
409 PACIENTE_ESTADO_SIN_CAMBIOS
```

cuando el estado solicitado coincide con el actual.

Un paciente inactivo:

- conserva paciente, tutor e historia;
- puede aparecer en historiales autorizados;
- no admite nuevos turnos;
- no admite nuevos informes;
- no admite nuevos vínculos;
- no puede asociarse con una conversación nueva;
- no se elimina de informes, turnos, mensajes o auditoría;
- no impide que conversaciones preexistentes sigan operativas.

La documentación vigente no ordena cerrar automáticamente todos los vínculos activos al desactivar al paciente.

No agregar ese efecto sin una decisión expresa y sin definir el motivo histórico de cierre.

---

## 16. Transacciones y concurrencia

| Operación | Unidad transaccional |
|---|---|
| Crear por rol global | Paciente, tutor y auditoría. |
| Crear por profesional | Paciente, tutor, vínculo automático y eventos. |
| Editar | Paciente, tutor y auditoría. |
| Desactivar | Validación de turnos, estado y auditoría. |
| Activar | Estado y auditoría. |

Reglas:

- propagar una única instancia `{ transaction }`;
- no dejar un paciente sin tutor por commits parciales;
- no confirmar el vínculo automático si falla el alta;
- no confirmar una operación si falla su evento exitoso obligatorio;
- no ocultar transacciones en hooks;
- no confiar únicamente en comprobaciones previas para la unicidad;
- no cambiar el aislamiento ni agregar locks por intuición.

La creación de turnos y la desactivación del paciente pueden competir.

La estrategia debe impedir:

- confirmar un turno nuevo sobre un paciente inactivo;
- desactivar al paciente dejando un turno futuro bloqueante.

Si la estrategia exacta no está aprobada en la arquitectura vigente, detener esa parte y documentar la decisión pendiente.

Pruebas simultáneas mínimas:

- dos altas con el mismo DNI;
- intentos de crear dos tutores para un paciente;
- rollback completo del alta realizada por profesional;
- edición conjunta sin estados parciales;
- desactivación frente a creación de turno.

---

## 17. Auditoría y privacidad

Eventos canónicos:

```text
PACIENTE_CREADO
PACIENTE_EDITADO
PACIENTE_ACTIVADO
PACIENTE_DESACTIVADO
PRESTADOR_VINCULADO_AUTOMATICAMENTE
```

`PRESTADOR_VINCULADO_AUTOMATICAMENTE` corresponde únicamente al vínculo creado durante el alta realizada por un profesional.

No crear códigos alternativos como:

```text
TUTOR_CREADO
TUTOR_EDITADO
FICHA_CREADA
PACIENTE_ACTUALIZADO
```

sin ampliar previamente el catálogo normativo.

Metadata permitida mediante lista positiva:

- UUID del paciente;
- UUID del vínculo o prestador cuando el evento lo autorice;
- nombres técnicos de campos modificados;
- estado anterior y nuevo;
- indicador de vínculo automático;
- códigos técnicos normalizados no sensibles.

Nunca registrar:

- DNI, nombre o apellido del paciente;
- diagnóstico u observaciones;
- número, imagen o información sensible del CUD;
- datos personales u observaciones del tutor;
- requests, responses o bodies completos;
- SQL, parámetros, constraints o stacks.

El acceso administrativo a Auditoría no permite almacenar información clínica.

Los eventos exitosos comparten transacción y `correlationId` con la operación funcional. Seguir `api/src/modules/auditoria/AGENTS.md`.

---

## 18. Errores contractuales

```text
400 VALIDATION_ERROR
401 UNAUTHORIZED
403 FORBIDDEN
403 FORBIDDEN_FILTER
403 PACIENTE_ACCESO_DENEGADO
404 PACIENTE_NO_ENCONTRADO
409 PACIENTE_DNI_DUPLICADO
409 PACIENTE_TIENE_TURNOS_FUTUROS
409 PACIENTE_ESTADO_SIN_CAMBIOS
422 PACIENTE_INACTIVO
422 TUTOR_REQUERIDO
422 CUD_VENCIMIENTO_REQUERIDO
422 CUD_VENCIMIENTO_NO_PERMITIDO
422 FECHA_NACIMIENTO_INVALIDA
```

`PACIENTE_POSIBLE_DUPLICADO` es una advertencia dentro de `meta.warnings`, no un error HTTP.

Reglas:

- usar el envelope general del backend;
- incluir `correlationId` según el contrato;
- no revelar recursos fuera del scope;
- no incluir información clínica o del tutor en errores;
- no devolver mensajes crudos de PostgreSQL;
- no mapear una violación desconocida a un código conocido sin comprobar su causa.

---

## 19. Integración con otros módulos

### Vínculos

- Pacientes solicita el vínculo automático únicamente cuando crea un profesional.
- Vínculos valida y persiste la relación histórica.
- Pacientes no duplica la lógica de desvinculación.
- La policy profesional consulta la existencia del vínculo activo.
- Todos los cambios de una misma operación comparten transacción.

### Turnos

- Pacientes expone una función interna para exigir paciente activo.
- Turnos no infiere actividad desde una proyección HTTP.
- Pacientes consulta turnos futuros antes de desactivar.
- No se cancelan turnos como efecto colateral.

### Informes

- Informes exige paciente activo para nuevas altas.
- Pacientes no crea, edita ni finaliza informes.
- La ficha del paciente no incluye informes automáticamente.

### Mensajería

- Una conversación nueva requiere paciente activo cuando lo referencia.
- Una conversación preexistente continúa tras la desactivación.
- Pacientes no administra participantes o mensajes.

### Auditoría

- Pacientes determina el evento funcional.
- Auditoría valida, sanitiza y persiste.
- Nunca se copia la ficha completa a metadata.

Evitar dependencias circulares. No importar controllers, routes o componentes privados de otro módulo.

---

## 20. Pruebas mínimas

### Unitarias

- DNI opcional y normalizado;
- fecha de nacimiento no futura;
- coherencia entre `poseeCud` y `cudFechaVencimiento`;
- límites de paciente y tutor;
- resumen sin datos clínicos ni tutor;
- detalle construido mediante lista positiva;
- policies globales y de profesional vinculado;
- rechazo de filtros prohibidos.

### Integración

- creación como cada rol autorizado;
- creación profesional genera un único vínculo;
- una falla revierte paciente, tutor, vínculo y eventos;
- DNI repetido devuelve `PACIENTE_DNI_DUPLICADO`;
- homónimo sin DNI se crea con warning;
- edición conserva el UUID del tutor;
- no se puede dejar la ficha sin tutor;
- profesional vinculado puede listar, consultar y editar;
- profesional no vinculado no accede por UUID;
- profesional no lista inactivos;
- profesional no utiliza `prestadorId`;
- profesional no cambia el estado;
- roles globales consultan activos e inactivos;
- desactivación con turno futuro bloqueante falla;
- desactivación preserva la historia;
- paciente inactivo se rechaza en nuevas operaciones dependientes;
- reactivación no reabre vínculos históricos;
- conversación preexistente continúa operativa;
- no existen rutas de tutores ni `DELETE /pacientes/:id`.

### Seguridad y concurrencia

- ningún listado expone diagnóstico, observaciones o tutor;
- logs y auditoría no contienen datos sensibles;
- el acceso directo no filtra existencia fuera del scope;
- se rechazan propiedades inesperadas;
- sort y búsqueda no permiten inyección;
- se prueba concurrencia de DNI, tutor, edición y baja frente a turno;
- fixtures y snapshots contienen únicamente información ficticia.

---

## 21. Acciones prohibidas

No:

- crear `src/modules/tutores/`;
- agregar CRUD independiente de tutores;
- admitir varios tutores por paciente;
- eliminar físicamente paciente o tutor;
- aceptar `activo` durante alta o edición;
- permitir cambio de estado al profesional;
- permitir acceso profesional sin vínculo activo;
- confiar en `prestadorId` enviado por un profesional;
- convertir el warning de homónimo en bloqueo;
- fusionar pacientes automáticamente;
- crear un segundo tutor durante `PUT`;
- reemplazar tutor mediante delete-and-insert sin aprobación;
- cancelar turnos automáticamente al desactivar;
- reabrir vínculos al reactivar;
- incluir información clínica o del tutor en listados;
- guardar datos sensibles en logs o auditoría;
- serializar modelos Sequelize directamente;
- utilizar `sequelize.sync()`;
- agregar endpoints o campos no contractuales;
- resolver decisiones pendientes por intuición.

---

## 22. Procedimiento de trabajo

Antes de implementar:

1. identificar endpoints, campos y roles afectados;
2. revisar contrato, matriz, modelo y AGENTS relacionados;
3. distinguir alcance global de alcance por vínculo;
4. enumerar efectos sobre tutor, vínculos, turnos y auditoría;
5. identificar la unidad transaccional;
6. definir proyección y lista positiva;
7. identificar datos sensibles;
8. resolver errores y rollback;
9. agregar pruebas de autorización, integración y privacidad;
10. agregar pruebas simultáneas si se afirma resolver una carrera;
11. actualizar documentación antes de ampliar el contrato.

Si la tarea exige una decisión no aprobada, detener esa parte y solicitarla.

---

## 23. Definition of Done

Un cambio está completo solo si:

- respeta los cinco endpoints contractuales;
- mantiene paciente y tutor como una ficha indivisible;
- conserva tutor único y obligatorio;
- aplica alcance global o vínculo activo según el rol;
- evita que los filtros amplíen permisos;
- utiliza proyecciones mediante listas positivas;
- protege DNI, información clínica y datos del tutor;
- mantiene atomicidad con tutor, vínculo automático y eventos;
- traduce constraints conocidas a errores funcionales;
- preserva la historia y evita eliminación física;
- bloquea la baja con turnos futuros aplicables;
- incluye pruebas unitarias, de integración, seguridad y concurrencia pertinentes;
- no incorpora alcance excluido;
- actualiza la documentación cuando cambia una decisión;
- informa qué validaciones se ejecutaron y cuáles no.

---

## 24. Decisiones pendientes

Los agentes no deben resolver por intuición:

1. algoritmo exacto para normalizar nombres al advertir homónimos sin DNI;
2. estrategia concurrente entre creación de turnos y desactivación del paciente;
3. estrategia ante ediciones simultáneas de la ficha completa;
4. si una desactivación futura debe cerrar vínculos activos y qué motivo debe persistir;
5. tratamiento de una ficha histórica sin tutor por corrupción o migración;
6. límites adicionales para textos clínicos si el contrato vigente no los fija;
7. conservación, rectificación o seudonimización de datos clínicos fuera del ciclo normal del MVP.

Hasta contar con una decisión expresa:

- conservar el comportamiento mínimo del contrato;
- no cerrar vínculos automáticamente al desactivar;
- no declarar `last-write-wins` como solución concurrente;
- no reparar tutores silenciosamente;
- no añadir tablas, endpoints o efectos colaterales.