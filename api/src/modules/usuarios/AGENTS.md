# AGENTS.md — Usuarios

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/usuarios/
```

También deben respetarse al modificar piezas relacionadas ubicadas fuera del
módulo, especialmente:

```text
api/src/modules/auth/
api/src/modules/auditoria/
api/src/modules/turnos/
api/src/modules/informes/
api/src/modules/vinculos/
api/src/modules/catalogos/
api/src/shared/database/models/
api/src/shared/files/
api/src/shared/permissions/
api/migrations/
api/tests/
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend ni las instrucciones especializadas de Autenticación o Auditoría.

Antes de modificar Usuarios, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/modules/auth/AGENTS.md
api/src/modules/auditoria/AGENTS.md
api/src/shared/database/AGENTS.md
```

Si alguno todavía no existe en el checkout, no inventar su contenido. Aplicar
únicamente las decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. este archivo especializado;
4. `api/AGENTS.md`.

Ante una contradicción, detener solo la parte afectada, documentar la
inconsistencia y solicitar una decisión. No cambiar el contrato, el modelo o la
matriz de permisos para justificar una implementación incompatible.

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
- crear el esquema de prueba mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- usar UUID, DNI, emails, teléfonos e imágenes completamente ficticios;
- no imprimir DNI, email, teléfono, hashes, tokens, cookies ni bodies;
- probar rollback cuando una operación modifica usuario, sesiones, vínculos o
  auditoría;
- probar accesos directos por UUID para detectar IDOR;
- no afirmar seguridad concurrente sin pruebas simultáneas reales;
- no actualizar dependencias ni rediseñar Auth como parte incidental de una
  tarea de Usuarios.

---

## 3. Decisiones obligatorias del MVP

```text
Entidad de acceso:              usuario
Roles:                          administrador, coordinacion, secretaria, profesional
Prestadores:                    coordinacion y profesional
Baja de usuario:                lógica mediante activo
Alta y edición administrativa:  solo administrador
Automodificación administrativa:prohibida
Credencial inicial/restablecida:DNI normalizado con hash bcrypt
Imágenes:                       endpoint multipart separado
Servicios habituales:          asociación organizativa, no autorización
Eliminación física:             no existe
```

Reglas centrales:

- Usuarios no es un CRUD común;
- una modificación puede afectar sesiones, agenda, vínculos, informes,
  exposición pública, imágenes y auditoría;
- ningún usuario, incluido el administrador, administra su propia cuenta por
  endpoints administrativos;
- coordinación y profesional pueden actuar como prestadores;
- administrador y secretaría no actúan como prestadores;
- un turno puede utilizar cualquier servicio activo aunque no sea habitual del
  prestador;
- los usuarios inactivos conservan todo su historial;
- ninguna respuesta expone `password_hash`, hashes de sesión, tokens o cookies;
- los permisos del frontend sirven para UX y nunca sustituyen las policies del
  backend.

No ampliar el módulo con registro público, contraseñas personales, recuperación
por correo, roles configurables, eliminación física ni publicación automática.

---

## 4. Separación entre Usuarios y Autenticación

`usuarios` es dueño del ciclo administrativo de la cuenta y de sus relaciones
organizativas. `auth` es dueño del ciclo de sesión.

```text
Usuarios -> crea y modifica la cuenta, deriva la credencial cuando corresponde,
            solicita revocación de sesiones y conserva reglas del perfil.
Auth     -> emite y verifica tokens, crea, rota y revoca sesiones, gestiona
            cookies y autentica requests.
```

Usuarios puede invocar una función interna de Auth para revocar todas las
sesiones, pero no debe:

- emitir access o refresh tokens;
- construir cookies;
- duplicar validadores de sesión;
- conocer el formato interno del refresh token;
- implementar login;
- exponer hashes o credenciales en respuestas;
- crear rutas alternativas de cambio o recuperación de contraseña.

La normalización de email y DNI debe reutilizar utilidades compartidas con Auth.
No mantener dos implementaciones que puedan producir resultados diferentes.

---

## 5. Responsabilidad del módulo

`usuarios` es dueño de:

- listado y detalle según proyección autorizada;
- filtros, búsqueda, orden y paginación de usuarios;
- alta administrativa;
- edición administrativa completa;
- reglas de rol y condición de prestador;
- activación y desactivación;
- derivación de credencial desde el DNI cuando corresponde;
- coordinación de revocación de sesiones;
- restablecimiento administrativo de acceso;
- carga, reemplazo y eliminación de foto;
- gestión de servicios habituales;
- transacciones del ciclo de vida del usuario;
- policies y proyecciones específicas;
- emisión de eventos funcionales de Usuarios;
- traducción de errores conocidos a códigos contractuales.

Estructura orientativa, sin crear archivos vacíos:

```text
src/modules/usuarios/
├── usuarios.routes.js
├── usuarios.validation.js
├── usuarios.controller.js
├── usuarios.service.js
├── usuarios.policy.js
├── usuarios.projection.js
├── usuarios.constants.js
└── AGENTS.md
```

Los modelos Sequelize permanecen centralizados en
`src/shared/database/models/`. No definir modelos paralelos dentro del módulo.
No agregar un Repository aislado salvo adopción formal del patrón en todo el
backend.

---

## 6. Responsabilidades por capa

### Routes

- declaran método y ruta contractuales;
- componen autenticación, autorización, Joi, upload y controller;
- aplican Multer únicamente a `PUT /usuarios/:id/foto`;
- no consultan modelos;
- no construyen proyecciones;
- no incorporan aliases ni rutas no documentadas.

### Validation

- valida path, query y body;
- normaliza email y DNI mediante helpers aprobados;
- rechaza propiedades inesperadas;
- diferencia JSON de `multipart/form-data`;
- valida límites sintácticos y enums;
- no consulta PostgreSQL;
- no decide si el actor puede usar una proyección o filtro;
- no decide si el usuario es prestador ni si posee turnos futuros.

### Controllers

- reciben datos HTTP ya validados;
- pasan al service valores primitivos, archivo validado y contexto del actor;
- construyen status y envelope contractuales;
- no contienen reglas de rol, estado, sesiones, archivos ni transacciones;
- no serializan modelos directamente.

### Services

- aplican policies y reglas de negocio;
- consultan modelos centralizados;
- abren y propagan transacciones;
- coordinan Auth, Vínculos, Turnos, Archivos y Auditoría;
- traducen errores de integridad a códigos funcionales;
- devuelven datos aptos para la proyección solicitada;
- nunca reciben `req` ni `res`.

### Policies

- autorizan acción, fila, proyección y campos;
- distinguen cuenta propia de cuenta ajena;
- bloquean filtros que intentan ampliar scope;
- no dependen del frontend;
- son funciones explícitas y testeables.

### Proyecciones

- construyen objetos nuevos desde una lista positiva;
- transforman nombres de persistencia a nombres contractuales;
- no eliminan campos de un objeto serializado de forma permisiva;
- no exponen asociaciones completas por conveniencia;
- no devuelven `undefined` o `null` para simular un campo prohibido: lo omiten.

---

## 7. Endpoints contractuales

| Método | Ruta | Acceso |
|---|---|---|
| `GET` | `/api/v1/usuarios` | Cualquier autenticado; scope y proyección limitados. |
| `GET` | `/api/v1/usuarios/:id` | Cualquier autenticado; inactivos solo administrador. |
| `POST` | `/api/v1/usuarios` | Solo administrador. |
| `PUT` | `/api/v1/usuarios/:id` | Solo administrador; nunca sobre sí mismo. |
| `PATCH` | `/api/v1/usuarios/:id/estado` | Solo administrador; nunca sobre sí mismo. |
| `PATCH` | `/api/v1/usuarios/:id/restablecer-acceso` | Solo administrador; nunca sobre sí mismo. |
| `PUT` | `/api/v1/usuarios/:id/foto` | Solo administrador; nunca sobre sí mismo. |
| `DELETE` | `/api/v1/usuarios/:id/foto` | Solo administrador; nunca sobre sí mismo. |
| `GET` | `/api/v1/usuarios/:id/servicios` | Cualquier autenticado; inactivos solo administrador. |
| `POST` | `/api/v1/usuarios/:id/servicios` | Administrador, coordinación o secretaría. |
| `DELETE` | `/api/v1/usuarios/:id/servicios/:servicioId` | Administrador, coordinación o secretaría. |

No existen en el MVP:

```text
PATCH  /api/v1/usuarios/:id
PATCH  /api/v1/usuarios/:id/password
DELETE /api/v1/usuarios/:id
POST   /api/v1/auth/registro
POST   /api/v1/auth/restablecer-password
```

No agregar endpoints de roles, permisos, historial de sesiones, biografías,
publicación o servicios por analogía con otros sistemas.

---

## 8. Proyecciones de usuario

Solo existen tres proyecciones contractuales.

### 8.1 `selector`

Disponible para cualquier actor autenticado, solo sobre usuarios activos:

```json
{
  "id": "uuid",
  "nombre": "Ana",
  "apellido": "Pérez",
  "titulo": "Lic.",
  "funcion": "Psicopedagoga clínica",
  "fotoUrl": "/uploads/usuarios/uuid.webp"
}
```

No incluye rol, especialidad, estado ni datos administrativos.

### 8.2 `directory`

Disponible para cualquier actor autenticado, solo sobre usuarios activos:

```json
{
  "id": "uuid",
  "nombre": "Ana",
  "apellido": "Pérez",
  "rol": "profesional",
  "titulo": "Lic.",
  "especialidad": "Psicopedagogía",
  "funcionPublica": "Psicopedagoga clínica",
  "fotoUrl": "/uploads/usuarios/uuid.webp"
}
```

### 8.3 `administrative`

Exclusiva del administrador:

```json
{
  "id": "uuid",
  "nombre": "Ana",
  "apellido": "Pérez",
  "dni": "30111222",
  "email": "persona@centro.com",
  "rol": "profesional",
  "titulo": "Lic.",
  "especialidad": "Psicopedagogía",
  "telefono": "+54 9 3777 000000",
  "bio": null,
  "fotoUrl": null,
  "funcionPublica": null,
  "visiblePublicamente": false,
  "ordenPublico": null,
  "activo": true,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

Reglas:

- administrador recibe `administrative` por defecto;
- los demás roles reciben `directory` por defecto;
- solicitar una proyección nunca amplía el permiso del actor;
- `administrative` solicitada por otro rol responde
  `403 USUARIO_PROYECCION_DENEGADA`;
- un usuario inactivo no aparece en `selector` ni `directory`;
- el profesional puede usar estas proyecciones como selector aunque no vea el
  módulo Usuarios en la navegación;
- ninguna proyección contiene hash, token, cookie o datos de sesiones.

Mapeo obligatorio:

```text
selector.funcion          <- usuarios.funcion_publica
directory.funcionPublica  <- usuarios.funcion_publica
administrative.funcionPublica <- usuarios.funcion_publica
```

No exponer simultáneamente `funcion`, `funcionPublica` y `funcion_publica`.

---

## 9. Listado y detalle

### `GET /usuarios`

Query autorizada:

```text
page
limit
search
rol
activo
projection
sort
order
```

Reglas:

- aplicar paginación general del contrato;
- `search` consulta nombre y apellido para todos;
- DNI y email solo participan de `search` cuando el actor es administrador;
- `activo=false` es exclusivo del administrador;
- no administrativos quedan forzados a usuarios activos aunque omitan el
  filtro;
- `sort` solo admite `apellido`, `nombre`, `createdAt` o `updatedAt`;
- `order` solo admite `asc` o `desc`;
- agregar un filtro no documentado requiere cambiar contrato y pruebas;
- la query debe seleccionar únicamente columnas necesarias para la proyección;
- mantener un desempate estable por `id` cuando el orden principal no sea
  único.

Intentos de filtro prohibido responden `403 FORBIDDEN_FILTER`; no se ignoran
silenciosamente.

### `GET /usuarios/:id`

- validar UUID antes de consultar;
- administrador recibe la proyección administrativa;
- otros roles reciben directorio solo si el objetivo está activo;
- para un objetivo inexistente o invisible responder
  `404 USUARIO_NO_ENCONTRADO`;
- no revelar por diferencias de error que un UUID corresponde a un usuario
  inactivo;
- no incluir servicios, sesiones, vínculos, turnos o informes automáticamente.

---

## 10. Alta administrativa

`POST /usuarios` es exclusivo del administrador.

Campos admitidos:

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, texto normalizado, máximo 100. |
| `apellido` | Obligatorio, texto normalizado, máximo 100. |
| `dni` | Obligatorio, 7 a 20 dígitos después de normalizar. |
| `email` | Obligatorio, válido, minúsculas, máximo 254. |
| `rol` | Obligatorio, rol fijo del MVP. |
| `titulo` | Opcional o `null`, máximo 120. |
| `especialidad` | Obligatoria para `profesional`, máximo 150. |
| `telefono` | Opcional o `null`, máximo 40. |
| `bio` | Opcional o `null`, texto plano. |
| `funcionPublica` | Opcional o `null`, máximo 160. |
| `visiblePublicamente` | Opcional, default `false`. |
| `ordenPublico` | Opcional o `null`, entero cero o positivo. |

Rechazar expresamente:

```text
id
password
passwordHash
password_hash
fotoUrl
foto_url
activo
createdAt
updatedAt
permissions
tokens
sesiones
```

Flujo:

```text
normalizar entrada
validar reglas de rol y publicación
comprobar unicidad útil para feedback
generar hash bcrypt desde DNI normalizado
crear usuario activo
registrar USUARIO_CREADO
proyectar administrative
```

La comprobación previa no reemplaza los índices únicos de PostgreSQL. Traducir
la carrera final a `USUARIO_EMAIL_DUPLICADO` o `USUARIO_DNI_DUPLICADO` sin
exponer el nombre del constraint.

---

## 11. Edición administrativa

`PUT /usuarios/:id` es un reemplazo completo de los campos editables y es
exclusivo del administrador.

Reglas:

- aplicar `403 USUARIO_AUTOMODIFICACION_DENEGADA` antes de mutar;
- exigir la misma estructura administrativa de creación;
- no interpretar omisión como “conservar” si el contrato exige reemplazo;
- no aceptar foto, estado, hashes, tokens ni sesiones;
- validar unicidad de email y DNI excluyendo al usuario objetivo;
- si cambia DNI, recalcular credencial y revocar todas las sesiones;
- si no cambia DNI, no volver a generar el hash;
- si cambia rol, evaluar consecuencias antes de persistir;
- registrar `USUARIO_EDITADO` sin copiar valores sensibles;
- la respuesta utiliza proyección `administrative`.

La auditoría puede almacenar nombres técnicos de campos cambiados, pero no los
valores de DNI, email, teléfono, bio ni función pública.

---

## 12. Prohibición de automodificación administrativa

Ningún usuario administra su propia cuenta mediante:

```text
PUT    /usuarios/:id
PATCH  /usuarios/:id/estado
PATCH  /usuarios/:id/restablecer-acceso
PUT    /usuarios/:id/foto
DELETE /usuarios/:id/foto
```

Esto incluye al administrador. Comparar siempre `actor.id` con el usuario
objetivo en el service o policy; no confiar en que el frontend oculte botones.

La regla no convierte los servicios habituales en edición de perfil. Sus
permisos son independientes y se aplican según la sección correspondiente.

No agregar excepciones implícitas para “actualizar solo la foto”, “reactivarse”
o “restablecerse”. Una excepción requiere una decisión y cambio contractual.

---

## 13. Roles y condición de prestador

Roles fijos:

```text
administrador
coordinacion
secretaria
profesional
```

Prestadores:

```text
coordinacion
profesional
```

Reglas:

- no existe CRUD de roles;
- `especialidad` es obligatoria para rol `profesional`;
- coordinación puede actuar como prestador aun con especialidad nula;
- administrador y secretaría no pueden ser destinatarios de vínculos o turnos
  como prestadores;
- administrador nunca puede tener `visiblePublicamente=true`;
- coordinación, secretaría y profesional pueden publicarse si el administrador
  lo configura y permanecen activos;
- cambiar de prestador a no prestador exige validar turnos futuros `pendiente`
  o `confirmado`;
- si existen turnos bloqueantes, responder
  `409 USUARIO_TIENE_TURNOS_FUTUROS`;
- el historial no se reasigna ni elimina por cambio de rol.

No inferir que un rol elevado puede actuar como prestador. La capacidad depende
del rol funcional aprobado, no de una jerarquía de privilegios.

---

## 14. Activación y desactivación

`PATCH /usuarios/:id/estado` acepta únicamente:

```json
{
  "activo": false
}
```

Reglas generales:

- solo administrador;
- nunca sobre la cuenta propia;
- el estado solicitado debe diferir del vigente;
- caso sin cambio responde `409 USUARIO_ESTADO_SIN_CAMBIOS`;
- no existe eliminación física;
- activar no restaura automáticamente relaciones cerradas;
- activar no publica automáticamente al usuario;
- desactivar no cambia `visiblePublicamente`, pero la API pública exige también
  `activo=true`;
- usuario inactivo no inicia ni renueva sesión;
- usuario inactivo no aparece en selectores de nuevas operaciones.

Antes de desactivar a un prestador:

- comprobar turnos futuros en estado `pendiente` o `confirmado`;
- si existen, bloquear con `USUARIO_TIENE_TURNOS_FUTUROS`;
- no cancelar ni reasignar turnos automáticamente.

Al desactivar:

```text
BEGIN
  bloquear/validar usuario objetivo
  verificar turnos futuros bloqueantes
  marcar activo = false
  revocar todas las sesiones
  cerrar vínculos prestador-paciente activos
  registrar USUARIO_DESACTIVADO
COMMIT
```

Conservar:

- turnos históricos;
- vínculos cerrados;
- informes finalizados;
- borradores;
- conversaciones y mensajes;
- auditorías;
- asociaciones históricas que la documentación no ordene eliminar.

Los borradores del autor desactivado quedan bloqueados y no se reasignan.

Al activar, registrar `USUARIO_ACTIVADO`. No reconstruir vínculos, servicios,
sesiones o permisos históricos por intuición.

---

## 15. DNI, email y credencial derivada

El uso del DNI como credencial es una simplificación deliberada del MVP.

Reglas:

- normalizar DNI a dígitos antes de validar, comparar y persistir;
- resultado normalizado entre 7 y 20 dígitos;
- normalizar email a minúsculas antes de validar y persistir;
- unicidad de email sin distinguir mayúsculas;
- nunca almacenar DNI como password plano en otra columna;
- almacenar únicamente el hash bcrypt derivado en `password_hash`;
- obtener el costo bcrypt de configuración validada;
- no incluir DNI, email ni hash en tokens;
- no registrar DNI, email ni hash en logs o auditoría;
- no devolver hash en ninguna proyección.

Cuando cambia el DNI:

```text
BEGIN
  actualizar DNI normalizado
  recalcular password_hash
  revocar todas las sesiones del usuario
  registrar USUARIO_EDITADO con campos modificados, sin valores
COMMIT
```

La operación es atómica. No confirmar el cambio de DNI dejando sesiones activas
o una credencial derivada del valor anterior.

---

## 16. Restablecimiento de acceso

`PATCH /usuarios/:id/restablecer-acceso`:

- es exclusivo del administrador;
- no admite body;
- no puede aplicarse sobre la cuenta propia;
- recalcula `password_hash` desde el DNI normalizado vigente;
- revoca todas las sesiones del objetivo;
- registra `ACCESO_RESTABLECIDO`;
- responde `204` sin body;
- no devuelve el DNI ni una credencial temporal;
- no envía emails ni genera enlaces o tokens de recuperación;
- no cambia el DNI;
- no activa implícitamente una cuenta inactiva.

La posibilidad de ejecutar esta acción sobre un usuario inactivo permanece
pendiente. Hasta una decisión, no inventar que restablecer acceso equivale a
activar.

---

## 17. Foto de usuario

La foto se gestiona únicamente mediante endpoints separados.

### Carga o reemplazo

```text
PUT /api/v1/usuarios/:id/foto
Content-Type: multipart/form-data
campo: imagen
```

Reglas:

- solo administrador y nunca sobre sí mismo;
- exactamente una imagen;
- máximo 5 MB;
- formatos JPEG, PNG o WebP;
- validar MIME y, cuando sea posible, firma real;
- generar nombre mediante UUID en el servidor;
- normalizar extensión;
- ignorar el nombre original para persistencia;
- impedir path traversal;
- PostgreSQL guarda una ruta pública controlada, nunca una ruta absoluta;
- no aceptar base64 ni URL en alta o edición general;
- no aplicar Multer globalmente.

Errores:

```text
IMAGEN_REQUERIDA
IMAGEN_TIPO_INVALIDO
IMAGEN_DEMASIADO_GRANDE
USUARIO_NO_ENCONTRADO
USUARIO_AUTOMODIFICACION_DENEGADA
```

### Reemplazo y compensación

El filesystem no participa en la transacción PostgreSQL:

```text
validar imagen
guardar archivo nuevo
actualizar foto_url y auditoría en PostgreSQL
si PostgreSQL falla, eliminar archivo nuevo
si confirma, intentar eliminar archivo anterior
si la limpieza anterior falla, conservar la operación y registrar warning seguro
```

No borrar el archivo anterior antes de confirmar la nueva referencia.

### Eliminación

`DELETE /usuarios/:id/foto`:

- es idempotente si no existe foto;
- actualiza `foto_url` a `NULL`;
- luego intenta eliminar el archivo físico;
- archivo físico ausente no convierte la respuesta en error;
- un fallo no crítico de limpieza produce warning sin rutas absolutas;
- registra `USUARIO_FOTO_ELIMINADA` cuando corresponda al contrato de eventos.

La carga o reemplazo registra `USUARIO_FOTO_ACTUALIZADA`. La auditoría nunca
incluye nombre original, ruta absoluta ni contenido del archivo.

---

## 18. Servicios habituales

`usuarios_servicios` es una asociación organizativa e informativa.

> Decisión contraintuitiva: no autoriza ni restringe el servicio de un turno.

### Consulta

`GET /usuarios/:id/servicios`:

- cualquier autenticado consulta asociaciones activas;
- `activo=false` es exclusivo del administrador;
- la respuesta usa proyección mínima de servicio;
- no expone `asignado_por` ni datos administrativos por defecto;
- validar visibilidad del usuario objetivo según el actor.

### Asignación

`POST /usuarios/:id/servicios`:

- permite administrador, coordinación o secretaría;
- profesional no gestiona ni siquiera sus propias asignaciones;
- usuario objetivo debe estar activo;
- usuario objetivo debe ser `coordinacion` o `profesional`;
- servicio debe existir y estar activo;
- duplicado responde `409 SERVICIO_YA_ASIGNADO`;
- persistir `asignado_por` cuando el modelo vigente lo contemple;
- registrar `SERVICIO_ASIGNADO` en la misma transacción.

### Remoción

`DELETE /usuarios/:id/servicios/:servicioId`:

- permite administrador, coordinación o secretaría;
- profesional no gestiona asociaciones;
- asociación inexistente responde
  `404 SERVICIO_ASIGNACION_NO_ENCONTRADA`;
- se permite eliminar físicamente la fila técnica;
- no se bloquea por turnos futuros;
- no modifica ni invalida turnos existentes;
- registra `SERVICIO_QUITADO` en la misma transacción.

Nunca consultar `usuarios_servicios` para decidir si un turno acepta un servicio.
La única regla del turno es que el servicio exista y esté activo, además de sus
otras invariantes propias.

---

## 19. Transacciones obligatorias

Propagar una única instancia `{ transaction }` a todos los services que
participan. No abrir transacciones internas independientes.

| Operación | Unidad atómica |
|---|---|
| Crear usuario | Usuario, hash derivado y auditoría. |
| Cambiar DNI | Usuario, hash nuevo, revocación de sesiones y auditoría. |
| Cambiar rol | Validaciones, usuario, cierre de relaciones aprobadas y auditoría. |
| Desactivar | Usuario, sesiones, vínculos activos y auditoría. |
| Activar | Usuario y auditoría. |
| Restablecer acceso | Hash, revocación de sesiones y auditoría. |
| Asignar servicio | Asociación y auditoría. |
| Quitar servicio | Remoción de asociación y auditoría. |

Una falla debe revertir la unidad funcional completa.

Las operaciones con archivos utilizan compensación adicional; no simular que
el filesystem pertenece a la transacción PostgreSQL.

Los eventos exitosos se registran dentro de la misma transacción. No abrir una
transacción independiente de Auditoría para conservar un supuesto éxito si la
operación funcional se revierte.

---

## 20. Concurrencia

Las validaciones previas mejoran el mensaje; PostgreSQL decide la integridad
final.

Casos que requieren tratamiento explícito:

- dos altas simultáneas con el mismo email;
- dos altas simultáneas con el mismo DNI;
- dos asignaciones simultáneas del mismo servicio;
- edición concurrente del mismo usuario;
- cambio de rol simultáneo con creación de turno futuro;
- desactivación simultánea con creación de turno futuro;
- dos acciones administrativas simultáneas sobre el último administrador;
- restablecimiento o cambio de DNI simultáneo con refresh de sesión.

Para restricciones conocidas:

1. capturar el error de Sequelize;
2. identificar la condición sin exponer SQL ni constraints;
3. traducir a código funcional estable;
4. responder conforme al contrato;
5. probar con dos conexiones reales.

La unicidad de `usuarios_servicios(usuario_id, servicio_id)` resuelve el
duplicado final. Las estrategias exactas de bloqueo para cambios de rol,
desactivación y último administrador permanecen pendientes; no inventarlas.

---

## 21. Auditoría

Eventos canónicos de Usuarios:

```text
USUARIO_CREADO
USUARIO_EDITADO
USUARIO_ACTIVADO
USUARIO_DESACTIVADO
ACCESO_RESTABLECIDO
USUARIO_FOTO_ACTUALIZADA
USUARIO_FOTO_ELIMINADA
SERVICIO_ASIGNADO
SERVICIO_QUITADO
```

Cada evento usa el contrato interno definido por
`api/src/modules/auditoria/AGENTS.md` y el catálogo central.

Metadata permitida solo cuando el evento la declara:

- UUID del usuario objetivo;
- UUID del servicio relacionado;
- estado anterior y nuevo;
- rol anterior y nuevo;
- nombres técnicos de campos modificados;
- resultado y causa técnica normalizada.

Metadata prohibida:

- DNI;
- email;
- teléfono;
- bio o función pública;
- `password_hash`;
- tokens, cookies o hashes de sesión;
- bodies completos;
- contenido o nombre original de imágenes;
- rutas absolutas;
- SQL, constraints o stacks.

No duplicar auditoría funcional en logs técnicos con metadata completa.

---

## 22. Validación y normalización

### Joi

Valida:

- forma del request;
- campos obligatorios;
- propiedades inesperadas;
- UUID;
- enums;
- longitudes;
- enteros y booleanos;
- formato general de email y DNI;
- presencia o ausencia de body;
- query permitida;
- existencia de exactamente un archivo en la ruta multipart.

### Service

Valida:

- actor y automodificación;
- unicidad útil para feedback;
- existencia y estado del objetivo;
- reglas del rol;
- especialidad condicional;
- publicación del administrador;
- condición de prestador;
- turnos futuros bloqueantes;
- servicio habitual y duplicado;
- consecuencias transaccionales.

### PostgreSQL

Garantiza:

- claves primarias y foráneas;
- unicidad final de DNI;
- unicidad final de email sin distinguir mayúsculas;
- unicidad de asociación usuario-servicio;
- nulabilidad y tipos;
- integridad final bajo concurrencia.

Normalización:

- email a minúsculas;
- DNI a dígitos;
- strings con política central de trim y nulos;
- no convertir silenciosamente valores inválidos en válidos;
- `funcionPublica` admite hasta 160 caracteres;
- `ordenPublico` es `null` o entero no negativo.

---

## 23. Errores y privacidad

Códigos específicos vigentes:

```text
USUARIO_NO_ENCONTRADO
USUARIO_EMAIL_DUPLICADO
USUARIO_DNI_DUPLICADO
USUARIO_TIENE_TURNOS_FUTUROS
USUARIO_ESTADO_SIN_CAMBIOS
USUARIO_NO_ES_PRESTADOR
USUARIO_PROYECCION_DENEGADA
USUARIO_AUTOMODIFICACION_DENEGADA
ESPECIALIDAD_REQUERIDA
ROL_NO_HABILITADO
ADMINISTRADOR_NO_PUBLICABLE
IMAGEN_REQUERIDA
IMAGEN_TIPO_INVALIDO
IMAGEN_DEMASIADO_GRANDE
SERVICIO_NO_ENCONTRADO
SERVICIO_YA_ASIGNADO
SERVICIO_ASIGNACION_NO_ENCONTRADA
USUARIO_INACTIVO
FORBIDDEN_FILTER
```

No crear aliases para el mismo error. No exponer:

- existencia de usuarios inactivos a actores no autorizados;
- valor conflictivo de DNI o email;
- SQL o nombre del constraint;
- stack o ruta absoluta;
- hash o estado interno de sesiones;
- permisos o datos administrativos en errores;
- nombres originales de archivos.

Los errores siguen el envelope transversal de `docs/contrato-api.md`.

---

## 24. Acceso público al equipo

Usuarios administra datos que también consume `GET /api/v1/public/equipo`, pero
la API pública no amplía las proyecciones privadas.

Para aparecer públicamente se exige simultáneamente:

```text
activo = true
visible_publicamente = true
rol != administrador
```

Reglas:

- `activo=true` no implica publicación;
- `visiblePublicamente=true` no publica un usuario inactivo;
- administrador nunca aparece;
- no publicar DNI, email de acceso, teléfono personal, rol técnico, permisos,
  estado de sesiones ni campos administrativos;
- ordenar según `orden_publico` y desempates contractuales;
- devolver solo la proyección pública definida por el contrato;
- la foto utiliza una ruta pública controlada.

No reutilizar `administrative` y luego eliminar campos. Construir una proyección
pública con lista positiva en el módulo dueño del endpoint público.

---

## 25. Pruebas mínimas

### Unitarias

- normalización de email y DNI;
- especialidad obligatoria para profesional;
- administrador no publicable;
- detección de prestador;
- automodificación denegada;
- selección de proyección;
- listas positivas de campos;
- validación de imagen;
- traducción de errores conocidos.

### Integración

- alta y proyección administrativa;
- unicidad de email sin distinguir mayúsculas;
- unicidad de DNI normalizado;
- edición completa;
- cambio de DNI revoca todas las sesiones;
- desactivación cierra vínculos y revoca sesiones;
- rollback conjunto ante fallo;
- activación no restaura relaciones;
- restablecimiento recalcula hash y revoca sesiones;
- carga, reemplazo y eliminación idempotente de foto;
- compensación si falla PostgreSQL tras guardar archivo;
- asignación y remoción de servicio habitual;
- asociación duplicada concurrente;
- auditoría en la misma transacción.

### Autorización y seguridad

- cada rol autorizado y no autorizado por endpoint;
- usuario, incluido administrador, no se modifica a sí mismo;
- `administrative` denegada a no administradores;
- DNI, email y teléfono ausentes de `selector` y `directory`;
- usuario inactivo invisible para no administradores;
- `activo=false` y búsqueda por DNI/email denegados a no administradores;
- acceso directo por UUID no filtra inactivos;
- profesional no gestiona servicios habituales;
- coordinación y secretaría sí pueden gestionarlos;
- upload rechaza tipo, tamaño y campos inesperados;
- ninguna respuesta o error expone hashes, tokens o rutas internas;
- rutas excluidas responden `404`.

### Concurrencia

- alta simultánea con mismo email;
- alta simultánea con mismo DNI;
- asignación simultánea del mismo servicio;
- desactivación simultánea con creación de turno;
- cambio de rol simultáneo con creación de turno;
- cambio de DNI o restablecimiento simultáneo con refresh;
- protección del último administrador cuando exista estrategia aprobada.

No usar únicamente mocks para afirmar integridad transaccional o concurrente.

---

## 26. Acciones prohibidas

No:

- crear registro público de usuarios;
- permitir automodificación administrativa;
- eliminar físicamente usuarios;
- crear roles configurables;
- aceptar `fotoUrl` en JSON;
- guardar imágenes en PostgreSQL;
- confiar en extensión o MIME enviados por el cliente;
- usar nombres originales como ruta persistida;
- exponer DNI o email en proyecciones no administrativas;
- serializar modelos Sequelize completos;
- usar `usuarios_servicios` para autorizar turnos;
- permitir que profesional gestione servicios habituales;
- cancelar o reasignar turnos automáticamente al desactivar;
- reasignar borradores de informes;
- reactivar vínculos o sesiones al activar un usuario;
- registrar información sensible en auditoría o logs;
- agregar endpoints no contractuales;
- usar `sequelize.sync()`;
- resolver decisiones pendientes por intuición.

---

## 27. Procedimiento de trabajo

Antes de implementar un cambio:

1. identificar endpoints y reglas afectadas;
2. revisar contrato, matriz, modelo y AGENTS relacionados;
3. confirmar proyección y campos permitidos;
4. enumerar efectos sobre sesiones, turnos, vínculos, informes, archivos y
   auditoría;
5. identificar la unidad transaccional;
6. definir estrategia de error e integridad final;
7. crear o ajustar migración si cambia persistencia;
8. implementar por capas;
9. agregar pruebas de permiso, privacidad, rollback y concurrencia;
10. ejecutar comandos disponibles e informar resultados.

No modificar documentación normativa para adecuarla después a una decisión de
código no aprobada.

---

## 28. Definition of Done

Una tarea de Usuarios está completa cuando:

- respeta rutas, status, envelopes y errores contractuales;
- aplica autorización por rol, fila, proyección y campos;
- bloquea automodificación administrativa;
- no expone información sensible;
- normaliza DNI y email de forma consistente con Auth;
- conserva historial y baja lógica;
- propaga una única transacción;
- revoca sesiones cuando corresponde;
- contempla consecuencias de rol y estado;
- maneja imágenes mediante storage compartido y compensación;
- mantiene servicios habituales como asociación informativa;
- registra eventos canónicos sin datos sensibles;
- traduce restricciones de PostgreSQL a errores funcionales;
- incluye pruebas unitarias, de integración y seguridad pertinentes;
- incluye pruebas concurrentes cuando afirma resolver una carrera;
- no agrega alcance excluido;
- actualiza documentación y AGENTS si cambia una decisión aprobada;
- informa qué validaciones se ejecutaron y cuáles no.

---

## 29. Decisiones pendientes

Los agentes no deben resolver estas decisiones por intuición.

### Último administrador activo

No está definida la estrategia que impida dejar al centro sin administradores
activos por desactivación o cambio de rol. Falta decidir:

- regla funcional exacta;
- código de error;
- bloqueo o serialización concurrente;
- alcance de la protección en seeders y tareas internas.

### Access tokens ya emitidos

Se revocan sesiones al desactivar, cambiar DNI o restablecer acceso, pero falta
definir si un access token ya emitido debe quedar inválido inmediatamente tras:

- desactivar el usuario;
- cambiar su rol;
- cambiar permisos derivados.

La decisión pertenece a la estrategia transversal de Auth.

### Cambio de prestador a no prestador

Está confirmado validar turnos futuros y cerrar relaciones aplicables, pero
falta precisar el tratamiento de:

- servicios habituales;
- borradores de informes;
- asignaciones históricas;
- operaciones iniciadas simultáneamente;
- estrategia exacta de bloqueo.

No eliminar mensajes, informes finalizados ni historial.

### Restablecimiento de usuario inactivo

No está definido si puede restablecerse el acceso de una cuenta inactiva.
Restablecer no debe activar implícitamente.

### Concurrencia administrativa

Falta aprobar una estrategia común para:

- último administrador;
- cambio de rol frente a turno simultáneo;
- desactivación frente a turno simultáneo;
- edición concurrente del mismo usuario;
- refresh simultáneo con revocación masiva.

### Almacenamiento de imágenes en producción

El MVP abstrae almacenamiento local, pero siguen pendientes proveedor,
persistencia, backup, restauración y migración eventual a storage externo. No
desplegar uploads en un filesystem efímero.

---

## 30. Criterio de cambio

Modificar permisos, proyecciones, campos, roles, credenciales, efectos de una
desactivación o relación entre servicios habituales y turnos es un cambio
funcional y de seguridad, no un refactor.

Todo cambio debe actualizar en conjunto, según corresponda:

```text
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
docs/arquitectura-backend.md
api/src/modules/usuarios/AGENTS.md
api/src/modules/auth/AGENTS.md
api/src/modules/auditoria/AGENTS.md
migraciones
pruebas
```

No convertir una preferencia de implementación en una decisión arquitectónica
sin aprobación explícita.
