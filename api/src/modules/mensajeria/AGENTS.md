# AGENTS.md — Mensajería interna

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/mensajeria/
```

También deben respetarse al modificar piezas relacionadas ubicadas fuera del
módulo, especialmente:

```text
api/src/modules/usuarios/
api/src/modules/pacientes/
api/src/modules/asuntos/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/permissions/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend ni las instrucciones especializadas de persistencia.

Antes de modificar Mensajería, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/shared/database/AGENTS.md
```

Si alguno de esos archivos todavía no existe en el checkout, no inventar su
contenido. Aplicar únicamente las decisiones normativas disponibles y señalar
el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. `docs/contrato-api.md`, `docs/matriz-permisos.md` y
   `docs/modelo-datos.md` vigentes;
4. este archivo especializado;
5. `api/AGENTS.md`.

Ante una contradicción, detener solo la parte afectada, documentar la
inconsistencia y solicitar una decisión. No cambiar documentación normativa
para encubrir una implementación incompatible.

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
- crear el esquema de test mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- utilizar contenido ficticio y no clínico en fixtures;
- no imprimir mensajes, previews, títulos, bodies ni contexto de pacientes;
- probar lectura, incorporación y envío concurrentes con operaciones reales;
- verificar privacidad con solicitudes directas por UUID, no solo mediante la
  interfaz;
- informar comandos ejecutados, resultados y validaciones no realizadas;
- no afirmar que el puntero de lectura es monotónico sin una prueba concurrente.

---

## 3. Decisiones obligatorias del MVP

```text
Acceso:                    solo participantes
Acceso global por rol:     no existe
Creación:                  cualquier usuario autenticado
Destinatario inicial:      al menos uno, activo y distinto del creador
Paciente:                  opcional
Vínculo clínico:           no requerido
Historial nuevo miembro:   completo
Mensajes:                  inmutables
Lectura automática:        no existe
Puntero de lectura:        avance explícito y monotónico
No leídos propios:         no se cuentan
Archivo:                   individual e idempotente
Remoción de participantes: no existe
Eliminación:               no existe
Tiempo real:               no existe
```

Reglas centrales:

- el creador se incorpora automáticamente como participante;
- los roles `administrador`, `coordinacion` y `secretaria` no pueden leer una
  conversación por jerarquía si no participan;
- cualquier participante puede incorporar usuarios activos;
- un participante nuevo accede al historial completo;
- el historial anterior a su incorporación se considera leído;
- los destinatarios iniciales reciben el primer mensaje como no leído;
- los mensajes enviados por el propio actor no integran su contador;
- consultar el historial no mueve el puntero de lectura;
- archivar o desarchivar afecta únicamente al participante autenticado;
- una conversación archivada no se elimina, no se cierra y no cambia para los
  demás participantes.

No ampliar ni restringir estas reglas por intuición de rol, vínculo clínico o
funcionamiento habitual de otras aplicaciones de chat.

---

## 4. Decisión contraintuitiva: participación sobre rol y vínculo

La participación es la única fuente de acceso a una conversación:

```text
participante autorizado > rol global o vínculo clínico
```

Esto implica:

- un administrador no participante no accede;
- coordinación no participante no accede;
- secretaría no participante no accede;
- un profesional no participante no accede aunque esté vinculado al paciente;
- un participante sí accede aunque no tenga acceso general a la ficha del
  paciente relacionado.

El último caso concede únicamente el contexto mínimo de paciente definido para
la conversación. No concede acceso indirecto a:

- ficha completa del paciente;
- tutores;
- diagnóstico;
- informes clínicos;
- turnos;
- vínculos profesionales;
- documentación ni otros datos sensibles.

La proyección de Mensajería debe limitarse mediante listas positivas. No cargar
una asociación clínica completa para luego ocultarla en el JSON.

---

## 5. Responsabilidad del módulo

`mensajeria` es dueño de:

- bandeja autorizada de conversaciones;
- creación de conversaciones;
- participación y alta de participantes;
- consulta de detalle e historial;
- envío de mensajes;
- estado individual de lectura;
- cálculo de no leídos;
- resumen agregado de conversaciones no leídas;
- archivo y desarchivo individual;
- proyecciones mínimas de conversación, participantes, mensaje y preview;
- protección contra acceso por identificador;
- transacciones de sus casos de uso;
- traducción de errores propios del dominio;
- auditoría funcional sin contenido sensible.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/mensajeria/
├── conversacion.routes.js
├── conversacion.validation.js
├── conversacion.controller.js
├── conversacion.service.js
├── conversacion.policy.js
├── conversacion.projection.js
├── conversacion.constants.js
└── AGENTS.md
```

Si el proyecto separa services de conversaciones, mensajes y lectura, mantener
un único límite de módulo y una única policy de participación reutilizable. No
duplicar reglas de acceso en cada archivo.

Los modelos Sequelize permanecen centralizados en
`src/shared/database/models/`. Mensajería no define modelos paralelos ni un
Repository genérico.

---

## 6. Responsabilidades por capa

### Routes

- declaran método y ruta;
- componen autenticación, validación Joi y controller;
- mantienen visible el orden de middlewares;
- declaran `/conversaciones/no-leidas/resumen` antes de `/:id`;
- no consultan modelos;
- no deciden participación ni privacidad por recurso.

### Validation

- valida `params`, `query` y `body`;
- limita UUID, arrays, strings, paginación, cursores y filtros;
- rechaza propiedades inesperadas;
- elimina duplicados solo si el contrato lo autoriza; de lo contrario rechaza;
- no consulta PostgreSQL;
- no determina si usuarios, paciente o asunto existen o están activos;
- no determina si el actor participa;
- no calcula no leídos.

### Controllers

- reciben entradas ya validadas;
- obtienen al actor autenticado;
- invocan un caso de uso del service;
- devuelven status y envelope contractuales;
- no abren transacciones;
- no cargan participantes ni mensajes;
- no marcan como leída una conversación al devolverla;
- no serializan instancias Sequelize completas.

### Services

- cargan recursos con atributos explícitos;
- aplican reglas de negocio y policies por recurso;
- verifican participantes, usuarios activos y pertenencia de mensajes;
- abren y propagan transacciones;
- preservan el avance monotónico de lectura;
- coordinan conversación, participantes, mensajes, lectura y auditoría;
- construyen cursores mediante una utilidad central;
- seleccionan la proyección autorizada;
- traducen errores internos a códigos funcionales del contrato;
- no reciben `req`, `res` ni status HTTP.

### Policies

- verifican participación activa o vigente según el modelo aprobado;
- protegen conversación, mensajes, lectura y archivo contra IDOR;
- no conceden acceso por rol global;
- no conceden acceso por vínculo con el paciente;
- se aplican también a endpoints agregados y búsquedas;
- no se sustituyen con filtros de frontend.

### Proyecciones

- utilizan listas positivas de atributos;
- separan bandeja, detalle, mensaje, participante y resumen;
- limitan el preview a bandejas ya autorizadas;
- exponen solo el contexto mínimo de paciente aprobado;
- omiten estados individuales de otros participantes salvo definición expresa;
- no utilizan `model.toJSON()` como respuesta;
- no utilizan `include: { all: true }`;
- evitan ciclos y asociaciones no autorizadas.

---

## 7. Endpoints permitidos

| Método | Ruta | Acceso resumido |
|---|---|---|
| `GET` | `/api/v1/conversaciones/no-leidas/resumen` | Actor autenticado; solo conversaciones propias. |
| `GET` | `/api/v1/conversaciones` | Actor autenticado; solo conversaciones propias. |
| `POST` | `/api/v1/conversaciones` | Cualquier usuario autenticado. |
| `GET` | `/api/v1/conversaciones/:id` | Solo participante. |
| `GET` | `/api/v1/conversaciones/:id/mensajes` | Solo participante. |
| `POST` | `/api/v1/conversaciones/:id/mensajes` | Solo participante. |
| `POST` | `/api/v1/conversaciones/:id/participantes` | Solo participante. |
| `PATCH` | `/api/v1/conversaciones/:id/leida` | Solo participante. |
| `PATCH` | `/api/v1/conversaciones/:id/archivar` | Solo participante. |
| `PATCH` | `/api/v1/conversaciones/:id/desarchivar` | Solo participante. |

La ruta estática debe registrarse antes de la parametrizada:

```text
/conversaciones/no-leidas/resumen
/conversaciones/:id
```

No incorporar aliases, endpoints genéricos ni rutas alternativas.

En particular, no existen:

```text
PUT    /api/v1/conversaciones/:id
DELETE /api/v1/conversaciones/:id
PATCH  /api/v1/conversaciones/:id/cerrar
DELETE /api/v1/conversaciones/:id/participantes/:usuarioId
PUT    /api/v1/conversaciones/:id/mensajes/:mensajeId
DELETE /api/v1/conversaciones/:id/mensajes/:mensajeId
```

No agregar WebSocket, Server-Sent Events ni rutas de polling diferentes de las
documentadas.

---

## 8. Modelo funcional mínimo

La representación exacta de tablas, columnas, constraints y asociaciones
proviene de `docs/modelo-datos.md` y de las migraciones vigentes.

Semánticamente, Mensajería necesita:

```text
Conversación
├── creador
├── asunto
├── paciente opcional
├── título
├── participantes
└── mensajes

Participación
├── conversación
├── usuario
├── punto individual de lectura
└── estado individual de archivo

Mensaje
├── conversación
├── remitente
├── contenido
└── orden temporal estable
```

Invariantes obligatorias:

- un usuario no puede aparecer dos veces en la misma conversación;
- todo remitente debe ser participante al enviar;
- todo mensaje pertenece a una única conversación;
- el puntero de lectura referencia un mensaje existente de esa misma
  conversación o queda vacío según el caso contractual;
- el puntero de lectura nunca retrocede;
- el archivo pertenece a la participación, no a la conversación global;
- mensajes y conversaciones no se eliminan por operaciones funcionales;
- desactivar un usuario, paciente o asunto no borra historia;
- las claves foráneas usan tipos compatibles con sus referencias.

Una FK simple sobre el mensaje leído no demuestra que el mensaje pertenezca a
la misma conversación. El service debe verificarlo dentro de la operación. No
agregar un trigger o constraint compuesto sin una decisión de persistencia
aprobada.

No inventar nombres físicos, nulabilidad, cascadas, constraints ni enums si no
están definidos normativamente.

---

## 9. Creación de conversaciones

El body contractual debe contener únicamente los campos aprobados. La forma
semántica esperada es:

```json
{
  "asuntoId": "uuid",
  "pacienteId": "uuid-o-null",
  "titulo": "Consulta interna",
  "usuarioIds": ["uuid-destinatario"],
  "mensaje": "Contenido inicial"
}
```

Los nombres, límites y nulabilidad definitivos se toman de
`docs/contrato-api.md`. No admitir aliases por conveniencia.

No aceptar desde el cliente:

```text
creadorId
remitenteId
participanteId del actor
ultimoMensajeLeidoId
archivadaAt
createdAt
updatedAt
contadorNoLeidos
```

El service debe comprobar:

- actor autenticado y activo;
- al menos un destinatario activo distinto del actor;
- inexistencia de identificadores inválidos según el contrato;
- asunto existente y activo al crear;
- paciente existente y activo cuando se informa;
- título y mensaje inicial dentro de los límites vigentes;
- ausencia de campos inesperados.

No exigir:

- vínculo entre actor y paciente;
- vínculo entre destinatarios y paciente;
- un rol específico;
- que el creador sea profesional;
- que los participantes compartan servicio o área.

La operación crea atómicamente:

1. conversación;
2. participación del creador;
3. participaciones de los destinatarios iniciales;
4. primer mensaje, cuyo remitente es el creador;
5. estado inicial de lectura necesario para el comportamiento contractual;
6. auditoría sin contenido.

Resultado observable obligatorio:

- el creador participa;
- los destinatarios participan;
- el primer mensaje forma parte del historial;
- el primer mensaje no se cuenta como no leído para el creador;
- el primer mensaje sí se cuenta como no leído para cada destinatario inicial.

Si cualquier paso falla, no debe quedar conversación, participación, mensaje,
estado de lectura ni auditoría parcial.

---

## 10. Participación y privacidad

Antes de devolver o modificar una conversación concreta, verificar en backend
que exista la participación del actor.

Aplicar esta regla a:

- detalle;
- historial;
- envío;
- alta de participantes;
- avance de lectura;
- archivo;
- desarchivo;
- previews;
- contadores y resúmenes;
- cualquier include o subconsulta relacionada.

Para un identificador inexistente o una conversación ajena, responder `404`
con el código funcional vigente. No utilizar `403` cuando revele que la
conversación existe.

No confiar en:

- rol del actor;
- identificadores entregados por el frontend;
- visibilidad previa en la bandeja;
- vínculo clínico;
- autoría de un mensaje;
- `permissions` contenidas en un token;
- ocultamiento de botones.

La bandeja debe partir de la relación de participación del actor. No consultar
todas las conversaciones para filtrarlas en memoria.

---

## 11. Incorporación de participantes

`POST /conversaciones/:id/participantes` solo puede ser ejecutado por un
participante actual.

Reglas:

- solo se incorporan usuarios existentes y activos;
- el actor no puede ampliar acceso a una conversación en la que no participa;
- no se exige rol ni vínculo clínico al nuevo participante;
- no se permite quitar participantes;
- la combinación conversación-usuario debe ser única;
- el alta y su auditoría se ejecutan en una transacción;
- el nuevo participante accede inmediatamente al historial completo;
- el historial existente al incorporarlo se considera leído;
- el último mensaje existente dentro del límite transaccional aprobado se usa
  como punto inicial de lectura;
- si todavía no existe mensaje, el punto inicial puede quedar vacío según el
  modelo vigente.

No copiar mensajes ni crear un historial paralelo para el nuevo participante.
El acceso se deriva de la participación.

No está definido si un lote que mezcla usuarios nuevos y ya participantes debe
rechazarse completo o ignorar duplicados. Hasta aprobar esa semántica:

- no implementar resultados parciales;
- no ocultar el conflicto;
- no asumir idempotencia del alta en lote;
- detener la parte afectada y solicitar una decisión.

---

## 12. Mensajes

Solo un participante puede enviar un mensaje. El backend asigna:

```text
conversación = recurso autorizado
remitente    = actor autenticado
timestamps   = servidor/base de datos
```

No aceptar `remitenteId` ni identidad equivalente desde el body.

El contenido:

- es obligatorio;
- respeta normalización y límites de `docs/contrato-api.md`;
- no se registra en logs ni auditoría;
- no se incorpora a mensajes de error;
- no se usa para búsqueda en el MVP;
- no admite adjuntos, HTML enriquecido, reacciones ni menciones salvo una
  decisión posterior.

Los mensajes son inmutables:

- no se editan;
- no se eliminan;
- no se reemplazan al corregir texto;
- no se ocultan selectivamente;
- no se cambian de conversación;
- no se reasigna el remitente.

Enviar un mensaje y registrar su auditoría forman una operación transaccional
cuando la auditoría normativa pertenece al mismo caso de uso. Una falla no debe
dejar un mensaje sin el registro obligatorio ni una auditoría de un mensaje que
no existe.

El envío no marca automáticamente como leído el historial del remitente salvo
que el contrato lo defina expresamente. La exclusión de mensajes propios del
contador debe cumplirse con independencia de esa decisión interna.

---

## 13. Historial y cursor

`GET /conversaciones/:id/mensajes` exige participación antes de consultar el
historial.

Reglas:

- usar paginación por cursor, no offsets crecientes;
- el orden estable combina `createdAt` e `id`;
- el cursor debe representar ambos componentes;
- dos mensajes con el mismo timestamp no pueden duplicarse ni omitirse;
- validar el cursor y responder el error contractual sin filtrar SQL;
- aplicar el scope de conversación en la misma consulta;
- limitar el tamaño de página conforme al contrato;
- seleccionar atributos e includes explícitos;
- no cargar el historial completo para paginar en memoria;
- consultar el historial no modifica la lectura.

La dirección definitiva, el formato opaco del cursor y la semántica exacta de
`nextCursor` provienen de `docs/contrato-api.md`. Si todavía no están definidos,
no inventarlos.

El mismo orden compuesto debe considerarse al comparar puntos de lectura. La
documentación aún debe confirmar si esa comparación es normativa para todas las
operaciones; no usar solo `createdAt` porque puede empatar.

---

## 14. Proyecciones y contexto mínimo

### Bandeja

La proyección de bandeja puede incluir únicamente los campos definidos por el
contrato, normalmente:

- identificador de conversación;
- título y asunto mínimo;
- paciente mínimo cuando exista;
- participantes mínimos;
- último mensaje o preview limitado;
- actividad visible;
- cantidad de no leídos del actor;
- estado de archivo del actor.

El preview solo puede calcularse después de aplicar participación. Nunca debe
aparecer en consultas globales, auditoría, logs o resumen agregado.

### Detalle

El detalle puede ampliar los metadatos de la conversación, pero no concede
campos clínicos de otros módulos. Aplicar la misma policy antes de cargar
asociaciones.

### Mensaje

La proyección de mensaje contiene únicamente:

- identificador;
- remitente mínimo;
- contenido;
- timestamp contractual;
- campos expresamente aprobados.

No exponer datos internos de participación, claves foráneas redundantes,
metadatos de auditoría ni atributos completos del usuario.

### Resumen de no leídas

El resumen agregado devuelve cantidades, no contenido. No contiene:

- preview;
- mensaje;
- título;
- paciente;
- asunto;
- participantes;
- identificadores de conversaciones.

---

## 15. Estado individual de lectura

La lectura se representa mediante un punto individual por participante. El
nombre físico definitivo proviene del modelo; conceptualmente corresponde a:

```text
ultimoMensajeLeidoId
```

`PATCH /conversaciones/:id/leida` es la única operación que avanza el puntero.

El service debe verificar dentro de la operación:

- el actor participa;
- el mensaje indicado existe;
- el mensaje pertenece a la misma conversación;
- el nuevo punto no es anterior al actual;
- la comparación usa el orden estable aprobado;
- la actualización afecta solo la participación del actor.

El avance es monotónico:

```text
sin punto → mensaje posterior      permitido
mensaje A → mensaje B posterior    permitido
mensaje A → mensaje A              idempotente
mensaje B → mensaje A anterior     no debe retroceder
```

Dos dispositivos no pueden provocar un retroceso por orden de llegada. No
implementar una secuencia insegura de leer-comparar-guardar fuera de una
protección transaccional o condicional.

No asumir como aprobada la estrategia concreta. Puede requerir actualización
condicional, bloqueo de fila u otra solución documentada. La implementación
debe justificarla y probarla contra PostgreSQL real.

Consultar conversación, detalle o mensajes no mueve el puntero. No ocultar una
escritura automática dentro de un endpoint `GET`.

---

## 16. Cálculo de mensajes no leídos

Los no leídos son mensajes de la conversación que:

- pertenecen al scope del participante;
- están después de su punto de lectura según el orden estable;
- no fueron enviados por ese mismo participante.

Para un participante incorporado después de existir historial:

- puede leer todo el historial;
- los mensajes anteriores al punto inicial no se cuentan como no leídos;
- los mensajes posteriores sí se evalúan normalmente;
- sus propios mensajes continúan excluidos.

No materializar contadores duplicados sin una decisión normativa. Si el modelo
calcula cantidades mediante consultas, mantener una única definición
reutilizable para bandeja y resumen.

Evitar diferencias entre:

- contador de la bandeja;
- filtro de conversaciones no leídas;
- resumen agregado;
- estado mostrado en detalle.

Un contador nunca debe incluir mensajes de conversaciones en las que el actor
no participa.

---

## 17. Resumen de conversaciones no leídas

`GET /conversaciones/no-leidas/resumen`:

- cuenta conversaciones con al menos un mensaje no leído;
- no suma la cantidad total de mensajes;
- utiliza exclusivamente participaciones del actor;
- excluye mensajes propios al determinar si una conversación tiene no leídos;
- no devuelve contenido ni metadatos sensibles;
- no registra auditoría por cada consulta periódica;
- debe poder ejecutarse eficientemente sin cargar mensajes en memoria.

La inclusión o exclusión de conversaciones archivadas todavía no está definida.
No fijarla por intuición ni permitir que bandeja y resumen adopten criterios
distintos accidentalmente.

La ruta estática se declara antes de `/:id` para impedir que `no-leidas` sea
interpretado como UUID.

---

## 18. Archivo y desarchivo individual

Archivar y desarchivar modifican únicamente la participación del actor.

Reglas:

- requieren participación;
- son idempotentes;
- no cambian la conversación para otros usuarios;
- no eliminan mensajes;
- no remueven participantes;
- no bloquean nuevos mensajes;
- no cierran la conversación;
- no alteran puntos de lectura;
- preservan el historial;
- registran auditoría cuando así lo exige el contrato.

Resultado idempotente:

```text
archivar una conversación archivada       → permanece archivada
desarchivar una conversación no archivada → permanece no archivada
```

No utilizar un campo global de conversación para esta función.

Todavía no está definido si un mensaje nuevo desarchiva automáticamente la
conversación del destinatario ni si una conversación archivada aparece en el
resumen de no leídas. No implementar ninguna de esas opciones sin aprobación.

---

## 19. Paciente, asunto y recursos inactivos

Al crear una conversación:

- el asunto debe existir y estar activo;
- el paciente es opcional;
- si se informa paciente, debe existir y estar activo.

No exigir vínculos profesionales para asociar al paciente.

Después de crear:

- desactivar el paciente no elimina ni bloquea la conversación;
- desactivar el asunto no elimina ni reescribe la conversación;
- el historial permanece disponible para participantes;
- el contexto se proyecta con el mínimo autorizado;
- no sustituir nombres históricos por valores vacíos sin una regla expresa;
- no reactivar recursos desde Mensajería.

La desactivación de usuarios debe preservar sus mensajes históricos. La
posibilidad de que un usuario inactivo siga accediendo se resuelve en
autenticación; Mensajería no debe borrar autoría ni reasignar mensajes.

---

## 20. Transacciones y rollback

Usar transacción cuando una operación escribe más de una entidad o exige
auditoría atómica.

Transacciones obligatorias:

| Caso de uso | Escrituras coordinadas |
|---|---|
| Crear conversación | Conversación, participantes, primer mensaje, lectura inicial y auditoría. |
| Incorporar participantes | Participaciones, puntos iniciales y auditoría. |
| Enviar mensaje | Mensaje y auditoría normativa. |
| Avanzar lectura | Participación y cualquier efecto aprobado. |
| Archivar/desarchivar | Participación y auditoría normativa. |

Reglas:

- abrir la transacción en el service;
- propagarla a todas las consultas y escrituras relacionadas;
- no abrir transacciones anidadas independientes;
- no registrar auditoría fuera de la transacción cuando sea parte obligatoria
  del caso de uso;
- no emitir una respuesta antes del commit;
- revertir completamente ante error;
- traducir el error después del rollback;
- no ejecutar llamadas externas dentro de la transacción.

La lectura de historial y los contadores no requieren transacción por sí solos,
salvo que una garantía de snapshot aprobada lo haga necesario.

---

## 21. Concurrencia

### Avance de lectura

Probar dos avances simultáneos desde dispositivos distintos. El resultado final
debe ser el punto más adelantado; nunca el último request que llegó si era más
antiguo.

### Incorporación duplicada

La unicidad conversación-usuario es la autoridad final. Traducir el conflicto
sin exponer el nombre del constraint. La semántica del lote mixto permanece
pendiente.

### Incorporación y envío simultáneos

Debe existir un límite transaccional coherente que determine si un mensaje
simultáneo:

- integra el historial inicial considerado leído; o
- se considera posterior y no leído.

Esta política todavía no está aprobada. No depender del orden casual de
sentencias ni afirmar un resultado sin prueba concurrente.

### Mensajes simultáneos

Ordenar de manera total mediante la combinación aprobada de timestamp e ID.
Probar timestamps empatados y paginación entre páginas para evitar omisiones o
duplicados.

### Archivo y actividad

Archivar, desarchivar o avanzar lectura son acciones individuales. No deben
reordenar accidentalmente la bandeja de todos los participantes mediante un
`updatedAt` global.

La documentación todavía debe definir qué acciones actualizan la actividad
visible de la conversación. No usar hooks genéricos como sustituto de esa
decisión.

---

## 22. Auditoría

Auditar los eventos funcionales exigidos por la documentación vigente, como:

- creación de conversación;
- incorporación de participantes;
- envío de mensaje;
- archivo y desarchivo individual;
- otros cambios expresamente definidos.

No auditar cada consulta periódica de:

- resumen de no leídas;
- contador de bandeja;
- polling de conversaciones;
- polling de mensajes.

Cada evento puede guardar únicamente metadatos mínimos autorizados:

- actor;
- acción;
- tipo e identificador del recurso;
- timestamp;
- resultado o contexto técnico sanitizado cuando corresponda.

Nunca guardar en auditoría:

- contenido del mensaje;
- preview;
- título de la conversación;
- nombre del paciente;
- asunto textual;
- body completo;
- listas completas de mensajes;
- tokens, cookies o credenciales.

La auditoría no es una copia del historial. Los mensajes permanecen en su tabla
funcional y se consultan solo mediante policies de participación.

---

## 23. Errores, privacidad e IDOR

Utilizar los códigos funcionales definidos en `docs/contrato-api.md`. No
inventar códigos alternativos mientras el contrato no esté disponible.

Traducir como mínimo estas categorías sin exponer detalles internos:

| Situación | Comportamiento contractual |
|---|---|
| Entrada inválida | Error de validación. |
| Conversación inexistente o ajena | `404` indistinguible. |
| Mensaje inexistente o de otra conversación | Error funcional sin revelar otra conversación. |
| Usuario, asunto o paciente inexistente/inactivo al crear | Error funcional vigente. |
| Participante duplicado | Conflicto traducido, nunca constraint SQL. |
| Cursor inválido | Error de validación contractual. |
| Retroceso de lectura | Idempotencia o conflicto según decisión vigente. |

No devolver:

- SQL;
- nombres de tablas o constraints;
- stack traces;
- IDs ajenos usados para diagnóstico;
- existencia de una conversación privada;
- contenido en mensajes de error;
- instancias Sequelize completas.

Los endpoints agregados también son susceptibles a IDOR: una consulta de
contador mal acotada puede revelar actividad ajena aunque no devuelva mensajes.

---

## 24. Consultas e índices

Diseñar consultas desde los patrones reales:

- bandeja por participante y estado individual de archivo;
- conversaciones con no leídos del actor;
- historial por conversación y orden compuesto;
- último mensaje autorizado;
- unicidad conversación-usuario;
- búsqueda de participantes activos;
- comparación y actualización del punto de lectura.

Reglas:

- aplicar `where` de participación en PostgreSQL;
- usar atributos e includes explícitos;
- evitar N+1 en participantes, último mensaje y no leídos;
- no cargar todos los mensajes para obtener el último;
- no contar en JavaScript si PostgreSQL puede hacerlo dentro del scope;
- no ordenar por campos no deterministas;
- justificar cada índice con una consulta real;
- revisar `EXPLAIN (ANALYZE, BUFFERS)` con datos representativos antes de
  afirmar una optimización;
- no agregar índices de búsqueda textual sobre mensajes en el MVP;
- no duplicar índices cubiertos por constraints existentes.

Los índices exactos, volumen esperado y umbrales de optimización pertenecen al
modelo de datos. No inventarlos en el módulo.

---

## 25. Datos sensibles y logging

Mensajes, previews y contexto del paciente son datos sensibles.

No registrar:

- bodies de creación o envío;
- contenido de mensajes;
- previews;
- títulos;
- paciente o asunto textual;
- arrays de destinatarios con datos personales;
- respuestas completas;
- consultas SQL con valores sensibles;
- tokens, cookies, DNI, emails o teléfonos.

Los logs técnicos pueden contener únicamente identificadores y metadatos
sanitizados cuando la política general lo autorice. No usar `console.log(req.body)`
ni logging automático de payloads en estas rutas.

Los fixtures, snapshots y mensajes de aserción también deben evitar contenido
real. El entorno de test no elimina la obligación de privacidad.

---

## 26. Exclusiones del MVP

No agregar:

- WebSocket o tiempo real;
- Server-Sent Events;
- notificaciones push;
- adjuntos;
- audios, imágenes o archivos;
- reacciones;
- menciones;
- indicadores de escritura;
- confirmación de lectura por cada mensaje;
- edición o eliminación de mensajes;
- eliminación o cierre de conversaciones;
- remoción de participantes;
- conversaciones públicas;
- acceso de pacientes o tutores;
- búsqueda sobre contenido;
- cifrado extremo a extremo;
- moderación automática;
- exportación de conversaciones;
- reenvío o copia automática a otros módulos.

No crear infraestructura anticipada para estas funciones.

---

## 27. Pruebas obligatorias

### Creación

- cualquier rol autenticado autorizado por el MVP puede crear;
- creador incorporado automáticamente;
- al menos un destinatario activo distinto;
- destinatario inexistente o inactivo;
- destinatarios duplicados según semántica aprobada;
- paciente omitido;
- paciente existente y activo;
- paciente inexistente o inactivo;
- asunto existente y activo;
- asunto inexistente o inactivo;
- no se exige vínculo clínico;
- primer mensaje y lectura inicial correctos;
- rollback completo ante falla intermedia;
- auditoría sin contenido.

### Participación y privacidad

- participante accede a bandeja, detalle, historial y envío;
- no participante recibe `404` por UUID conocido;
- administrador no participante no accede;
- coordinación no participante no accede;
- profesional vinculado pero no participante no accede;
- participante sin vínculo recibe solo contexto mínimo;
- previews y contadores no incluyen conversaciones ajenas;
- alta de participante solo por participante;
- nuevo participante accede al historial completo;
- no existe remoción.

### Mensajes e historial

- remitente asignado desde el actor;
- no se acepta remitente desde body;
- contenido válido e inválido;
- mensaje inmutable;
- cursor compuesto sin duplicados ni omisiones;
- timestamps empatados;
- cursor inválido;
- consultar historial no cambia lectura;
- auditoría no contiene mensaje ni preview.

### Lectura y no leídos

- destinatarios iniciales reciben el primer mensaje como no leído;
- mensajes propios no se cuentan;
- puntero vacío, avance e idempotencia;
- mensaje de otra conversación rechazado;
- puntero no retrocede;
- nuevo participante comienza con historial anterior leído;
- bandeja y resumen aplican la misma definición;
- resumen cuenta conversaciones y no mensajes;
- resumen no devuelve contenido.

### Archivo individual

- archivar afecta solo al actor;
- desarchivar afecta solo al actor;
- ambas operaciones son idempotentes;
- otros participantes conservan su estado;
- historial y participación se preservan;
- archivo no bloquea envío;
- comportamiento con no leídos según decisión aprobada.

### Concurrencia con PostgreSQL real

- dos avances simultáneos no retroceden el puntero;
- dos altas simultáneas del mismo participante preservan unicidad;
- mensaje e incorporación simultáneos respetan el límite aprobado;
- mensajes simultáneos tienen orden estable;
- paginación concurrente no duplica por empate de timestamps;
- archivo individual no altera estado ajeno;
- fallas transaccionales revierten todas las escrituras.

No reemplazar estas pruebas con mocks de Sequelize.

---

## 28. Acciones prohibidas

No realizar ninguna de estas acciones:

- conceder acceso global por rol;
- conceder acceso por vínculo clínico sin participación;
- responder `403` revelando una conversación privada cuando corresponde `404`;
- marcar como leída una conversación desde un `GET`;
- permitir que el puntero retroceda;
- comparar puntos de lectura solo por timestamp si puede empatar;
- aceptar `remitenteId`, `creadorId` o estado de lectura desde el cliente;
- editar o eliminar mensajes;
- eliminar conversaciones o participantes;
- archivar globalmente una conversación;
- contar mensajes propios como no leídos;
- contabilizar historial anterior para un participante recién incorporado;
- ocultar el historial previo al nuevo participante;
- exigir vínculo con el paciente;
- permitir acceso indirecto a la ficha clínica completa;
- registrar contenido, previews, títulos o bodies;
- auditar cada consulta periódica de no leídas;
- paginar mensajes con offset sin aprobación contractual;
- filtrar privacidad en memoria después de una consulta global;
- utilizar `include: { all: true }`;
- devolver instancias Sequelize completas;
- utilizar `sequelize.sync()`;
- modificar una migración aplicada;
- agregar triggers, índices o constraints no aprobados para ocultar una
  decisión pendiente;
- afirmar seguridad o concurrencia sin pruebas contra PostgreSQL real.

---

## 29. Sincronización documental

Cuando cambie Mensajería, revisar y actualizar únicamente lo afectado:

```text
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/migrations/
api/src/shared/database/models/
api/src/shared/database/associations.js
api/src/modules/mensajeria/
api/tests/
api/src/modules/mensajeria/AGENTS.md
```

Actualizar `docs/contrato-api.md` cuando cambien:

- endpoints;
- bodies;
- proyecciones;
- cursores;
- límites;
- filtros;
- códigos funcionales;
- semántica observable de lectura, no leídos o archivo.

Actualizar `docs/matriz-permisos.md` cuando cambien:

- quién puede crear;
- participación;
- acceso a contexto de paciente;
- alta de participantes;
- campos visibles;
- acciones individuales.

Actualizar `docs/modelo-datos.md` cuando cambien:

- tablas o columnas;
- claves foráneas;
- unicidad;
- puntero de lectura;
- estado de archivo;
- cascadas;
- índices;
- garantías de integridad.

No modificar la documentación normativa para justificar una implementación ya
realizada que contradice el contrato.

---

## 30. Procedimiento de trabajo

### Antes del cambio

1. Leer `api/AGENTS.md`.
2. Leer este archivo.
3. Leer el `AGENTS.md` de base de datos si afecta persistencia.
4. Consultar contrato, matriz de permisos y modelo de datos.
5. Inspeccionar rutas, services, policies, proyecciones y pruebas existentes.
6. Identificar la consulta exacta y el scope de participación.
7. Identificar contenido sensible que podría exponerse.
8. Evaluar transacciones y carreras concurrentes.
9. Identificar decisiones pendientes.
10. Detener cualquier parte ambigua con efecto contractual o de privacidad.

### Durante el cambio

1. Mantener el cambio acotado.
2. Validar entradas mediante Joi.
3. Aplicar participación en backend y en la consulta.
4. Usar listas positivas de atributos.
5. Abrir y propagar transacción cuando corresponda.
6. Preservar inmutabilidad y avance monotónico.
7. Traducir errores sin filtrar existencia ni SQL.
8. Registrar auditoría sin contenido.
9. Incorporar pruebas por rol, participación y concurrencia.
10. Actualizar solo la documentación afectada.

### Después del cambio

1. Migrar una base de prueba desde cero si cambió persistencia.
2. Ejecutar pruebas unitarias.
3. Ejecutar pruebas de integración contra PostgreSQL.
4. Ejecutar pruebas concurrentes si corresponde.
5. Ejecutar lint.
6. Probar IDOR con UUID conocido de una conversación ajena.
7. Revisar proyecciones, logs, auditoría y errores.
8. Comparar bandeja, detalle y resumen de no leídas.
9. Revisar planes de consulta si cambiaron índices o agregados.
10. Informar comandos, resultados y validaciones no realizadas.

No declarar una tarea terminada si no se ejecutaron las validaciones
correspondientes.

---

## 31. Definition of Done

Un cambio de Mensajería está completo solamente cuando:

- respeta las rutas y envelopes contractuales;
- la participación se verifica en cada recurso y consulta;
- no existe acceso global implícito por rol;
- los intentos de IDOR no revelan existencia ni contenido;
- creador y remitente se obtienen del actor;
- los recursos requeridos se validan en backend;
- la creación es transaccional y no deja filas parciales;
- los participantes nuevos acceden al historial completo;
- el historial anterior no se cuenta como no leído para ellos;
- los mensajes permanecen inmutables;
- la paginación utiliza un orden total estable;
- consultar no marca como leído;
- el puntero solo avanza y no retrocede bajo concurrencia;
- los mensajes propios no integran no leídos;
- el resumen cuenta conversaciones, no mensajes;
- el archivo modifica solo la participación del actor;
- archivo y desarchivo son idempotentes;
- las proyecciones contienen únicamente campos autorizados;
- no se exponen otros módulos clínicos mediante el paciente mínimo;
- auditoría y logs no contienen mensajes ni previews;
- los errores internos están traducidos;
- las pruebas relevantes pasan contra PostgreSQL real;
- lint pasa;
- la documentación afectada está actualizada;
- cualquier riesgo o decisión pendiente quedó informado.

---

## 32. Decisiones pendientes

Mientras no estén resueltas en la documentación normativa, no definir por
cuenta propia:

- límites definitivos de título y mensaje;
- longitud y reglas de truncado o normalización del preview;
- forma física definitiva de conversaciones, participantes y mensajes;
- formato y dirección exactos del cursor;
- confirmación del orden compuesto como base normativa del puntero;
- estrategia concreta para garantizar avance monotónico;
- resultado de un lote que mezcla usuarios nuevos y ya participantes;
- límite transaccional entre incorporación y mensaje simultáneos;
- si un mensaje nuevo desarchiva automáticamente la conversación;
- si conversaciones archivadas integran el resumen de no leídas;
- qué acciones modifican la actividad global y el orden de bandeja;
- si avanzar lectura o archivar modifica algún `updatedAt` visible;
- comportamiento del envío respecto del punto propio de lectura;
- garantías de snapshot entre bandeja, contador y resumen;
- códigos funcionales definitivos no presentes en el contrato disponible;
- nombres exactos de eventos de auditoría;
- política de retención o archivado histórico;
- índices y umbrales de optimización;
- trigger o constraint compuesto para pertenencia del puntero;
- cualquier ampliación con tiempo real, adjuntos o notificaciones.

Cuando una tarea dependa de alguno de estos puntos, detener esa parte y
solicitar una decisión explícita.
