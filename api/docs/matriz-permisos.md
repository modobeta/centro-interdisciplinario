# Centro Educativo Interdisciplinario Terapéutico
## Matriz de permisos, acceso por recurso, campo y auditoría — MVP

**Versión documental:** 4.2
**Fecha:** 1 de agosto de 2026  
**Carácter:** normativo para backend, frontend, pruebas y agentes de programación  
**Contrato relacionado:** `docs/contrato-api.md`

---

## 1. Propósito y alcance

Este documento define:

- qué rol puede acceder a cada recurso;
- qué acciones puede ejecutar;
- sobre qué filas o instancias puede actuar;
- qué campos puede leer o modificar;
- qué condiciones adicionales debe comprobar el backend;
- qué operaciones deben generar auditoría.

La autorización se implementa siempre en el backend. La visibilidad de una ruta, módulo, botón o campo en el frontend es una medida de experiencia de usuario, no una barrera de seguridad.

Esta versión incorpora las decisiones consolidadas del contrato de API v4 y reemplaza las reglas incompatibles de matrices anteriores, especialmente:

1. los servicios habituales solo los gestionan administrador, coordinación y secretaría;
2. cualquier servicio activo puede utilizarse en un turno, aunque no sea habitual del prestador;
3. administrador y coordinación no tienen acceso global a conversaciones ajenas;
4. administrador y secretaría nunca reciben `notasInternas` de turnos;
5. administrador y secretaría leen informes completos, pero no pueden crearlos ni modificarlos;
6. se incluyen Resumen, no leídos, selectores e imágenes;
7. `activo` y `visiblePublicamente` son condiciones independientes.

Este archivo es la autoridad exclusiva para rol, acción, alcance de filas,
policy y campo visible o editable. `contrato-api.md` gobierna HTTP,
`modelo-datos.md` persistencia y `arquitectura-backend.md` estructura técnica.
Ante una incompatibilidad transversal se detiene la implementación y se
armonizan las fuentes; ninguna prevalece fuera de su incumbencia.

---

## 2. Roles fijos

| Código | Alcance operativo |
|---|---|
| `administrador` | Gestiona cuentas, accesos, catálogos y auditoría. Opera sobre pacientes, vínculos y agenda. Lee informes, pero no los redacta. No actúa como prestador. |
| `coordinacion` | Posee alcance operativo global y también puede actuar como prestador. Puede redactar informes propios. No administra cuentas ni auditoría. |
| `secretaria` | Gestiona pacientes, tutores, vínculos y agenda. Lee informes completos. No redacta informes ni administra cuentas, catálogos o auditoría. |
| `profesional` | Opera sobre pacientes vinculados, turnos propios, informes autorizados y conversaciones donde participa. |

Cada usuario tiene exactamente un rol. No existe CRUD de roles en el MVP.

---

## 3. Notación de las matrices

| Símbolo | Significado |
|---|---|
| **Global** | Puede operar sobre todos los recursos de ese tipo dentro de la instalación. |
| **Propio** | Solo sobre recursos donde el actor es el prestador responsable. |
| **Vinculado** | Requiere vínculo activo entre el profesional y el paciente. |
| **Autor** | Requiere que el actor sea el autor del recurso. |
| **Participante** | Requiere participación activa en la conversación. |
| **Activo** | Solo registros activos. |
| **Sí** | Permitido sin un alcance adicional distinto de las reglas generales. |
| **No** | Prohibido. No debe existir un bypass por jerarquía de rol. |
| **N/A** | La acción no aplica al rol o recurso. |

“Global” no concede acceso a campos excluidos. Por ejemplo, el administrador posee alcance global sobre turnos, pero no puede leer `notasInternas`.

---

## 4. Modelo obligatorio de autorización

Cada operación privada debe evaluarse en este orden:

1. **Autenticación:** token, sesión y usuario activos.
2. **RBAC:** el rol permite la acción general.
3. **Alcance de filas:** global, propio, vinculado, autor o participante.
4. **Policy del recurso:** relación real con la instancia y estado compatible.
5. **Permiso de campo:** campos que puede leer o modificar.
6. **Regla de negocio:** transición, integridad, concurrencia y demás restricciones.

Un filtro enviado por el cliente nunca amplía el alcance. Si un profesional intenta forzar `prestadorId` de otra persona o un rol no autorizado solicita registros inactivos, corresponde `403 FORBIDDEN_FILTER`.

Reglas transversales:

- no confiar en IDs de actor, rol o permisos enviados por el cliente;
- prevenir IDOR comprobando la relación con cada recurso;
- aplicar proyecciones explícitas, no devolver modelos completos;
- no asumir que un rol “superior” hereda todas las acciones o campos;
- responder `404` en todo acceso directo por UUID cuando el actor no puede
  conocer el recurso;
- reservar `403` para acciones, campos o filtros prohibidos sobre recursos
  visibles;
- no incluir en JWT datos clínicos, DNI, mensajes, informes ni notas;
- la lista `permissions` de login y refresh ayuda al frontend, pero no reemplaza las policies del backend.

---

## 5. Visibilidad de módulos del panel

Esta tabla rige navegación y rutas del frontend. No reemplaza los permisos de API.

| Módulo | Administrador | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Resumen | Sí | Sí | Sí | Sí |
| Pacientes | Sí | Sí | Sí | Sí |
| Agenda | Sí | Sí | Sí | Sí |
| Mensajes | Sí | Sí | Sí | Sí |
| Informes | Sí | Sí | Sí | Sí |
| Usuarios | Sí | Sí | Sí | No |
| Servicios | Sí | Sí | Sí | No |
| Catálogos | Sí | No | No | No |
| Auditoría | Sí | No | No | No |

El profesional puede consultar proyecciones mínimas de usuarios y servicios dentro de selectores aunque no tenga acceso a sus módulos.

---

## 6. Autenticación, sesiones y cuenta propia

| Recurso | Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|---|:---:|:---:|:---:|:---:|---|
| Sesión | Iniciar sesión | Sí | Sí | Sí | Sí | Credenciales válidas y usuario activo. |
| Sesión | Renovar sesión | Propia | Propia | Propia | Propia | Cookie válida, sesión y usuario activos; rotación de refresh. |
| Sesión | Cerrar sesión actual | Propia | Propia | Propia | Propia | Revoca únicamente la sesión vigente. |
| Sesión | Cerrar todas las sesiones | Propias | Propias | Propias | Propias | Revoca todas las sesiones del actor. |
| Perfil | Leer contexto autenticado | Propio | Propio | Propio | Propio | Solo campos de identidad del contrato. |
| Perfil | Editar perfil propio | No | No | No | No | No existe autogestión de perfil en el MVP. |
| Cuenta | Cambiar contraseña propia | No | No | No | No | Endpoint deliberadamente inexistente. |

El refresh token solo viaja por cookie HttpOnly. Ningún rol puede listar, leer o modificar hashes, tokens persistidos o cookies.

---

## 7. Resumen

`GET /resumen` está disponible para cualquier autenticado. El cliente no puede solicitar la proyección de otro rol.

| Métrica `key` | Administrador | Coordinación | Secretaría | Profesional | Alcance del contador |
|---|:---:|:---:|:---:|:---:|---|
| `patients` | Sí | Sí | Sí | Sí | Global para roles operativos; vinculados activos para profesional. |
| `appointmentsToday` | Sí | Sí | Sí | Sí | Global para admin/coordinación/secretaría; propios para profesional. |
| `pendingAppointments` | No | No | Sí | No | Turnos pendientes con alcance global. |
| `reportDrafts` | No | No | No | Sí | Borradores propios. |
| `reports` | No | Sí | No | No | Informes recientes con alcance global. |
| `unreadConversations` | Sí | Sí | Sí | Sí | Solo conversaciones donde el actor participa. |
| `users` | Sí | Sí | Sí | No | Usuarios activos. |
| `services` | Sí | Sí | Sí | No | Servicios activos. |
| `recentAuditEvents` | Sí | No | No | No | Eventos recientes de auditoría. |

El resumen no devuelve diagnósticos, informes, mensajes, previews, observaciones ni notas internas. Puede contener como máximo seis tarjetas según el contrato.

---

## 8. Usuarios

### 8.1 Acciones

| Recurso | Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|---|:---:|:---:|:---:|:---:|---|
| Usuarios | Listar activos con proyección `selector` | Global | Global | Global | Global | Solo usuarios activos. |
| Usuarios | Listar activos con proyección `directory` | Global | Global | Global | Global | El profesional la usa solo como selector, no como módulo. |
| Usuarios | Ver detalle activo de directorio | Global | Global | Global | Global | Usuario objetivo activo. |
| Usuarios | Listar o ver inactivos | Global | No | No | No | Solo administrador. |
| Usuarios | Usar proyección `administrative` | Global | No | No | No | Solo administrador. |
| Usuarios | Crear | Sí | No | No | No | El actor no puede fijar hashes, foto o estado. |
| Usuarios | Editar datos administrativos | Global | No | No | No | Prohibido sobre la cuenta propia. |
| Usuarios | Cambiar rol | Global | No | No | No | Prohibido sobre sí mismo; validar consecuencias del cambio. |
| Usuarios | Activar o desactivar | Global | No | No | No | Prohibido sobre sí mismo; sin turnos futuros bloqueantes. |
| Usuarios | Restablecer acceso | Global | No | No | No | Prohibido sobre sí mismo; recalcula credencial y revoca sesiones. |
| Usuarios | Cargar, reemplazar o quitar foto | Global | No | No | No | Prohibido sobre sí mismo; endpoint multipart separado. |
| Usuarios | Eliminar físicamente | No | No | No | No | No existe endpoint. |

El último administrador activo no puede ser desactivado ni cambiado a otro rol.
Ambas operaciones comparten una serialización transaccional. Cambiar un
prestador a un rol no prestador cierra vínculos, elimina servicios habituales
vigentes y bloquea sus borradores sin transferir autoría.

### 8.2 Campos de lectura

| Campo o grupo | Administrador | Coordinación | Secretaría | Profesional | Proyección / condición |
|---|:---:|:---:|:---:|:---:|---|
| `id`, `nombre`, `apellido` | Sí | Sí | Sí | Sí | Todas las proyecciones autorizadas. |
| `titulo`, `funcionPublica`, `fotoUrl` | Sí | Sí | Sí | Sí | Selector o directorio. |
| `rol`, `especialidad` | Sí | Sí | Sí | Sí | Directorio; selector no los incluye. |
| `activo` | Sí | Implícito `true` | Implícito `true` | Implícito `true` | Solo admin recibe estado administrativo real. |
| `dni`, `email`, `telefono` | Sí | No | No | No | Proyección administrativa. |
| `bio`, `visiblePublicamente`, `ordenPublico` | Sí | No | No | No | Proyección administrativa. |
| `createdAt`, `updatedAt` | Sí | No | No | No | Proyección administrativa. |
| `passwordHash`, hashes de sesión, tokens, cookies | No | No | No | No | Nunca expuestos. |

### 8.3 Campos de escritura administrativa

Solo el administrador puede escribir los campos indicados, y nunca sobre su propia cuenta.

| Campo | Crear | Editar | Endpoint separado | Regla |
|---|:---:|:---:|:---:|---|
| `nombre`, `apellido`, `dni`, `email`, `rol` | Sí | Sí | No | DNI y email únicos. |
| `titulo`, `especialidad`, `telefono`, `bio`, `funcionPublica` | Sí | Sí | No | `especialidad` obligatoria para profesional. |
| `visiblePublicamente`, `ordenPublico` | Sí | Sí | No | Administrador nunca publicable. |
| `activo` | No | No | Sí | Solo `PATCH /usuarios/:id/estado`. |
| `fotoUrl` | No | No | Sí | Se deriva del upload; el cliente no envía la URL. |
| `passwordHash`, sesiones, tokens | No | No | No | Solo procesos internos autorizados. |
| `createdAt`, `updatedAt` | No | No | No | Administrados por el sistema. |

Al desactivar un usuario se revocan sus sesiones y se cierran sus vínculos activos. El historial y los informes finalizados se conservan. Los borradores del autor quedan bloqueados y no se reasignan.

---

## 9. Servicios habituales de prestadores

`usuarios_servicios` es una asociación organizativa e informativa. No autoriza ni restringe la selección del servicio de un turno.

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Consultar servicios activos de un usuario | Global | Global | Global | Global | Cualquier autenticado; proyección mínima. |
| Consultar asignaciones con servicios inactivos | Global | No | No | No | Solo administrador puede solicitar `activo=false`. |
| Asignar servicio habitual | Global | Global | Global | No | Usuario objetivo activo y prestador; servicio activo; sin duplicado. |
| Quitar servicio habitual | Global | Global | Global | No | Asociación existente. No se bloquea por turnos futuros. |
| Recibir una asignación | N/A | Sí | N/A | Sí | Solo coordinación o profesional pueden ser prestadores. |

Un profesional puede elegir cualquier servicio activo al crear su propio turno, aunque no figure entre sus servicios habituales.

---

## 10. Pacientes y tutor

El tutor es único, obligatorio y se gestiona dentro del paciente. No existe un CRUD independiente de tutores.

### 10.1 Acciones y alcance

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Listar pacientes activos | Global | Global | Global | Vinculados | Profesional limitado a vínculo activo. |
| Listar pacientes inactivos | Global | Global | Global | No | Profesional solo puede solicitar `activo=true`. |
| Ver detalle | Global | Global | Global | Vinculado | Puede conservarse acceso histórico si existe vínculo activo. |
| Crear paciente y tutor | Sí | Sí | Sí | Sí | Profesional queda vinculado automáticamente. |
| Editar paciente y tutor | Global | Global | Global | Vinculado | Actualiza el tutor existente; no crea otro. |
| Activar o desactivar | Global | Global | Global | No | Sin turnos futuros `pendiente` o `confirmado`. |
| Eliminar físicamente | No | No | No | No | Se conserva historia. |

### 10.2 Campos

Todos los roles que superen la policy del recurso reciben la misma ficha de detalle definida por el contrato.

| Campo o grupo | Lectura autorizada | Escritura autorizada | Regla |
|---|---|---|---|
| `id` | Todos dentro de su scope | Nadie | Generado por backend. |
| `dni` | Todos dentro de su scope | Roles con permiso de crear/editar | Único cuando existe. |
| `nombre`, `apellido`, `fechaNacimiento`, `colegio` | Todos dentro de su scope | Roles con permiso de crear/editar | Fecha no futura. |
| `diagnostico`, `observaciones` | Todos dentro de su scope | Roles con permiso de crear/editar | Datos sensibles; nunca en logs o auditoría. |
| `poseeCud`, `cudFechaVencimiento` | Todos dentro de su scope | Roles con permiso de crear/editar | Vencimiento obligatorio solo cuando posee CUD. |
| `tutor.nombre`, `tutor.apellido`, `tutor.telefono`, `tutor.parentesco` | Todos dentro de su scope | Roles con permiso de crear/editar | Tutor obligatorio. |
| `tutor.email`, `tutor.direccion`, `tutor.observaciones` | Todos dentro de su scope | Roles con permiso de crear/editar | No exponer fuera de la ficha autorizada. |
| `activo` | Todos dentro de su scope | Admin/coordinación/secretaría por endpoint de estado | No aceptado en crear o editar. |
| `createdAt`, `updatedAt` | Detalle autorizado | Nadie | Sistema. |

Un paciente inactivo conserva la historia y sus vínculos activos, pero no
admite nuevos turnos, informes, vínculos ni conversaciones asociadas. Las
conversaciones preexistentes pueden continuar entre sus participantes. Un
borrador preexistente puede continuar únicamente bajo las reglas de Informes.

---

## 11. Vínculos prestador-paciente

Un prestador es un usuario activo con rol `coordinacion` o `profesional`.

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Consultar vínculos activos | Global | Global | Global | Vinculado | Profesional debe pertenecer al equipo del paciente. |
| Consultar historial de vínculos | Global | Global | Global | No | Requiere `incluirHistorial=true`. |
| Crear vínculo | Global | Global | Global | Vinculado | Profesional solo puede sumar a otro prestador si ya está vinculado. |
| Desvincular | Global | Global | Global | No | Motivo obligatorio y sin turnos futuros entre ambos. |
| Auto-vincularse sin acceso previo | No | No aplica | No aplica | No | Solo creación automática autorizada por paciente o turno. |

Campos de vínculo:

| Campo | Roles globales | Profesional vinculado | Escritura cliente |
|---|:---:|:---:|:---:|
| `id`, `pacienteId`, `prestador`, `activo`, `fechaInicio` | Sí | Sí | No |
| `fechaFin`, `motivoDesvinculacion` | Sí | No, porque no accede al historial | Solo `motivo` al desvincular |

La baja cierra el vínculo; no elimina la fila. La pérdida de acceso es inmediata y el historial permanece.

---

## 12. Turnos y agenda

### 12.1 Acciones y alcance

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Consultar agenda | Global | Global | Global | Propio | Filtros dentro del scope. |
| Consultar disponibilidad | Global | Global | Global | Global | Resultado orientativo; no reserva horario. |
| Ver detalle | Global | Global | Global | Propio | Profesional debe ser prestador responsable. |
| Crear para cualquier prestador | Sí | Sí | Sí | No | Prestador, paciente, servicio y consultorio activos. |
| Crear turno propio | N/A | Sí | N/A | Sí | Profesional necesita vínculo; coordinación puede crearlo automáticamente. |
| Confirmar | Global | Global | Global | Propio | `pendiente → confirmado`. |
| Cancelar | Global | Global | Global | Propio | Desde pendiente o confirmado; motivo obligatorio. |
| Completar | Global | Global | Global | Propio | `confirmado → completado`; turno iniciado. |
| Marcar ausente | Global | Global | Global | Propio | `confirmado → ausente`; turno iniciado. |
| Editar observación administrativa | Global | Global | Global | Propio | Solo turno no terminal. |
| Editar notas internas | No | Global | No | Propio | Solo turno no terminal. |
| Editar estructura o reprogramar | No | No | No | No | Cancelar el original y crear otro. |
| Eliminar físicamente | No | No | No | No | Se conserva historia. |

Coordinación puede crear turnos propios o ajenos. Administrador y secretaría no son prestadores, pero operan sobre cualquier agenda.

### 12.2 Campos de lectura

| Campo o grupo | Administrador | Coordinación | Secretaría | Profesional responsable | Listado |
|---|:---:|:---:|:---:|:---:|---|
| `id`, `inicioAt`, `finAt`, `duracionMinutos`, `estado` | Sí | Sí | Sí | Sí | Sí |
| `paciente`, `prestador`, `servicio`, `consultorio` | Sí | Sí | Sí | Sí | Sí |
| `observacionAdministrativa` | Sí | Sí | Sí | Sí | No |
| `notasInternas` | No | Sí | No | Sí | Nunca |
| `creadoPor`, `cancelacion`, `createdAt`, `updatedAt` | Sí | Sí | Sí | Sí | No |

`notasInternas` se omite por completo para administrador y secretaría; no se envía como `null`.

### 12.3 Campos de escritura

| Campo | Administrador | Coordinación | Secretaría | Profesional | Regla |
|---|:---:|:---:|:---:|:---:|---|
| `pacienteId`, `prestadorId`, `servicioId`, `consultorioId` al crear | Sí | Sí | Sí | Propio | Profesional no puede forzar prestador ajeno. |
| `fecha`, `horaInicio`, `duracionMinutos` al crear | Sí | Sí | Sí | Propio | Lunes a sábado, 08:00–21:00 y duración permitida. |
| `observacionAdministrativa` | Sí | Sí | Sí | Propio | Crear o endpoint específico; turno no terminal al editar. |
| `notasInternas` | No | Sí | No | Propio | Crear o endpoint específico. |
| `estado` directo | No | No | No | No | Solo endpoints de transición. |
| `inicioAt`, `finAt`, actores y timestamps | No | No | No | No | Derivados por backend. |

No se exige servicio habitual. PostgreSQL debe impedir solapamientos de paciente, prestador y consultorio.

La disponibilidad usa comienzos cada 15 minutos. Cuando se informan prestador y
consultorio, el resultado es la intersección de ambos.

---

## 13. Informes

### 13.1 Acciones y alcance

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Listar informes | Global | Global | Global | Vinculados | Incluye borradores dentro del scope. |
| Leer detalle completo | Global | Global | Global | Vinculado | La lectura exitosa se audita. |
| Crear sobre cualquier paciente activo | No | Sí | No | No | Coordinación queda como autor. |
| Crear sobre paciente vinculado | No | Sí | No | Sí | Profesional requiere vínculo activo. |
| Editar borrador propio | No | Autor | No | Autor | Autor activo y estado borrador. |
| Editar informe ajeno | No | No | No | No | Sin excepción administrativa. |
| Finalizar borrador propio | No | Autor | No | Autor | Completa `fechaEmision`; queda inmutable. |
| Eliminar | No | No | No | No | No existe endpoint. |
| Generar PDF desde backend | No | No | No | No | Fuera del MVP; impresión se resuelve en frontend. |

El administrador no puede crear informes. La secretaría puede leer título, resumen y contenido completo, pero no escribir. Estos permisos son deliberados.

El profesional requiere vínculo activo incluso si es autor. Un paciente
inactivo no habilita informes nuevos, pero permite continuar un borrador
preexistente mientras se mantengan autoría y vínculo. Un tipo inactivo puede
conservarse, no seleccionarse como reemplazo. Editar y finalizar exigen
`expectedVersion` vigente.

### 13.2 Campos

| Campo o grupo | Lectura en listado | Lectura en detalle | Escritura al crear | Escritura al editar |
|---|:---:|:---:|:---:|:---:|
| `id`, `paciente`, `autor`, `tipoInforme` | Sí | Sí | `pacienteId`, `tipoInformeId` | Solo `tipoInformeId` |
| `titulo` | Sí | Sí | Sí | Sí |
| `resumen` | No | Sí | Sí | Sí |
| `contenido` | No | Sí | Sí | Sí |
| `estado`, `fechaEmision` | Sí | Sí | No | No |
| `createdAt`, `updatedAt` | Sí | Sí | No | No |
| `puedeEditar`, `puedeFinalizar` | Sí | Sí | No | No; calculados por backend |

El contenido clínico nunca se copia en logs ni auditoría. El evento de lectura solo registra actor, recurso, resultado y metadatos mínimos no sensibles.

---

## 14. Mensajería interna

La participación prevalece sobre el rol. No existe acceso global para administrador, coordinación o secretaría.

### 14.1 Acciones

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Consultar resumen de no leídas | Participante | Participante | Participante | Participante | Solo conversaciones propias. |
| Listar conversaciones | Participante | Participante | Participante | Participante | Scope obligatorio por participación. |
| Crear conversación | Sí | Sí | Sí | Sí | Al menos un destinatario activo adicional. |
| Ver detalle | Participante | Participante | Participante | Participante | No participante recibe `404`. |
| Leer mensajes | Participante | Participante | Participante | Participante | Historial completo autorizado. |
| Enviar mensaje | Participante | Participante | Participante | Participante | Actor activo; contenido no vacío. |
| Agregar participantes | Participante | Participante | Participante | Participante | Solo usuarios activos; sin duplicados. |
| Quitar participantes | No | No | No | No | Operación inexistente. |
| Avanzar lectura | Participante | Participante | Participante | Participante | Mensaje de la conversación; nunca retrocede. |
| Archivar o desarchivar | Participante | Participante | Participante | Participante | Estado individual e idempotente. |
| Editar o eliminar mensajes | No | No | No | No | Mensajes inmutables. |
| Eliminar conversación | No | No | No | No | Operación inexistente. |

Crear una conversación asociada a un paciente no exige vínculo con él. El paciente, si se informa, debe estar activo. Una conversación ya existente sobre un paciente inactivo puede continuar.

### 14.2 Campos y proyecciones

| Campo o grupo | Lista de conversaciones | Detalle | Mensajes | Resumen no leídas |
|---|:---:|:---:|:---:|:---:|
| `id`, `titulo`, `asunto`, `participantes`, `updatedAt` | Sí | Sí | Según proyección | `id`, `titulo`, `participantes`, `updatedAt` |
| `paciente` | Sí, nullable | Sí, nullable | No | No |
| `ultimoMensaje.preview` | Sí, solo participante | No | No | Nunca |
| `noLeidos`, `archivada` | Sí, estado individual | Sí | No | Solo contador agregado |
| `ultimoMensajeLeidoId`, timestamps de lectura | No | Sí | No | No |
| `mensaje.contenido` | Solo preview limitado | No | Sí, solo participante | Nunca |

El nuevo participante accede al historial completo, pero el último mensaje existente se establece como punto inicial de lectura para que el historial previo no compute como no leído.

La incorporación es atómica: si el lote contiene un participante existente no
se agrega a nadie. Un mensaje nuevo desarchiva la conversación para sus
receptores y actualiza la actividad global; lectura, archivo y desarchivo no la
actualizan.

---

## 15. Catálogos

Catálogos: `servicios`, `consultorios`, `asuntos` y `tipos-informe`.

### 15.1 Acciones

| Acción | Administrador | Coordinación | Secretaría | Profesional | Policy |
|---|:---:|:---:|:---:|:---:|---|
| Listar y ver activos | Global | Activos | Activos | Activos | Cualquier autenticado. |
| Listar y ver inactivos | Global | No | No | No | Solo administrador. |
| Crear | Sí | No | No | No | Campos definidos por catálogo. |
| Editar | Global | No | No | No | No modifica estado ni imagen implícitamente. |
| Activar o desactivar | Global | No | No | No | Validar dependencias futuras. |
| Cargar, reemplazar o quitar imagen de servicio | Global | No | No | No | Endpoint separado. |
| Eliminar físicamente | No | No | No | No | Se conserva historial. |

### 15.2 Campos de servicio

| Campo | Lectura autenticada | Escritura admin | Regla |
|---|:---:|:---:|---|
| `id`, `nombre`, `descripcion` | Sí | `nombre`, `descripcion` | Ambos obligatorios al crear. |
| `imagenUrl` | Sí | Solo endpoint de imagen | No se acepta URL del cliente. |
| `visiblePublicamente`, `ordenPublico` | Sí | Sí | Independientes de `activo`. |
| `activo` | Sí para registros visibles | Solo endpoint de estado | Servicio inactivo no se usa en turnos nuevos. |
| `createdAt`, `updatedAt` | Sí | No | Sistema. |

### 15.3 Campos de otros catálogos

| Recurso | Campos editables por admin | Campos inmutables o administrados por endpoint separado |
|---|---|---|
| Consultorio | `nombre`, `descripcion`, `ubicacion`, `capacidad` | `id`, `activo`, timestamps |
| Asunto | `codigo` y `nombre` al crear; solo `nombre` al editar | `codigo` después de crear; `id`, `activo`, timestamps |
| Tipo de informe | `nombre`, `descripcion` | `id`, `activo`, timestamps |

Antes de desactivar un servicio o consultorio deben resolverse turnos futuros activos que dependan de él. Asuntos y tipos de informe pueden desactivarse conservando el historial.

---

## 16. Auditoría

### 16.1 Acceso al recurso de auditoría

| Acción | Administrador | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Listar y filtrar eventos | Sí | No | No | No |
| Ver actor, acción, recurso, resultado y metadata autorizada | Sí | No | No | No |
| Crear evento manualmente | No | No | No | No |
| Editar o eliminar evento | No | No | No | No |
| Exportar auditoría | No | No | No | No |

Los eventos se generan desde services o middleware especializado. La tabla es append-only para la aplicación.

### 16.2 Campos visibles

Solo el administrador puede leer:

- `id`;
- actor resumido o `null`;
- `accion`;
- `recurso`;
- `recursoId`;
- `resultado`;
- `metadata` sanitizada;
- `ip`;
- `correlationId`;
- `createdAt`.

### 16.3 Eventos mínimos

#### Autenticación

- `LOGIN_EXITOSO`;
- `LOGIN_FALLIDO`;
- `SESION_RENOVADA`;
- `LOGOUT`;
- `LOGOUT_TODAS`.

#### Usuarios y accesos

- `USUARIO_CREADO`;
- `USUARIO_EDITADO`;
- `USUARIO_ACTIVADO`;
- `USUARIO_DESACTIVADO`;
- `ACCESO_RESTABLECIDO`;
- `USUARIO_FOTO_ACTUALIZADA`;
- `USUARIO_FOTO_ELIMINADA`.

#### Pacientes y vínculos

- `PACIENTE_CREADO`;
- `PACIENTE_EDITADO`;
- `PACIENTE_ACTIVADO`;
- `PACIENTE_DESACTIVADO`;
- `PRESTADOR_VINCULADO`;
- `PRESTADOR_VINCULADO_AUTOMATICAMENTE`;
- `PRESTADOR_DESVINCULADO`.

#### Servicios y catálogos

- `SERVICIO_ASIGNADO`;
- `SERVICIO_QUITADO`;
- `CATALOGO_CREADO`;
- `CATALOGO_EDITADO`;
- `CATALOGO_ACTIVADO`;
- `CATALOGO_DESACTIVADO`;
- `SERVICIO_IMAGEN_ACTUALIZADA`;
- `SERVICIO_IMAGEN_ELIMINADA`.

#### Turnos

- `TURNO_CREADO`;
- `TURNO_CONFIRMADO`;
- `TURNO_CANCELADO`;
- `TURNO_COMPLETADO`;
- `TURNO_AUSENTE`;
- `TURNO_OBSERVACION_EDITADA`;
- `TURNO_NOTA_INTERNA_EDITADA`.

#### Informes

- `INFORME_CREADO`;
- `INFORME_EDITADO`;
- `INFORME_FINALIZADO`;
- `INFORME_VISUALIZADO`.

#### Mensajería

- `CONVERSACION_CREADA`;
- `PARTICIPANTE_AGREGADO`;
- `MENSAJE_ENVIADO`;
- `CONVERSACION_ARCHIVADA`;
- `CONVERSACION_DESARCHIVADA`.

No se audita cada polling de `GET /conversaciones/no-leidas/resumen`.

### 16.4 Metadata permitida

- UUID de recursos relacionados;
- estado anterior y nuevo;
- nombres técnicos de campos modificados;
- cantidad de elementos afectados;
- tipo de catálogo;
- motivo administrativo cuando no contenga información clínica;
- referencias de correlación;
- causa técnica normalizada de un resultado fallido, sin stack ni SQL.

### 16.5 Datos prohibidos en auditoría y logs

- DNI;
- credenciales, hashes, tokens y cookies;
- diagnósticos;
- observaciones clínicas;
- contenido o resumen de informes;
- contenido o preview de mensajes;
- `notasInternas` de turnos;
- datos completos de tutor;
- bodies HTTP completos;
- SQL, nombres internos de constraints o stacks.

El evento `TURNO_NOTA_INTERNA_EDITADA` registra que el campo cambió, nunca su valor.

---

## 17. API pública y archivos

| Recurso / acción | Público | Autenticado | Administrador | Regla |
|---|:---:|:---:|:---:|---|
| Consultar equipo publicado | Sí | Sí | Sí | Usuario activo, publicado, no administrador. |
| Consultar servicios publicados | Sí | Sí | Sí | Servicio activo y publicado. |
| Descargar imagen por URL conocida | Sí | Sí | Sí | Sin listado de directorios. |
| Subir imagen anónimamente | No | No | Solo por endpoint administrativo | Formatos y tamaño contractuales. |
| Crear consulta de contacto | No | No | No | No existe persistencia de contacto. |
| Reservar turno públicamente | No | No | No | Fuera del MVP. |
| Consultar `/health` | Sí o infraestructura | Sí | Sí | Solo estado del proceso; no consulta PostgreSQL. |
| Consultar `/ready` | Sí o infraestructura | Sí | Sí | Solo disponibilidad; nunca expone host, SQL o credenciales. |

Campos públicos de equipo:

```text
id, nombre, apellido, titulo, especialidad,
funcionPublica, bio, fotoUrl, ordenPublico
```

Nunca se publican DNI, email de acceso, teléfono personal, rol técnico, permisos, estado de sesiones o usuarios administradores.

Campos públicos de servicios:

```text
id, nombre, descripcion, imagenUrl, ordenPublico
```

`visiblePublicamente=true` no publica un recurso inactivo. `activo=true` tampoco lo publica si `visiblePublicamente=false`.

---

## 18. Operaciones deliberadamente prohibidas

Ningún rol puede:

- registrar usuarios públicamente;
- recuperar o cambiar contraseñas mediante endpoints de autoservicio;
- modificar su propio perfil;
- eliminar físicamente usuarios, pacientes, informes, mensajes o catálogos;
- crear, editar o eliminar tutores por separado;
- editar estructuralmente o reprogramar un turno;
- editar o eliminar un informe finalizado;
- editar o eliminar mensajes;
- quitar participantes de una conversación;
- leer una conversación ajena por poseer rol elevado;
- crear o editar manualmente auditoría;
- exportar auditoría desde la API del MVP;
- reservar turnos desde el sitio público;
- persistir mensajes del formulario público.

La ausencia de un endpoint es una decisión funcional. No debe completarse por analogía con otros sistemas.

---

## 19. Reglas de implementación

### 19.1 Separación de responsabilidades

- El middleware verifica autenticación y permisos generales.
- El service verifica alcance, relación con el recurso, estado y campos.
- La base de datos garantiza integridad y concurrencia cuando corresponde.
- El serializer o projector construye la respuesta autorizada.
- El frontend usa permisos para UX, nunca para conceder acceso.

### 19.2 Policies mínimas explícitas

La implementación debe contar con policies testeables equivalentes a:

```text
canAccessPatient(actor, patient)
canManagePatientState(actor, patient)
canManagePatientLinks(actor, patient)
canAccessAppointment(actor, appointment)
canReadAppointmentInternalNotes(actor, appointment)
canAccessReport(actor, report)
canEditReport(actor, report)
canAccessConversation(actor, conversation)
canRequestUserProjection(actor, projection, filters)
canRequestCatalogState(actor, activeFilter)
```

No concentrar toda la autorización en un único `if` por rol ni duplicarla de forma divergente en controllers.

### 19.3 Lista `permissions` de sesión

La respuesta de login y refresh se deriva de esta tabla. Los identificadores son
estables, están en inglés con puntos y constituyen el catálogo completo del MVP.

| Permission | Admin | Coord. | Secr. | Prof. | Scope | Policy y proyección |
|---|:---:|:---:|:---:|:---:|---|---|
| `summary.read` | Sí | Sí | Sí | Sí | Del rol | Resumen agregado sin datos sensibles. |
| `users.readDirectory` | Sí | Sí | Sí | Sí | Global activo | Policy de proyección; `directory` o `selector`. |
| `users.manage` | Sí | No | No | No | Global | Usuario visible; proyección administrativa y sin automodificación. |
| `users.manageServices` | Sí | Sí | Sí | No | Global | Usuario prestador; proyección de asignaciones. |
| `patients.readAll` | Sí | Sí | Sí | No | Global | Policy de paciente; proyección permitida por rol. |
| `patients.readLinked` | No | No | No | Sí | Vinculado | Vínculo activo; proyección profesional. |
| `patients.create` | Sí | Sí | Sí | Sí | Del actor | Policy de creación; ficha autorizada. |
| `patients.updateAll` | Sí | Sí | Sí | No | Global | Paciente visible; campos editables del rol. |
| `patients.updateLinked` | No | No | No | Sí | Vinculado | Vínculo activo; campos profesionales. |
| `patients.manageState` | Sí | Sí | Sí | No | Global | Policy de estado; proyección de ficha. |
| `patients.manageLinks` | Sí | Sí | Sí | No | Global | Policy de vínculos; proyección de relación. |
| `patients.linkFromLinked` | No | No | No | Sí | Vinculado | Actor ya vinculado; proyección de relación. |
| `appointments.readAll` | Sí | Sí | Sí | No | Global | Policy de turno; detalle filtrado por campos. |
| `appointments.manageAll` | Sí | Sí | Sí | No | Global | Policy de acción y estado; detalle filtrado. |
| `appointments.manageOwn` | No | No | No | Sí | Propio | Prestador responsable; detalle profesional. |
| `appointments.readAvailability` | Sí | Sí | Sí | Sí | Autorizado | Filtros dentro del alcance; proyección de slots. |
| `appointments.readInternalNotesAll` | No | Sí | No | No | Global | Turno visible; incluye notas internas. |
| `appointments.readInternalNotesOwn` | No | No | No | Sí | Propio | Prestador responsable; incluye notas internas. |
| `reports.readAll` | Sí | Sí | Sí | No | Global | Policy de informe; contenido completo autorizado. |
| `reports.readLinked` | No | No | No | Sí | Vinculado | Vínculo activo; informe visible. |
| `reports.createAny` | No | Sí | No | No | Global | Autor propio y paciente válido; borrador. |
| `reports.createLinked` | No | No | No | Sí | Vinculado | Vínculo activo; borrador propio. |
| `reports.manageOwnDraft` | No | Sí | No | Sí | Autor | Borrador editable, vínculo cuando aplica y versión esperada. |
| `conversations.manageOwn` | Sí | Sí | Sí | Sí | Participante | Participación activa; proyección de conversación o mensaje. |
| `services.read` | Sí | Sí | Sí | Sí | Global activo | Proyección autenticada de servicio. |
| `services.manage` | Sí | No | No | No | Global | Policy administrativa; proyección completa. |
| `catalogs.read` | Sí | Sí | Sí | Sí | Global activo | Proyección autenticada del catálogo. |
| `catalogs.manage` | Sí | No | No | No | Global | Policy administrativa; proyección completa. |
| `audit.read` | Sí | No | No | No | Global | Policy administrativa; metadata sanitizada. |

`permissions` habilita navegación y controles de interfaz; nunca concede acceso
por sí sola. Scope, estado, relación, autoría, participación y campos continúan
evaluándose en el backend. No crear una segunda nomenclatura ni agregar strings
fuera de esta tabla sin actualizar contrato, cliente, mocks y pruebas.

---

## 20. Pruebas mínimas de autorización

Para cada acción protegida deben existir, según corresponda:

1. caso autorizado por rol;
2. rol no autorizado;
3. recurso propio frente a ajeno;
4. paciente vinculado frente a no vinculado;
5. autor frente a no autor;
6. participante frente a no participante;
7. recurso activo frente a inactivo;
8. filtro permitido frente a filtro que intenta ampliar scope;
9. campo visible frente a campo omitido;
10. escritura de campo permitido frente a campo prohibido;
11. acceso directo por UUID para detectar IDOR;
12. proyección pública, selector, directorio y administrativa;
13. auditoría sin contenido sensible;
14. transición y concurrencia cuando corresponda.

Casos críticos obligatorios:

- un profesional solo lista pacientes vinculados;
- un profesional vinculado puede sumar otro prestador, pero no desvincularlo;
- un profesional no puede forzar `prestadorId` ajeno en un turno;
- cualquier servicio activo puede usarse en turno aunque no sea habitual;
- un profesional no puede administrar servicios habituales;
- administrador y secretaría nunca reciben `notasInternas`;
- coordinación sí puede ver y editar `notasInternas` de cualquier turno autorizado;
- administrador y secretaría leen informes completos pero no crean ni editan;
- solo el autor activo edita y finaliza un borrador;
- ningún rol elevado ve conversaciones ajenas;
- el participante nuevo accede al historial sin contarlo como no leído;
- el resumen de no leídos no contiene previews ni paciente;
- la proyección de usuario no administrativa no expone DNI, email o teléfono;
- un usuario, incluido el administrador, no puede modificarse a sí mismo;
- registros inactivos de usuarios y catálogos solo son visibles para administrador;
- `activo` y `visiblePublicamente` se prueban de forma independiente;
- rutas deliberadamente inexistentes responden `404`.

---

## 21. Criterio de cambio

Modificar un permiso, scope o campo visible es un cambio funcional y de seguridad, no un refactor.

Todo cambio debe actualizar en conjunto:

- esta matriz;
- `docs/contrato-api.md`;
- policies y proyecciones del backend;
- schemas Joi cuando afecte entradas;
- lista de permisos de login y refresh;
- guards y `PermissionGate` del frontend;
- mocks;
- pruebas unitarias, de integración y E2E;
- eventos de auditoría afectados.

No debe modificarse esta matriz para justificar una implementación incompatible ya realizada. Primero se presenta la contradicción y se obtiene una decisión funcional.
