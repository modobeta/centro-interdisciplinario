# Layout, navegación y permisos — Frontend privado MVP

---

## 1. Objetivo

Definir cómo se organiza el panel privado, qué rutas existen, qué elementos ve cada rol y cómo se aplican las restricciones de acceso sin duplicar interfaces.

---

## 2. Un único dashboard para todos

Todos los usuarios autenticados utilizan el mismo layout y la misma ruta inicial:

```text
/app/resumen
```

No existen dashboards independientes por rol. El contenido se adapta mediante:

- menú lateral filtrado;
- tarjetas permitidas;
- datos limitados por el backend;
- acciones visibles según permisos;
- proyecciones de campos según rol.

---

## 3. Composición visual

```text
┌───────────────────────────────────────────────────────────────┐
│ Topbar: Inicio | Alertas | Cerrar sesión                     │
├─────────────────┬─────────────────────────────────────────────┤
│ Sidebar         │ Contenido seleccionado                     │
│                 │                                             │
│ Usuario         │                                             │
│ Título/función  │                                             │
│                 │                                             │
│ Resumen         │                                             │
│ Pacientes       │                                             │
│ Agenda          │                                             │
│ Mensajes        │                                             │
│ Informes        │                                             │
│ ...             │                                             │
└─────────────────┴─────────────────────────────────────────────┘
```

### 3.1 Sidebar

Contiene:

- fotografía o iniciales;
- nombre y apellido;
- título o función pública/institucional;
- opciones autorizadas;
- indicador visual de ruta activa;
- botón para contraer en escritorio;
- cierre automático como drawer al navegar en celular.

Cuando está contraído:

- muestra iconos;
- conserva tooltips accesibles;
- no oculta la opción activa;
- el nombre puede reducirse a avatar/iniciales.

### 3.2 Topbar

Contiene únicamente:

- `Inicio`: vuelve a `/` en la misma pestaña;
- `Alertas`: muestra conversaciones no leídas y actividad reciente;
- `Cerrar sesión`: revoca la sesión actual y vuelve a `/login`;
- botón de apertura de menú en pantallas pequeñas.

No contiene un buscador global ni un centro de notificaciones general en el MVP.

### 3.3 Perfil de solo lectura

Al seleccionar el bloque del usuario en el sidebar se abre un diálogo con:

- fotografía;
- nombre y apellido;
- título;
- función;
- especialidad;
- correo de acceso;
- rol interno.

No existe edición del perfil propio.

---

## 4. Menú por rol

### 4.1 Profesional

```text
Resumen
Pacientes
Agenda
Mensajes
Informes
```

No ve:

- Usuarios;
- Servicios;
- Catálogos;
- Auditoría.

### 4.2 Secretaría

```text
Resumen
Pacientes
Agenda
Mensajes
Informes
Usuarios
Servicios
```

Usuarios funciona como directorio interno. Servicios permite consultar y gestionar asociaciones habituales, no editar el catálogo.

### 4.3 Coordinación

```text
Resumen
Pacientes
Agenda
Mensajes
Informes
Usuarios
Servicios
```

Coordinación también puede actuar como prestador y administrar operaciones globales autorizadas.

### 4.4 Administrador

```text
Resumen
Pacientes
Agenda
Mensajes
Informes
Usuarios
Servicios
Catálogos
Auditoría
```

---

## 5. Rutas privadas

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/app/resumen` | Resumen | Todos |
| `/app/pacientes` | Listado de pacientes | Todos, con scope por rol |
| `/app/pacientes/:pacienteId` | Detalle del paciente | Según policy de recurso |
| `/app/agenda` | Agenda | Todos, con scope por rol |
| `/app/mensajes` | Mensajería | Todos |
| `/app/mensajes/:conversacionId` | Conversación | Solo participantes |
| `/app/informes` | Listado de informes | Todos, con scope por rol |
| `/app/informes/:informeId` | Informe | Según policy de lectura |
| `/app/usuarios` | Usuarios/directorio | Admin, coordinación, secretaría |
| `/app/servicios` | Servicios | Admin, coordinación, secretaría |
| `/app/catalogos` | Catálogos | Solo admin |
| `/app/auditoria` | Auditoría | Solo admin |
| `/app/403` | Sin permiso | Todos autenticados |

`/app` redirige a `/app/resumen`.

---

## 6. Resumen

### 6.1 Comportamiento

- presenta tarjetas con cantidades;
- una tarjeta queda seleccionada;
- debajo aparece una vista resumida del elemento seleccionado;
- seleccionar una tarjeta no cambia la ruta;
- cada detalle ofrece `Ver módulo` cuando existe una pantalla completa;
- la selección inicial es Pacientes.

### 6.2 Tarjetas por rol

#### Profesional

- Pacientes activos vinculados;
- Turnos de hoy;
- Informes en borrador propios;
- Mensajes no leídos.

#### Secretaría

- Pacientes activos;
- Turnos de hoy;
- Turnos pendientes;
- Mensajes no leídos;
- Usuarios activos;
- Servicios activos.

#### Coordinación

- Pacientes activos;
- Turnos de hoy;
- Informes recientes;
- Mensajes no leídos;
- Usuarios activos;
- Servicios activos.

#### Administrador

- Pacientes activos;
- Turnos de hoy;
- Usuarios activos;
- Servicios activos;
- Mensajes no leídos;
- Eventos recientes de auditoría.

### 6.3 Vista resumida de pacientes

Muestra como máximo cinco pacientes con:

- nombre y apellido;
- edad;
- tutor;
- teléfono del tutor cuando el rol puede verlo;
- estado;
- acceso a detalle.

La vista resumida no reemplaza el listado completo.

---

## 7. Matriz de visibilidad de módulos

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

---

## 8. Permisos de acciones principales

### 8.1 Pacientes

| Acción | Admin | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Ver todos | Sí | Sí | Sí | No |
| Ver vinculados | Sí | Sí | Sí | Sí |
| Crear | Sí | Sí | Sí | Sí |
| Editar cualquiera | Sí | Sí | Sí | No |
| Editar vinculado | Sí | Sí | Sí | Sí |
| Activar/desactivar | Sí | Sí | Sí | No |
| Vincular prestador | Sí | Sí | Sí | Sí, si ya está vinculado |
| Desvincular | Sí | Sí | Sí | No |

### 8.2 Turnos

| Acción | Admin | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Ver agenda general | Sí | Sí | Sí | No |
| Ver agenda propia | Sí* | Sí | Sí* | Sí |
| Crear para otro prestador | Sí | Sí | Sí | No |
| Crear propio | No aplica | Sí | No aplica | Sí |
| Confirmar cualquiera | Sí | Sí | Sí | No |
| Confirmar propio | No aplica | Sí | No aplica | Sí |
| Cancelar cualquiera | Sí | Sí | Sí | No |
| Cancelar propio | No aplica | Sí | No aplica | Sí |
| Completar/ausente cualquiera | Sí | Sí | Sí | No |
| Completar/ausente propio | No aplica | Sí | No aplica | Sí |

`*` Admin y secretaría no son prestadores, pero pueden filtrar y operar sobre cualquier agenda.

### 8.3 Informes

| Acción | Admin | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Leer todos | Sí | Sí | Sí | No |
| Leer de pacientes vinculados | Sí | Sí | Sí | Sí |
| Crear | No | Sí | No | Sí |
| Editar propio en borrador | No | Sí | No | Sí |
| Finalizar propio | No | Sí | No | Sí |
| Editar ajeno | No | No | No | No |
| Eliminar | No | No | No | No |

### 8.4 Mensajería

Todos pueden:

- crear conversaciones;
- responder si participan;
- agregar participantes si participan;
- archivar para sí.

Nadie puede ver una conversación ajena solo por tener un rol elevado.

### 8.5 Usuarios

| Acción | Admin | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Ver directorio activo | Sí | Sí | Sí | No desde módulo |
| Crear/editar | Sí | No | No | No |
| Cambiar rol | Sí | No | No | No |
| Activar/desactivar | Sí | No | No | No |
| Restablecer acceso | Sí | No | No | No |
| Ver datos administrativos completos | Sí | No | No | No |

El profesional puede obtener el directorio mínimo dentro del selector de destinatarios de Mensajería, sin acceso al módulo Usuarios.

### 8.6 Servicios

| Acción | Admin | Coordinación | Secretaría | Profesional |
|---|:---:|:---:|:---:|:---:|
| Ver módulo | Sí | Sí | Sí | No |
| Crear/editar catálogo | Sí | No | No | No |
| Activar/desactivar | Sí | No | No | No |
| Gestionar servicios habituales | Sí | Sí | Sí | No |
| Elegir servicio activo en turno | Sí | Sí | Sí | Sí |

La selección de un servicio para un turno no requiere asociación previa en `usuarios_servicios`.

---

## 9. Protección de rutas

### 9.1 `ProtectedRoute`

Comprueba sesión válida. Durante la recuperación muestra una pantalla neutral de carga.

### 9.2 `PermissionRoute`

Comprueba permiso de módulo. Ante ausencia redirige a `/app/403`.

### 9.3 Policy por recurso

Las páginas de detalle no se protegen solo por rol. Siempre solicitan el recurso al backend, que decide:

- vínculo activo;
- autoría;
- participación;
- estado activo;
- campo visible.

Un `404` o `403` debe mostrarse sin filtrar información sobre la existencia del recurso.

---

## 10. `PermissionGate`

Se usa para acciones dentro de una pantalla.

```jsx
<PermissionGate permission="patients.create">
  <Button onClick={openCreatePatient}>Nuevo paciente</Button>
</PermissionGate>
```

No debe envolver grandes secciones con lógica compleja. La página puede derivar capacidades una sola vez:

```js
const canCreate = hasPermission('patients.create');
const canDeactivate = hasPermission('patients.deactivate');
```

---

## 11. Navegación contextual

### 11.1 Desde Pacientes

- Crear turno abre modal con paciente precargado.
- Crear informe abre modal con paciente precargado.
- Ver turnos mantiene el contexto del paciente.
- Ver conversación solo muestra conversaciones participadas.

### 11.2 Desde Agenda

- Clic en turno abre detalle.
- Clic en franja abre nuevo turno con fecha/hora.
- `Ver paciente` navega al detalle cuando está autorizado.

### 11.3 Desde Resumen

- las tarjetas cambian la vista inferior;
- `Ver módulo` navega a la ruta completa;
- no se duplica lógica de gestión en Resumen.

---

## 12. Estados de ruta

### 12.1 `401`

Se intenta refresh. Si falla, login.

### 12.2 `403`

Ruta completa: `/app/403`.  
Acción puntual: toast o mensaje contextual.

### 12.3 `404`

Pantalla de recurso no disponible con regreso al módulo.

### 12.4 Sesión inactiva

El guard de inactividad se ejecuta dentro de `PrivateLayout`, por lo que cubre todas las rutas privadas.

---

## 13. Criterios de aceptación

- El profesional no puede descubrir módulos administrativos por navegación o URL.
- Coordinación y secretaría ven Usuarios como directorio, no como administración.
- El administrador es el único con Catálogos y Auditoría.
- El Resumen utiliza una estructura única.
- Pacientes contiene tutor; no hay menú Familias.
- La ruta activa se comunica visual y semánticamente.
- El sidebar funciona contraído, expandido y como drawer.
- Toda ruta sensible sigue protegida aunque el menú no la muestre.
