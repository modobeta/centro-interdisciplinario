# AGENTS.md — Informes clínicos

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/informes/
```

También deben respetarse al modificar piezas relacionadas ubicadas fuera del
módulo, especialmente:

```text
api/src/modules/vinculos/
api/src/modules/pacientes/
api/src/modules/usuarios/
api/src/modules/tipos-informe/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/permissions/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend ni las instrucciones especializadas de persistencia.

Antes de modificar Informes, consultar:

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
inconsistencia y solicitar una decisión. No cambiar la documentación normativa
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
- no usar pacientes, autores ni contenido clínico reales en fixtures;
- no imprimir títulos, resúmenes, contenidos ni bodies durante las pruebas;
- probar finalización y edición concurrentes con operaciones simultáneas reales;
- informar comandos ejecutados, resultados y validaciones no realizadas;
- no afirmar que la inmutabilidad está protegida en base de datos si solo fue
  comprobada mediante el service.

---

## 3. Decisiones obligatorias del MVP

```text
Estados:                 borrador, finalizado
Estado inicial:          borrador
Autor:                   actor autenticado
Edición:                 solo autor activo y solo en borrador
Finalización:            solo autor activo y solo en borrador
Informe finalizado:      inmutable
Eliminación:             no existe
Reapertura:              no existe
Transferencia de autor:  no existe
PDF backend:             no existe
```

Solo los roles `profesional` y `coordinacion` pueden crear informes.

- El profesional crea únicamente para pacientes con vínculo activo.
- Coordinación crea para cualquier paciente activo.
- El backend obtiene el autor del actor autenticado.
- Administrador y secretaría pueden leer informes completos dentro de su
  alcance global, pero no crear, editar ni finalizar.
- Un rol global o jerárquicamente superior no hereda permisos de autoría.

Todo informe nuevo se crea como `borrador`, sin `fechaEmision`. Al finalizar:

1. cambia a `finalizado`;
2. el backend asigna `fechaEmision`;
3. se registra la auditoría correspondiente;
4. el contenido queda inmutable.

No existe eliminación física ni lógica de informes. La historia clínica debe
conservarse.

---

## 4. Decisión contraintuitiva: lectura no equivale a autoría

Algunas descripciones resumidas antiguas indican que el profesional accede a
“informes propios”. La regla vigente distingue lectura y escritura:

```text
Lectura profesional: todos los informes de pacientes con vínculo activo.
Escritura: únicamente borradores creados por el propio autor.
```

Por lo tanto:

- un profesional vinculado puede leer borradores y finalizados de otros
  profesionales sobre ese paciente;
- no puede editar ni finalizar esos informes;
- coordinación puede leer globalmente, pero solo editar o finalizar los
  borradores que ella misma creó;
- administrador y secretaría no pueden modificar informes, aunque puedan leer
  el contenido completo;
- la UI no define el permiso: el backend debe verificar vínculo, autoría,
  estado y actividad del autor en cada operación.

No restringir la lectura profesional a `autor_id = actor.id`. No ampliar la
escritura por jerarquía de rol.

---

## 5. Responsabilidad del módulo

`informes` es dueño de:

- listado autorizado de informes;
- detalle clínico autorizado;
- creación de borradores;
- edición de borradores propios;
- finalización e inmutabilidad funcional;
- cálculo de capacidades de edición y finalización;
- aplicación de scopes por rol, vínculo, recurso y autoría;
- selección de proyecciones resumidas y completas;
- coordinación transaccional de la finalización;
- traducción de errores propios del dominio;
- eventos de auditoría del ciclo de vida y de visualización.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/informes/
├── informe.routes.js
├── informe.validation.js
├── informe.controller.js
├── informe.service.js
├── informe.policy.js
├── informe.projection.js
├── informe.constants.js
└── AGENTS.md
```

Los modelos Sequelize permanecen centralizados en
`src/shared/database/models/`. Informes no define modelos paralelos ni un
Repository genérico.

---

## 6. Responsabilidades por capa

### Routes

- declaran método y ruta;
- componen autenticación, permiso general, validación Joi y controller;
- mantienen visible el orden de middlewares;
- no consultan modelos;
- no deciden acceso a un informe concreto;
- no implementan autoría mediante condiciones ad hoc.

### Validation

- valida `params`, `query` y `body`;
- limita UUID, strings, enums, paginación, filtros y ordenamiento;
- rechaza propiedades inesperadas;
- diferencia campos requeridos al crear y permitidos al editar;
- no consulta PostgreSQL;
- no determina si paciente, autor o tipo están activos;
- no resuelve vínculos ni permisos por recurso.

### Controllers

- reciben entradas ya validadas;
- obtienen al actor autenticado;
- invocan un caso de uso del service;
- devuelven status y envelope contractuales;
- no abren transacciones;
- no aplican reglas clínicas, de vínculo o autoría;
- no serializan instancias Sequelize completas.

### Services

- cargan el informe y sus relaciones mediante atributos explícitos;
- aplican reglas de negocio y policies por recurso;
- verifican actividad de paciente, autor y tipo cuando corresponda;
- abren y propagan transacciones;
- preservan la precondición de estado ante concurrencia;
- asignan autor, estado, timestamps y `fechaEmision` en backend;
- seleccionan la proyección autorizada;
- coordinan auditoría sin copiar contenido clínico;
- traducen errores internos a códigos funcionales;
- no reciben `req`, `res` ni status HTTP.

### Policies

- distinguen permiso general, alcance de filas, recurso concreto y campo;
- verifican alcance global o vínculo activo;
- verifican autoría para editar y finalizar;
- verifican estado y actividad del autor;
- protegen acceso directo por UUID contra IDOR;
- no se sustituyen con controles del frontend.

### Proyecciones

- utilizan listas positivas de atributos;
- separan listado y detalle;
- omiten contenido clínico desde la consulta cuando no corresponde;
- calculan capacidades en backend;
- no utilizan `model.toJSON()` como respuesta;
- no utilizan `include: { all: true }`;
- evitan ciclos y asociaciones no autorizadas.

---

## 7. Endpoints permitidos

| Método | Ruta | Acceso resumido |
|---|---|---|
| `GET` | `/api/v1/informes` | Roles autenticados con scope global o vinculado. |
| `GET` | `/api/v1/informes/:id` | Roles globales o profesional vinculado. |
| `POST` | `/api/v1/informes` | Profesional vinculado o coordinación. |
| `PUT` | `/api/v1/informes/:id` | Autor activo de su borrador. |
| `PATCH` | `/api/v1/informes/:id/finalizar` | Autor activo de su borrador. |

No incorporar aliases, rutas genéricas ni endpoints alternativos.

En particular, no existen:

```text
DELETE /api/v1/informes/:id
PATCH  /api/v1/informes/:id/reabrir
PATCH  /api/v1/informes/:id/cambiar-autor
PATCH  /api/v1/informes/:id/restaurar
GET    /api/v1/informes/:id/pdf
```

La impresión se resuelve en el frontend a partir de la proyección autorizada.
No agregar generación, almacenamiento ni descarga de PDF en el backend sin una
decisión nueva.

---

## 8. Modelo funcional mínimo

La representación exacta de tabla, columnas, constraints y asociaciones
proviene de `docs/modelo-datos.md` y de las migraciones vigentes.

Semánticamente, un informe necesita:

```text
paciente
autor
tipo de informe
título
resumen
contenido
estado
fecha de creación
fecha de actualización
fecha de emisión, solo al finalizar
```

Invariantes obligatorias:

- `estado` solo admite `borrador` o `finalizado`;
- `borrador` implica `fecha_emision IS NULL`;
- `finalizado` implica `fecha_emision IS NOT NULL`;
- paciente, autor y tipo no pueden apuntar a registros inexistentes;
- un informe no se elimina cuando se desactiva un recurso relacionado;
- la baja lógica de paciente, autor o tipo no altera la historia del informe;
- los tipos de claves foráneas deben coincidir con sus claves referenciadas.

No inventar nombres de tabla, columnas o constraints si todavía no están
definidos normativamente.

---

## 9. Creación

### Entrada

El body contractual contiene únicamente los campos editables de creación:

```json
{
  "pacienteId": "uuid",
  "tipoInformeId": "uuid",
  "titulo": "Informe de seguimiento",
  "resumen": "Síntesis clínica autorizada",
  "contenido": "Contenido completo del informe"
}
```

No aceptar desde el cliente:

```text
autorId
estado
fechaEmision
createdAt
updatedAt
puedeEditar
puedeFinalizar
```

### Validaciones de negocio

El service debe comprobar:

- actor con rol `profesional` o `coordinacion`;
- actor activo;
- paciente existente y activo;
- tipo de informe existente y activo;
- vínculo activo entre profesional y paciente cuando el actor es profesional;
- presencia y validez de título, resumen y contenido;
- campos permitidos según el contrato.

El backend asigna:

```text
autor_id       = actor.id
estado         = borrador
fecha_emision  = NULL
timestamps     = valores del servidor
```

No permitir que coordinación elija otro autor. Si coordinación crea el
informe, coordinación es la autora.

No crear automáticamente vínculos desde Informes. La ausencia de vínculo del
profesional es un error funcional; no es una invitación a ampliar permisos.

---

## 10. Acceso clínico por rol

| Rol | Listado | Detalle completo | Crear | Editar | Finalizar |
|---|---|---|---|---|---|
| `administrador` | Global | Global | No | No | No |
| `coordinacion` | Global | Global | Sí, autor propio | Solo borrador propio | Solo borrador propio |
| `secretaria` | Global | Global | No | No | No |
| `profesional` | Pacientes vinculados | Pacientes vinculados | Sí, con vínculo | Solo borrador propio | Solo borrador propio |

“Global” significa alcance de filas autorizado, no permiso irrestricto sobre
campos o acciones.

No existe acceso para pacientes, tutores ni usuarios públicos en el MVP.

Las comprobaciones deben aplicarse también cuando el recurso se solicita por
UUID. Ocultar un botón o filtrar la navegación no protege contra IDOR.

---

## 11. Vínculo profesional-paciente

Para un actor con rol `profesional`, el vínculo activo condiciona:

- aparición del informe en listados;
- lectura del detalle;
- creación de un nuevo informe para el paciente.

El vínculo se verifica en backend contra la relación vigente. No confiar en:

- paciente enviado por el frontend;
- autoría del informe;
- acceso previo a otro recurso del paciente;
- `permissions` contenidas en el JWT;
- filtros visuales de la interfaz.

La documentación todavía no define si un autor conserva lectura, edición o
finalización de un borrador después de cerrarse su vínculo. Hasta que exista una
decisión explícita:

- no conceder acceso por autoría como excepción implícita;
- no borrar ni transferir el borrador;
- no afirmar que queda definitivamente editable o bloqueado;
- detener cualquier implementación que deba resolver ese caso y solicitar una
  decisión.

---

## 12. Listado y filtros

`GET /informes` debe aplicar el scope antes de paginar:

- administrador, coordinación y secretaría: alcance global;
- profesional: pacientes con vínculo activo.

Filtros funcionales previstos:

```text
search
estado
pacienteId
autorId
tipoInformeId
page
limit
sort
```

La búsqueda prevista cubre título y paciente según el contrato. No ampliar por
intuición la búsqueda a `resumen` o `contenido`.

Reglas:

- validar listas blancas de filtros y ordenamiento;
- aplicar límites máximos del contrato;
- no aceptar nombres de columnas libres;
- parametrizar cualquier SQL literal;
- evitar N+1 al proyectar paciente, tipo y autor;
- no cargar `resumen` ni `contenido` para construir el listado;
- mantener orden estable cuando la paginación lo requiera;
- no usar filtros para ampliar el scope del actor.

La sintaxis exacta de paginación, búsqueda y ordenamiento proviene de
`docs/contrato-api.md`. No inventar defaults o máximos ausentes.

---

## 13. Proyección de listado

El listado devuelve únicamente la información necesaria para identificar y
operar el recurso:

```text
id
titulo
paciente resumido
tipo de informe resumido
autor resumido
fechaCreacion
fechaEmision
estado
acciones o capacidades contractuales
```

El listado no devuelve:

```text
resumen
contenido
objetos completos de paciente
datos de contacto del paciente o tutor
metadatos internos de Sequelize
campos de auditoría
```

La omisión debe realizarse mediante selección positiva de atributos. No cargar
contenido clínico para descartarlo después de serializar.

---

## 14. Detalle y capacidades

`GET /informes/:id` devuelve la proyección clínica completa solo después de
resolver el acceso al recurso concreto.

Puede incluir, según el contrato:

```text
id
paciente
tipoInforme
autor
titulo
resumen
contenido
estado
fechaCreacion
fechaActualizacion
fechaEmision
puedeEditar
puedeFinalizar
```

`puedeEditar` y `puedeFinalizar` son valores calculados por el backend. Nunca se
persisten ni se aceptan desde el cliente.

Ambos son verdaderos solamente cuando se cumplen simultáneamente las reglas
vigentes:

- actor autorizado para escritura;
- actor es el autor;
- autor activo;
- informe en estado `borrador`;
- cualquier otra precondición normativa vigente.

El detalle exitoso debe generar el evento de auditoría
`INFORME_VISUALIZADO` sin incluir contenido clínico.

---

## 15. Edición de borradores

`PUT /informes/:id` permite modificar únicamente:

```text
tipoInformeId
titulo
resumen
contenido
```

No permite modificar:

```text
pacienteId
autorId
estado
fechaEmision
createdAt
updatedAt
```

Precondiciones obligatorias:

- el informe existe dentro del scope del actor;
- el actor es el autor;
- el autor continúa activo;
- el estado actual es `borrador`;
- el nuevo tipo de informe, si cambia, existe y está activo;
- el body contiene únicamente campos permitidos.

El profesional no puede convertir una edición en un cambio de paciente para
evitar la comprobación de vínculo. Coordinación tampoco puede reasignar un
informe propio a otro paciente mediante `PUT`.

No existe autosave obligatorio en el backend. Guardar varias veces un borrador
es válido, pero cada escritura debe respetar las precondiciones actuales.

---

## 16. Finalización

`PATCH /informes/:id/finalizar` realiza una transición única:

```text
borrador -> finalizado
```

No recibe del cliente:

- nuevo estado;
- fecha de emisión;
- autor;
- contenido reemplazado;
- motivo de finalización inventado.

La operación debe:

1. abrir una transacción;
2. cargar o afectar el informe preservando la precondición `borrador`;
3. comprobar autoría y actividad del autor;
4. asignar `estado = finalizado`;
5. asignar `fecha_emision` con un instante del backend;
6. registrar la auditoría de finalización en la misma transacción;
7. confirmar solo si todas las escrituras tienen éxito.

Si falla el cambio o su auditoría transaccional, no debe quedar un informe
finalizado parcialmente.

Una segunda finalización no es un éxito silencioso salvo que el contrato lo
establezca expresamente. Traducir el conflicto de estado mediante el código
funcional vigente.

---

## 17. Inmutabilidad

Después de finalizar, el informe no puede:

- editar título, resumen o contenido;
- cambiar tipo de informe;
- cambiar paciente;
- cambiar autor;
- volver a borrador;
- finalizarse nuevamente como si fuera una nueva transición;
- eliminarse física o lógicamente;
- sobrescribirse mediante una ruta administrativa genérica.

La inmutabilidad se aplica a todos los roles, incluidos administrador,
coordinación y el autor original.

No agregar una excepción de “superadministrador”. Una corrección clínica
posterior requiere una decisión de dominio y un flujo explícito; no debe
resolverse alterando el informe finalizado.

Los constraints conocidos garantizan coherencia entre `estado` y
`fecha_emision`, pero no necesariamente impiden cambiar cada campo clínico de
una fila finalizada. No afirmar protección total en PostgreSQL sin inspeccionar
el esquema y probarla directamente.

Existe una recomendación previa de evaluar un trigger de inmutabilidad antes de
producción. No está aprobado como requisito actual. No agregarlo, modificarlo ni
eliminarlo por intuición.

---

## 18. Recursos inactivos e historia

### Autor inactivo

- no puede crear nuevos informes;
- no puede editar ni finalizar borradores;
- sus borradores no se transfieren a otro usuario;
- sus informes finalizados continúan legibles según el scope del lector;
- no reemplazar sus datos históricos por un autor ficticio.

### Paciente inactivo

- no admite nuevos informes;
- sus informes existentes no se eliminan;
- los finalizados permanecen como historia según permisos;
- no está definido si un borrador existente puede editarse o finalizarse.

### Tipo de informe inactivo

- no puede seleccionarse al crear;
- no puede seleccionarse como nuevo valor al editar;
- los informes históricos que ya lo referencian conservan la relación;
- no está definido si un borrador que ya usa ese tipo puede finalizarse sin
  reemplazarlo.

No convertir silenciosamente estas decisiones pendientes en borrados,
reasignaciones, `SET NULL` o excepciones de permiso.

---

## 19. Auditoría

Auditar como mínimo las acciones definidas por el contrato para:

- creación;
- edición;
- finalización;
- visualización del detalle.

El evento de lectura clínica vigente es:

```text
INFORME_VISUALIZADO
```

Para los demás eventos, usar los nombres canónicos definidos en el catálogo de
auditoría. No crear variantes de strings en distintos services.

Una auditoría puede registrar metadatos mínimos, por ejemplo:

```text
actorId
acción
recursoTipo
recursoId
timestamp
resultado permitido por la política de auditoría
```

Nunca registrar en auditoría:

```text
titulo
resumen
contenido
body HTTP completo
respuesta clínica
datos de contacto
tokens o cookies
SQL o parámetros
```

La auditoría de finalización comparte la transacción porque forma parte de la
operación. La política ante un fallo al auditar una lectura exitosa todavía no
está definida. No decidir por intuición si se entrega o se bloquea el contenido;
detener esa parte y solicitar una decisión.

---

## 20. Transacciones

La finalización siempre es transaccional.

La creación o edición también debe usar transacción cuando incluya varias
escrituras que constituyan una sola operación funcional, por ejemplo auditoría
atómica exigida por la documentación vigente.

Reglas:

- el service dueño del caso de uso abre la transacción;
- pasar la misma instancia a todas las consultas y escrituras relacionadas;
- no abrir transacciones independientes dentro de una existente;
- no confirmar un cambio clínico si falla una escritura obligatoria;
- permitir rollback ante error;
- mantener la transacción breve;
- no ejecutar llamadas externas irreversibles dentro de ella;
- no capturar un error para continuar silenciosamente;
- no asumir que una transacción por sí sola evita carreras de estado.

---

## 21. Concurrencia

Las operaciones sensibles deben preservar la precondición de estado en el
momento de escribir, no solo durante una consulta previa.

Casos mínimos:

- dos finalizaciones simultáneas;
- edición concurrente con finalización;
- dos ediciones simultáneas del mismo borrador.

Procedimiento general:

1. validar previamente para ofrecer errores claros;
2. iniciar la transacción cuando corresponda;
3. volver a proteger o comprobar autoría y estado en la escritura;
4. ejecutar la modificación;
5. comprobar cuántas filas fueron afectadas;
6. registrar la auditoría obligatoria;
7. traducir el conflicto sin exponer detalles internos;
8. agregar una prueba concurrente contra PostgreSQL real.

La estrategia exacta para cada carrera —bloqueo de fila, actualización
condicional u otra alternativa aprobada— todavía no está cerrada. No introducir
automáticamente:

- una columna de versión;
- control optimista global;
- un nivel de aislamiento más estricto;
- bloqueos generales;
- reintentos automáticos.

Cualquier estrategia elegida debe impedir que una edición confirmada después de
la finalización altere el contenido finalizado.

---

## 22. Constraints y persistencia

PostgreSQL debe proteger como mínimo las invariantes documentadas que puedan
expresarse en el esquema:

- claves primarias y foráneas;
- nulabilidad;
- estados válidos;
- coherencia de `estado` y `fecha_emision`;
- referencias existentes;
- unicidades que defina `docs/modelo-datos.md`.

Reglas:

- crear cambios mediante migraciones nuevas;
- no modificar una migración ya aplicada;
- asignar nombres estables a constraints reconocidos por el backend;
- no exponer esos nombres en respuestas HTTP;
- no sustituir constraints por consultas previas;
- no usar `ON DELETE CASCADE` sobre informes o sus auditorías;
- no debilitar integridad para hacer pasar una prueba;
- mantener modelo Sequelize, migración y documentación sincronizados;
- no usar `constraints: false` para ocultar asociaciones inconsistentes.

La baja lógica de recursos relacionados no implica modificar las claves
históricas del informe.

---

## 23. Errores funcionales

Los errores de Sequelize y PostgreSQL no deben llegar al cliente.

Traducir según `docs/contrato-api.md`:

| Condición | Status habitual | Código |
|---|---:|---|
| body, params o query inválidos | `400` | El contractual vigente. |
| autenticación ausente o inválida | `401` | El contractual vigente. |
| rol sin permiso general | `403` | El contractual vigente. |
| recurso fuera de scope, sin vínculo o no autorizado | Según contrato | No inventar. |
| informe inexistente | Según contrato | No inventar. |
| autor distinto | `403` o contractual | Usar el contrato. |
| informe no editable o ya finalizado | `409` o contractual | Usar el contrato. |
| paciente, autor o tipo inactivo | Según contrato | Usar el contrato. |
| conflicto concurrente de estado | `409` | El contractual vigente. |
| violación inesperada | `500` | `INTERNAL_ERROR` si así lo define el contrato. |

No inventar códigos para completar una tabla ausente. Si la condición está
definida pero el código o status no lo están, detener esa parte y solicitar la
decisión.

No devolver:

- mensaje crudo de PostgreSQL;
- nombre de constraint o tabla;
- SQL o parámetros;
- contenido clínico dentro del error;
- stack trace;
- detalles de existencia que faciliten IDOR;
- diferencias no aprobadas que permitan enumerar pacientes o informes.

---

## 24. Consultas e índices

Las consultas deben ser explícitas y respetar el scope desde PostgreSQL.

Reglas:

- seleccionar solo columnas necesarias y autorizadas;
- filtrar informes profesionales mediante vínculos activos en la consulta;
- incluir paciente, autor y tipo con aliases documentados;
- evitar N+1;
- paginar listados;
- no cargar contenido para listados;
- no utilizar `include: { all: true }`;
- no aceptar ordenamiento libre;
- parametrizar SQL literal;
- no concatenar entradas externas;
- no agregar búsqueda de texto completo por intuición;
- no introducir caché o desnormalización sin medición y aprobación.

Todo índice debe corresponder a una consulta real. Antes de agregarlo,
identificar:

- endpoint que lo usa;
- filtros y joins;
- ordenamiento;
- cardinalidad y selectividad;
- índice existente que pueda cubrir la consulta;
- costo de escritura.

Revisar especialmente FKs y consultas por:

```text
paciente_id
autor_id
tipo_informe_id
estado
created_at o fecha_emision, según contrato
```

No crear índices GIN, GiST, trigramas o búsquedas sobre contenido clínico sin
una decisión expresa de privacidad, retención y rendimiento.

---

## 25. Datos clínicos y logging

`resumen` y `contenido` son información clínica sensible. El hecho de que una
columna exista no autoriza a seleccionarla, registrarla ni devolverla.

Está prohibido:

- registrar bodies de creación o edición;
- imprimir título, resumen o contenido;
- registrar respuestas completas;
- copiar contenido a auditoría;
- incluir contenido en mensajes de error;
- usar datos clínicos reales en seeders, fixtures o snapshots;
- guardar duplicados del contenido para búsqueda sin aprobación;
- exponerlo en métricas, trazas o herramientas de monitoreo;
- usar `console.log(informe)`;
- devolver una instancia Sequelize completa;
- incluir contenido en previews o listados.

Usar listas positivas de atributos y sanitización estructural. No depender de
expresiones regulares para ocultar información después de registrarla.

---

## 26. Conservación histórica

Los informes forman parte de la historia clínica y no se eliminan.

Reglas:

- conservar paciente, autor, tipo, estado y fechas necesarios para interpretar
  el registro;
- no usar cascadas destructivas;
- no transferir autoría;
- no reutilizar IDs de recursos inactivos;
- no reemplazar datos históricos con valores ficticios;
- no sobrescribir informes finalizados para corregir catálogos;
- no anular automáticamente referencias cuando un recurso se desactiva;
- mantener legibles los finalizados dentro del scope autorizado.

Una necesidad de rectificación, anexado o versionado clínico requiere un caso de
uso aprobado. No improvisar ese flujo mediante `PUT`, SQL manual o una migración
de datos incidental.

---

## 27. Exclusiones del MVP

No incorporar:

- eliminación de informes;
- papelera o restauración;
- reapertura de finalizados;
- transferencia o reasignación de autor;
- coautoría;
- aprobación por un superior;
- firma digital;
- firma manuscrita capturada;
- versionado clínico;
- anexos o fe de erratas;
- comentarios sobre informes;
- autosave obligatorio;
- generación de PDF en backend;
- almacenamiento de PDFs;
- envío por correo o mensajería;
- acceso de pacientes o tutores;
- plantillas clínicas no documentadas;
- búsqueda sobre resumen o contenido;
- edición administrativa de contenido finalizado.

Agregar cualquiera de estas capacidades exige contrato, permisos, modelo de
datos, auditoría y pruebas propios.

---

## 28. Pruebas obligatorias

### Creación

- profesional activo con vínculo activo;
- profesional sin vínculo;
- profesional con vínculo inactivo;
- coordinación sobre paciente activo;
- administrador y secretaría rechazados;
- paciente inexistente o inactivo;
- tipo inexistente o inactivo;
- autor forzado desde body rechazado;
- estado o fecha de emisión enviados por cliente rechazados;
- creación en `borrador` y `fechaEmision = null`;
- auditoría sin contenido clínico.

### Lectura y scope

- alcance global de administrador, coordinación y secretaría;
- profesional con vínculo activo;
- profesional sin vínculo;
- profesional leyendo informe ajeno de paciente vinculado;
- acceso directo por UUID fuera de scope;
- borradores incluidos dentro del scope autorizado;
- listado sin resumen ni contenido;
- detalle completo autorizado;
- capacidades calculadas correctamente;
- `INFORME_VISUALIZADO` sin contenido clínico.

### Edición

- autor profesional activo editando su borrador;
- autor coordinación activo editando su borrador;
- profesional no autor rechazado;
- coordinación no autora rechazada;
- administrador y secretaría rechazados;
- autor inactivo rechazado;
- informe finalizado rechazado;
- cambio de paciente, autor, estado o fecha rechazado;
- tipo nuevo inactivo rechazado;
- edición repetida válida de un borrador;
- auditoría sin contenido clínico.

### Finalización

- autor activo finaliza su borrador;
- no autor rechazado;
- autor inactivo rechazado;
- transición a `finalizado`;
- `fechaEmision` asignada por backend;
- auditoría en la misma transacción;
- rollback completo si falla una escritura obligatoria;
- segunda finalización traducida según contrato;
- informe finalizado no editable;
- informe finalizado no eliminable ni reabrible.

### Concurrencia con PostgreSQL real

- dos finalizaciones simultáneas;
- edición simultánea con finalización;
- dos ediciones simultáneas, documentando la política vigente;
- ausencia de modificación clínica posterior a la finalización;
- rollback y respuesta contractual ante conflicto.

No reemplazar estas pruebas con mocks de Sequelize. Las pruebas concurrentes no
deben compartir una única transacción de test.

### Privacidad

- logs sin título, resumen ni contenido;
- errores sin contenido ni SQL;
- auditoría sin cuerpos clínicos;
- listados sin selección accidental de contenido;
- fixtures completamente ficticios;
- intentos de IDOR sin filtración de existencia no aprobada.

---

## 29. Acciones prohibidas

No realizar ninguna de estas acciones:

- aceptar `autorId`, `estado` o `fechaEmision` desde el cliente;
- permitir que un rol global edite un informe ajeno;
- limitar la lectura profesional solo a informes propios;
- conceder lectura por autoría cuando ya no existe vínculo sin decisión expresa;
- editar o reabrir un informe finalizado;
- eliminar informes;
- transferir borradores de autores inactivos;
- crear vínculos automáticamente al redactar;
- omitir auditoría obligatoria;
- copiar contenido clínico a auditoría o logs;
- cargar contenido en listados;
- generar PDF en backend;
- usar `sequelize.sync()`;
- modificar migraciones aplicadas;
- agregar `ON DELETE CASCADE` sobre historia clínica;
- devolver instancias Sequelize completas;
- usar `include: { all: true }`;
- construir SQL dinámico no parametrizado;
- usar mocks como única validación de concurrencia;
- introducir trigger, versionado o bloqueo global sin aprobación;
- inventar la política para pacientes, vínculos o tipos inactivos;
- afirmar inmutabilidad en PostgreSQL sin prueba directa;
- modificar documentación normativa para justificar una desviación.

---

## 30. Sincronización documental

Cuando cambie el módulo, revisar únicamente los artefactos afectados:

```text
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
docs/arquitectura-backend.md
api/migrations/
api/src/shared/database/models/
api/src/shared/database/associations.js
api/src/modules/informes/
api/src/modules/auditoria/
api/tests/
```

Actualizar `contrato-api.md` si cambian:

- campos de entrada o salida;
- endpoints;
- status o códigos funcionales;
- filtros, búsqueda, ordenamiento o paginación;
- comportamiento observable de edición o finalización;
- proyecciones y capacidades.

Actualizar `matriz-permisos.md` si cambian:

- roles con lectura o escritura;
- scope global o vinculado;
- reglas de autoría;
- campos clínicos visibles;
- tratamiento de recursos inactivos.

Actualizar `modelo-datos.md` si cambian:

- estados;
- nulabilidad;
- constraints;
- claves foráneas;
- política histórica;
- estrategia de inmutabilidad en PostgreSQL.

---

## 31. Procedimiento de trabajo

### Antes del cambio

1. Leer `api/AGENTS.md`.
2. Leer este archivo.
3. Leer el `AGENTS.md` de base de datos si hay persistencia afectada.
4. Consultar contrato, matriz y modelo vigentes.
5. Inspeccionar routes, schemas, services, policies y proyecciones existentes.
6. Inspeccionar migraciones, modelos y asociaciones relacionadas.
7. Identificar alcance, autoría, estado y campos clínicos involucrados.
8. Evaluar inmutabilidad, concurrencia, auditoría e historia.
9. Identificar decisiones pendientes.
10. Detener cualquier cambio destructivo o ambiguo.

### Durante el cambio

1. Mantener el caso de uso acotado.
2. Rechazar campos inesperados.
3. Aplicar scope en backend.
4. Verificar recurso, vínculo, autoría, actividad y estado.
5. Seleccionar atributos mediante listas positivas.
6. Abrir y propagar transacción cuando corresponda.
7. Preservar precondiciones ante concurrencia.
8. Registrar auditoría sin contenido clínico.
9. Traducir errores internos.
10. Agregar pruebas de permisos, privacidad y estado.
11. Agregar pruebas concurrentes cuando corresponda.
12. Actualizar solo la documentación afectada.

### Después del cambio

1. Ejecutar migraciones en una base de test desde cero si cambió persistencia.
2. Ejecutar pruebas unitarias e integración.
3. Ejecutar pruebas concurrentes relevantes.
4. Ejecutar lint.
5. Revisar proyecciones y SQL generado.
6. Verificar que listados no seleccionen contenido clínico.
7. Verificar logs, errores y auditoría.
8. Verificar inmutabilidad después de finalizar.
9. Comparar documentación, modelo y comportamiento observable.
10. Informar comandos, resultados y validaciones no realizadas.

No declarar una tarea terminada si no se ejecutaron las validaciones
correspondientes.

---

## 32. Definition of Done

Un cambio en Informes está completo solamente cuando:

- respeta los endpoints contractuales;
- no incorpora rutas o capacidades excluidas;
- autor, estado y fecha de emisión se asignan en backend;
- el profesional requiere vínculo activo donde está definido;
- los roles globales no obtienen escritura por jerarquía;
- solo el autor activo modifica o finaliza su borrador;
- la lectura profesional incluye informes ajenos de pacientes vinculados;
- el scope se aplica también al acceso directo por UUID;
- el listado no selecciona ni devuelve resumen o contenido;
- el detalle devuelve contenido solo al actor autorizado;
- `puedeEditar` y `puedeFinalizar` se calculan en backend;
- toda visualización exitosa se audita según la política vigente;
- la finalización es transaccional;
- `fechaEmision` y estado quedan coherentes;
- un finalizado no puede modificarse, reabrirse ni eliminarse;
- las carreras de estado fueron consideradas y probadas;
- la historia se conserva cuando se desactivan recursos relacionados;
- no se transfieren borradores de autores inactivos;
- logs, errores y auditoría no contienen información clínica;
- los errores internos se traducen al contrato;
- las pruebas relevantes pasan contra PostgreSQL real;
- lint pasa;
- la documentación afectada está actualizada;
- cualquier validación omitida o decisión pendiente quedó informada.

---

## 33. Decisiones pendientes

Mientras no estén resueltas en la documentación normativa, no definir por
cuenta propia:

- acceso de lectura del autor después de cerrarse su vínculo con el paciente;
- posibilidad de editar o finalizar un borrador después de cerrar el vínculo;
- tratamiento de borradores existentes cuando el paciente queda inactivo;
- posibilidad de finalizar un borrador cuyo tipo de informe quedó inactivo;
- política ante fallo al registrar `INFORME_VISUALIZADO`;
- estrategia exacta para dos finalizaciones simultáneas;
- estrategia exacta para edición concurrente con finalización;
- política para dos ediciones simultáneas;
- uso de bloqueo de fila o actualización condicional;
- incorporación de versionado optimista;
- protección de inmutabilidad mediante trigger u otro mecanismo PostgreSQL;
- flujo de corrección, anexado o rectificación de un finalizado;
- catálogo definitivo de eventos de auditoría y sus metadatos;
- códigos y status exactos para casos todavía ausentes del contrato;
- límites y defaults definitivos de paginación y búsqueda;
- índices de búsqueda textual;
- retención o archivado específico de informes y auditorías.

Cuando una tarea dependa de alguno de estos puntos, detener esa parte y solicitar
una decisión explícita. No completar vacíos mediante convenciones generales ni
por semejanza con otros módulos.
