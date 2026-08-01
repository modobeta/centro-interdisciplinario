# AGENTS.md — Servicios

## 1. Alcance y precedencia

Estas instrucciones se aplican a:

```text
api/src/modules/servicios/
```

También deben respetarse al modificar componentes relacionados:

```text
api/src/modules/usuarios/
api/src/modules/turnos/
api/src/modules/resumen/
api/src/modules/public/
api/src/modules/auditoria/
api/src/shared/database/models/
api/src/shared/files/
api/src/shared/permissions/
api/migrations/
api/seeders/
api/uploads/servicios/
api/tests/
```

Este archivo complementa `api/AGENTS.md`. Antes de modificar Servicios,
consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/modules/usuarios/AGENTS.md
api/src/modules/turnos/AGENTS.md
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
- usar nombres, descripciones, UUID e imágenes completamente ficticios;
- no imprimir bodies, binarios, nombres originales ni rutas absolutas;
- probar rollback cuando una operación modifica catálogo y auditoría;
- probar compensación cuando una operación combina PostgreSQL y filesystem;
- probar accesos directos por UUID, incluidos servicios inactivos;
- no afirmar seguridad concurrente sin pruebas simultáneas reales;
- no rediseñar Usuarios, Turnos, Public o Archivos como parte incidental de una
  tarea de Servicios.

---

## 3. Decisiones obligatorias del MVP

```text
Entidad:                    servicio
Naturaleza:                 catálogo de prestaciones del centro
Gestión del catálogo:       solo administrador
Lectura privada:            cualquier autenticado; activos por defecto
Lectura de inactivos:       solo administrador
Lectura pública:            solo activos y visibles públicamente
Imagen:                     endpoint multipart separado
Baja:                       lógica mediante activo
Servicios habituales:      asociación informativa en usuarios_servicios
Servicio de un turno:       cualquier servicio activo
Eliminación física:         no existe desde API
```

Reglas centrales:

- Servicios no es un CRUD genérico.
- Solo el administrador crea, edita, activa, desactiva o administra la imagen.
- Coordinación, secretaría y profesional pueden consultar servicios activos.
- `activo` y `visiblePublicamente` son atributos independientes.
- Un servicio se publica únicamente si está activo y
  `visiblePublicamente=true`.
- Un turno puede utilizar cualquier servicio activo del centro.
- La selección de un servicio para un turno no requiere que sea habitual del
  prestador.
- `usuarios_servicios` organiza y prioriza; no autoriza ni restringe turnos.
- Desactivar un servicio se bloquea si lo usan turnos futuros `pendiente` o
  `confirmado`.
- Quitar una asociación habitual no se bloquea por turnos futuros.
- La historia conserva el servicio referenciado aunque luego quede inactivo.
- No existe eliminación física del servicio desde la API.
- Los permisos y ocultamientos del frontend no sustituyen las policies del
  backend.

> Decisión contraintuitiva: `usuarios_servicios` nunca debe consultarse para
> aceptar o rechazar el servicio de un turno.

> Decisión contraintuitiva: desactivar el catálogo y quitar una asociación
> habitual son operaciones distintas. La primera puede bloquearse por turnos
> futuros; la segunda no.

No ampliar el módulo con precios, duración predeterminada, sedes, profesionales
exclusivos, reservas públicas, pagos, variantes, categorías, SEO, galería de
imágenes o eliminación física sin una decisión contractual previa.

---

## 4. Responsabilidad y límites del módulo

`servicios` es dueño de:

- listado y detalle del catálogo dentro de la visibilidad autorizada;
- filtros, búsqueda, orden y paginación;
- creación y edición administrativa;
- activación y desactivación lógica;
- carga, reemplazo y eliminación de la imagen;
- proyección privada completa;
- proyección pública mediante lista positiva;
- validación de existencia y actividad para otros módulos;
- coordinación con Turnos, Archivos y Auditoría;
- traducción de errores conocidos a códigos contractuales;
- emisión de eventos funcionales del catálogo y de su imagen.

`servicios` no es dueño de:

- las rutas `/usuarios/:id/servicios`;
- el ciclo administrativo de usuarios;
- la autorización de prestadores;
- la creación o edición de turnos;
- la ruta pública como capa HTTP si esta se compone en `modules/public`;
- el almacenamiento genérico de archivos;
- la consulta del historial clínico o administrativo.

Distribución de responsabilidades:

```text
Servicios -> catálogo, imagen, estado, proyecciones y requireActiveService()
Usuarios  -> altas y bajas de asociaciones en usuarios_servicios
Turnos    -> selección y persistencia del servicio concreto del turno
Public    -> ruta HTTP pública que consume la consulta segura de Servicios
Archivos  -> validación y almacenamiento físico detrás de una interfaz común
```

No duplicar reglas o consultas en varios módulos. Exponer funciones internas
pequeñas y explícitas.

---

## 5. Estructura orientativa

Crear únicamente archivos que tengan responsabilidad real:

```text
src/modules/servicios/
├── servicio.routes.js
├── servicio.validation.js
├── servicio.controller.js
├── servicio.service.js
├── servicio.policy.js
├── servicio.projection.js
├── servicio.constants.js
└── AGENTS.md
```

El modelo Sequelize `Servicio` permanece centralizado en:

```text
src/shared/database/models/
```

La asociación `UsuarioServicio` también permanece centralizada. No definir
modelos paralelos dentro del módulo ni agregar un Repository aislado salvo
adopción formal del patrón en todo el backend.

---

## 6. Responsabilidades por capa

### Routes

- declaran únicamente métodos y rutas contractuales;
- componen autenticación, autorización, validación, upload y controller;
- aplican Multer solo a `PUT /servicios/:id/imagen`;
- no consultan modelos;
- no construyen proyecciones;
- no incorporan aliases ni rutas no documentadas;
- no montan rutas de servicios habituales bajo `/servicios`.

### Validation

- valida path, query y body;
- rechaza propiedades inesperadas;
- valida UUID, booleanos, enteros, enums y campos obligatorios;
- diferencia JSON de `multipart/form-data`;
- valida sintácticamente nombre, descripción, visibilidad y orden;
- valida presencia y límites del archivo mediante componentes compartidos;
- no consulta PostgreSQL;
- no decide si existen turnos futuros;
- no decide si el servicio es visible para el actor.

### Controllers

- reciben datos HTTP ya validados;
- pasan al service valores primitivos, archivo validado y contexto del actor;
- construyen status y envelope contractuales;
- no contienen reglas de estado, publicación, archivos o transacciones;
- no serializan instancias Sequelize directamente.

### Services

- aplican policies y reglas de negocio;
- consultan modelos centralizados;
- abren y propagan transacciones;
- coordinan Turnos, Archivos y Auditoría;
- traducen errores de integridad a códigos funcionales;
- devuelven datos aptos para la proyección solicitada;
- exponen funciones internas acotadas como `requireActiveService()`;
- nunca reciben `req` ni `res`.

### Policies

- autorizan acción, fila, estado solicitado, filtros y proyección;
- distinguen administrador de otros usuarios autenticados;
- impiden que `activo=false` exponga registros a roles no autorizados;
- no dependen del menú o de los botones del frontend;
- son explícitas, testeables y reutilizables por las rutas privadas.

### Proyecciones

- construyen objetos nuevos mediante listas positivas;
- transforman `snake_case` de persistencia a `camelCase` contractual;
- separan proyección privada y pública;
- no reutilizan la proyección privada para luego borrar campos;
- no serializan asociaciones completas por conveniencia;
- omiten campos no autorizados en lugar de devolverlos como `undefined`.

---

## 7. Endpoints contractuales

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/v1/servicios` | Cualquier autenticado; inactivos solo administrador. |
| `GET` | `/api/v1/servicios/:id` | Cualquier autenticado; inactivos solo administrador. |
| `POST` | `/api/v1/servicios` | Solo administrador. |
| `PUT` | `/api/v1/servicios/:id` | Solo administrador. |
| `PUT` | `/api/v1/servicios/:id/imagen` | Solo administrador. |
| `DELETE` | `/api/v1/servicios/:id/imagen` | Solo administrador. |
| `PATCH` | `/api/v1/servicios/:id/estado` | Solo administrador. |
| `GET` | `/api/v1/public/servicios` | Público; solo activos y publicados. |

Las siguientes rutas pertenecen al módulo Usuarios, aunque utilicen la entidad
Servicio:

```text
GET    /api/v1/usuarios/:id/servicios
POST   /api/v1/usuarios/:id/servicios
DELETE /api/v1/usuarios/:id/servicios/:servicioId
```

No existen en el MVP:

```text
PATCH  /api/v1/servicios/:id
DELETE /api/v1/servicios/:id
POST   /api/v1/servicios/:id/profesionales
DELETE /api/v1/servicios/:id/profesionales/:usuarioId
POST   /api/v1/public/servicios
POST   /api/v1/public/turnos
```

No agregar rutas para precios, categorías, duración, galería, sedes o reserva
pública por analogía con otros sistemas.

---

## 8. Modelo de datos

Tabla `servicios`:

| Campo | Tipo | Nulo | Regla |
|---|---|:---:|---|
| `id` | UUID | No | PK generada por el backend. |
| `nombre` | `VARCHAR(150)` | No | Único sin distinguir mayúsculas. |
| `descripcion` | `TEXT` | No | Obligatoria. |
| `imagen_url` | `TEXT` | Sí | Ruta pública controlada por el backend. |
| `visible_publicamente` | `BOOLEAN` | No | Default `false`. |
| `orden_publico` | `INTEGER` | Sí | Orden de presentación pública. |
| `activo` | `BOOLEAN` | No | Default `true`. |
| `created_at` | `TIMESTAMPTZ` | No | Administrado por el sistema. |
| `updated_at` | `TIMESTAMPTZ` | No | Administrado por el sistema. |

Índices normativos:

```sql
CREATE UNIQUE INDEX servicios_nombre_lower_uq
ON servicios (lower(nombre));

CREATE INDEX servicios_publicos_idx
ON servicios (orden_publico, nombre)
WHERE activo = true AND visible_publicamente = true;
```

No modificar una migración ya aplicada. Toda corrección del esquema se realiza
mediante una migración nueva.

No agregar columnas de precio, duración, categoría o profesional por
conveniencia de una pantalla.

---

## 9. Proyección privada

Usar en listado, detalle, creación, edición y cambio de estado:

```json
{
  "id": "uuid",
  "nombre": "Psicopedagogía Clínica",
  "descripcion": "Descripción completa.",
  "imagenUrl": "/uploads/servicios/uuid.webp",
  "visiblePublicamente": true,
  "ordenPublico": 1,
  "activo": true,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

Reglas:

- todos los autenticados pueden recibir esta proyección para servicios activos;
- solo el administrador puede recibirla para servicios inactivos;
- `imagenUrl` puede ser `null`;
- `ordenPublico` puede ser `null`;
- no incluir prestadores, asignaciones, turnos ni métricas automáticamente;
- no devolver nombres de persistencia.

No devolver:

```text
imagen_url
visible_publicamente
orden_publico
created_at
updated_at
usuarios_servicios
```

---

## 10. Proyección pública

`GET /api/v1/public/servicios` devuelve únicamente:

```json
{
  "id": "uuid",
  "nombre": "Psicopedagogía Clínica",
  "descripcion": "Descripción completa.",
  "imagenUrl": "/uploads/servicios/uuid.webp",
  "ordenPublico": 1
}
```

Lista positiva exacta:

```text
id
nombre
descripcion
imagenUrl
ordenPublico
```

No incluir públicamente:

- `activo`;
- `visiblePublicamente`;
- timestamps;
- prestadores habituales;
- cantidad de turnos;
- campos internos o asociaciones.

No construir primero la proyección privada para eliminar campos después. La
proyección pública debe tener un constructor propio y una prueba específica.

---

## 11. Listado privado, filtros y paginación

`GET /servicios` acepta únicamente:

```text
page
limit
search
activo
sort
order
```

Valores permitidos para `sort`:

```text
nombre
ordenPublico
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
- responder con envelope paginado de la proyección privada;
- `search` opera sobre `nombre`;
- `activo` tiene default funcional `true`;
- solo el administrador puede solicitar `activo=false`;
- un filtro prohibido responde `403 FORBIDDEN_FILTER`;
- no degradar silenciosamente un filtro prohibido;
- no interpolar `sort`, `order` o búsquedas directamente en SQL;
- mapear `sort` contractual a una columna permitida mediante lista cerrada;
- aplicar un orden secundario estable por `id` cuando corresponda;
- no unir `usuarios_servicios` o `turnos` si no son necesarios para la consulta;
- evitar joins que multipliquen filas o alteren `total`.

El UUID de un servicio inactivo no lo convierte en visible para un actor no
administrador.

---

## 12. Detalle privado

`GET /servicios/:id`:

- cualquier autenticado consulta un servicio activo;
- solo el administrador consulta uno inactivo;
- responde con la proyección privada completa;
- no incluye usuarios habituales ni turnos;
- utiliza `404 CATALOGO_NO_ENCONTRADO` cuando el recurso no existe o no es
  visible para el actor.

No variar la respuesta para revelar que un UUID inactivo existe.

---

## 13. Creación

`POST /servicios` recibe:

```json
{
  "nombre": "Psicopedagogía Clínica",
  "descripcion": "Descripción completa.",
  "visiblePublicamente": false,
  "ordenPublico": 1
}
```

Reglas:

- acceso exclusivo del administrador;
- `nombre` es obligatorio y admite hasta 150 caracteres;
- `descripcion` es obligatoria y no puede quedar vacía tras la normalización
  aprobada;
- `visiblePublicamente` es opcional y por defecto `false`;
- `ordenPublico` es opcional y puede ser `null`;
- `imagenUrl` se rechaza;
- `activo` se rechaza;
- IDs y timestamps se rechazan;
- el backend genera el UUID;
- el servicio comienza activo;
- la creación no genera imagen, asignaciones ni turnos;
- registrar `CATALOGO_CREADO` en la misma transacción;
- responder `201` con la proyección privada.

Patrón:

```text
BEGIN
  validar reglas de negocio
  crear servicio activo
  registrar CATALOGO_CREADO
COMMIT
```

No aceptar una URL de imagen enviada por el cliente.

---

## 14. Nombre y unicidad

El nombre:

- es obligatorio;
- admite hasta 150 caracteres;
- utiliza la política compartida de trim y normalización de strings;
- es único sin distinguir mayúsculas;
- no se considera disponible solo por superar una consulta previa.

La garantía final depende de:

```sql
UNIQUE INDEX ON servicios (lower(nombre))
```

Ante una violación conocida, responder:

```text
409 CATALOGO_NOMBRE_DUPLICADO
```

No exponer el valor conflictivo, SQL, parámetros ni nombre del índice.

No incorporar por intuición:

- eliminación de tildes;
- equivalencias fonéticas;
- fuzzy matching;
- slugs;
- fusión automática de servicios;
- reutilización automática de un servicio inactivo con el mismo nombre.

---

## 15. Edición

`PUT /servicios/:id`:

- es exclusivo del administrador;
- recibe los mismos campos editables de creación;
- exige los campos requeridos definidos por el contrato;
- no modifica `activo`;
- no modifica `imagenUrl`;
- no acepta ID ni timestamps;
- no crea otro servicio si el UUID no existe;
- no reemplaza ni elimina la imagen;
- no altera asociaciones habituales;
- no modifica turnos históricos o futuros;
- registra `CATALOGO_EDITADO` en la misma transacción;
- responde con la proyección privada actualizada.

Transacción:

```text
BEGIN
  cargar servicio autorizado
  validar campos y unicidad
  actualizar servicio
  registrar CATALOGO_EDITADO
COMMIT
```

La auditoría puede indicar los nombres técnicos de los campos modificados, pero
no debe copiar la descripción completa.

---

## 16. Visibilidad y orden público

Reglas de publicación:

```text
publicable = activo = true AND visible_publicamente = true
```

Por lo tanto:

- `activo=true` no publica por sí solo;
- `visiblePublicamente=true` no publica un servicio inactivo;
- desactivar retira el servicio de la consulta pública sin cambiar el flag de
  visibilidad;
- reactivar puede volver a publicarlo si el flag continúa en `true`;
- `ordenPublico` organiza la presentación y no concede visibilidad;
- una imagen no concede visibilidad;
- la ausencia de imagen no bloquea la publicación salvo nueva decisión expresa;
- `visiblePublicamente` y `ordenPublico` se editan con el `PUT` administrativo;
- no existe un endpoint separado de publicación en el MVP.

No modificar automáticamente `visiblePublicamente` al activar o desactivar.

No asumir límites o reglas adicionales para `ordenPublico` que no estén
definidos por el contrato, el modelo o una utilidad compartida aprobada.

---

## 17. Activación y desactivación

`PATCH /servicios/:id/estado` acepta únicamente:

```json
{
  "activo": false
}
```

Acceso exclusivo del administrador.

Antes de desactivar:

- cargar el servicio dentro de la operación autorizada;
- comprobar que actualmente esté activo;
- rechazar si existen turnos futuros `pendiente` o `confirmado` que lo utilicen;
- no cancelar, completar, reasignar ni editar turnos automáticamente;
- no eliminar asociaciones de `usuarios_servicios`;
- registrar `CATALOGO_DESACTIVADO` en la misma transacción.

Al activar:

- rechazar si ya está activo;
- registrar `CATALOGO_ACTIVADO` en la misma transacción;
- no crear ni reconstruir asociaciones habituales;
- no modificar turnos;
- no alterar `visiblePublicamente` ni `ordenPublico`.

Errores:

```text
404 CATALOGO_NO_ENCONTRADO
409 CATALOGO_ESTADO_SIN_CAMBIOS
409 SERVICIO_CON_TURNOS_FUTUROS
```

Un servicio inactivo:

- conserva su fila, imagen, asociaciones e historia;
- no aparece en listados activos ni selectores nuevos;
- no puede asignarse como servicio habitual nuevo;
- no puede elegirse en un turno nuevo;
- no invalida turnos históricos;
- no altera informes, auditoría ni otros datos históricos;
- puede ser consultado por administrador mediante el scope autorizado.

---

## 18. Integración con Turnos

Servicios debe exponer una función interna equivalente a:

```text
requireActiveService(servicioId, { transaction })
```

Esta función:

- valida UUID antes de llegar al service HTTP;
- exige que el servicio exista;
- exige que esté activo;
- devuelve solo los datos necesarios para el caso de uso;
- recibe y propaga la transacción del módulo llamador;
- no consulta `usuarios_servicios`;
- no autoriza al actor sobre el turno;
- no crea o modifica el turno.

Turnos es dueño de seleccionar y persistir `servicio_id`.

Errores internos aplicables:

```text
404 SERVICIO_NO_ENCONTRADO
422 SERVICIO_INACTIVO
```

El código siguiente está retirado y no debe usarse:

```text
SERVICIO_NO_ASIGNADO
```

La creación del turno debe aceptar cualquier servicio activo, aunque no sea
habitual del prestador.

---

## 19. Servicios habituales

`usuarios_servicios` es una asociación organizativa e informativa administrada
por el módulo Usuarios.

Reglas que Servicios debe respetar:

- el receptor debe ser un usuario activo con rol `coordinacion` o
  `profesional`;
- el servicio debe existir y estar activo al asignarlo;
- solo administrador, coordinación o secretaría gestionan asociaciones;
- el profesional puede consultarlas, pero no administrarlas;
- la combinación `(usuario_id, servicio_id)` es única;
- quitar la asociación elimina físicamente esa fila técnica;
- quitarla no se bloquea por turnos futuros;
- quitarla no modifica turnos existentes;
- desactivar un servicio no elimina automáticamente sus asociaciones;
- una asociación no concede autorización ni acceso a pacientes;
- una asociación no limita los servicios disponibles para un turno.

Las rutas y eventos de esta relación permanecen en Usuarios:

```text
SERVICIO_ASIGNADO
SERVICIO_QUITADO
```

No duplicar estas rutas, transacciones o eventos dentro de Servicios.

---

## 20. Imagen del servicio

### Carga o reemplazo

`PUT /servicios/:id/imagen`:

- es exclusivo del administrador;
- usa `multipart/form-data`;
- acepta un único campo `imagen`;
- admite JPEG, PNG o WebP;
- admite como máximo 5 MB;
- valida MIME y, cuando sea posible, firma real;
- genera nombre mediante UUID del servidor;
- normaliza la extensión;
- no conserva ni utiliza el nombre original;
- guarda una ruta pública controlada, nunca una ruta absoluta;
- responde solo con `{ imagenUrl }`;
- registra `SERVICIO_IMAGEN_ACTUALIZADA`.

### Eliminación

`DELETE /servicios/:id/imagen`:

- es exclusivo del administrador;
- no recibe body;
- establece `imagen_url=NULL`;
- responde `200` con `{ imagenUrl: null }`;
- es idempotente si el servicio ya no tiene imagen;
- registra `SERVICIO_IMAGEN_ELIMINADA` cuando corresponda al contrato de
  eventos.

Errores:

```text
404 SERVICIO_NO_ENCONTRADO
413 IMAGEN_DEMASIADO_GRANDE
422 IMAGEN_REQUERIDA
422 IMAGEN_TIPO_INVALIDO
```

Multer se aplica únicamente a la ruta de carga. No aplicar upload globalmente.

---

## 21. Seguridad de archivos

La implementación física pertenece a `src/shared/files/`.

Reglas obligatorias:

- una imagen por operación;
- formatos JPEG, PNG y WebP;
- máximo 5 MB;
- nombre generado por el servidor;
- extensión normalizada;
- prevención de path traversal;
- rechazo de ejecutables y contenido incompatible;
- prohibición de confiar solo en la extensión o MIME declarado;
- directorios no listables;
- `X-Content-Type-Options: nosniff`;
- binarios reales ignorados por Git;
- logs sin nombre original, ruta absoluta ni contenido.

Ubicación inicial:

```text
uploads/servicios/
```

PostgreSQL almacena únicamente una ruta pública controlada como:

```text
/uploads/servicios/<archivo-generado>.webp
```

No desplegar uploads en un filesystem efímero.

---

## 22. Compensación entre PostgreSQL y filesystem

El filesystem no participa en transacciones PostgreSQL.

### Reemplazo

```text
1. validar el archivo
2. guardar el archivo nuevo
3. actualizar imagen_url en PostgreSQL
4. si PostgreSQL falla, eliminar el archivo nuevo
5. si confirma, intentar eliminar el archivo anterior
6. si la limpieza anterior falla, registrar warning sanitizado
```

### Eliminación

```text
1. obtener la ruta vigente
2. actualizar imagen_url a NULL en PostgreSQL
3. eliminar el archivo físico
4. si el archivo no existe, conservar el estado correcto de PostgreSQL
5. si la limpieza falla, registrar warning sanitizado
```

Reglas:

- no prometer atomicidad distribuida;
- no borrar el archivo anterior antes de confirmar la nueva ruta;
- no dejar apuntada en PostgreSQL una ruta nueva cuyo archivo fue descartado;
- no revertir una operación confirmada por una limpieza posterior no crítica;
- no incluir rutas absolutas en warnings o auditoría;
- probar fallos en cada paso compensable.

---

## 23. API pública

`GET /api/v1/public/servicios`:

- no exige autenticación;
- acepta únicamente `limit` opcional entre 1 y 50;
- sin `limit`, devuelve todos los servicios publicados;
- exige simultáneamente `activo=true` y `visible_publicamente=true`;
- ordena por `orden_publico ASC` y luego `nombre`;
- utiliza la proyección pública exacta;
- responde con `meta.count`;
- no utiliza la paginación administrativa;
- no acepta `search`, `activo`, `sort`, `order` ni filtros internos;
- no expone si existen servicios inactivos u ocultos.

La ruta HTTP puede vivir en `modules/public`, pero la consulta y proyección del
dominio deben reutilizar una interfaz pública y segura de Servicios.

No duplicar SQL o construir la respuesta desde el frontend.

Las imágenes se obtienen por una URL pública conocida:

```text
GET /uploads/servicios/<archivo>
```

No permitir listado de directorio ni upload anónimo.

---

## 24. Transacciones

| Operación | Unidad transaccional |
|---|---|
| Crear | Servicio y `CATALOGO_CREADO`. |
| Editar | Servicio y `CATALOGO_EDITADO`. |
| Desactivar | Validación de turnos, estado y `CATALOGO_DESACTIVADO`. |
| Activar | Estado y `CATALOGO_ACTIVADO`. |
| Reemplazar imagen | Persistencia de ruta y evento, más compensación del archivo. |
| Quitar imagen | Persistencia de `NULL` y evento, más limpieza del archivo. |

Reglas:

- propagar una única instancia `{ transaction }`;
- no abrir transacciones independientes dentro de Auditoría;
- no ocultar reglas críticas en hooks;
- no confirmar un éxito funcional si falla su evento obligatorio;
- no confundir compensación de archivos con rollback PostgreSQL;
- no mantener una transacción abierta mientras se ejecutan tareas externas no
  aprobadas;
- no eliminar físicamente el servicio para resolver dependencias.

Las transacciones de `usuarios_servicios` pertenecen a Usuarios y deben seguir
su `AGENTS.md`.

---

## 25. Concurrencia

Las verificaciones previas mejoran el mensaje; PostgreSQL sostiene la integridad
final.

Casos obligatorios:

- dos creaciones simultáneas con el mismo nombre variando mayúsculas;
- dos ediciones simultáneas hacia el mismo nombre;
- desactivación simultánea con creación de un turno futuro;
- reemplazos simultáneos de imagen;
- reemplazo de imagen simultáneo con eliminación;
- activación o desactivación simultánea del mismo servicio.

Para una constraint conocida:

1. capturar el error de Sequelize;
2. identificar la condición sin exponer SQL ni constraints;
3. traducirla al código funcional estable;
4. responder conforme al contrato;
5. probar con dos conexiones reales.

La estrategia concurrente debe impedir:

- confirmar un turno nuevo con un servicio inactivo;
- desactivar un servicio dejando un turno futuro bloqueante;
- perder silenciosamente la ruta ganadora de una imagen;
- dejar archivos nuevos huérfanos sin advertencia o compensación.

Si la estrategia exacta de bloqueo o versionado no está aprobada, detener esa
parte y registrar la decisión pendiente. No afirmar `last-write-wins` como una
solución deliberada sin aprobación.

---

## 26. Auditoría y privacidad

Eventos canónicos del catálogo Servicio:

```text
CATALOGO_CREADO
CATALOGO_EDITADO
CATALOGO_ACTIVADO
CATALOGO_DESACTIVADO
SERVICIO_IMAGEN_ACTUALIZADA
SERVICIO_IMAGEN_ELIMINADA
```

Los eventos de asociaciones habituales pertenecen a Usuarios:

```text
SERVICIO_ASIGNADO
SERVICIO_QUITADO
```

Metadata permitida mediante lista positiva:

- UUID del servicio;
- tipo de catálogo normalizado;
- estado anterior y nuevo;
- nombres técnicos de campos modificados;
- indicador técnico de presencia o ausencia de imagen;
- causa técnica normalizada cuando el contrato interno la admita.

Nunca registrar:

- descripción completa;
- nombre original del archivo;
- contenido o binario de imagen;
- ruta absoluta del filesystem;
- bodies HTTP completos;
- SQL, parámetros, constraints o stacks;
- listas de usuarios, turnos o pacientes relacionados.

Los eventos exitosos comparten transacción y `correlationId` con la operación
funcional. Seguir `api/src/modules/auditoria/AGENTS.md`.

---

## 27. Errores contractuales

```text
400 VALIDATION_ERROR
401 UNAUTHORIZED
403 FORBIDDEN
403 FORBIDDEN_FILTER
404 CATALOGO_NO_ENCONTRADO
404 SERVICIO_NO_ENCONTRADO
409 CATALOGO_NOMBRE_DUPLICADO
409 CATALOGO_ESTADO_SIN_CAMBIOS
409 SERVICIO_CON_TURNOS_FUTUROS
413 IMAGEN_DEMASIADO_GRANDE
422 CATALOGO_EN_USO
422 SERVICIO_DESCRIPCION_REQUERIDA
422 SERVICIO_INACTIVO
422 IMAGEN_REQUERIDA
422 IMAGEN_TIPO_INVALIDO
```

Uso:

- `CATALOGO_NO_ENCONTRADO` corresponde a las rutas generales del catálogo;
- `SERVICIO_NO_ENCONTRADO` corresponde a operaciones específicas definidas por
  el contrato, como imagen o validaciones internas de Turnos y Usuarios;
- `SERVICIO_INACTIVO` se usa cuando otra operación requiere un servicio activo;
- `SERVICIO_CON_TURNOS_FUTUROS` bloquea la desactivación;
- `CATALOGO_EN_USO` no sustituye códigos más específicos cuando estos existen.

No utilizar:

```text
SERVICIO_NO_ASIGNADO
```

Reglas:

- usar el envelope general del backend;
- incluir `correlationId` según el contrato;
- no revelar servicios inactivos a actores no autorizados;
- no devolver mensajes crudos de PostgreSQL o del filesystem;
- no incluir rutas absolutas ni nombres de constraints;
- no mapear una violación desconocida a un código conocido sin comprobarla.

---

## 28. Integración con otros módulos

### Usuarios

- Usuarios administra `usuarios_servicios`.
- Servicios valida existencia y actividad durante una asignación.
- Servicios no decide si el usuario objetivo es prestador.
- La remoción no se bloquea por turnos futuros.
- No duplicar endpoints ni auditoría de asociaciones.

### Turnos

- Turnos exige que el servicio exista y esté activo al crear.
- Servicios no exige asociación habitual.
- Servicios consulta turnos futuros antes de desactivar.
- No se cancelan o reasignan turnos como efecto colateral.
- El turno histórico conserva su FK al servicio.

### Resumen

- Resumen puede contar servicios activos mediante una consulta acotada.
- No reutilizar el listado completo ni cargar imágenes o asociaciones para un
  contador.

### Public

- Public expone únicamente servicios activos y visibles.
- Public usa la proyección pública del dominio.
- Public no reimplementa el catálogo ni accede a modelos desde el controller.

### Archivos

- Archivos valida y persiste físicamente.
- Servicios decide cuándo reemplazar o quitar la imagen.
- La consistencia se maneja mediante compensación explícita.

### Auditoría

- Servicios determina el evento funcional.
- Auditoría valida, sanitiza y persiste.
- No se copia el recurso completo a metadata.

Evitar dependencias circulares. No importar controllers, routes o piezas
privadas de otro módulo.

---

## 29. Pruebas mínimas

### Unitarias

- nombre obligatorio y límite de 150 caracteres;
- descripción obligatoria;
- rechazo de propiedades inesperadas;
- mapping de filtros y orden mediante listas cerradas;
- policy de administrador para escritura e inactivos;
- proyección privada completa;
- proyección pública mediante lista positiva;
- regla `activo AND visiblePublicamente`;
- `requireActiveService()` distingue inexistente de inactivo;
- ninguna validación de turno consulta `usuarios_servicios`.

### Integración privada

- cualquier autenticado lista y consulta activos;
- solo administrador consulta inactivos;
- actor no autorizado recibe rechazo al pedir `activo=false`;
- solo administrador crea, edita y cambia estado;
- alta comienza activa y no acepta `imagenUrl` ni `activo`;
- nombre duplicado sin distinguir mayúsculas devuelve conflicto;
- edición no cambia estado ni imagen;
- baja con turno futuro `pendiente` falla;
- baja con turno futuro `confirmado` falla;
- turnos históricos terminales no se modifican;
- reactivación conserva visibilidad, imagen y asociaciones;
- no existe `DELETE /servicios/:id`;
- no existen rutas invertidas de profesionales bajo Servicios.

### Servicios habituales y Turnos

- un turno acepta servicio activo no habitual;
- no se emite `SERVICIO_NO_ASIGNADO`;
- no se asigna un servicio inactivo como habitual;
- desactivar no elimina asociaciones existentes;
- quitar una asociación no se bloquea por turnos futuros;
- quitar una asociación no modifica turnos.

### Imagen y archivos

- solo administrador carga, reemplaza y elimina;
- falta de archivo devuelve `IMAGEN_REQUERIDA`;
- formato inválido se rechaza;
- tamaño mayor a 5 MB se rechaza;
- nombre del cliente no determina ruta o extensión final;
- fallo de PostgreSQL elimina el archivo nuevo;
- reemplazo confirmado intenta limpiar el archivo anterior;
- eliminación idempotente tolera archivo físico ausente;
- logs y auditoría no contienen nombres o rutas sensibles.

### API pública

- devuelve únicamente activos y visibles;
- activo oculto no aparece;
- inactivo visible no aparece;
- ordena por `ordenPublico` y luego nombre;
- `limit` acepta únicamente 1 a 50;
- sin `limit` devuelve todos los publicados;
- no expone estado, visibilidad, timestamps ni asociaciones;
- no permite listado de directorios ni upload anónimo.

### Concurrencia

- dos altas con el mismo nombre normalizado;
- dos cambios hacia el mismo nombre;
- baja frente a creación de turno;
- dos reemplazos de imagen;
- reemplazo frente a eliminación de imagen;
- dos cambios de estado simultáneos.

---

## 30. Acciones prohibidas

No:

- permitir escritura del catálogo a coordinación, secretaría o profesional;
- exponer servicios inactivos a roles no autorizados;
- eliminar físicamente un servicio desde la API;
- aceptar `activo` en alta o edición;
- aceptar `imagenUrl` desde JSON;
- modificar la imagen desde `POST` o `PUT /servicios/:id`;
- modificar visibilidad al activar o desactivar;
- eliminar asociaciones habituales al desactivar;
- cancelar o reasignar turnos automáticamente;
- utilizar `usuarios_servicios` para autorizar turnos;
- emitir `SERVICIO_NO_ASIGNADO`;
- bloquear la remoción habitual por turnos futuros;
- duplicar rutas de Usuarios dentro de Servicios;
- reutilizar la proyección privada como pública mediante eliminación de campos;
- confiar solo en MIME, extensión o nombre del archivo cliente;
- almacenar binarios o rutas absolutas en PostgreSQL;
- serializar modelos Sequelize directamente;
- utilizar `sequelize.sync()`;
- agregar endpoints, campos o efectos colaterales no contractuales;
- resolver decisiones pendientes por intuición.

---

## 31. Procedimiento de trabajo

Antes de implementar:

1. identificar endpoints, campos y roles afectados;
2. revisar contrato, matriz, modelo y AGENTS relacionados;
3. distinguir catálogo, asociación habitual y servicio del turno;
4. distinguir proyección privada y pública;
5. enumerar efectos sobre turnos, asociaciones, archivos y auditoría;
6. identificar la unidad transaccional y las compensaciones;
7. definir filtros, orden y lista positiva de salida;
8. identificar constraints y errores funcionales;
9. agregar pruebas de autorización, integración, privacidad y archivos;
10. agregar pruebas simultáneas si se afirma resolver una carrera;
11. actualizar documentación antes de ampliar el contrato.

Si la tarea exige una decisión no aprobada, detener esa parte y solicitarla.

---

## 32. Definition of Done

Un cambio está completo solo si:

- respeta los ocho endpoints contractuales y sus propietarios;
- mantiene escritura administrativa exclusiva;
- impide que roles no autorizados consulten inactivos;
- mantiene independencia entre actividad y publicación;
- usa proyecciones privadas y públicas mediante listas positivas;
- conserva `usuarios_servicios` como asociación informativa;
- acepta cualquier servicio activo en un turno;
- no utiliza `SERVICIO_NO_ASIGNADO`;
- bloquea la baja con turnos futuros `pendiente` o `confirmado`;
- preserva asociaciones, imágenes e historia al desactivar;
- mantiene imagen en endpoint separado y aplica compensación;
- traduce constraints conocidas a errores estables;
- registra auditoría sanitizada en la unidad funcional correcta;
- incluye pruebas unitarias, integración, seguridad, archivos y concurrencia
  pertinentes;
- no incorpora alcance excluido;
- actualiza documentación cuando cambia una decisión;
- informa qué validaciones se ejecutaron y cuáles no.

---

## 33. Decisiones pendientes

Los agentes no deben resolver por intuición:

1. estrategia concurrente exacta entre creación de turnos y desactivación del
   servicio;
2. estrategia de edición simultánea del mismo servicio;
3. estrategia de reemplazo y eliminación simultánea de imágenes;
4. límites adicionales de `descripcion` si el contrato no los fija;
5. dominio y forma final de las URLs públicas de imágenes en producción;
6. proveedor persistente, backup y restauración de imágenes en producción;
7. política de cache e invalidación para `GET /public/servicios`;
8. tratamiento visual público de un servicio publicado sin imagen;
9. reglas adicionales de rango o desempate para `ordenPublico` si se desean;
10. estrategia operativa para archivos huérfanos históricos o rutas rotas.

Hasta contar con una decisión expresa:

- conservar el comportamiento mínimo del contrato;
- no agregar restricciones de asociación habitual a Turnos;
- no borrar asociaciones al desactivar;
- no modificar automáticamente la visibilidad;
- no inventar límites de descripción u orden;
- no declarar `last-write-wins` como política concurrente;
- no desplegar uploads sobre filesystem efímero;
- no agregar tablas, endpoints o efectos colaterales.

---

## 34. Criterio de cambio

Modificar campos, proyecciones, permisos, publicación, almacenamiento, eventos,
errores, reglas de desactivación o relación con Turnos y Usuarios es un cambio
de contrato o arquitectura, no un detalle local.

Antes de implementarlo:

1. actualizar la fuente normativa correspondiente;
2. revisar `docs/contrato-api.md`, `docs/matriz-permisos.md` y
   `docs/modelo-datos.md`;
3. revisar los AGENTS de Usuarios, Turnos y Auditoría;
4. documentar migración y compatibilidad si cambia persistencia;
5. recién entonces adaptar código y pruebas.
