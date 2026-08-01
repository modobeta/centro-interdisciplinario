# Centro Educativo Interdisciplinario Terapéutico
## Contrato de API REST — MVP

**Versión documental:** 4.0  
**Fecha:** 1 de agosto de 2026  
**Base path:** `/api/v1`  
**Formato:** JSON UTF-8  
**Zona horaria de agenda:** `America/Argentina/Cordoba`

---

## 1. Propósito y alcance

Este documento define la interfaz HTTP estable del MVP:

- endpoints;
- autenticación y autorización;
- parámetros de ruta y consulta;
- cuerpos de solicitud;
- proyecciones de respuesta;
- códigos HTTP;
- códigos funcionales de error;
- endpoints deliberadamente excluidos.

Es normativo para backend, frontend, pruebas y agentes de programación. Debe leerse junto con:

- `docs/matriz-permisos.md`;
- `docs/modelo-datos.md`;
- `docs/arquitectura-backend.md`;
- los `AGENTS.md` aplicables.

Las migraciones son la fuente de verdad del esquema físico. Los schemas Joi deben implementar este contrato sin ampliar silenciosamente entradas, permisos ni campos de salida.

### 1.1 Decisiones consolidadas por esta versión

Esta versión incorpora y reemplaza las reglas incompatibles de documentos anteriores:

1. Un turno puede utilizar cualquier servicio activo. No se exige que sea un servicio habitual del prestador.
2. Los servicios habituales de un prestador solo pueden ser administrados por `administrador`, `coordinacion` o `secretaria`.
3. El endpoint de ausencia es `PATCH /turnos/:id/ausente`.
4. No existen edición estructural ni reprogramación de turnos: se cancela el original y se crea uno nuevo.
5. Se incorporan `GET /resumen` y `GET /conversaciones/no-leidas/resumen`.
6. Se incorporan los endpoints administrativos de imagen de usuarios y servicios.
7. `activo` y `visiblePublicamente` son condiciones independientes.
8. El administrador y coordinación no pueden leer conversaciones ajenas si no son participantes.
9. Administración y secretaría no reciben `notasInternas` de turnos.

---

## 2. Convenciones generales

### 2.1 Headers

Todas las solicitudes JSON utilizan:

```http
Content-Type: application/json
Accept: application/json
```

Las rutas privadas requieren:

```http
Authorization: Bearer <accessToken>
```

El refresh token viaja exclusivamente en una cookie HttpOnly. Nunca se acepta en el body, query string ni header `Authorization`.

El cliente puede enviar:

```http
X-Correlation-Id: <uuid>
```

Si no lo envía, la API genera uno. La respuesta siempre devuelve el header `X-Correlation-Id`; los errores también lo incluyen en el body.

### 2.2 Respuesta exitosa simple

```json
{
  "data": {
    "id": "uuid"
  }
}
```

### 2.3 Respuesta exitosa paginada

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 134,
    "totalPages": 7
  }
}
```

### 2.4 Respuesta no paginada

```json
{
  "data": [],
  "meta": {
    "count": 0
  }
}
```

### 2.5 Advertencias no bloqueantes

```json
{
  "data": {},
  "meta": {
    "warnings": [
      {
        "code": "PACIENTE_POSIBLE_DUPLICADO",
        "message": "Existe otro paciente con datos coincidentes."
      }
    ]
  }
}
```

### 2.6 Error estándar

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisá los datos enviados.",
    "details": [
      {
        "field": "email",
        "code": "string.email",
        "message": "Ingresá un correo válido."
      }
    ],
    "correlationId": "9eeced3e-0000-4000-8000-000000000000"
  }
}
```

`details` es siempre un arreglo. No contiene SQL, nombres internos de constraints, stacks ni datos sensibles.

### 2.7 Operaciones sin body

Una respuesta `204 No Content` no lleva envelope ni cuerpo de respuesta.

### 2.8 Códigos HTTP

| HTTP | Uso contractual |
|---:|---|
| `200` | Consulta o modificación exitosa. |
| `201` | Recurso creado. |
| `204` | Operación exitosa sin body. |
| `400` | JSON malformado, query incompatible o formato general inválido. |
| `401` | Falta autenticación, token inválido, sesión revocada o credenciales incorrectas. |
| `403` | Usuario autenticado sin permiso sobre la acción, recurso o campo. |
| `404` | Recurso inexistente o deliberadamente oculto al actor. |
| `409` | Duplicado, conflicto de estado, concurrencia o solapamiento. |
| `413` | Archivo superior al máximo permitido. |
| `422` | Datos sintácticamente válidos que incumplen una regla de negocio. |
| `429` | Límite de intentos o solicitudes excedido. |
| `500` | Error interno inesperado. |
| `503` | Dependencia requerida no disponible. |

### 2.9 Errores transversales

Salvo que el endpoint sea público, todos pueden responder:

| HTTP | Código | Significado |
|---:|---|---|
| `400` | `VALIDATION_ERROR` | Params, query o body inválidos. |
| `401` | `AUTHENTICATION_REQUIRED` | Falta access token. |
| `401` | `TOKEN_INVALIDO` | Access token inválido. |
| `401` | `TOKEN_EXPIRADO` | Access token vencido. |
| `401` | `SESION_REVOCADA` | La sesión fue revocada. |
| `401` | `USUARIO_INACTIVO` | El usuario ya no está activo. |
| `403` | `FORBIDDEN` | El rol no posee la facultad general. |
| `429` | `RATE_LIMIT_EXCEEDED` | Límite general excedido. |
| `500` | `INTERNAL_ERROR` | Error inesperado sin detalle técnico. |

### 2.10 Paginación, búsqueda y orden

Convención uniforme:

```text
?page=1&limit=20&search=texto&sort=createdAt&order=desc
```

| Parámetro | Tipo | Regla |
|---|---|---|
| `page` | entero | Opcional; mínimo `1`; default `1`. |
| `limit` | entero | Opcional; mínimo `1`; default `20`; máximo `100`. |
| `search` | string | Opcional; se normaliza y aplica solo a campos autorizados. |
| `sort` | string | Opcional; debe pertenecer a la lista blanca del endpoint. |
| `order` | string | Opcional; `asc` o `desc`. |

Un filtro nunca amplía el alcance autorizado. Cuando el actor intenta forzar un alcance ajeno, la API responde `403 FORBIDDEN_FILTER`; no ignora silenciosamente el filtro.

### 2.11 Tipos y serialización

- IDs: UUID en minúsculas.
- Instantes: ISO 8601 en UTC, por ejemplo `2026-08-01T13:30:00.000Z`.
- Fechas civiles: `YYYY-MM-DD`.
- Horas locales: `HH:mm`, formato de 24 horas.
- Booleanos: `true` o `false`, no `0`, `1`, `"true"` ni `"false"`.
- Campos ausentes: no se modifican en `PATCH`.
- `null`: solo se acepta cuando el campo se documenta como nullable.
- Strings: se recortan en los extremos; un string vacío no equivale a `null`.

Para crear turnos, `fecha` y `horaInicio` se interpretan en `America/Argentina/Cordoba`. El backend persiste el instante resultante en UTC.

### 2.12 Campos nunca expuestos

- `password_hash`;
- `refresh_token_hash`;
- tokens persistidos;
- cookies completas;
- secretos o credenciales;
- consultas SQL y nombres internos de constraints;
- rutas físicas del servidor.

El DNI solo aparece en proyecciones administrativas de usuarios y en proyecciones autorizadas de pacientes.

---

## 3. Roles y alcance

Roles fijos:

```text
administrador
coordinacion
secretaria
profesional
```

No existe CRUD de roles en el MVP.

| Rol | Alcance resumido |
|---|---|
| `administrador` | Usuarios, accesos, catálogos, auditoría, pacientes, vínculos y agenda. Lee informes; no los crea. No actúa como prestador. |
| `coordinacion` | Operación global y actuación como prestador. Crea informes propios. No administra cuentas ni auditoría. |
| `secretaria` | Pacientes, tutores, vínculos y agenda. Lee informes completos. No crea informes ni administra cuentas o auditoría. |
| `profesional` | Pacientes vinculados, agenda propia, informes propios y mensajería como participante. |

La respuesta del backend puede reducir filas y campos según RBAC, policy de recurso y proyección. El frontend no determina el alcance de seguridad.

---

## 4. Índice de endpoints

### 4.1 Públicos y sesión

| Método | Ruta | Resultado principal |
|---|---|---|
| `POST` | `/auth/login` | Inicia sesión. |
| `POST` | `/auth/refresh` | Rota refresh y renueva contexto. |
| `GET` | `/public/equipo` | Equipo publicado. |
| `GET` | `/public/servicios` | Servicios publicados. |
| `GET` | `/health` | Estado del proceso. |
| `GET` | `/ready` | Disponibilidad de PostgreSQL. |

### 4.2 Privados

| Dominio | Endpoints |
|---|---|
| Sesión | `POST /auth/logout`, `POST /auth/logout-todas` |
| Resumen | `GET /resumen` |
| Usuarios | `GET/POST /usuarios`, `GET/PUT /usuarios/:id`, estado, acceso, foto y servicios habituales |
| Pacientes | `GET/POST /pacientes`, `GET/PUT /pacientes/:id`, estado y vínculos |
| Turnos | listado, disponibilidad, detalle, creación y acciones de estado/campos |
| Informes | listado, detalle, creación, edición y finalización |
| Mensajería | conversaciones, mensajes, participantes, lectura y archivo |
| Catálogos | servicios, consultorios, asuntos y tipos de informe |
| Auditoría | `GET /auditoria` |

Las rutas de este documento omiten `/api/v1` en títulos posteriores para facilitar la lectura.

---

# 5. Autenticación y sesiones

## 5.1 `POST /auth/login`

**Acceso:** público.  
**Content-Type:** `application/json`.

### Body

| Campo | Tipo | Requerido | Regla |
|---|---|:---:|---|
| `email` | string | Sí | Correo válido; máximo 254; se normaliza a minúsculas. |
| `dni` | string | Sí | 7 a 20 dígitos después de normalizar separadores. |

```json
{
  "email": "persona@centro.com",
  "dni": "30111222"
}
```

### Respuesta `200`

```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "uuid",
      "nombre": "Ana",
      "apellido": "Pérez",
      "rol": "profesional",
      "titulo": "Lic.",
      "especialidad": "Psicopedagogía",
      "funcion": "Psicopedagoga clínica",
      "fotoUrl": "/uploads/usuarios/uuid.webp"
    },
    "permissions": [
      "patients.readLinked",
      "appointments.manageOwn",
      "reports.createLinked"
    ]
  }
}
```

El refresh token se establece mediante `Set-Cookie` y no aparece en el JSON.

### Errores

| HTTP | Código | Situación |
|---:|---|---|
| `400` | `VALIDATION_ERROR` | Email o DNI con formato inválido. |
| `401` | `CREDENCIALES_INVALIDAS` | Usuario inexistente, inactivo o DNI incorrecto. Mensaje genérico. |
| `429` | `LOGIN_LIMITE_EXCEDIDO` | Más de cinco fallos en quince minutos para la combinación protegida. |

## 5.2 `POST /auth/refresh`

**Acceso:** público con cookie de refresh.  
**Body:** ninguno.

Valida sesión y usuario, rota el refresh token y devuelve el contexto vigente. Esto hace efectivo un cambio de permisos sin esperar un nuevo login.

### Respuesta `200`

Misma estructura de `data` que login: `accessToken`, `user` y `permissions`. También reemplaza la cookie de refresh.

### Errores

| HTTP | Código |
|---:|---|
| `401` | `REFRESH_INVALIDO` |
| `401` | `SESION_REVOCADA` |
| `401` | `SESION_EXPIRADA` |
| `401` | `USUARIO_INACTIVO` |

## 5.3 `POST /auth/logout`

**Acceso:** autenticado.  
**Body:** ninguno.  
**Respuesta:** `204`.

Revoca la sesión actual, identificada por la sesión y cookie vigentes, y limpia la cookie de refresh.

## 5.4 `POST /auth/logout-todas`

**Acceso:** autenticado.  
**Body:** ninguno.  
**Respuesta:** `204`.

Revoca todas las sesiones del usuario autenticado y limpia la cookie actual.

---

# 6. Resumen

## 6.1 `GET /resumen`

**Acceso:** cualquier autenticado.  
**Query:** ninguna. El cliente no puede solicitar la proyección de otro rol.

### Respuesta `200`

```json
{
  "data": {
    "cards": [
      {
        "key": "patients",
        "label": "Pacientes activos",
        "count": 18
      },
      {
        "key": "appointmentsToday",
        "label": "Turnos de hoy",
        "count": 7
      }
    ]
  }
}
```

`cards` contiene como máximo seis elementos y solo las métricas autorizadas:

| Rol | Keys permitidas |
|---|---|
| Profesional | `patients`, `appointmentsToday`, `reportDrafts`, `unreadConversations` |
| Secretaría | `patients`, `appointmentsToday`, `pendingAppointments`, `unreadConversations`, `users`, `services` |
| Coordinación | `patients`, `appointmentsToday`, `reports`, `unreadConversations`, `users`, `services` |
| Administrador | `patients`, `appointmentsToday`, `users`, `services`, `unreadConversations`, `recentAuditEvents` |

Los contadores respetan el alcance del actor. La respuesta nunca contiene contenido clínico, mensajes ni notas.

---

# 7. Usuarios

Ningún usuario puede modificar su propia cuenta mediante endpoints administrativos, incluido el administrador. En `PUT`, cambio de estado, restablecimiento de acceso o foto, si el actor y el usuario objetivo coinciden, la API responde `403 USUARIO_AUTOMODIFICACION_DENEGADA`. Las relaciones organizativas de servicios habituales se rigen por sus permisos específicos y no equivalen a editar el perfil.

## 7.1 Proyecciones

### Selector

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

### Directorio interno

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

### Gestión administrativa

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

## 7.2 `GET /usuarios`

**Acceso:** cualquier autenticado.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `search` | string | Nombre, apellido y, solo para admin, email o DNI. |
| `rol` | enum | Uno de los cuatro roles. |
| `activo` | boolean | `false` solo para administrador. |
| `projection` | enum | `selector`, `directory` o `administrative`; esta última solo para admin. |
| `sort` | enum | `apellido`, `nombre`, `createdAt`, `updatedAt`. |
| `order` | enum | `asc` o `desc`. |

La proyección por defecto es `administrative` para administrador y `directory` para otros roles.

### Respuesta `200`

Envelope paginado. Cada elemento usa la proyección autorizada solicitada.

### Errores específicos

| HTTP | Código |
|---:|---|
| `403` | `USUARIO_PROYECCION_DENEGADA` |
| `403` | `FORBIDDEN_FILTER` |

## 7.3 `GET /usuarios/:id`

**Acceso:** cualquier autenticado.

### Path

| Parámetro | Tipo |
|---|---|
| `id` | UUID |

Administrador recibe proyección administrativa. El resto recibe directorio solo si el usuario está activo.

### Respuesta `200`

```json
{
  "data": {}
}
```

`data` se reemplaza por la proyección correspondiente.

### Error

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |

## 7.4 `POST /usuarios`

**Acceso:** solo administrador.

### Body

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `nombre` | string | Sí | Máximo 100. |
| `apellido` | string | Sí | Máximo 100. |
| `dni` | string | Sí | 7 a 20 dígitos normalizados. |
| `email` | string | Sí | Máximo 254. |
| `rol` | enum | Sí | Rol fijo del MVP. |
| `titulo` | string/null | No | Máximo 120. |
| `especialidad` | string/null | Cond. | Obligatoria para `profesional`; máximo 150. |
| `telefono` | string/null | No | Máximo 40. |
| `bio` | string/null | No | Texto plano. |
| `funcionPublica` | string/null | No | Máximo 160. |
| `visiblePublicamente` | boolean | No | Default `false`. |
| `ordenPublico` | entero/null | No | Cero o positivo. |

`fotoUrl`, `passwordHash`, `activo` y cualquier token se rechazan. La foto se carga por endpoint separado.

### Respuesta `201`

`data` contiene la proyección administrativa creada.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `USUARIO_EMAIL_DUPLICADO` |
| `409` | `USUARIO_DNI_DUPLICADO` |
| `422` | `ESPECIALIDAD_REQUERIDA` |
| `422` | `ROL_NO_HABILITADO` |
| `422` | `ADMINISTRADOR_NO_PUBLICABLE` |

## 7.5 `PUT /usuarios/:id`

**Acceso:** solo administrador.  
**Path:** `id` UUID.

El body contiene la misma estructura administrativa de creación. Es un reemplazo completo de campos editables; no acepta `fotoUrl`, `activo`, hashes ni sesiones.

Si cambia DNI, el backend recalcula la credencial derivada y revoca todas las sesiones. Si cambia el rol desde prestador a no prestador, verifica turnos futuros y cierra relaciones según la matriz.

### Respuesta `200`

`data` contiene la proyección administrativa actualizada.

### Errores específicos

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |
| `409` | `USUARIO_EMAIL_DUPLICADO` |
| `409` | `USUARIO_DNI_DUPLICADO` |
| `409` | `USUARIO_TIENE_TURNOS_FUTUROS` |
| `422` | `ADMINISTRADOR_NO_PUBLICABLE` |

## 7.6 `PATCH /usuarios/:id/estado`

**Acceso:** solo administrador.

```json
{
  "activo": false
}
```

### Respuesta `200`

`data` contiene la proyección administrativa actualizada.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |
| `409` | `USUARIO_TIENE_TURNOS_FUTUROS` |
| `409` | `USUARIO_ESTADO_SIN_CAMBIOS` |

Al desactivar se revocan sesiones y se cierran vínculos activos; se conserva el historial.

## 7.7 `PATCH /usuarios/:id/restablecer-acceso`

**Acceso:** solo administrador.  
**Body:** ninguno.  
**Respuesta:** `204`.

Recalcula la credencial a partir del DNI actual y revoca todas las sesiones.

### Error

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |

## 7.8 `PUT /usuarios/:id/foto`

**Acceso:** solo administrador.  
**Content-Type:** `multipart/form-data`.

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `imagen` | archivo | Sí | Una imagen JPEG, PNG o WebP; máximo 5 MB. |

### Respuesta `200`

```json
{
  "data": {
    "fotoUrl": "/uploads/usuarios/uuid.webp"
  }
}
```

### Errores

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |
| `413` | `IMAGEN_DEMASIADO_GRANDE` |
| `422` | `IMAGEN_REQUERIDA` |
| `422` | `IMAGEN_TIPO_INVALIDO` |

## 7.9 `DELETE /usuarios/:id/foto`

**Acceso:** solo administrador.  
**Body:** ninguno.

### Respuesta `200`

```json
{
  "data": {
    "fotoUrl": null
  }
}
```

La operación es idempotente si el usuario ya no posee foto.

## 7.10 `GET /usuarios/:id/servicios`

**Acceso:** cualquier autenticado.  
**Query:** `activo=true|false`; `false` solo para administrador.

### Respuesta `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Psicopedagogía",
      "descripcion": "...",
      "activo": true
    }
  ],
  "meta": {
    "count": 1
  }
}
```

## 7.11 `POST /usuarios/:id/servicios`

**Acceso:** administrador, coordinación o secretaría.

```json
{
  "servicioId": "uuid"
}
```

### Respuesta `201`

```json
{
  "data": {
    "usuarioId": "uuid",
    "servicioId": "uuid",
    "createdAt": "2026-08-01T12:00:00.000Z"
  }
}
```

### Errores

| HTTP | Código |
|---:|---|
| `404` | `USUARIO_NO_ENCONTRADO` |
| `404` | `SERVICIO_NO_ENCONTRADO` |
| `409` | `SERVICIO_YA_ASIGNADO` |
| `422` | `USUARIO_NO_ES_PRESTADOR` |
| `422` | `USUARIO_INACTIVO` |
| `422` | `SERVICIO_INACTIVO` |

## 7.12 `DELETE /usuarios/:id/servicios/:servicioId`

**Acceso:** administrador, coordinación o secretaría.  
**Respuesta:** `204`.

La asociación es informativa y su eliminación no se bloquea por turnos futuros.

### Error

| HTTP | Código |
|---:|---|
| `404` | `SERVICIO_ASIGNACION_NO_ENCONTRADA` |

---

# 8. Pacientes y tutor

El tutor es único, obligatorio y se administra dentro de la ficha del paciente. No existe un módulo ni CRUD independiente de tutores.

## 8.1 Proyección resumida

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

## 8.2 Proyección de detalle

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

## 8.3 `GET /pacientes`

**Acceso:** autenticado.

- administrador, coordinación y secretaría: alcance global;
- profesional: solo pacientes con vínculo activo.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `search` | string | Nombre, apellido y DNI cuando el actor puede utilizarlo. |
| `dni` | string | Filtro exacto; no amplía la proyección de salida. |
| `activo` | boolean | Profesional solo puede solicitar `true`. |
| `prestadorId` | UUID | Solo roles con alcance global; profesional no puede forzar otro actor. |
| `sort` | enum | `apellido`, `nombre`, `fechaNacimiento`, `createdAt`, `updatedAt`. |
| `order` | enum | `asc` o `desc`. |

### Respuesta `200`

Envelope paginado de proyecciones resumidas.

### Error específico

| HTTP | Código |
|---:|---|
| `403` | `FORBIDDEN_FILTER` |

## 8.4 `GET /pacientes/:id`

**Acceso:** administrador, coordinación, secretaría o profesional vinculado.  
**Path:** `id` UUID.

### Respuesta `200`

`data` contiene la proyección de detalle.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `PACIENTE_ACCESO_DENEGADO` |
| `404` | `PACIENTE_NO_ENCONTRADO` |

Cuando la policy de ocultamiento de recurso se aplique, el backend puede responder `404` en lugar de `403`; debe hacerlo de forma consistente para la misma clase de acceso.

## 8.5 `POST /pacientes`

**Acceso:** administrador, coordinación, secretaría o profesional.

### Body

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

### Campos

| Objeto | Campo | Tipo | Req. | Regla |
|---|---|---|:---:|---|
| paciente | `dni` | string/null | No | Único si existe; 7 a 20 dígitos. |
| paciente | `nombre` | string | Sí | Máximo 100. |
| paciente | `apellido` | string | Sí | Máximo 100. |
| paciente | `fechaNacimiento` | fecha | Sí | No futura. |
| paciente | `colegio` | string/null | No | Máximo 200. |
| paciente | `diagnostico` | string/null | No | Dato sensible. |
| paciente | `poseeCud` | boolean | Sí | Default funcional `false`. |
| paciente | `cudFechaVencimiento` | fecha/null | Cond. | Obligatoria solo si `poseeCud=true`. |
| paciente | `observaciones` | string/null | No | Dato sensible. |
| tutor | `nombre` | string | Sí | Máximo 100. |
| tutor | `apellido` | string | Sí | Máximo 100. |
| tutor | `telefono` | string | Sí | Máximo 40. |
| tutor | `parentesco` | string | Sí | Máximo 80. |
| tutor | `email` | string/null | No | Máximo 254. |
| tutor | `direccion` | string/null | No | Máximo 255. |
| tutor | `observaciones` | string/null | No | Texto plano. |

Paciente, tutor, vínculo automático cuando corresponde y auditoría se crean en una única transacción. Si el actor es profesional, queda vinculado automáticamente. El estado inicial es activo y no se acepta desde el cliente.

### Respuesta `201`

`data` contiene la ficha completa. Puede incluir `meta.warnings` con `PACIENTE_POSIBLE_DUPLICADO` cuando no hay DNI y coinciden nombre, apellido y fecha de nacimiento.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `PACIENTE_DNI_DUPLICADO` |
| `422` | `TUTOR_REQUERIDO` |
| `422` | `CUD_VENCIMIENTO_REQUERIDO` |
| `422` | `CUD_VENCIMIENTO_NO_PERMITIDO` |
| `422` | `FECHA_NACIMIENTO_INVALIDA` |

## 8.6 `PUT /pacientes/:id`

**Acceso:** administrador, coordinación, secretaría o profesional vinculado.  
**Body:** misma estructura completa de creación. `activo` no se acepta.

Actualiza paciente y tutor existente en una transacción; nunca crea un segundo tutor.

### Respuesta `200`

`data` contiene la ficha completa actualizada.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `PACIENTE_ACCESO_DENEGADO` |
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `409` | `PACIENTE_DNI_DUPLICADO` |
| `422` | `FECHA_NACIMIENTO_INVALIDA` |

## 8.7 `PATCH /pacientes/:id/estado`

**Acceso:** administrador, coordinación o secretaría.

```json
{
  "activo": false
}
```

### Respuesta `200`

`data` contiene la ficha actualizada.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `409` | `PACIENTE_TIENE_TURNOS_FUTUROS` |
| `409` | `PACIENTE_ESTADO_SIN_CAMBIOS` |

Al reactivar no se reabren vínculos históricos.

---

# 9. Vínculos prestador-paciente

Un prestador es un usuario activo con rol `profesional` o `coordinacion`.

## 9.1 Proyección

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

## 9.2 `GET /pacientes/:pacienteId/vinculos`

**Acceso:** administrador, coordinación, secretaría o profesional vinculado.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `activo` | boolean | Default `true`. |
| `incluirHistorial` | boolean | Default `false`; solo roles globales. |

### Respuesta `200`

Respuesta no paginada con proyecciones de vínculo.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `PACIENTE_ACCESO_DENEGADO` |
| `404` | `PACIENTE_NO_ENCONTRADO` |

## 9.3 `POST /pacientes/:pacienteId/vinculos`

**Acceso:** administrador, coordinación, secretaría o profesional ya vinculado.

```json
{
  "usuarioId": "uuid"
}
```

### Respuesta `201`

`data` contiene el vínculo creado.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `VINCULO_CREACION_DENEGADA` |
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `404` | `USUARIO_NO_ENCONTRADO` |
| `409` | `VINCULO_YA_EXISTE` |
| `422` | `USUARIO_NO_ES_PRESTADOR` |
| `422` | `USUARIO_INACTIVO` |
| `422` | `PACIENTE_INACTIVO` |

## 9.4 `PATCH /pacientes/:pacienteId/vinculos/:usuarioId/desvincular`

**Acceso:** administrador, coordinación o secretaría.

```json
{
  "motivo": "Cambio de profesional responsable."
}
```

### Respuesta `200`

`data` contiene el vínculo histórico cerrado.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `VINCULO_NO_ENCONTRADO` |
| `409` | `VINCULO_TIENE_TURNOS_FUTUROS` |
| `422` | `MOTIVO_DESVINCULACION_REQUERIDO` |

---

# 10. Turnos y agenda

## 10.1 Estados

```text
pendiente → confirmado | cancelado
confirmado → completado | ausente | cancelado
```

`completado`, `ausente` y `cancelado` son terminales.

## 10.2 Proyección de evento

```json
{
  "id": "uuid",
  "inicioAt": "2026-08-05T13:00:00.000Z",
  "finAt": "2026-08-05T14:00:00.000Z",
  "duracionMinutos": 60,
  "estado": "pendiente",
  "paciente": {
    "id": "uuid",
    "nombreCompleto": "Juan Pérez"
  },
  "prestador": {
    "id": "uuid",
    "nombreCompleto": "Valentina Ríos"
  },
  "servicio": {
    "id": "uuid",
    "nombre": "Psicopedagogía Clínica"
  },
  "consultorio": {
    "id": "uuid",
    "nombre": "Consultorio 2"
  }
}
```

El listado nunca contiene `notasInternas`.

## 10.3 Proyección de detalle

La respuesta de detalle agrega a la proyección de evento:

```json
{
  "observacionAdministrativa": "Traer documentación.",
  "notasInternas": "Nota operativa privada.",
  "creadoPor": {
    "id": "uuid",
    "nombreCompleto": "Carla Domínguez"
  },
  "cancelacion": null,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

`notasInternas` solo existe para coordinación y prestador responsable. No se envía con `null` a administrador o secretaría: se omite.

Si está cancelado:

```json
{
  "cancelacion": {
    "motivo": "La familia informó que no podrá asistir.",
    "canceladoAt": "2026-08-01T12:00:00.000Z",
    "canceladoPor": {
      "id": "uuid",
      "nombreCompleto": "Carla Domínguez"
    }
  }
}
```

## 10.4 `GET /turnos`

**Acceso:** autenticado.

- administrador, coordinación y secretaría: alcance global;
- profesional: solo turnos propios.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `desde` | instante/fecha | Opcional; inclusivo. Para agenda visual es obligatorio junto con `hasta`. |
| `hasta` | instante/fecha | Opcional; exclusivo. |
| `prestadorId` | UUID | Solo roles globales; profesional queda limitado a sí mismo. |
| `pacienteId` | UUID | Filtro por paciente dentro del scope. |
| `consultorioId` | UUID | Filtro exacto. |
| `servicioId` | UUID | Filtro exacto. |
| `estado` | enum | `pendiente`, `confirmado`, `completado`, `cancelado`, `ausente`. |
| `page`, `limit` | entero | Default 1/20; máximo 100. |
| `sort` | enum | `inicioAt`, `estado`, `createdAt`. Default `inicioAt`. |
| `order` | enum | `asc` o `desc`; default `asc` para agenda. |

Para agenda, el rango no puede superar 31 días. Un rango de fechas civiles se interpreta en la zona horaria del centro.

### Respuesta `200`

Envelope paginado de eventos ordenados por `inicioAt`.

### Errores

| HTTP | Código |
|---:|---|
| `400` | `RANGO_FECHAS_INVALIDO` |
| `422` | `RANGO_FECHAS_EXCEDIDO` |
| `403` | `FORBIDDEN_FILTER` |

## 10.5 `GET /turnos/disponibilidad`

**Acceso:** cualquier autenticado.

### Query

| Parámetro | Tipo | Req. | Regla |
|---|---|:---:|---|
| `fecha` | fecha | Sí | Lunes a sábado; no pasada. |
| `prestadorId` | UUID | Cond. | Se exige este o `consultorioId`. |
| `consultorioId` | UUID | Cond. | Se exige este o `prestadorId`. |
| `duracionMinutos` | entero | Sí | `30`, `45`, `60`, `90` o `120`. |

### Respuesta `200`

```json
{
  "data": {
    "fecha": "2026-08-01",
    "franja": {
      "desde": "08:00",
      "hasta": "21:00"
    },
    "duracionMinutos": 60,
    "intervalosDisponibles": [
      {
        "horaInicio": "08:00",
        "horaFin": "09:00"
      }
    ]
  }
}
```

La disponibilidad es orientativa. La creación continúa sujeta a constraints de concurrencia.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `PRESTADOR_NO_ENCONTRADO` |
| `404` | `CONSULTORIO_NO_ENCONTRADO` |
| `422` | `TURNO_FECHA_INVALIDA` |
| `422` | `TURNO_DURACION_INVALIDA` |

## 10.6 `GET /turnos/:id`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.

### Respuesta `200`

`data` contiene la proyección de detalle autorizada.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `TURNO_ACCESO_DENEGADO` |
| `404` | `TURNO_NO_ENCONTRADO` |

## 10.7 `POST /turnos`

**Acceso:** administrador, coordinación, secretaría o profesional.

### Body

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

`profesionalId` conserva el nombre contractual v1 por compatibilidad; representa al prestador responsable, que puede tener rol `profesional` o `coordinacion`.

### Campos

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `pacienteId` | UUID | Sí | Paciente activo. |
| `profesionalId` | UUID | Sí | Prestador activo. |
| `servicioId` | UUID | Sí | Cualquier servicio activo. No requiere asociación habitual. |
| `consultorioId` | UUID | Sí | Consultorio activo. |
| `fecha` | fecha | Sí | No pasada; lunes a sábado. |
| `horaInicio` | hora | Sí | Inicio desde 08:00. |
| `duracionMinutos` | entero | Sí | `30`, `45`, `60`, `90`, `120`; fin máximo 21:00. |
| `observacionAdministrativa` | string/null | No | Visible para roles autorizados del turno. |
| `notasInternas` | string/null | No | Solo coordinación o profesional responsable. |

### Reglas del actor

- Profesional: `profesionalId` debe ser su propio ID y el paciente debe estar vinculado.
- Coordinación: puede crear turnos propios o ajenos; crea vínculo automático si falta.
- Administrador y secretaría: pueden crear para cualquier prestador activo; crean vínculo automático si falta.
- El servicio solo necesita existir y estar activo.
- Paciente, prestador y consultorio no pueden solaparse con otro turno bloqueante.
- Vínculo automático, turno y auditoría comparten transacción.

### Respuesta `201`

`data` contiene la proyección de detalle autorizada, con estado inicial `pendiente`.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `TURNO_PRESTADOR_AJENO` |
| `403` | `PACIENTE_NO_VINCULADO` |
| `403` | `TURNO_NOTAS_INTERNAS_DENEGADAS` |
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `404` | `PRESTADOR_NO_ENCONTRADO` |
| `404` | `SERVICIO_NO_ENCONTRADO` |
| `404` | `CONSULTORIO_NO_ENCONTRADO` |
| `409` | `TURNO_CONFLICTO_PROFESIONAL` |
| `409` | `TURNO_CONFLICTO_PACIENTE` |
| `409` | `TURNO_CONFLICTO_CONSULTORIO` |
| `422` | `TURNO_HORARIO_INVALIDO` |
| `422` | `TURNO_DURACION_INVALIDA` |
| `422` | `PACIENTE_INACTIVO` |
| `422` | `PRESTADOR_INACTIVO` |
| `422` | `SERVICIO_INACTIVO` |
| `422` | `CONSULTORIO_INACTIVO` |

`SERVICIO_NO_ASIGNADO` no existe en este endpoint.

## 10.8 `PATCH /turnos/:id/confirmar`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.  
**Body:** ninguno.

Transición permitida: `pendiente → confirmado`.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Error

| HTTP | Código |
|---:|---|
| `409` | `TURNO_TRANSICION_INVALIDA` |

## 10.9 `PATCH /turnos/:id/cancelar`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.

```json
{
  "motivo": "La familia informó que no podrá asistir."
}
```

Transiciones permitidas: `pendiente|confirmado → cancelado`.

### Respuesta `200`

`data` contiene el detalle cancelado. El intervalo queda liberado.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `TURNO_TRANSICION_INVALIDA` |
| `422` | `MOTIVO_CANCELACION_REQUERIDO` |

## 10.10 `PATCH /turnos/:id/completar`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.  
**Body:** ninguno.

Transición: `confirmado → completado`, solo después de `inicioAt`.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `TURNO_TRANSICION_INVALIDA` |
| `422` | `TURNO_AUN_NO_COMENZO` |

## 10.11 `PATCH /turnos/:id/ausente`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.  
**Body:** ninguno.

Transición: `confirmado → ausente`, solo después de `inicioAt`.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `TURNO_TRANSICION_INVALIDA` |
| `422` | `TURNO_AUN_NO_COMENZO` |

## 10.12 `PATCH /turnos/:id/observacion-administrativa`

**Acceso:** administrador, coordinación, secretaría o prestador responsable.

```json
{
  "observacionAdministrativa": "Se confirmó telefónicamente."
}
```

El valor puede ser `null`. Solo se modifica en turnos no terminales.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Error

| HTTP | Código |
|---:|---|
| `409` | `TURNO_TERMINAL_INMUTABLE` |

## 10.13 `PATCH /turnos/:id/notas-internas`

**Acceso:** coordinación o prestador responsable.

```json
{
  "notasInternas": "Nota interna operativa."
}
```

El valor puede ser `null`. Solo se modifica en turnos no terminales.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `TURNO_NOTAS_INTERNAS_DENEGADAS` |
| `409` | `TURNO_TERMINAL_INMUTABLE` |

---

# 11. Informes

## 11.1 Proyección resumida

```json
{
  "id": "uuid",
  "titulo": "Informe evolutivo",
  "paciente": {
    "id": "uuid",
    "nombreCompleto": "Juan Gómez"
  },
  "autor": {
    "id": "uuid",
    "nombreCompleto": "Ana Pérez"
  },
  "tipoInforme": {
    "id": "uuid",
    "nombre": "Informe evolutivo"
  },
  "estado": "borrador",
  "fechaEmision": null,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z",
  "puedeEditar": true,
  "puedeFinalizar": true
}
```

El listado no devuelve `contenido`.

## 11.2 Proyección de detalle

```json
{
  "id": "uuid",
  "paciente": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Gómez"
  },
  "autor": {
    "id": "uuid",
    "nombre": "Ana",
    "apellido": "Pérez"
  },
  "tipoInforme": {
    "id": "uuid",
    "nombre": "Informe evolutivo"
  },
  "titulo": "Informe evolutivo",
  "resumen": "Síntesis del período.",
  "contenido": "Contenido completo...",
  "estado": "borrador",
  "fechaEmision": null,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z",
  "puedeEditar": true,
  "puedeFinalizar": true
}
```

## 11.3 `GET /informes`

**Acceso:** autenticado.

- administrador, coordinación y secretaría: todos;
- profesional: informes de pacientes con vínculo activo.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `search` | string | Título y paciente dentro del scope. |
| `pacienteId` | UUID | Filtro exacto. |
| `autorId` | UUID | Filtro exacto dentro del scope. |
| `tipoInformeId` | UUID | Filtro exacto. |
| `estado` | enum | `borrador` o `finalizado`. |
| `sort` | enum | `createdAt`, `updatedAt`, `fechaEmision`, `titulo`. |
| `order` | enum | `asc` o `desc`. |

### Respuesta `200`

Envelope paginado de proyecciones resumidas.

## 11.4 `GET /informes/:id`

**Acceso:** administrador, coordinación, secretaría o profesional vinculado al paciente.

### Respuesta `200`

`data` contiene la proyección de detalle. Toda lectura exitosa se audita sin copiar título, resumen ni contenido.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `INFORME_ACCESO_DENEGADO` |
| `404` | `INFORME_NO_ENCONTRADO` |

## 11.5 `POST /informes`

**Acceso:** profesional o coordinación.

```json
{
  "pacienteId": "uuid",
  "tipoInformeId": "uuid",
  "titulo": "Informe evolutivo",
  "resumen": "Síntesis del período.",
  "contenido": "Contenido completo..."
}
```

### Campos

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `pacienteId` | UUID | Sí | Paciente activo. |
| `tipoInformeId` | UUID | Sí | Tipo activo. |
| `titulo` | string | Sí | Máximo 200. |
| `resumen` | string | Sí | No vacío. |
| `contenido` | string | Sí | Texto plano no vacío. |

Profesional requiere vínculo activo. Coordinación puede crear sobre cualquier paciente activo. Autor y estado `borrador` se asignan en backend.

### Respuesta `201`

`data` contiene el detalle creado.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `INFORME_PACIENTE_NO_VINCULADO` |
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `404` | `TIPO_INFORME_NO_ENCONTRADO` |
| `422` | `PACIENTE_INACTIVO` |
| `422` | `TIPO_INFORME_INACTIVO` |

## 11.6 `PUT /informes/:id`

**Acceso:** solo autor activo de un borrador.

```json
{
  "tipoInformeId": "uuid",
  "titulo": "Informe evolutivo",
  "resumen": "Síntesis actualizada.",
  "contenido": "Contenido actualizado..."
}
```

No permite cambiar paciente, autor ni estado.

### Respuesta `200`

`data` contiene el detalle actualizado.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `INFORME_NO_ES_AUTOR` |
| `404` | `INFORME_NO_ENCONTRADO` |
| `409` | `INFORME_FINALIZADO` |
| `409` | `INFORME_AUTOR_INACTIVO` |
| `422` | `TIPO_INFORME_INACTIVO` |

## 11.7 `PATCH /informes/:id/finalizar`

**Acceso:** solo autor activo.  
**Body:** ninguno.

Transición: `borrador → finalizado`. Completa `fechaEmision` y vuelve el recurso inmutable.

### Respuesta `200`

`data` contiene el detalle finalizado.

### Errores

| HTTP | Código |
|---:|---|
| `403` | `INFORME_NO_ES_AUTOR` |
| `404` | `INFORME_NO_ENCONTRADO` |
| `409` | `INFORME_FINALIZADO` |
| `409` | `INFORME_AUTOR_INACTIVO` |

No existe eliminación de informes ni generación de PDF en el backend del MVP.

---

# 12. Mensajería interna

Solo los participantes acceden a una conversación. No hay bypass para administrador o coordinación.

## 12.1 Proyección resumida de conversación

```json
{
  "id": "uuid",
  "titulo": "Seguimiento de Juan",
  "asunto": {
    "id": "uuid",
    "codigo": "acuerdo",
    "nombre": "Acuerdo"
  },
  "paciente": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Gómez"
  },
  "participantes": [
    {
      "id": "uuid",
      "nombreCompleto": "Ana Pérez",
      "fotoUrl": null
    }
  ],
  "ultimoMensaje": {
    "id": "uuid",
    "remitente": "Ana Pérez",
    "preview": "Podemos coordinar...",
    "createdAt": "2026-08-01T12:00:00.000Z"
  },
  "noLeidos": 2,
  "archivada": false,
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

`paciente` y `ultimoMensaje` pueden ser `null`. El preview solo se entrega a participantes y nunca se incluye en el resumen de topbar.

## 12.2 Proyección de mensaje

```json
{
  "id": "uuid",
  "conversacionId": "uuid",
  "remitente": {
    "id": "uuid",
    "nombreCompleto": "Ana Pérez",
    "fotoUrl": null
  },
  "contenido": "De acuerdo, lo revisamos mañana.",
  "createdAt": "2026-08-01T12:00:00.000Z"
}
```

## 12.3 `GET /conversaciones/no-leidas/resumen`

**Acceso:** cualquier autenticado.  
**Importante:** la route estática se declara antes de `/:id`.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `limit` | entero | Opcional; default `5`; mínimo 1; máximo 20. |

### Respuesta `200`

```json
{
  "data": {
    "count": 3,
    "items": [
      {
        "id": "uuid",
        "titulo": "Seguimiento de Juan",
        "updatedAt": "2026-08-01T12:00:00.000Z",
        "participants": ["Valentina Ríos", "Carla Domínguez"]
      }
    ]
  }
}
```

`count` es la cantidad de conversaciones con al menos un mensaje no leído, no la cantidad de mensajes. No se incluyen previews, paciente, contenido ni datos clínicos. No se audita cada polling.

## 12.4 `GET /conversaciones`

**Acceso:** cualquier autenticado; solo conversaciones donde participa.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `search` | string | Título y nombres de participantes dentro del scope. |
| `asuntoId` | UUID | Filtro exacto. |
| `pacienteId` | UUID | Filtro exacto. |
| `archivada` | boolean | Estado individual; default `false`. |
| `soloNoLeidas` | boolean | Opcional. |
| `sort` | enum | `updatedAt`, `createdAt`, `titulo`. |
| `order` | enum | `asc` o `desc`; default `desc`. |

### Respuesta `200`

Envelope paginado de proyecciones resumidas.

## 12.5 `POST /conversaciones`

**Acceso:** cualquier autenticado.

```json
{
  "asuntoId": "uuid",
  "pacienteId": "uuid",
  "titulo": "Seguimiento de Juan",
  "participanteIds": ["uuid", "uuid"],
  "mensajeInicial": "Propongo revisar el seguimiento."
}
```

### Campos

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `asuntoId` | UUID | Sí | Asunto activo. |
| `pacienteId` | UUID/null | No | Paciente activo si se informa. |
| `titulo` | string | Sí | Máximo 200. |
| `participanteIds` | UUID[] | Sí | Al menos un usuario distinto del creador; sin duplicados. |
| `mensajeInicial` | string | Sí | Texto plano no vacío. |

No se restringe la selección de participantes por vínculo con pacientes. Creador, participantes, conversación, primer mensaje, lectura inicial y auditoría se confirman en una transacción.

### Respuesta `201`

```json
{
  "data": {
    "conversacion": {},
    "mensaje": {}
  }
}
```

`conversacion` usa el detalle autorizado y `mensaje` la proyección de mensaje.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `ASUNTO_NO_ENCONTRADO` |
| `404` | `PACIENTE_NO_ENCONTRADO` |
| `422` | `CONVERSACION_SIN_DESTINATARIOS` |
| `422` | `PARTICIPANTE_INACTIVO` |
| `422` | `PACIENTE_INACTIVO` |
| `422` | `ASUNTO_INACTIVO` |

## 12.6 `GET /conversaciones/:id`

**Acceso:** solo participante.

### Respuesta `200`

```json
{
  "data": {
    "id": "uuid",
    "titulo": "Seguimiento de Juan",
    "asunto": {
      "id": "uuid",
      "codigo": "acuerdo",
      "nombre": "Acuerdo"
    },
    "paciente": null,
    "participantes": [],
    "archivada": false,
    "ultimoMensajeLeidoId": null,
    "createdAt": "2026-08-01T12:00:00.000Z",
    "updatedAt": "2026-08-01T12:00:00.000Z"
  }
}
```

### Error

| HTTP | Código |
|---:|---|
| `404` | `CONVERSACION_NO_ENCONTRADA` |

Se utiliza `404` para no revelar conversaciones a no participantes.

## 12.7 `GET /conversaciones/:id/mensajes`

**Acceso:** solo participante.

### Query por cursor

| Parámetro | Tipo | Regla |
|---|---|---|
| `beforeCreatedAt` | instante | Opcional; debe acompañar `beforeId`. |
| `beforeId` | UUID | Opcional; debe acompañar `beforeCreatedAt`. |
| `limit` | entero | Default 30; mínimo 1; máximo 100. |

### Respuesta `200`

```json
{
  "data": [],
  "meta": {
    "nextCursor": {
      "beforeCreatedAt": "2026-08-01T12:00:00.000Z",
      "beforeId": "uuid"
    },
    "hasMore": true
  }
}
```

Cuando no hay más resultados, `nextCursor` es `null` y `hasMore` es `false`. Los mensajes se devuelven del más reciente al más antiguo.

## 12.8 `POST /conversaciones/:id/mensajes`

**Acceso:** solo participante activo.

```json
{
  "contenido": "De acuerdo, lo revisamos mañana."
}
```

### Respuesta `201`

`data` contiene el mensaje creado. El mensaje es inmutable.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `CONVERSACION_NO_ENCONTRADA` |
| `422` | `MENSAJE_CONTENIDO_REQUERIDO` |

## 12.9 `POST /conversaciones/:id/participantes`

**Acceso:** cualquier participante actual.

```json
{
  "usuarioIds": ["uuid"]
}
```

### Respuesta `201`

```json
{
  "data": {
    "participantesAgregados": [
      {
        "id": "uuid",
        "nombreCompleto": "Carla Domínguez",
        "fotoUrl": null
      }
    ]
  }
}
```

El nuevo participante accede a todo el historial, pero el último mensaje existente se toma como punto inicial de lectura para el contador.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `CONVERSACION_NO_ENCONTRADA` |
| `409` | `PARTICIPANTE_YA_EXISTE` |
| `422` | `PARTICIPANTE_INACTIVO` |

No existe remoción de participantes.

## 12.10 `PATCH /conversaciones/:id/leida`

**Acceso:** solo participante.

```json
{
  "ultimoMensajeLeidoId": "uuid"
}
```

El mensaje debe pertenecer a la conversación. El puntero solo puede avanzar, no retroceder.

### Respuesta `200`

```json
{
  "data": {
    "ultimoMensajeLeidoId": "uuid",
    "ultimaLecturaAt": "2026-08-01T12:00:00.000Z",
    "noLeidos": 0
  }
}
```

### Errores

| HTTP | Código |
|---:|---|
| `404` | `MENSAJE_NO_ENCONTRADO` |
| `422` | `MENSAJE_NO_PERTENECE_CONVERSACION` |
| `409` | `LECTURA_NO_PUEDE_RETROCEDER` |

## 12.11 `PATCH /conversaciones/:id/archivar`

**Acceso:** solo participante.  
**Body:** ninguno.  
**Respuesta:** `204`.

El archivo es individual e idempotente.

## 12.12 `PATCH /conversaciones/:id/desarchivar`

**Acceso:** solo participante.  
**Body:** ninguno.  
**Respuesta:** `204`.

El desarchivo es individual e idempotente.

---

# 13. Catálogos

Catálogos del MVP:

| Ruta | Recurso |
|---|---|
| `/servicios` | Prestaciones del centro. |
| `/consultorios` | Espacios físicos reservables. |
| `/asuntos` | Categorías de conversaciones. |
| `/tipos-informe` | Clases de informe. |

Todos los autenticados consultan registros activos. Solo el administrador crea, edita, activa o desactiva. No existen eliminaciones físicas desde API.

## 13.1 Proyecciones

### Servicio

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

### Consultorio

```json
{
  "id": "uuid",
  "nombre": "Consultorio 2",
  "descripcion": null,
  "ubicacion": "Planta baja",
  "capacidad": 4,
  "activo": true,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

### Asunto

```json
{
  "id": "uuid",
  "codigo": "acuerdo",
  "nombre": "Acuerdo",
  "activo": true,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

### Tipo de informe

```json
{
  "id": "uuid",
  "nombre": "Informe evolutivo",
  "descripcion": null,
  "activo": true,
  "createdAt": "2026-08-01T12:00:00.000Z",
  "updatedAt": "2026-08-01T12:00:00.000Z"
}
```

## 13.2 `GET /<catalogo>`

**Acceso:** cualquier autenticado.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `search` | string | Nombre; en asuntos también código. |
| `activo` | boolean | `false` solo para administrador; default `true` para otros. |
| `sort` | enum | `nombre`, `createdAt`, `updatedAt`; servicios también `ordenPublico`; asuntos también `codigo`. |
| `order` | enum | `asc` o `desc`. |

### Respuesta `200`

Envelope paginado de la proyección correspondiente.

## 13.3 `GET /<catalogo>/:id`

**Acceso:** cualquier autenticado. Los registros inactivos solo son visibles para administrador.

### Respuesta `200`

`data` contiene la proyección del catálogo.

### Error

| HTTP | Código |
|---:|---|
| `404` | `CATALOGO_NO_ENCONTRADO` |

## 13.4 `POST /servicios`

**Acceso:** solo administrador.

```json
{
  "nombre": "Psicopedagogía Clínica",
  "descripcion": "Descripción completa.",
  "visiblePublicamente": false,
  "ordenPublico": 1
}
```

`nombre` y `descripcion` son obligatorios. `imagenUrl` y `activo` no se aceptan. Estado inicial activo y visibilidad default `false`.

### Respuesta `201`

`data` contiene el servicio creado.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `CATALOGO_NOMBRE_DUPLICADO` |
| `422` | `SERVICIO_DESCRIPCION_REQUERIDA` |

## 13.5 `PUT /servicios/:id`

**Acceso:** solo administrador.  
**Body:** mismos campos editables de creación. No modifica `activo` ni `imagenUrl`.

### Respuesta `200`

`data` contiene el servicio actualizado.

## 13.6 `PUT /servicios/:id/imagen`

**Acceso:** solo administrador.  
**Content-Type:** `multipart/form-data`.

| Campo | Tipo | Req. | Regla |
|---|---|:---:|---|
| `imagen` | archivo | Sí | JPEG, PNG o WebP; máximo 5 MB. |

### Respuesta `200`

```json
{
  "data": {
    "imagenUrl": "/uploads/servicios/uuid.webp"
  }
}
```

### Errores

| HTTP | Código |
|---:|---|
| `404` | `SERVICIO_NO_ENCONTRADO` |
| `413` | `IMAGEN_DEMASIADO_GRANDE` |
| `422` | `IMAGEN_REQUERIDA` |
| `422` | `IMAGEN_TIPO_INVALIDO` |

## 13.7 `DELETE /servicios/:id/imagen`

**Acceso:** solo administrador.

### Respuesta `200`

```json
{
  "data": {
    "imagenUrl": null
  }
}
```

La operación es idempotente.

## 13.8 `POST /consultorios`

**Acceso:** solo administrador.

```json
{
  "nombre": "Consultorio 2",
  "descripcion": null,
  "ubicacion": "Planta baja",
  "capacidad": 4
}
```

`nombre` es obligatorio; `capacidad`, si existe, debe ser mayor que cero.

### Respuesta `201`

`data` contiene el consultorio creado.

## 13.9 `PUT /consultorios/:id`

**Acceso:** solo administrador.  
**Body:** mismos campos editables de creación. No modifica estado.

### Respuesta `200`

`data` contiene el consultorio actualizado.

## 13.10 `POST /asuntos`

**Acceso:** solo administrador.

```json
{
  "codigo": "acuerdo",
  "nombre": "Acuerdo"
}
```

`codigo` utiliza letras minúsculas, números y guion bajo; máximo 40. Después de crear es inmutable.

### Respuesta `201`

`data` contiene el asunto creado.

### Errores

| HTTP | Código |
|---:|---|
| `409` | `ASUNTO_CODIGO_DUPLICADO` |
| `409` | `CATALOGO_NOMBRE_DUPLICADO` |

## 13.11 `PUT /asuntos/:id`

**Acceso:** solo administrador.

```json
{
  "nombre": "Acuerdo"
}
```

### Respuesta `200`

`data` contiene el asunto actualizado. No se acepta `codigo`.

## 13.12 `POST /tipos-informe`

**Acceso:** solo administrador.

```json
{
  "nombre": "Informe evolutivo",
  "descripcion": "Descripción opcional."
}
```

### Respuesta `201`

`data` contiene el tipo creado.

## 13.13 `PUT /tipos-informe/:id`

**Acceso:** solo administrador.  
**Body:** mismos campos editables de creación. No modifica estado.

### Respuesta `200`

`data` contiene el tipo actualizado.

## 13.14 `PATCH /<catalogo>/:id/estado`

**Acceso:** solo administrador.

```json
{
  "activo": false
}
```

### Respuesta `200`

`data` contiene el catálogo actualizado.

### Errores

| HTTP | Código |
|---:|---|
| `404` | `CATALOGO_NO_ENCONTRADO` |
| `409` | `CATALOGO_ESTADO_SIN_CAMBIOS` |
| `409` | `SERVICIO_CON_TURNOS_FUTUROS` |
| `409` | `CONSULTORIO_CON_TURNOS_FUTUROS` |

Asuntos y tipos de informe pueden desactivarse aunque posean historial; dejan de estar disponibles para nuevas operaciones.

## 13.15 Errores comunes de catálogos

| HTTP | Código | Situación |
|---:|---|---|
| `404` | `CATALOGO_NO_ENCONTRADO` | El recurso no existe o no es visible. |
| `409` | `CATALOGO_NOMBRE_DUPLICADO` | El nombre ya existe sin distinguir mayúsculas. |
| `422` | `CATALOGO_EN_USO` | Una operación no permitida afectaría datos históricos. |
| `422` | `CONSULTORIO_CAPACIDAD_INVALIDA` | La capacidad informada no es mayor que cero. |

---

# 14. Auditoría

## 14.1 `GET /auditoria`

**Acceso:** solo administrador. Es de solo lectura.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `page`, `limit` | entero | Paginación general. |
| `usuarioId` | UUID | Actor. |
| `accion` | string | Código estable de evento. |
| `recurso` | string | Tipo de recurso. |
| `recursoId` | UUID | Recurso afectado. |
| `resultado` | enum | `exitoso` o `fallido`. |
| `desde` | instante/fecha | Inclusivo. |
| `hasta` | instante/fecha | Exclusivo. |
| `correlationId` | UUID | Correlación exacta. |
| `sort` | enum | `createdAt`; default descendente. |
| `order` | enum | `asc` o `desc`. |

### Respuesta `200`

```json
{
  "data": [
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
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

`usuario` puede ser `null`. `metadata` solo contiene identificadores y cambios no sensibles. Nunca incluye DNI, informes, diagnósticos, mensajes, notas internas, tokens ni bodies completos.

No existen endpoints POST, PUT, PATCH, DELETE ni exportación de auditoría en el MVP.

---

# 15. API pública

## 15.1 `GET /public/equipo`

**Acceso:** público.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `limit` | entero | Opcional; 1 a 50. Sin valor devuelve todos los publicados. |

### Reglas de selección

- usuario activo;
- `visiblePublicamente=true`;
- rol coordinación, secretaría o profesional;
- administrador excluido;
- orden `ordenPublico ASC`, luego apellido y nombre.

### Respuesta `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Valentina",
      "apellido": "Ríos",
      "titulo": "Licenciada en Psicopedagogía",
      "especialidad": "Psicopedagogía Clínica",
      "funcionPublica": "Psicopedagoga clínica",
      "bio": "Biografía pública completa...",
      "fotoUrl": "/uploads/usuarios/uuid.webp",
      "ordenPublico": 3
    }
  ],
  "meta": {
    "count": 1
  }
}
```

No devuelve DNI, email de acceso, teléfono personal, rol técnico, permisos ni sesiones.

## 15.2 `GET /public/servicios`

**Acceso:** público.

### Query

| Parámetro | Tipo | Regla |
|---|---|---|
| `limit` | entero | Opcional; 1 a 50. Sin valor devuelve todos los publicados. |

### Reglas de selección

- servicio activo;
- `visiblePublicamente=true`;
- orden `ordenPublico ASC`, luego nombre.

### Respuesta `200`

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Psicopedagogía Clínica",
      "descripcion": "Descripción completa...",
      "imagenUrl": "/uploads/servicios/uuid.webp",
      "ordenPublico": 1
    }
  ],
  "meta": {
    "count": 1
  }
}
```

## 15.3 Archivos públicos

Las rutas devueltas en `fotoUrl` e `imagenUrl` pueden solicitarse mediante:

```http
GET /uploads/usuarios/<archivo>
GET /uploads/servicios/<archivo>
```

Respuestas:

- `200` con el MIME real de la imagen;
- `404` si el archivo no existe.

No se permite listar directorios ni subir archivos de forma anónima.

## 15.4 Contacto público

No existe `POST /public/contacto`. El sitio utiliza enlaces externos a WhatsApp, correo y teléfono sin persistir consultas.

---

# 16. Operación

`/health` y `/ready` se publican en la raíz del servidor, fuera del base path `/api/v1`. Las imágenes bajo `/uploads` también se sirven fuera del base path.

## 16.1 `GET /health`

**Acceso:** público o restringido por infraestructura.  
**No consulta PostgreSQL.**

### Respuesta `200`

```json
{
  "status": "ok"
}
```

## 16.2 `GET /ready`

**Acceso:** público o restringido por infraestructura.  
**Verifica PostgreSQL.**

### Respuesta `200`

```json
{
  "status": "ready"
}
```

### Respuesta `503`

```json
{
  "status": "not_ready"
}
```

No expone credenciales, host, SQL ni causa interna.

---

# 17. Catálogo de códigos funcionales

La siguiente lista consolida los códigos contractuales. Los códigos consumidos por frontend no se renombran sin actualizar contrato, mocks, pruebas y cliente.

## 17.1 Generales y autenticación

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
FORBIDDEN
FORBIDDEN_FILTER
INTERNAL_ERROR
RATE_LIMIT_EXCEEDED
CREDENCIALES_INVALIDAS
LOGIN_LIMITE_EXCEDIDO
TOKEN_INVALIDO
TOKEN_EXPIRADO
REFRESH_INVALIDO
SESION_REVOCADA
SESION_EXPIRADA
USUARIO_INACTIVO
```

## 17.2 Usuarios e imágenes

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
```

## 17.3 Pacientes y vínculos

```text
PACIENTE_NO_ENCONTRADO
PACIENTE_ACCESO_DENEGADO
PACIENTE_DNI_DUPLICADO
PACIENTE_POSIBLE_DUPLICADO
PACIENTE_INACTIVO
PACIENTE_TIENE_TURNOS_FUTUROS
PACIENTE_ESTADO_SIN_CAMBIOS
TUTOR_REQUERIDO
CUD_VENCIMIENTO_REQUERIDO
CUD_VENCIMIENTO_NO_PERMITIDO
FECHA_NACIMIENTO_INVALIDA
VINCULO_NO_ENCONTRADO
VINCULO_YA_EXISTE
VINCULO_CREACION_DENEGADA
VINCULO_TIENE_TURNOS_FUTUROS
MOTIVO_DESVINCULACION_REQUERIDO
```

## 17.4 Servicios, catálogos y turnos

```text
SERVICIO_NO_ENCONTRADO
SERVICIO_INACTIVO
SERVICIO_YA_ASIGNADO
SERVICIO_ASIGNACION_NO_ENCONTRADA
SERVICIO_CON_TURNOS_FUTUROS
SERVICIO_DESCRIPCION_REQUERIDA
CONSULTORIO_NO_ENCONTRADO
CONSULTORIO_INACTIVO
CONSULTORIO_CON_TURNOS_FUTUROS
PRESTADOR_NO_ENCONTRADO
PRESTADOR_INACTIVO
CATALOGO_NO_ENCONTRADO
CATALOGO_NOMBRE_DUPLICADO
CATALOGO_ESTADO_SIN_CAMBIOS
CATALOGO_EN_USO
CONSULTORIO_CAPACIDAD_INVALIDA
ASUNTO_NO_ENCONTRADO
ASUNTO_INACTIVO
ASUNTO_CODIGO_DUPLICADO
TIPO_INFORME_NO_ENCONTRADO
TIPO_INFORME_INACTIVO
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
RANGO_FECHAS_INVALIDO
RANGO_FECHAS_EXCEDIDO
```

`SERVICIO_NO_ASIGNADO` queda retirado y no debe utilizarse.

## 17.5 Informes y mensajería

```text
INFORME_NO_ENCONTRADO
INFORME_ACCESO_DENEGADO
INFORME_PACIENTE_NO_VINCULADO
INFORME_NO_ES_AUTOR
INFORME_FINALIZADO
INFORME_AUTOR_INACTIVO
CONVERSACION_NO_ENCONTRADA
CONVERSACION_SIN_DESTINATARIOS
PARTICIPANTE_INACTIVO
PARTICIPANTE_YA_EXISTE
MENSAJE_NO_ENCONTRADO
MENSAJE_NO_PERTENECE_CONVERSACION
MENSAJE_CONTENIDO_REQUERIDO
LECTURA_NO_PUEDE_RETROCEDER
```

---

# 18. Endpoints deliberadamente excluidos

La ausencia de estas rutas es una decisión funcional del MVP:

```text
POST   /auth/registro
POST   /auth/recuperar-password
POST   /auth/restablecer-password
PATCH  /usuarios/:id/password
DELETE /usuarios/:id

GET    /tutores
POST   /tutores
PUT    /tutores/:id
DELETE /tutores/:id

DELETE /pacientes/:id

PUT    /turnos/:id
DELETE /turnos/:id
PATCH  /turnos/:id/reprogramar
PATCH  /turnos/:id/marcar-ausente

DELETE /informes/:id
GET    /informes/:id/pdf

PUT    /mensajes/:id
DELETE /mensajes/:id
DELETE /conversaciones/:id
DELETE /conversaciones/:id/participantes/:usuarioId

DELETE /servicios/:id
DELETE /consultorios/:id
DELETE /asuntos/:id
DELETE /tipos-informe/:id

POST   /public/contacto
POST   /public/turnos
```

No hay reserva pública de turnos, autogestión para familias, pagos, adjuntos, WebSocket, notificaciones push, eliminación física de historia ni edición del perfil propio.

---

# 19. Compatibilidad y control de cambios

- Agregar un campo opcional de respuesta es compatible si no expone información nueva sin permiso.
- Renombrar o eliminar un campo requiere compatibilidad planificada o nueva versión de API.
- Hacer obligatorio un campo existente exige actualización coordinada de backend, frontend, documentación y pruebas.
- Cambiar un permiso es un cambio funcional, no un refactor técnico.
- Eliminar un endpoint o cambiar su semántica exige versionado.
- Los códigos de error son estables para permitir que el frontend asigne mensajes de UX.
- Una modificación del contrato debe actualizar Joi, services, policies, pruebas de integración, mocks y consumo frontend.

---

# 20. Matriz mínima de pruebas de contrato

Cada endpoint debe probar, según corresponda:

1. respuesta exitosa y envelope exacto;
2. validación de params, query y body;
3. autenticación ausente, inválida y expirada;
4. autorización por rol;
5. policy sobre recurso e IDOR;
6. proyección de campos por rol;
7. recurso inexistente;
8. recurso inactivo;
9. duplicados y conflictos `409`;
10. transacciones y rollback;
11. constraints PostgreSQL;
12. concurrencia real en turnos y refresh;
13. ausencia de datos sensibles;
14. código funcional estable;
15. correlation ID en errores;
16. inexistencia de rutas deliberadamente excluidas.

Casos críticos adicionales:

- profesional crea turno con servicio activo no habitual;
- servicio inactivo rechaza el turno;
- profesional no gestiona servicios habituales;
- admin y secretaría nunca reciben `notasInternas`;
- profesional no fuerza `prestadorId` ajeno;
- administrador no crea informes;
- secretaría lee informes completos;
- usuario no participante recibe `404` al consultar conversación;
- participante nuevo ve historial, pero no lo recibe como no leído;
- endpoint público excluye inactivos, no publicados y administradores;
- uploads rechazan archivo excesivo, tipo inválido y path traversal;
- endpoint de contacto público y reprogramación responden `404` porque no existen.
