# AGENTS.md — Auditoría funcional

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/auditoria/
```

También deben respetarse al emitir o consultar eventos desde cualquier otro
módulo, especialmente:

```text
api/src/modules/auth/
api/src/modules/usuarios/
api/src/modules/pacientes/
api/src/modules/vinculos/
api/src/modules/turnos/
api/src/modules/informes/
api/src/modules/mensajeria/
api/src/modules/catalogos/
api/src/shared/database/models/
api/src/shared/http/
api/src/shared/logging/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend ni las instrucciones especializadas de cada módulo productor.

Antes de modificar Auditoría o incorporar un evento, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/shared/database/AGENTS.md
```

Si alguno todavía no existe en el checkout, no inventar su contenido. Aplicar
únicamente las decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. `docs/contrato-api.md`, `docs/matriz-permisos.md` y
   `docs/modelo-datos.md` vigentes;
4. este archivo especializado;
5. `api/AGENTS.md`.

Ante una contradicción, detener solo la parte afectada, documentar la
inconsistencia y solicitar una decisión. No cambiar el catálogo, el contrato o
la matriz para encubrir una implementación incompatible.

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
- usar UUID y datos completamente ficticios en fixtures;
- no imprimir metadata, IP, user agent, tokens, bodies ni eventos completos;
- comprobar rollback y atomicidad con operaciones funcionales reales;
- probar accesos directos al endpoint con todos los roles;
- revisar snapshots y mensajes de error antes de conservarlos;
- informar comandos ejecutados, resultados y validaciones no realizadas;
- no afirmar que la tabla es físicamente append-only si la garantía existe
  únicamente en routes, services o models.

---

## 3. Decisiones obligatorias del MVP

```text
Recurso HTTP:              GET /api/v1/auditoria
Acceso:                    solo administrador
Detalle individual:       no existe
Creación manual:           no existe
Edición:                   no existe
Eliminación:               no existe
Exportación:               no existe
Persistencia:              append-only para la aplicación
Resultados:                exitoso, fallido
Correlation ID:            obligatorio
Metadata:                  lista positiva por evento
Logs técnicos:             mecanismo separado
Polling de no leídos:      no se audita
```

Reglas centrales:

- ningún usuario crea eventos manualmente mediante HTTP;
- los módulos funcionales deciden cuándo una acción exige auditoría;
- Auditoría valida el contrato interno del evento, sanitiza, persiste, consulta
  y proyecta;
- el catálogo utiliza códigos canónicos y estables;
- no se crean aliases ni cadenas libres para la misma acción;
- los eventos exitosos que forman parte de una operación funcional se guardan
  en la misma transacción;
- si la operación funcional se revierte, su evento exitoso también se revierte;
- `usuario_id` puede ser nulo únicamente para un intento sin actor identificado
  o un proceso automático expresamente aprobado;
- `correlation_id` es obligatorio y procede del contexto de request aprobado;
- el administrador consulta el historial, pero tampoco puede modificarlo;
- el acceso administrativo no habilita la persistencia de información sensible.

No ampliar el módulo a un CRUD, un sistema de analítica, una copia de requests o
un almacén general de logs.

---

## 4. Decisión contraintuitiva: auditoría no es logging ni CRUD

Aplicar esta separación:

```text
Módulo funcional  -> decide la acción y el momento del evento
Auditoría         -> valida, minimiza, persiste y consulta el evento
Logging técnico   -> diagnostica la ejecución sin conservar negocio sensible
Administrador     -> solo consulta el historial autorizado
```

Un middleware de request puede aportar `correlationId`, IP o user agent, pero no
debe inferir por sí solo:

- si el caso de uso fue funcionalmente exitoso;
- cuál es el recurso afectado;
- qué transición ocurrió;
- qué metadata es admisible;
- si el evento comparte la transacción de negocio.

No reemplazar eventos funcionales por “método + URL + body”. No duplicar cada
evento en logs con toda su metadata. No exponer operaciones de escritura al
administrador.

---

## 5. Responsabilidad del módulo

`auditoria` es dueño de:

- catálogo central de acciones, recursos y resultados;
- contrato interno de cada evento;
- listas positivas de metadata por evento;
- validación y sanitización antes de persistir;
- persistencia de eventos funcionales;
- participación en transacciones iniciadas por otros services;
- consulta administrativa paginada;
- filtros autorizados y orden estable;
- policy de acceso exclusivo del administrador;
- proyección contractual de actor y evento;
- protección append-only dentro de la aplicación;
- traducción de errores propios de consulta;
- pruebas transversales de privacidad e integridad.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/auditoria/
├── auditoria.routes.js
├── auditoria.validation.js
├── auditoria.controller.js
├── auditoria.service.js
├── auditoria.policy.js
├── auditoria.projection.js
├── auditoria.events.js
└── AGENTS.md
```

`auditoria.events.js` centraliza los códigos y el contrato de metadata. No debe
contener secretos ni depender de controllers.

Los modelos Sequelize permanecen centralizados en
`src/shared/database/models/`. No definir un modelo paralelo dentro del módulo.
No agregar un Repository aislado salvo que el backend adopte formalmente ese
patrón de forma transversal.

---

## 6. Responsabilidades por capa

### Routes

- declaran únicamente `GET /auditoria`;
- componen autenticación, autorización de administrador, validación y
  controller;
- no permiten métodos de escritura;
- no consultan modelos;
- no sanitizan metadata después de recuperarla como sustituto de una proyección
  segura.

### Validation

- valida query, paginación, UUID, fechas, enums y orden;
- acepta solo los filtros contractuales;
- limita `accion` y `recurso` según los catálogos vigentes;
- rechaza propiedades inesperadas;
- no consulta PostgreSQL;
- no decide el scope mediante parámetros enviados por el cliente.

### Controllers

- reciben query ya validada y actor autenticado;
- invocan un caso de uso del service;
- devuelven el envelope paginado contractual;
- no abren transacciones;
- no crean eventos;
- no serializan instancias Sequelize completas;
- no exponen `user_agent`.

### Services

- exponen una operación interna de registro para módulos productores;
- exigen una transacción cuando el contrato del evento exitoso lo requiere;
- validan acción, recurso, resultado y metadata contra el catálogo;
- obtienen el actor del contexto confiable, nunca de un body público;
- normalizan y reducen el contexto técnico;
- persisten solo campos aprobados;
- consultan con atributos y asociaciones explícitos;
- aplican filtros sin ampliar permisos;
- seleccionan la proyección contractual;
- no reciben `req`, `res` ni status HTTP;
- no convierten errores inesperados en eventos fallidos recursivos.

### Policies

- permiten consulta únicamente al rol `administrador` autenticado y activo;
- no conceden acceso a coordinación, secretaría ni profesional;
- no confían en ocultamiento de frontend;
- no introducen permisos por propiedad del evento;
- no permiten que un usuario consulte “sus propios eventos”.

### Proyecciones

- usan listas positivas de columnas y asociaciones;
- resumen al actor con `id`, `nombre` y `apellido`, o devuelve `null`;
- incluyen solo metadata ya validada y autorizada;
- omiten `user_agent` aunque exista en PostgreSQL;
- no utilizan `model.toJSON()` como respuesta;
- no utilizan `include: { all: true }`;
- no exponen columnas, asociaciones o contexto no contractual.

### Catálogo de eventos

- define una constante por código canónico;
- asocia cada acción con un recurso permitido;
- declara las claves de metadata permitidas;
- declara si `recursoId` puede ser nulo;
- declara qué resultados son válidos;
- evita que los producers construyan contratos ad hoc;
- falla de forma segura ante una acción o clave desconocida.

---

## 7. Endpoint permitido

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/v1/auditoria` | Solo `administrador`; listado paginado y filtrable. |

No existen:

```text
GET    /api/v1/auditoria/:id
POST   /api/v1/auditoria
PUT    /api/v1/auditoria/:id
PATCH  /api/v1/auditoria/:id
DELETE /api/v1/auditoria/:id
GET    /api/v1/auditoria/exportar
```

No incorporar aliases, endpoints internos expuestos por HTTP, exportación,
descarga masiva ni rutas genéricas.

La operación interna utilizada por otros services no es un endpoint y no
acepta datos directamente suministrados por el cliente sin validación del
productor.

---

## 8. Modelo funcional mínimo

La representación física exacta proviene de `docs/modelo-datos.md` y de las
migraciones vigentes.

La tabla aprobada es:

```text
auditoria_eventos
```

Campos funcionales:

| Campo físico | Regla |
|---|---|
| `id` | UUID generado por backend o PostgreSQL. |
| `usuario_id` | Actor; nullable solo en los casos aprobados. |
| `accion` | Código estable del catálogo. |
| `recurso` | Tipo de recurso canónico. |
| `recurso_id` | UUID afectado; nullable cuando el contrato del evento lo admite. |
| `resultado` | Solo `exitoso` o `fallido`. |
| `metadata` | JSONB mínimo y validado por lista positiva. |
| `ip` | Contexto técnico opcional. |
| `user_agent` | Contexto opcional, truncado al máximo documental. |
| `correlation_id` | UUID obligatorio para correlación con logs. |
| `created_at` | Instante generado al persistir. |

Invariantes:

- no existe `updated_at` porque el evento es inmutable para la aplicación;
- no se persiste el request, la response ni una copia del recurso;
- `resultado` posee defensa mediante `CHECK` en PostgreSQL;
- los tipos de FK deben coincidir con sus claves referenciadas;
- la baja o eliminación técnica de un actor histórico no elimina el evento;
- `usuario_id` utiliza la política `SET NULL` definida en el modelo;
- ninguna asociación debe habilitar cascadas de borrado desde la API.

No agregar columnas, enums nativos, tablas auxiliares ni JSONB sin contrato
documental.

---

## 9. Catálogo mínimo de acciones

Utilizar exactamente estos códigos mientras la documentación vigente no apruebe
otros.

### Autenticación

```text
LOGIN_EXITOSO
LOGIN_FALLIDO
SESION_RENOVADA
LOGOUT
LOGOUT_TODAS
```

### Usuarios y accesos

```text
USUARIO_CREADO
USUARIO_EDITADO
USUARIO_ACTIVADO
USUARIO_DESACTIVADO
ACCESO_RESTABLECIDO
USUARIO_FOTO_ACTUALIZADA
USUARIO_FOTO_ELIMINADA
```

### Pacientes y vínculos

```text
PACIENTE_CREADO
PACIENTE_EDITADO
PACIENTE_ACTIVADO
PACIENTE_DESACTIVADO
PRESTADOR_VINCULADO
PRESTADOR_VINCULADO_AUTOMATICAMENTE
PRESTADOR_DESVINCULADO
```

### Servicios y catálogos

```text
SERVICIO_ASIGNADO
SERVICIO_QUITADO
CATALOGO_CREADO
CATALOGO_EDITADO
CATALOGO_ACTIVADO
CATALOGO_DESACTIVADO
SERVICIO_IMAGEN_ACTUALIZADA
SERVICIO_IMAGEN_ELIMINADA
```

### Turnos

```text
TURNO_CREADO
TURNO_CONFIRMADO
TURNO_CANCELADO
TURNO_COMPLETADO
TURNO_AUSENTE
TURNO_OBSERVACION_EDITADA
TURNO_NOTA_INTERNA_EDITADA
```

### Informes

```text
INFORME_CREADO
INFORME_EDITADO
INFORME_FINALIZADO
INFORME_VISUALIZADO
```

### Mensajería

```text
CONVERSACION_CREADA
PARTICIPANTE_AGREGADO
MENSAJE_ENVIADO
CONVERSACION_ARCHIVADA
CONVERSACION_DESARCHIVADA
```

Reglas:

- no traducir estos códigos;
- no usar etiquetas visibles como código persistido;
- no crear variantes por rol o endpoint;
- no reutilizar un código para un significado diferente;
- una acción nueva requiere decisión funcional, actualización documental,
  contrato de metadata y pruebas;
- si un productor necesita un evento no catalogado, detener esa parte y
  proponer su incorporación; no usar una cadena improvisada.

---

## 10. Contrato interno del evento

Cada evento debe construirse a partir de datos confiables del caso de uso:

```text
accion
recurso
recursoId o null autorizado
resultado
usuarioId o null autorizado
metadata aprobada o null
ip normalizada o null
userAgent truncado o null
correlationId
transaction, cuando corresponda
```

Reglas:

- `accion`, `recurso` y claves de metadata se validan contra
  `auditoria.events.js`;
- el actor proviene del contexto autenticado o del contexto interno aprobado;
- el productor no envía `createdAt` como fuente de verdad;
- el cliente nunca decide `resultado`, actor, acción o recurso;
- `correlationId` no se genera de nuevo en el service de Auditoría;
- metadata ausente se representa conforme al modelo, sin inventar un objeto
  lleno de valores nulos;
- no persistir propiedades desconocidas aunque parezcan inocuas;
- no “sanitizar” mediante una denylist: descartar todo lo no permitido.

El service debe rechazar un contrato interno inválido. No persistir parcialmente
un evento defectuoso ni degradarlo silenciosamente a un evento genérico.

---

## 11. Módulos productores

Cada módulo funcional es responsable de:

1. identificar la acción canónica;
2. completar la operación de negocio autorizada;
3. seleccionar únicamente metadata aprobada;
4. propagar actor, `correlationId` y transacción;
5. invocar Auditoría en el punto funcional correcto;
6. comprobar la atomicidad mediante pruebas.

El productor no debe:

- insertar directamente en `auditoria_eventos`;
- duplicar el catálogo;
- construir una metadata arbitraria;
- enviar instancias Sequelize completas;
- enviar `req`, `res`, body o headers completos;
- ocultar fallos de persistencia de eventos exitosos obligatorios;
- emitir el evento antes de saber que la operación funcional es válida.

Hooks genéricos de Sequelize no sustituyen eventos funcionales. Un hook conoce
una escritura de tabla, pero no necesariamente la intención, el actor, el
resultado de negocio o la transacción completa.

---

## 12. Actor y eventos sin usuario

Para acciones autenticadas:

- `usuario_id` se obtiene del actor autenticado;
- no se acepta desde body, query ni params;
- el actor puede diferir del recurso afectado;
- no duplicar al actor completo en metadata.

`usuario_id = null` está permitido por el modelo para:

- intentos sin identidad autenticada, como un login fallido;
- procesos automáticos expresamente aprobados.

No interpretar la nulabilidad como autorización para omitir actores conocidos.
No crear identidades ficticias como `system`, UUID cero o administrador
predeterminado.

Cuando un usuario histórico deja de existir por una operación técnica permitida
y la FK aplica `SET NULL`, el evento se conserva. La proyección devuelve
`usuario: null`; no reconstruye datos personales desde metadata.

El catálogo definitivo de eventos automáticos continúa pendiente. No emitirlos
sin aprobación.

---

## 13. Correlation ID y contexto de request

Toda solicitud recibe un `correlationId` UUID desde el contexto HTTP general:

- se valida `X-Correlation-Id` si el cliente lo envía;
- se genera uno si falta;
- se devuelve en el header de respuesta;
- se incluye en el envelope de error;
- se propaga a logs técnicos, services y auditoría;
- se persiste como `correlation_id` en cada evento relacionado.

Auditoría no debe:

- aceptar un correlation ID diferente desde metadata;
- generar uno nuevo para cada escritura del mismo caso de uso;
- utilizarlo como autorización;
- exponer otros eventos por conocer ese UUID;
- copiar el request completo para facilitar diagnóstico.

El filtro por `correlationId` está disponible únicamente para el administrador
dentro de `GET /auditoria`.

---

## 14. Eventos exitosos y transacciones

Cuando el evento exitoso forma parte del resultado funcional, debe persistirse
en la misma transacción que la operación de negocio.

Patrón obligatorio:

```text
service dueño abre transacción
  -> valida estado y permisos
  -> ejecuta escrituras funcionales
  -> auditoria.service registra con la misma transaction
  -> commit único
```

Si falla cualquier parte:

- se revierte la escritura funcional;
- se revierte el evento exitoso;
- no se confirma un resultado parcial;
- no se reintenta Auditoría fuera de la transacción para aparentar éxito.

La transacción la abre el service dueño del caso de uso. Auditoría recibe y usa
la instancia existente; no crea una transacción anidada independiente.

Son transaccionales, entre otros:

- transición de estado de turno y evento;
- finalización de informe y evento;
- creación de conversación, participantes, primer mensaje y eventos aprobados;
- incorporación de participantes y auditoría;
- desactivación de usuario, revocación de sesiones, cierre de vínculos y evento;
- cambio de DNI, actualización del hash, revocación y evento;
- rotación o revocación de sesión cuando el evento integra el resultado.

Mantener las transacciones breves. No realizar llamadas externas irreversibles
dentro de ellas.

---

## 15. Eventos fallidos

`resultado = fallido` forma parte del modelo y `LOGIN_FALLIDO` pertenece al
catálogo. Sin embargo, una escritura dentro de la transacción que falla se
revierte con ella.

El mecanismo transversal para conservar intentos fallidos fuera del rollback
no está aprobado.

Hasta que exista una decisión:

- no abrir una conexión o transacción paralela por intuición;
- no escribir después del rollback sin una estrategia explícita;
- no usar colas, outbox, bus de eventos o almacenamiento externo;
- no degradar un error funcional a un evento exitoso;
- no afirmar que todos los intentos fallidos quedan persistidos;
- mantener `LOGIN_FALLIDO` en el catálogo y detener la implementación de su
  persistencia durable si depende de esta decisión.

Una causa fallida, cuando sea posible registrarla mediante una estrategia
aprobada, debe ser un código técnico normalizado. Nunca debe incluir credenciales,
SQL, constraints, stacks ni mensajes crudos de dependencias.

---

## 16. Metadata mediante lista positiva

`metadata` es contexto mínimo, no un objeto libre. Cada acción debe declarar en
el catálogo las claves que admite.

Familias de datos autorizables:

- UUID de recursos relacionados;
- estado anterior y nuevo;
- nombres técnicos de campos modificados;
- cantidad de elementos afectados;
- tipo técnico de catálogo;
- motivo administrativo no clínico expresamente aprobado;
- referencia técnica de correlación cuando no duplique campos principales;
- causa normalizada de un resultado fallido.

Convenciones:

- utilizar nombres `camelCase` en la proyección JSON;
- preferir identificadores sobre nombres personales o textos descriptivos;
- almacenar estados mediante valores canónicos;
- registrar campos modificados, no sus valores, cuando el valor pueda contener
  información sensible;
- limitar arrays a cantidades razonables definidas por el contrato interno;
- rechazar objetos anidados no declarados;
- no persistir claves con `undefined`, datos redundantes o copias de columnas
  principales.

Ejemplos permitidos cuando el evento correspondiente los declara:

```json
{
  "estadoAnterior": "confirmado",
  "estadoNuevo": "cancelado"
}
```

```json
{
  "camposModificados": ["notasInternas"]
}
```

El segundo ejemplo registra que el campo cambió, nunca su contenido.

No aceptar metadata arbitraria para luego recorrerla con una denylist. Toda
clave no declarada se descarta o provoca un error interno de contrato según la
estrategia transversal aprobada; nunca se persiste.

---

## 17. Datos terminantemente prohibidos

No almacenar en `metadata`, otras columnas, logs, errores, fixtures o snapshots:

- DNI;
- email o DNI utilizados como credencial cuando identifiquen el intento;
- contraseñas y hashes;
- access tokens o refresh tokens;
- cookies o cabecera `Authorization`;
- secretos y credenciales de infraestructura;
- diagnósticos y observaciones clínicas;
- títulos, resúmenes o contenidos de informes;
- respuestas clínicas completas;
- mensajes, previews o títulos de conversaciones;
- nombres de pacientes usados como contexto de mensajería;
- observaciones administrativas o `notasInternas` de turnos;
- motivo completo de cancelación sin aprobación específica;
- datos completos de tutores;
- cuerpos HTTP o respuestas completas;
- SQL, parámetros de consulta o nombres de constraints;
- stacks o errores crudos;
- nombres originales de archivos;
- rutas absolutas o detalles de infraestructura;
- instancias Sequelize serializadas.

El acceso exclusivo del administrador no reduce estas restricciones.

No registrar el valor anterior y nuevo de un campo sensible. Para eventos como
`TURNO_NOTA_INTERNA_EDITADA`, registrar únicamente el nombre técnico del campo
o la existencia del cambio.

---

## 18. Consulta, filtros y paginación

`GET /api/v1/auditoria` admite exclusivamente:

| Parámetro | Regla |
|---|---|
| `page` | Entero, mínimo `1`, default general. |
| `limit` | Entero dentro de los límites generales. |
| `usuarioId` | UUID exacto del actor. |
| `accion` | Código estable existente. |
| `recurso` | Tipo canónico de recurso. |
| `recursoId` | UUID exacto del recurso afectado. |
| `resultado` | `exitoso` o `fallido`. |
| `desde` | Fecha o instante; límite inclusivo. |
| `hasta` | Fecha o instante; límite exclusivo. |
| `correlationId` | UUID exacto. |
| `sort` | Solo `createdAt`. |
| `order` | `asc` o `desc`; default descendente. |

Reglas:

- no agregar búsqueda textual libre sobre metadata;
- no filtrar mediante claves JSONB arbitrarias;
- no permitir ordenar por IP, actor, acción, recurso o metadata;
- validar que `desde < hasta` cuando ambos estén presentes;
- interpretar fechas e instantes según las convenciones generales aprobadas;
- combinar filtros con `AND`, salvo contrato posterior expreso;
- usar consultas parametrizadas mediante Sequelize;
- seleccionar solo columnas contractuales;
- aplicar un desempate estable por `id` coherente con el orden de `createdAt`;
- no devolver páginas fuera del envelope general;
- no ampliar límites para facilitar una exportación encubierta.

`desde` es inclusivo y `hasta` exclusivo. No cambiar a rangos cerrados ni sumar
un día de forma implícita sin una regla temporal aprobada.

---

## 19. Proyección contractual

La respuesta exitosa incluye únicamente:

```text
id
usuario resumido o null
accion
recurso
recursoId
resultado
metadata sanitizada
ip
correlationId
createdAt
```

El actor resumido contiene:

```text
id
nombre
apellido
```

Ejemplo de forma autorizada:

```json
{
  "id": "uuid",
  "usuario": {
    "id": "uuid",
    "nombre": "Carla",
    "apellido": "Domínguez"
  },
  "accion": "TURNO_CANCELADO",
  "recurso": "turno",
  "recursoId": "uuid",
  "resultado": "exitoso",
  "metadata": {
    "estadoAnterior": "confirmado",
    "estadoNuevo": "cancelado"
  },
  "ip": "192.0.2.10",
  "correlationId": "uuid",
  "createdAt": "2026-08-01T12:00:00.000Z"
}
```

`usuario` puede ser `null`. No sustituirlo por un usuario borrado, un texto
“sistema” ni datos históricos recuperados desde metadata.

Aunque `user_agent` exista en PostgreSQL, no se expone. Tampoco se exponen:

- `usuario_id` como campo adicional;
- timestamps distintos de `createdAt`;
- asociaciones completas de usuario o recurso;
- flags internos;
- nombres de tablas o constraints.

---

## 20. Acceso, privacidad e IDOR

Solo un actor autenticado, activo y con rol `administrador` puede listar y
filtrar auditoría.

No existe:

- acceso global para coordinación;
- acceso operativo para secretaría;
- acceso profesional a eventos propios;
- acceso de un usuario a eventos donde es actor o recurso;
- enlace público o descarga compartida;
- endpoint de detalle por UUID.

La policy se aplica antes de ejecutar la consulta. No recuperar datos para luego
ocultarlos en el controller.

Los filtros nunca conceden acceso. Conocer un `usuarioId`, `recursoId` o
`correlationId` no permite consultar Auditoría sin el rol autorizado.

Las pruebas deben enviar solicitudes directas con todos los roles y actores
inactivos. No considerar suficiente que el menú no sea visible en frontend.

---

## 21. Append-only e inmutabilidad

Para la aplicación, `auditoria_eventos` es append-only:

- solo se insertan eventos;
- no se actualizan;
- no se eliminan;
- no se restauran;
- no se corrigen manualmente;
- no se desactivan;
- no se reemplaza al actor;
- no se modifica metadata después de persistir.

No definir:

- rutas de escritura;
- métodos públicos `update` o `delete` en el service;
- hooks que modifiquen eventos históricos;
- asociaciones con cascadas activables desde la API;
- tareas de limpieza sin política de retención.

La protección física en PostgreSQL todavía no está aprobada. No agregar por
intuición:

- triggers que rechacen `UPDATE` o `DELETE`;
- permisos especiales de tabla;
- roles de base de datos separados;
- reglas de Row-Level Security;
- particiones o tablas históricas.

Documentar con precisión si la garantía verificada es solo de aplicación.

---

## 22. Logs técnicos y auditoría funcional

Los logs técnicos pueden registrar:

- inicio y apagado;
- método y ruta normalizada;
- status HTTP y duración;
- `correlation_id`;
- código funcional de error;
- fallos de conexión o infraestructura sanitizados.

La auditoría funcional registra:

- actor o ausencia autorizada de actor;
- acción canónica;
- recurso e identificador permitido;
- resultado;
- instante;
- metadata mínima;
- contexto técnico aprobado.

No duplicar el contenido de negocio entre ambos mecanismos. Ambos deben
redactar los datos prohibidos de la sección 17.

No crear un evento de auditoría por cada línea de log ni un log completo por
cada evento. La correlación se realiza mediante `correlationId`, no copiando el
request.

---

## 23. IP y user agent

`ip` y `user_agent` son contexto técnico opcional, no identidad ni autorización.

Reglas:

- obtenerlos del contexto HTTP normalizado;
- no recibirlos desde el body del caso de uso;
- validar la IP antes de persistir en la columna `INET`;
- respetar la configuración productiva de proxies confiables;
- no confiar indiscriminadamente en `X-Forwarded-For`;
- truncar `user_agent` al máximo definido en `docs/modelo-datos.md`;
- no usar user agent como prueba única de sesión, usuario o dispositivo;
- no devolver `user_agent` en `GET /auditoria`;
- no copiar headers completos en metadata.

La configuración productiva definitiva de proxy confiable permanece pendiente.
No interpretar encabezados suministrados por el cliente sin esa decisión.

---

## 24. Auditoría de lecturas sensibles

La visualización exitosa del detalle de un informe exige:

```text
INFORME_VISUALIZADO
```

El evento no contiene título, resumen, contenido, respuesta clínica ni datos de
contacto. Puede identificar el recurso mediante UUID conforme al contrato del
evento.

La política ante un fallo al registrar esta lectura todavía no está definida:

- no está aprobado entregar el contenido y recuperar la auditoría después;
- no está aprobado bloquear la respuesta si falla la auditoría;
- no está aprobado usar una cola o outbox.

Detener la implementación de esa conducta y solicitar una decisión. No decidir
por intuición ni capturar el error para continuar silenciosamente.

No auditar cada polling de:

- `GET /conversaciones/no-leidas/resumen`;
- contadores de bandeja;
- consultas periódicas de conversaciones o mensajes.

No está definido si `GET /auditoria` debe auditar su propia consulta. No crear
esa recursión por intuición.

---

## 25. Errores y fallos internos

Aplicar el contrato transversal de errores:

- entrada o filtros inválidos: error de validación;
- actor no autenticado: error de autenticación;
- rol no autorizado: `403 FORBIDDEN` conforme al contrato general;
- error inesperado: `500 INTERNAL_ERROR` sin detalle interno.

Reglas:

- no exponer SQL, constraints, stacks, rutas ni metadata completa;
- no devolver el evento interno que falló como parte del error;
- no convertir una violación inesperada en `200` con lista vacía;
- no registrar recursivamente un fallo de Auditoría mediante Auditoría;
- usar logs técnicos sanitizados y el mismo `correlationId` para diagnóstico;
- no revelar si existe un actor o recurso mediante mensajes de validación no
  contractuales.

Si el catálogo interno rechaza una acción o metadata desconocida, tratarlo como
un defecto de implementación, no como entrada corregible por el usuario final.

---

## 26. Consultas e índices

Usar los índices definidos en `docs/modelo-datos.md` y las migraciones:

```text
(usuario_id, created_at DESC)
(recurso, recurso_id, created_at DESC)
(accion, created_at DESC)
(correlation_id)
(created_at DESC, id DESC)
```

Reglas:

- no duplicar índices equivalentes sin medir;
- no eliminar índices para simplificar migraciones o tests;
- no agregar índices JSONB genéricos sin consultas aprobadas;
- evitar `include: { all: true }`;
- cargar solo `id`, `nombre` y `apellido` del actor;
- no ejecutar una consulta por fila para resolver usuarios;
- preservar el orden determinista de páginas;
- revisar planes de ejecución con volumen representativo antes de optimizar;
- mantener la paginación contractual aunque el historial sea pequeño.

La retención y el volumen esperado no están aprobados; no convertir suposiciones
de escala en particionado o desnormalización.

---

## 27. Retención, archivado y particionado

No existe una política aprobada para:

- plazo de conservación;
- archivado en frío;
- particionado por fecha;
- purga;
- anonimización histórica;
- exportación regulatoria;
- volumen máximo esperado.

Hasta contar con una decisión:

- conservar los eventos;
- no crear cron jobs de borrado;
- no usar TTL;
- no truncar la tabla;
- no mover eventos a otra base;
- no particionar automáticamente;
- no agregar endpoints de exportación o eliminación.

Una futura política debe actualizar modelo, arquitectura, contrato cuando
corresponda, migraciones, operaciones y pruebas.

---

## 28. Pruebas obligatorias

### Acceso

- administrador activo lista y filtra;
- coordinación recibe denegación;
- secretaría recibe denegación;
- profesional recibe denegación;
- usuario inactivo no accede;
- actor no autenticado no accede;
- conocer UUID o correlation ID no evita la policy;
- no existen rutas de detalle, escritura o exportación.

### Consulta

- paginación por defaults, límites y páginas sucesivas;
- filtros por actor, acción, recurso, recursoId, resultado y correlación;
- `desde` inclusivo y `hasta` exclusivo;
- combinación de filtros;
- orden ascendente y descendente por `createdAt`;
- desempate estable cuando varios eventos comparten instante;
- UUID, fechas, enums, sort y order inválidos;
- `usuario: null` para eventos sin actor disponible;
- proyección exacta sin `userAgent` ni columnas extra.

### Catálogo y metadata

- todos los códigos aprobados se aceptan;
- acción desconocida se rechaza internamente;
- recurso incompatible se rechaza;
- resultado fuera de catálogo se rechaza;
- metadata no declarada no se persiste;
- strings, objetos o arrays sensibles no atraviesan sanitización;
- `TURNO_NOTA_INTERNA_EDITADA` no almacena el valor;
- `MENSAJE_ENVIADO` no almacena contenido ni preview;
- `INFORME_VISUALIZADO` no almacena contenido clínico;
- login fallido no almacena credenciales ni identificadores del intento.

### Transacciones

- operación funcional y evento exitoso confirman juntos;
- fallo del evento obligatorio revierte la operación;
- fallo de la operación revierte el evento;
- no quedan eventos exitosos huérfanos;
- la misma instancia de transacción llega al registro;
- no se abren transacciones anidadas;
- un rollback no se convierte silenciosamente en éxito.

### Inmutabilidad

- no existen routes de actualización o eliminación;
- el service público no expone esas operaciones;
- ninguna operación administrativa modifica eventos;
- las asociaciones no permiten borrado funcional en cascada;
- las pruebas distinguen inmutabilidad de aplicación y garantía física.

### Privacidad

- fixtures y snapshots carecen de DNI, tokens, hashes y cookies;
- errores carecen de SQL, constraints y stacks;
- logs carecen de bodies y contenido sensible;
- respuestas carecen de `userAgent`;
- metadata carece de informes, mensajes, notas y datos clínicos;
- los serializers no filtran asociaciones completas por accidente.

No marcar como cubiertas las decisiones pendientes mediante pruebas que
cristalicen una conducta no aprobada.

---

## 29. Acciones prohibidas

No:

- exponer Auditoría como CRUD;
- permitir consulta a roles distintos de administrador;
- permitir que un usuario consulte sus eventos por propiedad;
- crear un endpoint de detalle;
- crear exportación o descarga masiva;
- insertar eventos desde controllers o routes funcionales;
- permitir strings de acción libres;
- aceptar metadata arbitraria;
- persistir request o response completos;
- guardar información clínica, credenciales, mensajes o notas internas;
- incluir `userAgent` en la respuesta;
- usar un middleware HTTP genérico como única auditoría funcional;
- usar hooks Sequelize como sustituto del caso de uso;
- crear eventos recursivos ante un fallo de Auditoría;
- confirmar una operación funcional si falla su evento exitoso obligatorio;
- inventar una estrategia para eventos fallidos fuera del rollback;
- agregar triggers append-only, RLS, particionado o jobs de purga sin aprobación;
- auditar polling de no leídos;
- usar `sequelize.sync()`;
- exponer errores de PostgreSQL o Sequelize;
- alterar documentación normativa para justificar código existente.

---

## 30. Sincronización documental

Cambios en Auditoría pueden afectar:

```text
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
docs/arquitectura-backend.md
api/AGENTS.md
api/src/modules/*/AGENTS.md
api/src/shared/database/AGENTS.md
```

Actualizar documentación antes o junto con la implementación cuando cambie:

- catálogo de acciones;
- roles con acceso;
- filtros o proyección;
- estructura de `metadata`;
- columnas, constraints o índices;
- atomicidad de eventos exitosos;
- mecanismo de eventos fallidos;
- inmutabilidad física;
- retención o particionado;
- tratamiento de lecturas sensibles;
- contexto técnico persistido.

No mantener dos catálogos canónicos en archivos distintos. Los documentos
normativos describen el contrato; `auditoria.events.js` lo implementa.

Ante una diferencia entre código y documentación, no asumir automáticamente que
el código es la fuente de verdad.

---

## 31. Procedimiento de trabajo

Antes de modificar:

1. leer contrato, matriz, modelo y arquitectura vigentes;
2. leer el `AGENTS.md` del módulo productor;
3. identificar acción, recurso, resultado y metadata aprobados;
4. determinar si el evento integra una transacción funcional;
5. verificar si la conducta toca una decisión pendiente;
6. revisar la proyección y los datos prohibidos;
7. ubicar las pruebas existentes y los índices relevantes.

Durante la implementación:

1. mantener el catálogo centralizado;
2. obtener actor y correlation ID desde contexto confiable;
3. usar una lista positiva por evento;
4. propagar la transacción del service dueño;
5. seleccionar atributos explícitos;
6. traducir errores sin internals;
7. agregar pruebas funcionales, de privacidad y rollback;
8. evitar cambios colaterales en otros módulos.

Antes de finalizar:

1. ejecutar lint y pruebas disponibles;
2. inspeccionar migraciones y modelo si se modificó persistencia;
3. buscar códigos duplicados o strings libres;
4. buscar términos sensibles en logs, fixtures y snapshots;
5. verificar que no existan rutas de escritura;
6. verificar proyección sin `userAgent`;
7. confirmar atomicidad de eventos exitosos;
8. revisar documentación afectada;
9. informar validaciones no ejecutadas y decisiones pendientes.

---

## 32. Definition of Done

Un cambio en Auditoría está completo cuando:

- respeta el único endpoint y su acceso exclusivo;
- utiliza el catálogo canónico sin variantes libres;
- declara y aplica metadata mediante listas positivas;
- persiste actor, resultado, recurso y correlation ID conforme al contrato;
- no copia requests, responses ni recursos;
- no filtra datos sensibles a eventos, logs o errores;
- mantiene la proyección exacta y omite `userAgent`;
- preserva append-only dentro de la aplicación;
- comparte la transacción de los eventos exitosos obligatorios;
- no deja estados parciales tras rollback;
- usa migraciones y modelos coherentes;
- utiliza índices y paginación contractuales;
- incluye pruebas por rol, filtro, proyección, privacidad y transacción;
- actualiza documentación afectada;
- no resuelve decisiones pendientes por intuición;
- documenta comandos ejecutados y limitaciones de validación.

---

## 33. Decisiones pendientes

No completar sin aprobación explícita:

### Persistencia de intentos fallidos

Falta definir cómo conservar `LOGIN_FALLIDO` y otros resultados fallidos fuera
de una transacción que se revierte, sin introducir inconsistencias.

### Fallo de auditoría en una lectura clínica

Falta decidir si un fallo de `INFORME_VISUALIZADO` bloquea la entrega del
informe o si se utiliza un mecanismo de recuperación.

### Inmutabilidad física

Falta aprobar si PostgreSQL protegerá append-only mediante trigger, permisos,
roles u otra estrategia. La aplicación por sí sola no constituye garantía
física.

### Retención y particionado

Faltan plazo de conservación, volumen esperado, archivado, particionado y
eventual política de purga.

### Confianza en la IP

Falta definir la configuración productiva de proxies confiables y la fuente
autorizada de la IP real.

### Auditoría de la consulta administrativa

Falta decidir si `GET /auditoria` genera un evento. No introducir recursión sin
una regla expresa.

### Procesos automáticos

El modelo admite `usuario_id = null`, pero falta definir el catálogo y el
contexto de eventos emitidos por procesos sin actor autenticado.

### Contratos detallados de metadata

Las familias permitidas están aprobadas, pero cada nueva acción o ampliación de
metadata debe definir sus claves exactas, nulabilidad y límites antes de
implementarse.

Mientras una decisión pendiente afecte el caso de uso, detener esa parte,
documentar el bloqueo y solicitar definición. No seleccionar la alternativa que
parezca más habitual.
