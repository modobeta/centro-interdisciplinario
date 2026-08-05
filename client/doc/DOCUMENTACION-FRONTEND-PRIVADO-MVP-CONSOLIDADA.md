# Documentación consolidada del frontend privado — MVP
**Proyecto:** Centro Educativo Interdisciplinario Terapéutico  
**Versión:** 1.0  
**Fecha:** 2026-07-30
> Este archivo unifica los documentos modulares. Ante una actualización, deben modificarse primero los archivos individuales y regenerarse esta versión.

---

# Centro Educativo Interdisciplinario Terapéutico
## Documentación del frontend privado — MVP

**Versión:** 1.0  
**Estado:** consolidada y validada  
**Fecha:** 2026-07-30  
**Tecnología base:** React + Vite + JavaScript  
**Área cubierta:** panel privado autenticado

---

## 1. Propósito

Este conjunto documental define la arquitectura, navegación, pantallas, permisos, componentes, formularios, integración con la API, seguridad, pruebas y plan de implementación del frontend privado del Producto Mínimo Viable del Centro Educativo Interdisciplinario Terapéutico.

El objetivo es que un equipo con experiencia limitada pueda desarrollar el panel sin improvisar decisiones estructurales ni interpretar de manera distinta las reglas del negocio.

La documentación no reemplaza al backend como autoridad de seguridad. El frontend:

- presenta únicamente las funciones útiles para cada rol;
- evita acciones inválidas antes de enviarlas;
- guía al usuario mediante estados claros;
- conserva una experiencia coherente;
- acepta que el backend puede rechazar cualquier operación con `401`, `403`, `409` o `422`.

---

## 2. Alcance del panel privado

El panel privado incluye:

- autenticación con correo y DNI;
- recuperación y renovación de sesión;
- cierre automático por inactividad;
- layout compartido para todos los roles;
- resumen operativo;
- pacientes y tutor único;
- agenda de turnos;
- informes;
- mensajería interna;
- directorio y administración de usuarios;
- servicios y servicios habituales por prestador;
- catálogos;
- auditoría;
- carga de fotografías e imágenes desde formularios administrativos.

No incluye:

- registro público;
- recuperación automática de contraseña;
- edición del perfil propio;
- PWA avanzada;
- aplicación móvil nativa;
- pagos o facturación;
- videollamadas;
- adjuntos en mensajes;
- notificaciones push, email o WhatsApp automáticas;
- edición colaborativa;
- generación de PDF en backend;
- drag and drop para reprogramar turnos;
- modo oscuro en el MVP.

---

## 3. Fuentes de verdad y precedencia

Cuando exista una contradicción, se aplicará el siguiente orden:

1. reglas de negocio confirmadas para el MVP;
2. `08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md` para los cambios posteriores;
3. matriz de permisos del backend;
4. contrato API del backend;
5. modelo de datos del backend;
6. esta documentación del frontend privado;
7. documentación del frontend público;
8. documentos históricos.

La precedencia anterior resuelve específicamente estas contradicciones heredadas:

- un servicio activo puede utilizarse en un turno aunque no figure como servicio habitual del prestador;
- `usuarios_servicios` es informativa y organizativa, no una restricción para crear turnos;
- el profesional no ve el módulo Servicios;
- el frontend privado utiliza un único dashboard para todos los roles;
- Pacientes incluye la información del tutor y no existe un módulo Familias/Tutores;
- no existe reprogramación: se cancela el turno original y se crea uno nuevo;
- el administrador no puede crear informes clínicos;
- las conversaciones son visibles solamente para sus participantes.

---

## 4. Índice de documentos

1. [`01-ARQUITECTURA-FRONTEND-PRIVADO-MVP.md`](./01-ARQUITECTURA-FRONTEND-PRIVADO-MVP.md)  
   Arquitectura, stack, estructura de carpetas, diseño, responsive, seguridad y convenciones.

2. [`02-LAYOUT-NAVEGACION-Y-PERMISOS-MVP.md`](./02-LAYOUT-NAVEGACION-Y-PERMISOS-MVP.md)  
   Layout privado, sidebar, topbar, rutas, menú por rol, resumen y autorización visual.

3. [`03-MAPA-PANTALLAS-Y-FLUJOS-PRIVADOS-MVP.md`](./03-MAPA-PANTALLAS-Y-FLUJOS-PRIVADOS-MVP.md)  
   Inventario de pantallas, flujos funcionales y criterios de aceptación.

4. [`04-COMPONENTES-FORMULARIOS-Y-FEEDBACK-MVP.md`](./04-COMPONENTES-FORMULARIOS-Y-FEEDBACK-MVP.md)  
   Componentes reutilizables, modales, formularios, validaciones, feedback y accesibilidad.

5. [`05-ESTADO-AUTENTICACION-E-INTEGRACION-API-MVP.md`](./05-ESTADO-AUTENTICACION-E-INTEGRACION-API-MVP.md)  
   Redux Toolkit, Axios, sesión, refresh, inactividad, errores, caché local y seguridad.

6. [`06-AGENDA-MENSAJERIA-E-INFORMES-MVP.md`](./06-AGENDA-MENSAJERIA-E-INFORMES-MVP.md)  
   Especificaciones profundas para FullCalendar, mensajería interna e informes.

7. [`07-PLAN-IMPLEMENTACION-Y-PRUEBAS-MVP.md`](./07-PLAN-IMPLEMENTACION-Y-PRUEBAS-MVP.md)  
   Etapas de implementación, Git, CI, pruebas, cobertura y Definition of Done.

8. [`08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md`](./08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md)  
   Cambios requeridos en API, permisos y reglas técnicas para soportar el frontend confirmado.

9. [`09-REGISTRO-DECISIONES-FRONTEND-PRIVADO-MVP.md`](./09-REGISTRO-DECISIONES-FRONTEND-PRIVADO-MVP.md)  
   Registro trazable de decisiones confirmadas, reemplazadas y fuera del MVP.

10. [`10-INFORME-VALIDACION-CRUZADA-MVP.md`](./10-INFORME-VALIDACION-CRUZADA-MVP.md)  
    Resultado de la validación documental, contradicciones detectadas y resolución aplicada.

---

## 5. Anexos

- [`anexos/private-tokens.example.css`](./anexos/private-tokens.example.css)
- [`anexos/private-routes.example.js`](./anexos/private-routes.example.js)
- [`anexos/private-menu.example.js`](./anexos/private-menu.example.js)
- [`anexos/permissions.example.js`](./anexos/permissions.example.js)
- [`anexos/package-dependencies.md`](./anexos/package-dependencies.md)

Los anexos son ejemplos de implementación, no una segunda fuente de verdad.

---

## 6. Decisiones estructurales confirmadas

- Una única aplicación React + Vite contiene área pública, login y panel privado.
- El frontend se desarrolla en JavaScript ES6+.
- El panel utiliza un layout único para todos los roles.
- El sidebar es estrecho y muestra solo módulos autorizados.
- La topbar contiene Inicio público, alertas de mensajes y cierre de sesión.
- El resumen es la ruta inicial y utiliza tarjetas seleccionables.
- Pacientes incluye tutor único dentro de la misma ficha.
- Las acciones de alta y edición se realizan mediante modales reutilizables.
- La agenda se aproxima a Google Calendar con vistas Día y Semana.
- No existe reprogramación visual ni drag and drop.
- Informes se crean y editan en modal amplio; los finalizados son inmutables.
- Mensajería utiliza dos paneles en escritorio y una vista por vez en celular.
- El profesional no ve Usuarios ni Servicios en el menú.
- El profesional puede elegir cualquier servicio activo al crear un turno propio.
- La asignación habitual de servicios no restringe la agenda.
- Redux conserva solo estado global necesario.
- Los datos sensibles no se persisten en `localStorage`.
- La sesión advierte a los 30 minutos de inactividad y se cierra 5 minutos después.
- El objetivo de cobertura es 80 % con foco en flujos críticos.

---

## 7. Convenciones documentales

- Las rutas se escriben con prefijo `/app`.
- Los nombres de base de datos usan `snake_case`.
- Los payloads JavaScript usan `camelCase`.
- “Prestador” significa usuario con rol `profesional` o `coordinacion` cuando actúa brindando atención.
- “Usuario” incluye administrador, coordinación, secretaría y profesional.
- “Servicio habitual” es una asociación informativa en `usuarios_servicios`.
- “Servicio del turno” es el servicio activo seleccionado específicamente para ese turno.
- Las acciones destructivas se entienden como desactivaciones lógicas o cambios de estado, nunca borrado físico clínico.

---

## 8. Criterio de modificación

Toda modificación importante debe registrar:

- problema;
- decisión anterior;
- nueva decisión;
- motivo;
- módulos afectados;
- endpoints afectados;
- migraciones o cambios de datos;
- pruebas requeridas;
- identificador `FPRI-XXX` en el registro de decisiones.

No debe modificarse una regla de negocio solo para facilitar una pantalla.

---

# Arquitectura del frontend privado — MVP

**Versión:** 1.0  
**Área:** panel autenticado  
**Lenguaje:** JavaScript ES6+  
**Arquitectura:** SPA modular por funcionalidad

---

## 1. Objetivo

Definir una arquitectura simple, mantenible y coherente para desarrollar el panel privado del centro sin introducir complejidad innecesaria.

La arquitectura debe permitir:

- una experiencia común para los cuatro roles;
- autorización visual por permiso;
- integración segura con la API REST;
- desarrollo progresivo por módulos;
- pruebas unitarias, de integración y E2E;
- responsive design funcional;
- reutilización del sistema visual del área pública;
- evolución posterior sin reescribir el MVP.

---

## 2. Principios

### 2.1 Simplicidad deliberada

El equipo no implementará microfrontends, arquitectura hexagonal en el cliente, Event Sourcing, CQRS, RTK Query, GraphQL ni un framework visual completo.

El flujo normal será:

```text
Page
→ feature hook o handler
→ API service Axios
→ backend REST
→ actualización local o global necesaria
```

### 2.2 Modularidad por funcionalidad

Cada dominio agrupa sus páginas, componentes, servicios, esquemas y pruebas.

```text
features/patients
features/appointments
features/reports
```

Se evita separar todo el proyecto por tipo técnico cuando eso dispersa una misma funcionalidad.

### 2.3 Backend como autoridad

El frontend puede ocultar botones y prevenir solicitudes inválidas, pero no decide definitivamente:

- permisos;
- alcance de pacientes;
- transiciones de estados;
- solapamientos;
- integridad de vínculos;
- inmutabilidad de informes;
- visibilidad de conversaciones.

### 2.4 Datos sensibles mínimos

El navegador conserva solo la información necesaria para la pantalla actual. No se persisten pacientes, informes, mensajes, DNI ni notas internas en almacenamiento permanente.

### 2.5 Accesibilidad desde el inicio

Los componentes compartidos deben ser operables con teclado, foco visible, etiquetas semánticas y mensajes asociados.

---

## 3. Stack confirmado

| Área | Tecnología |
|---|---|
| Runtime UI | React |
| Build | Vite |
| Lenguaje | JavaScript ES6+ |
| Rutas | React Router v6 |
| Estado global | Redux Toolkit |
| HTTP | Axios |
| Formularios | React Hook Form |
| Validación | Joi + `@hookform/resolvers` |
| Fechas | date-fns |
| Agenda | FullCalendar React + TimeGrid + Interaction |
| Iconos | React Icons |
| Estilos | CSS Modules + CSS Custom Properties |
| Unitarias/componentes | Vitest + React Testing Library |
| Mock HTTP | MSW |
| E2E | Playwright |

### 3.1 Dependencias que no se incorporan

- Material UI;
- Ant Design;
- Bootstrap UI;
- Tailwind CSS;
- styled-components;
- RTK Query;
- editor de texto enriquecido;
- librería de PDF;
- WebSocket en el MVP;
- almacenamiento persistente de Redux.

---

## 4. Arquitectura general

```text
Browser
│
├── PublicLayout
│   └── páginas institucionales
│
├── AuthLayout
│   └── /login
│
└── PrivateLayout
    ├── Sidebar
    ├── Topbar
    ├── Outlet
    ├── ToastContainer
    ├── SessionIdleGuard
    └── ConfirmDialogHost
         │
         ├── feature pages
         ├── API services
         └── Redux Toolkit
               │
               └── API REST /api/v1
```

El área privada vive bajo `/app/*` y se carga únicamente después de comprobar la sesión.

---

## 5. Estructura de carpetas

```text
client/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── store.js
│   │   ├── rootReducer.js
│   │   └── providers.jsx
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── feedback/
│   │   ├── forms/
│   │   ├── icons/
│   │   ├── modals/
│   │   ├── navigation/
│   │   └── tables/
│   ├── config/
│   │   ├── env.js
│   │   ├── permissions.js
│   │   ├── private-menu.js
│   │   └── routes.js
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── patients/
│   │   ├── appointments/
│   │   ├── reports/
│   │   ├── messages/
│   │   ├── users/
│   │   ├── services/
│   │   ├── catalogs/
│   │   └── audit/
│   ├── hooks/
│   ├── layouts/
│   │   ├── AuthLayout/
│   │   ├── PrivateLayout/
│   │   └── PublicLayout/
│   ├── router/
│   │   ├── AppRouter.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── PermissionRoute.jsx
│   │   └── GuestRoute.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authSession.js
│   │   ├── errorNormalizer.js
│   │   └── fileUrl.js
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── globals.css
│   │   ├── public.css
│   │   ├── private.css
│   │   ├── print.css
│   │   └── utilities.css
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── setup.js
│   ├── mocks/
│   └── e2e/
├── .env.example
├── eslint.config.js
├── package.json
└── vite.config.js
```

---

## 6. Estructura interna de una feature

Ejemplo de Pacientes:

```text
features/patients/
├── api/
│   └── patientsApi.js
├── components/
│   ├── PatientCard.jsx
│   ├── PatientTable.jsx
│   ├── PatientForm.jsx
│   ├── PatientFormModal.jsx
│   └── PatientSummary.jsx
├── hooks/
│   ├── usePatients.js
│   └── usePatient.js
├── pages/
│   ├── PatientsPage.jsx
│   └── PatientDetailPage.jsx
├── schemas/
│   └── patientSchema.js
├── utils/
│   └── patientMappers.js
└── tests/
```

### 6.1 Regla de ubicación

- Si un componente solo sirve a una feature, permanece dentro de esa feature.
- Si se usa en tres o más features y representa una abstracción estable, puede pasar a `components/common`.
- No se crea una abstracción preventiva sin uso real.

---

## 7. Layout privado

### 7.1 Estructura

```text
PrivateLayout
├── PrivateSidebar
├── PrivateTopbar
├── MainContent
│   └── Outlet
├── AlertsPopover
├── UserReadOnlyDialog
├── IdleWarningDialog
└── ToastContainer
```

### 7.2 Escritorio

- sidebar fijo y contraíble;
- topbar fija en la parte superior del contenido;
- área principal amplia;
- tablas completas;
- agenda semanal inicial;
- mensajería en dos paneles.

### 7.3 Celular

- sidebar convertido en drawer;
- topbar compacta;
- tablas convertidas en tarjetas;
- agenda diaria inicial;
- modales a pantalla completa;
- mensajería muestra lista o conversación, nunca ambas simultáneamente.

---

## 8. Diseño y estilos

El área privada comparte los tokens del sitio público y añade variables operativas.

```css
:root {
  --sidebar-width-expanded: 15rem;
  --sidebar-width-collapsed: 4.5rem;
  --topbar-height: 4rem;
  --private-content-max-width: 100rem;
  --table-row-height: 3.25rem;
  --calendar-slot-height: 3rem;
}
```

### 8.1 Regla de tokens

No se escriben colores, tipografías, radios, sombras o espaciados reutilizables directamente dentro de componentes.

### 8.2 React Icons

- familia principal consistente para interfaz;
- familias de marca solo para marcas;
- iconos importantes acompañados por texto;
- iconos decorativos con `aria-hidden`;
- tamaños mediante variables CSS.

---

## 9. Estado global y local

### 9.1 Redux Toolkit

Redux almacena:

```text
auth.status
auth.currentUser
auth.accessToken
auth.permissions
messages.unreadCount
ui.sidebarCollapsed
ui.notifications
```

### 9.2 Estado local

React maneja:

- formularios;
- modales;
- pestañas;
- filtros temporales;
- selección de tarjeta del resumen;
- datos de listados de una página;
- estado de FullCalendar;
- conversación seleccionada.

### 9.3 Sin persistencia sensible

No se usa Redux Persist ni `localStorage` para:

- tokens;
- DNI;
- pacientes;
- informes;
- mensajes;
- notas internas;
- formularios incompletos.

---

## 10. Integración HTTP

Se usa una única instancia Axios.

Responsabilidades:

- `baseURL` por entorno;
- `withCredentials: true`;
- header `Authorization: Bearer` con access token en memoria;
- correlation ID cuando el backend lo devuelve;
- refresh coordinado;
- normalización de errores;
- cancelación de solicitudes al desmontar pantallas cuando corresponda.

### 10.1 Renovación concurrente

Si varias solicitudes reciben `401` al mismo tiempo:

1. una sola inicia el refresh;
2. las demás esperan la misma promesa;
3. si refresh funciona, se reintentan una vez;
4. si falla, se limpia la sesión y se redirige a login.

No existe un ciclo infinito de reintentos.

---

## 11. Formularios

Patrón confirmado:

```text
React Hook Form
+ Joi schema
+ FormModal
+ errores del backend normalizados
```

### 11.1 Modal responsive

- escritorio: modal centrado o casi pantalla completa según extensión;
- celular: pantalla completa;
- encabezado y acciones fijas;
- cuerpo desplazable;
- confirmación al descartar cambios;
- bloqueo durante envío.

### 11.2 Formularios extensos

Pacientes y tutor permanecen en un único formulario. Informes usan un modal amplio. No se crean pasos múltiples si una sola pantalla sigue siendo comprensible.

---

## 12. Responsive design

### 12.1 Breakpoints orientativos

```css
--breakpoint-sm: 36rem;
--breakpoint-md: 48rem;
--breakpoint-lg: 64rem;
--breakpoint-xl: 80rem;
```

Los breakpoints son tokens de referencia. La decisión final depende de cuándo el contenido deja de ser usable.

### 12.2 Reglas

- controles táctiles de al menos 44 px de alto;
- acciones principales visibles;
- tablas adaptadas a tarjetas;
- filtros en drawer o acordeón;
- formularios en una columna en celular;
- textos sin truncar información crítica;
- scroll horizontal solo como último recurso.

---

## 13. Accesibilidad

Referencia: WCAG 2.1 AA.

Requisitos:

- landmarks `header`, `nav`, `main`;
- salto al contenido;
- foco visible;
- navegación completa por teclado;
- etiquetas asociadas a controles;
- errores con `aria-describedby`;
- tablas con encabezados;
- diálogos con foco atrapado y retorno de foco;
- estados no dependientes solo del color;
- `aria-live` para toasts y cambios relevantes;
- respeto a `prefers-reduced-motion`.

---

## 14. Seguridad del cliente

- access token solo en memoria;
- refresh token solo en cookie HttpOnly;
- no incluir secretos en `VITE_*`;
- no imprimir payloads sensibles en consola;
- no renderizar HTML sin sanitización;
- no usar `dangerouslySetInnerHTML` para informes o mensajes;
- enlaces externos con configuración segura;
- limpieza de estado al logout;
- cierre automático por inactividad;
- proyección de campos según rol;
- no confiar en el ocultamiento de botones como autorización.

---

## 15. Rendimiento

- lazy loading por rutas privadas;
- listados paginados;
- búsqueda con debounce;
- agenda consulta solo el intervalo visible;
- imágenes con lazy loading;
- skeletons en lugar de bloqueo global;
- memoización solo ante problemas medidos;
- no precargar módulos administrativos para profesionales.

---

## 16. Manejo de fechas

- el backend entrega timestamps ISO 8601;
- el frontend presenta la zona horaria institucional;
- date-fns formatea y compara fechas;
- no se envían strings ambiguos;
- los turnos se crean con fecha, hora y duración;
- el frontend muestra fin calculado, pero el backend lo recalcula;
- la agenda usa intervalos `[inicio, fin)`.

---

## 17. Convenciones de código

- componentes `PascalCase`;
- hooks `useSomething`;
- funciones y variables `camelCase`;
- constantes globales `UPPER_SNAKE_CASE` cuando corresponda;
- archivos de página `SomethingPage.jsx`;
- archivos de modal `SomethingModal.jsx`;
- servicios API terminados en `Api.js`;
- esquemas terminados en `Schema.js`;
- no mezclar llamada HTTP y renderizado en un componente presentacional.

---

## 18. Variables de entorno

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_FILES_URL=http://localhost:3000
VITE_APP_NAME=C.E.I.T. Mentes Luminosas
```

Las variables públicas de Vite no deben contener secretos.

---

## 19. Criterios de aceptación arquitectónicos

La arquitectura queda aceptada cuando:

- todas las rutas privadas usan `PrivateLayout`;
- el menú se deriva de permisos y rol;
- Redux no contiene datos clínicos persistidos;
- Axios renueva sesión con una sola solicitud concurrente;
- los módulos se cargan por ruta;
- formularios comparten componentes y feedback;
- el sistema visual usa tokens;
- las pantallas críticas funcionan en teclado y celular;
- las pruebas pueden ejecutarse sin backend real mediante MSW;
- no existe duplicación de layouts por rol.

---

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

---

# Mapa de pantallas y flujos privados — MVP

---

## 1. Inventario general

| Pantalla | Ruta | Presentación |
|---|---|---|
| Login | `/login` | Página |
| Resumen | `/app/resumen` | Página |
| Pacientes | `/app/pacientes` | Página |
| Detalle de paciente | `/app/pacientes/:id` | Página con pestañas |
| Nuevo/editar paciente | — | Modal |
| Agenda | `/app/agenda` | Página FullCalendar |
| Nuevo turno | — | Modal |
| Detalle/cancelación de turno | — | Modal |
| Mensajes | `/app/mensajes` | Página de dos paneles |
| Nueva conversación | — | Modal |
| Informes | `/app/informes` | Página |
| Nuevo/editar informe | — | Modal amplio |
| Informe finalizado | `/app/informes/:id` | Página imprimible |
| Usuarios | `/app/usuarios` | Página |
| Nuevo/editar usuario | — | Modal |
| Servicios | `/app/servicios` | Página con secciones |
| Nuevo/editar servicio | — | Modal |
| Servicios habituales | — | Modal |
| Catálogos | `/app/catalogos` | Página con pestañas |
| Nuevo/editar catálogo | — | Modal |
| Auditoría | `/app/auditoria` | Página |
| Detalle de auditoría | — | Modal de lectura |
| Sin permiso | `/app/403` | Página |

---

# 2. Login

## 2.1 Contenido

- logo;
- correo electrónico;
- DNI con visualización tipo contraseña;
- mostrar/ocultar DNI;
- botón Ingresar;
- volver al sitio público;
- mensajes de error.

No incluye registro, recuperación, proveedores sociales ni selector de rol.

## 2.2 Flujo

```text
Ingresar credenciales
→ POST /auth/login
→ guardar access token en memoria
→ backend deja refresh cookie HttpOnly
→ cargar usuario y permisos
→ redirigir a ruta previa o /app/resumen
```

## 2.3 Errores

- credenciales: mensaje genérico;
- cuenta inactiva: comunicarse con administración;
- `429`: esperar e intentar más tarde;
- sin conexión: error de disponibilidad.

---

# 3. Resumen

## 3.1 Encabezado

- saludo simple;
- fecha actual;
- sin mensajes motivacionales aleatorios;
- sin gráficos decorativos.

## 3.2 Tarjetas

Cada tarjeta contiene:

- icono;
- etiqueta;
- cantidad;
- estado de carga independiente;
- estado seleccionado.

## 3.3 Detalle inferior

La selección inicial es Pacientes. El detalle muestra cinco elementos como máximo y un enlace al módulo completo.

## 3.4 Flujo

```text
GET /resumen
→ renderizar tarjetas autorizadas
→ seleccionar tarjeta
→ consultar preview con endpoint del módulo si no está cargado
→ mostrar lista resumida
```

---

# 4. Pacientes

## 4.1 Listado `/app/pacientes`

### Encabezado

- título;
- botón Nuevo paciente;
- buscador por nombre, apellido o DNI;
- filtro estado;
- filtro prestador vinculado para roles globales;
- limpiar filtros.

### Tabla de escritorio

- paciente;
- edad;
- tutor;
- estado;
- prestadores vinculados;
- acciones.

### Tarjeta móvil

- nombre;
- edad;
- tutor;
- estado;
- botón Ver detalle;
- menú de acciones autorizado.

### Paginación

20 registros por página, controlada por backend.

## 4.2 Nuevo paciente

Modal conjunto con:

### Paciente obligatorio

- nombre;
- apellido;
- fecha de nacimiento.

### Paciente opcional

- DNI;
- escuela;
- diagnóstico;
- observaciones;
- posee CUD;
- vencimiento de CUD condicionado.

### Tutor obligatorio

- nombre;
- apellido;
- vínculo/parentesco;
- teléfono.

### Tutor opcional

- correo;
- dirección;
- observaciones.

## 4.3 Duplicado posible

Coincidencia por nombre, apellido y fecha genera advertencia no bloqueante. DNI repetido bloquea.

## 4.4 Creación por profesional

El backend crea paciente, tutor y vínculo con el profesional en una transacción.

## 4.5 Edición

Reutiliza el formulario de alta, precargado. Activación/desactivación son acciones separadas.

## 4.6 Detalle `/app/pacientes/:id`

Pestañas:

```text
Resumen
Turnos
Informes
Conversaciones
```

### Resumen

- datos personales;
- tutor completo;
- CUD;
- observaciones;
- vínculos activos;
- estado;
- acciones según permiso.

### Turnos

- próximos;
- históricos;
- Nuevo turno con paciente precargado.

### Informes

- listado según permiso;
- Nuevo informe para coordinación/profesional autorizado.

### Conversaciones

Solo conversaciones asociadas al paciente donde el usuario participa.

## 4.7 Desactivación

Confirmación explícita. Si existen turnos futuros activos, backend responde conflicto y la UI ofrece Ver agenda.

---

# 5. Agenda

## 5.1 Ruta

```text
/app/agenda
```

## 5.2 Toolbar

- Hoy;
- anterior;
- siguiente;
- rango visible;
- Día;
- Semana;
- filtro de prestador para admin/coordinación/secretaría;
- Nuevo turno.

## 5.3 Vista inicial

- escritorio: Semana;
- celular: Día;
- lunes a sábado;
- 08:00 a 21:00;
- línea de hora actual.

## 5.4 Creación

### Botón Nuevo turno

Formulario sin fecha/hora, salvo prestador propio cuando corresponde.

### Clic en encabezado del día

Fecha precargada, hora vacía.

### Clic en franja

Fecha y hora precargadas, duración 60 minutos.

### Campos

- paciente;
- prestador;
- servicio activo;
- consultorio;
- fecha;
- hora;
- duración;
- observación administrativa;
- notas internas según permiso.

## 5.5 Servicio

El selector incluye todos los servicios activos del centro. Los habituales pueden ordenarse primero, pero no son una restricción.

## 5.6 Detalle de turno

Clic en evento abre modal con datos y acciones válidas.

No existe edición general. Cambios de fecha/hora/duración/consultorio/servicio/prestador requieren cancelar y crear otro.

## 5.7 Estados

```text
pendiente → confirmado | cancelado
confirmado → completado | ausente | cancelado
```

No hay transiciones desde completado, ausente o cancelado.

---

# 6. Informes

## 6.1 Listado `/app/informes`

- búsqueda;
- estado;
- paciente;
- autor;
- tipo;
- tabla/tarjetas;
- paginación de 20.

Columnas:

- título;
- paciente;
- tipo;
- autor;
- fecha;
- estado;
- acciones.

## 6.2 Alta/edición

Modal amplio con:

- paciente;
- tipo;
- título;
- resumen;
- contenido.

Acciones:

- Cancelar;
- Guardar borrador;
- Finalizar informe.

No hay autosave ni editor enriquecido.

## 6.3 Finalización

Confirmación reforzada. El informe se vuelve inmutable.

## 6.4 Lectura e impresión

Ruta de solo lectura con botón Imprimir / Guardar como PDF del navegador.

Los estilos de impresión ocultan navegación y acciones.

## 6.5 Autor inactivo

- informes finalizados siguen visibles;
- borradores quedan bloqueados;
- no se reasignan;
- admin y coordinación pueden verlos según backend.

---

# 7. Mensajería

## 7.1 Escritorio

```text
Lista de conversaciones | Conversación seleccionada
```

## 7.2 Celular

- listado;
- selección abre conversación;
- botón Volver.

## 7.3 Lista

- Nueva conversación;
- buscar;
- filtros Todas / No leídas / Archivadas;
- título;
- participantes;
- último mensaje resumido;
- fecha;
- badge no leído.

## 7.4 Conversación

- título;
- categoría;
- paciente opcional;
- participantes;
- historial;
- respuesta;
- agregar participante;
- archivar/desarchivar.

## 7.5 Nueva conversación

Modal:

- uno o más destinatarios;
- categoría;
- paciente opcional;
- título;
- primer mensaje.

## 7.6 Reglas

- creador incluido automáticamente;
- solo participantes ven y responden;
- cualquier participante agrega usuarios;
- nuevos participantes ven historial, pero el historial previo no nace como no leído;
- no se quitan participantes;
- mensajes inmutables;
- sin adjuntos, reacciones o menciones.

---

# 8. Usuarios

## 8.1 Vista directorio

Coordinación y secretaría ven usuarios activos con proyección limitada:

- foto;
- nombre;
- título;
- función;
- especialidad;
- rol;
- servicios habituales.

No ven DNI, correo de acceso, teléfono personal ni usuarios inactivos.

## 8.2 Vista administrativa

Administrador ve activos e inactivos y puede:

- crear;
- editar;
- cambiar rol;
- activar/desactivar;
- restablecer acceso;
- gestionar publicación;
- cargar/reemplazar/eliminar foto.

## 8.3 Formulario

Secciones:

### Acceso

- nombre;
- apellido;
- DNI;
- correo;
- rol.

### Información profesional

- título;
- especialidad condicionada;
- teléfono;
- biografía.

### Presentación pública

- foto;
- función pública;
- visible públicamente;
- orden público.

## 8.4 Cambio de DNI

Debe mostrar advertencia: actualiza la credencial y cierra todas las sesiones.

---

# 9. Servicios

## 9.1 Secciones

```text
Servicios del centro
Servicios habituales por prestador
```

## 9.2 Servicios del centro

- imagen;
- nombre;
- descripción;
- activo;
- visible públicamente;
- orden público.

Solo admin crea y modifica catálogo/publicación.

## 9.3 Servicios habituales

Admin, coordinación y secretaría pueden asociar servicios a prestadores. La asociación sirve para organización y orden preferente en formularios.

No impide elegir otro servicio activo en un turno.

---

# 10. Catálogos

Ruta exclusiva del administrador con pestañas:

- Consultorios;
- Tipos de informe;
- Categorías de conversación.

Cada pestaña permite:

- listar;
- crear;
- editar;
- activar/desactivar;
- buscar.

No se eliminan físicamente registros usados.

---

# 11. Auditoría

## 11.1 Listado

- fecha;
- usuario;
- acción;
- recurso;
- resultado;
- IP;
- filtros;
- 20 por página;
- orden descendente.

## 11.2 Detalle

Modal de solo lectura con metadatos permitidos y correlation ID.

Nunca muestra credenciales, DNI, mensajes, contenido clínico ni notas internas.

---

# 12. Flujos críticos E2E

## 12.1 Profesional crea paciente y turno

```text
Login
→ Pacientes
→ Nuevo paciente
→ completar paciente+tutor
→ crear y vincular
→ abrir detalle
→ Nuevo turno
→ elegir servicio activo
→ guardar pendiente
→ verificar agenda propia
```

## 12.2 Secretaría agenda primer turno

```text
Agenda
→ clic en franja
→ seleccionar paciente y prestador
→ backend crea vínculo si no existe
→ turno pendiente
→ aparece en calendario
```

## 12.3 Cancelación y nuevo turno

```text
Abrir turno
→ Cancelar
→ motivo obligatorio
→ confirmar
→ horario liberado
→ clic en nuevo horario
→ crear turno nuevo
```

No existe reprogramación.

## 12.4 Informe

```text
Paciente vinculado
→ Informes
→ Nuevo informe
→ guardar borrador
→ editar
→ finalizar con confirmación
→ vista de lectura
→ imprimir/guardar PDF
```

## 12.5 Mensajería

```text
Nueva conversación
→ elegir participantes/categoría/paciente
→ enviar primer mensaje
→ otro participante responde
→ contador no leído cambia
→ abrir conversación marca lectura
```

---

# 13. Criterios de aceptación del mapa

- Todas las acciones de alta/edición confirmadas abren modal.
- El detalle de paciente conserva cuatro pestañas.
- Agenda ofrece Día y Semana, sin mes.
- No se arrastran eventos.
- Informes finalizados no muestran editar.
- Conversaciones no participantes no aparecen.
- Profesional no dispone de pantallas Usuarios o Servicios.
- Auditoría es solo lectura.
- Cada pantalla tiene loading, empty y error.

---

# Componentes, formularios y feedback — Frontend privado MVP

---

## 1. Objetivo

Definir componentes reutilizables y reglas uniformes para formularios, modales, tablas, estados y mensajes. La meta es evitar que cada módulo implemente una experiencia diferente.

---

## 2. Catálogo de componentes

### 2.1 Layout y navegación

- `PrivateLayout`
- `PrivateSidebar`
- `PrivateTopbar`
- `SidebarNavItem`
- `MobileDrawer`
- `PageHeader`
- `Breadcrumbs`
- `UserSummaryButton`
- `AlertsButton`
- `SkipToContent`

### 2.2 Botones

- `Button`
- `IconButton`
- `LinkButton`
- `DangerButton`
- `SplitAction` solo si un caso real lo requiere

Variantes:

```text
primary
secondary
outline
ghost
danger
```

Tamaños mediante tokens. Todo botón debe tener estado `disabled`, `loading` y foco visible.

### 2.3 Formularios

- `FormField`
- `Input`
- `PasswordInput`
- `Select`
- `AsyncSelect`
- `MultiSelect`
- `Textarea`
- `Checkbox`
- `DateInput`
- `TimeInput`
- `DurationSelect`
- `FileInput`
- `FormSection`
- `FormErrorSummary`
- `RequiredMark`

### 2.4 Feedback

- `ToastContainer`
- `Toast`
- `Alert`
- `InlineError`
- `LoadingSpinner`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `UnauthorizedState`
- `SessionExpiredNotice`

### 2.5 Modales

- `BaseModal`
- `FormModal`
- `FullScreenFormModal`
- `ConfirmDialog`
- `ReadOnlyDialog`
- `IdleWarningDialog`

### 2.6 Datos

- `DataTable`
- `ResponsiveDataList`
- `Pagination`
- `SearchInput`
- `FilterBar`
- `FilterDrawer`
- `SortSelect`
- `StatusBadge`
- `Avatar`
- `DefinitionList`
- `Tabs`

### 2.7 Dominio compartido

- `PatientSummary`
- `TutorSummary`
- `UserSummary`
- `AppointmentStatusBadge`
- `ReportStatusBadge`
- `ConversationUnreadBadge`

---

## 3. Patrón de modal

### 3.1 Estructura

```text
Dialog
├── Header fijo
│   ├── título
│   └── cerrar
├── Body desplazable
│   └── formulario/contenido
└── Footer fijo
    ├── cancelar
    └── acción principal
```

### 3.2 Reglas

- `role="dialog"`;
- `aria-modal="true"`;
- `aria-labelledby` apuntando al título;
- foco inicial en título o primer campo;
- foco atrapado;
- `Escape` cierra salvo guardado activo;
- retorno de foco al disparador;
- bloqueo de scroll del fondo;
- confirmación si hay cambios no guardados.

### 3.3 Tamaños

- `sm`: confirmaciones;
- `md`: catálogos;
- `lg`: turnos, usuarios, servicios;
- `xl`: paciente+tutor;
- `fullscreen`: informes y celulares.

En celular, todos los formularios relevantes ocupan la pantalla completa.

---

## 4. Formularios con React Hook Form y Joi

### 4.1 Flujo

```text
Joi schema
→ resolver
→ React Hook Form
→ submit mapper
→ API
→ field errors o éxito
```

### 4.2 Validación por capas

Frontend valida:

- obligatorios;
- formatos;
- dependencias simples;
- longitudes;
- fechas evidentes;
- experiencia inmediata.

Backend valida definitivamente:

- permisos;
- unicidad;
- relaciones;
- estados;
- solapamientos;
- integridad transaccional.

### 4.3 Errores del backend

Formato esperado:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisá los datos enviados.",
    "fields": {
      "tutor.telefono": "El teléfono es obligatorio."
    }
  }
}
```

El mapper debe asociar rutas anidadas con `setError`.

---

## 5. Formulario de paciente y tutor

### 5.1 Secciones

```text
Datos del paciente
CUD
Datos del tutor
Información adicional
```

### 5.2 Dependencias

- `cudFechaVencimiento` se muestra y exige si `poseeCud=true`;
- DNI es opcional, pero si existe se valida formato;
- edad se calcula, no se guarda manualmente;
- tutor siempre obligatorio;
- el formulario se envía como una sola operación.

### 5.3 Advertencia de duplicado

El backend puede responder una advertencia con coincidencias similares. La UI muestra un segundo diálogo:

```text
Encontramos un paciente con datos similares.
[Revisar datos] [Crear de todas formas]
```

La segunda solicitud incluye un indicador explícito autorizado por contrato, nunca omite validaciones.

---

## 6. Formulario de turno

### 6.1 Campos

- paciente;
- prestador;
- servicio;
- consultorio;
- fecha;
- hora;
- duración;
- observación administrativa;
- notas internas autorizadas.

### 6.2 Dependencias

- profesional autenticado: prestador fijo;
- paciente: solo vinculados para profesional;
- servicio: todos los activos, habituales primero opcionalmente;
- fin mostrado se calcula desde inicio+duración;
- fecha/hora pueden precargarse desde agenda.

### 6.3 Conflicto

Ante `409` el modal permanece abierto y destaca el tipo de conflicto:

- prestador;
- paciente;
- consultorio.

No se ocultan los campos ya ingresados.

---

## 7. Formulario de informe

### 7.1 Modal amplio

Campos:

- paciente;
- tipo;
- título;
- resumen;
- contenido.

### 7.2 Acciones

- Cancelar;
- Guardar borrador;
- Finalizar informe.

### 7.3 Sin editor enriquecido

El contenido es texto plano multilínea. React renderiza preservando saltos de línea mediante CSS seguro. No se procesa HTML del usuario.

### 7.4 Finalización

`Finalizar` abre confirmación independiente y solo continúa si el borrador cumple todas las validaciones.

---

## 8. Formulario de conversación

- destinatarios múltiples;
- categoría;
- paciente opcional;
- título;
- primer mensaje.

El selector de destinatarios usa el directorio interno mínimo, incluso para profesionales, sin exponer el módulo Usuarios.

No se permite destinatario inactivo.

---

## 9. Formulario de usuario

### 9.1 Acceso

- nombre;
- apellido;
- DNI;
- correo;
- rol.

### 9.2 Profesional/institucional

- título;
- especialidad;
- teléfono;
- biografía;
- función pública;
- publicación;
- orden;
- fotografía.

### 9.3 Reglas

- especialidad requerida para rol profesional;
- admin nunca publicable;
- cambio de DNI advierte sobre regeneración de credencial y revocación de sesiones;
- fotografía usa endpoint multipart separado, aunque la UI lo presente integrada.

---

## 10. Feedback global

### 10.1 Toast

Uso:

- creación exitosa;
- actualización;
- confirmación de estado;
- mensaje enviado;
- error breve recuperable.

No usar toast para:

- contenido clínico;
- confirmaciones;
- errores de campos;
- mensajes que requieran lectura prolongada.

### 10.2 Duración

- éxito: 4 segundos;
- info: 5 segundos;
- error: permanece más tiempo o requiere cierre manual según gravedad.

### 10.3 Accesibilidad

- `role="status"` para éxito/info;
- `role="alert"` para error;
- no mover el foco automáticamente al toast.

---

## 11. Cargas

### 11.1 Página

Skeletons compatibles con la forma final.

### 11.2 Acción

El botón cambia texto:

```text
Guardando…
Enviando…
Confirmando…
Cancelando…
```

### 11.3 Agenda

No desaparece el calendario. Se muestra una capa discreta o indicador en toolbar.

### 11.4 Doble envío

El submit se deshabilita desde el primer envío hasta resolución.

---

## 12. Estados vacíos

Cada estado vacío debe explicar el contexto y ofrecer acción autorizada.

Ejemplos:

```text
No se encontraron pacientes.
No hay turnos para el período seleccionado.
No hay informes que coincidan con los filtros.
Todavía no participás en conversaciones.
```

No mostrar botones de creación a roles sin permiso.

---

## 13. Confirmaciones sensibles

Requieren `ConfirmDialog`:

- activar/desactivar usuario;
- activar/desactivar paciente;
- vincular/desvincular prestador cuando corresponda;
- restablecer acceso;
- quitar servicio habitual;
- finalizar informe;
- activar/desactivar catálogo;
- eliminar foto o imagen;
- descartar cambios.

### 13.1 Cancelar turno

Utiliza modal específico con motivo obligatorio, no un diálogo genérico.

---

## 14. Estados y badges

### 14.1 Turnos

- pendiente;
- confirmado;
- completado;
- cancelado;
- ausente.

### 14.2 Informes

- borrador;
- finalizado.

### 14.3 Entidades

- activo;
- inactivo;
- visible públicamente;
- oculto públicamente.

Todo badge incluye texto; el color es complementario.

---

## 15. Tablas y tarjetas móviles

### 15.1 Tabla

- encabezados accesibles;
- ordenamiento explícito;
- acciones en última columna;
- filas seleccionables solo si se comunica correctamente;
- no colocar cinco botones visibles por fila: usar menú contextual cuando sea necesario.

### 15.2 Celular

`ResponsiveDataList` convierte cada registro en tarjeta con etiqueta-valor. Las acciones principales se mantienen visibles.

---

## 16. Filtros y búsquedas

### 16.1 Búsqueda

- debounce 400 ms;
- comienza con 2 caracteres;
- limpiar;
- vuelve a página 1;
- no persiste al recargar.

### 16.2 Filtros

- escritorio: barra visible;
- celular: drawer;
- aplicación inmediata;
- `Limpiar filtros`;
- estado temporal por módulo.

---

## 17. Cambios sin guardar

Se detectan mediante `formState.isDirty`.

Al cerrar:

```text
Hay cambios sin guardar.
[Continuar editando] [Descartar cambios]
```

No se usa `beforeunload` de forma indiscriminada; se limita a formularios extensos abiertos y según soporte del navegador.

---

## 18. Errores HTTP normalizados

| HTTP | Tratamiento |
|---|---|
| 400 | mensaje general de solicitud inválida |
| 401 | refresh o cierre de sesión |
| 403 | sin permiso |
| 404 | recurso no disponible |
| 409 | conflicto de negocio contextual |
| 422 | campos y resumen de validación |
| 429 | límite de intentos |
| 500 | error genérico + correlation ID opcional |

No se muestra stack trace ni mensaje interno.

---

## 19. Pruebas mínimas de componentes

- foco y cierre de modal;
- confirmación de cambios;
- mapeo de errores de campos;
- botón loading;
- toast accesible;
- tabla y tarjeta móvil;
- PermissionGate;
- estados vacíos;
- formularios con dependencias;
- cancelación de turno con motivo.

---

## 20. Criterios de aceptación

- Todos los formularios usan el mismo patrón.
- Los errores no borran información ingresada.
- Los diálogos devuelven el foco.
- No hay valores visuales mágicos repetidos.
- No hay HTML de usuario renderizado.
- Las acciones sensibles siempre confirman.
- Las cargas evitan doble submit.
- Los estados vacíos son específicos.

---

# Estado, autenticación e integración API — Frontend privado MVP

---

## 1. Objetivo

Definir cómo se administra la sesión, qué información vive en Redux, cómo se consumen los endpoints y cómo se manejan renovación, errores, inactividad y concurrencia.

---

## 2. Estado global

### 2.1 Store

```text
auth
messages
ui
```

No se crean slices por cada entidad si la información solo se usa en una pantalla.

### 2.2 `authSlice`

```js
{
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated',
  currentUser: null,
  accessToken: null,
  permissions: [],
  sessionReason: null
}
```

`currentUser` contiene únicamente la proyección necesaria para navegación y presentación.

### 2.3 `messagesSlice`

```js
{
  unreadCount: 0,
  recentActivity: [],
  lastUpdatedAt: null
}
```

No almacena el historial completo de conversaciones.

### 2.4 `uiSlice`

```js
{
  sidebarCollapsed: false,
  toasts: [],
  globalBusyReason: null
}
```

El estado del sidebar puede persistirse como preferencia no sensible. Ningún dato clínico se persiste.

---

## 3. Estado de páginas

Cada feature puede usar un hook local con:

```js
{
  data,
  isLoading,
  error,
  pagination,
  filters
}
```

No se crea un store global de pacientes o informes. Después de una mutación:

- se actualiza el registro local cuando es seguro;
- o se vuelve a consultar el listado;
- o se invalida el preview del resumen.

---

## 4. Inicio de sesión

### 4.1 Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@centro.test",
  "dni": "12345678"
}
```

### 4.2 Respuesta esperada

```json
{
  "data": {
    "accessToken": "...",
    "user": {
      "id": "uuid",
      "nombre": "Valentina",
      "apellido": "Ríos",
      "rol": "profesional",
      "titulo": "Licenciada en Psicopedagogía",
      "funcion": "Psicopedagoga clínica",
      "fotoUrl": "/uploads/usuarios/archivo.webp"
    },
    "permissions": [
      "patients.readLinked",
      "appointments.manageOwn",
      "reports.createLinked"
    ]
  }
}
```

El refresh token no aparece en el body; queda en cookie HttpOnly.

---

## 5. Recuperación de sesión

Al montar la aplicación:

```text
status = checking
→ POST /auth/refresh
→ si funciona: authenticated
→ si no hay sesión: unauthenticated
```

No se muestra brevemente el panel antes de saber el estado.

---

## 6. Axios

### 6.1 Instancia

```js
const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 15000,
});
```

### 6.2 Request interceptor

Agrega access token si existe.

### 6.3 Response interceptor

- normaliza errores;
- intenta refresh ante `401` elegible;
- no refresca login/refresh/logout;
- reintenta la solicitud original una vez;
- cierra sesión si refresh falla.

---

## 7. Cola de refresh

Debe existir una única promesa compartida:

```text
401 A ─┐
401 B ─┼→ un solo POST /auth/refresh
401 C ─┘
       ├→ éxito: reintentar A, B y C
       └→ fallo: logout local único
```

Cada request se marca con `_retry` para evitar loops.

---

## 8. Logout

### 8.1 Manual

```http
POST /api/v1/auth/logout
```

Después, aunque la red falle:

- se limpia access token;
- se limpia usuario;
- se limpian datos locales sensibles;
- se cierran modales;
- se redirige a `/login`.

Si la API no respondió, se muestra un aviso no técnico, pero la sesión del navegador se considera cerrada.

### 8.2 Por inactividad

Mismo endpoint, con razón local `idle_timeout` para el mensaje de UX. El backend no necesita confiar en esa razón.

### 8.3 Todas las sesiones

Solo se usa en operaciones administrativas específicas del backend, como restablecimiento o desactivación. No es una acción del usuario común.

---

## 9. Inactividad

### 9.1 Temporización

```text
30 minutos sin actividad útil
→ advertencia
5 minutos adicionales
→ logout
```

### 9.2 Actividad válida

- clic;
- teclado;
- navegación;
- submit;
- interacción táctil.

No se cuenta el movimiento continuo del mouse.

### 9.3 Advertencia

El diálogo muestra cuenta regresiva aproximada y acciones:

- Continuar sesión;
- Cerrar sesión.

Continuar puede solicitar refresh si el access token está próximo a vencer.

### 9.4 Varias pestañas

Para el MVP, la señal de logout se comparte mediante `BroadcastChannel` cuando esté disponible. Si una pestaña cierra sesión, las otras limpian su estado.

No se comparten datos clínicos entre pestañas.

---

## 10. Alertas de mensajes

No se implementan WebSockets.

Estrategia MVP:

- consultar contador al entrar al panel;
- consultar cada 60 segundos mientras la pestaña está visible;
- pausar polling cuando `document.hidden=true`;
- refrescar después de enviar, leer o archivar;
- no mostrar contenido sensible en notificaciones del sistema operativo.

Endpoint recomendado:

```http
GET /api/v1/conversaciones/no-leidas/resumen?limit=5
```

---

## 11. Resumen operativo

Endpoint agregado recomendado:

```http
GET /api/v1/resumen
```

La respuesta es role-aware y contiene solo contadores autorizados:

```json
{
  "data": {
    "cards": [
      { "key": "patients", "label": "Pacientes activos", "count": 18 },
      { "key": "appointmentsToday", "label": "Turnos de hoy", "count": 7 }
    ]
  }
}
```

Los previews usan endpoints existentes con `limit=5`. Esto evita un payload enorme y permite cargar el detalle al seleccionar tarjeta.

---

## 12. Listados y query params

### 12.1 Convención

```text
page=1
limit=20
search=texto
sort=apellido
order=asc
```

Los filtros se agregan según recurso.

### 12.2 Pacientes

```http
GET /pacientes?page=1&limit=20&search=juan&activo=true&prestadorId=...
```

### 12.3 Informes

```http
GET /informes?page=1&limit=20&estado=borrador&pacienteId=...
```

### 12.4 Auditoría

```http
GET /auditoria?page=1&limit=20&desde=...&hasta=...&accion=...
```

---

## 13. Agenda por intervalo

```http
GET /turnos?desde=2026-08-03T00:00:00-03:00&hasta=2026-08-10T00:00:00-03:00&prestadorId=...
```

Reglas:

- `hasta` exclusivo;
- solo rango visible;
- profesional no puede forzar otro prestador;
- backend ignora o rechaza filtros no autorizados;
- eventos devuelven `inicioAt`, `finAt`, estado y proyección necesaria.

---

## 14. Errores normalizados

Objeto interno:

```js
{
  status,
  code,
  message,
  fields,
  correlationId,
  retryable
}
```

### 14.1 Mensajes

El normalizador traduce códigos técnicos a textos de UX. No usa el mensaje crudo como única fuente.

### 14.2 Correlation ID

Puede mostrarse en errores inesperados:

```text
Código de referencia: abc-123
```

No se muestra en validaciones comunes.

---

## 15. Cancelación de requests

Los listados con búsqueda pueden usar `AbortController`:

- nueva búsqueda cancela anterior;
- desmontar página cancela consulta;
- una cancelación no genera toast de error.

Las mutaciones no se cancelan una vez enviadas salvo soporte explícito del backend.

---

## 16. Archivos

### 16.1 URL

La API devuelve ruta relativa. El frontend construye URL con `VITE_FILES_URL`.

### 16.2 Carga

Fotografías e imágenes se envían por `multipart/form-data` a endpoints específicos.

### 16.3 Seguridad

- validar extensión y tamaño en UI;
- backend valida realmente;
- preview usa URL local temporal revocada después;
- no guardar base64 en Redux.

---

## 17. Caché y revalidación

Sin RTK Query, la estrategia es explícita:

- catálogos activos pueden mantenerse en memoria de feature durante la sesión;
- directorios de selectores se vuelven a cargar al abrir un modal si están obsoletos;
- después de crear/editar se actualiza o recarga;
- no se cachean informes completos ni mensajes en almacenamiento persistente;
- navegar hacia atrás puede conservar el listado mientras la página siga montada.

---

## 18. Seguridad de campos

El frontend no solicita deliberadamente campos que el rol no utiliza.

Ejemplos:

- directorio para coordinación/secretaría sin DNI;
- selector de destinatarios sin correo de acceso;
- evento de agenda sin notas internas para admin/secretaría;
- conversación sin participantes ajenos;
- auditoría sin contenido clínico.

---

## 19. MSW

Los mocks representan el contrato real:

- éxito;
- validación;
- conflicto;
- permiso;
- expiración;
- rate limit;
- servidor caído.

No se usan respuestas ideales únicamente. Cada feature debe probar al menos un error de negocio.

---

## 20. Criterios de aceptación

- Nunca hay más de un refresh concurrente.
- Los tokens no persisten.
- El polling se pausa en pestaña oculta.
- Logout se propaga entre pestañas cuando sea posible.
- Los listados usan paginación backend.
- La agenda consulta intervalos.
- Los errores tienen correlation ID cuando corresponde.
- Los datos del rol se obtienen desde backend, no se infieren solo por menú.

---

# Agenda, mensajería e informes — Especificación profunda del MVP

---

# 1. Agenda

## 1.1 Objetivo

Ofrecer una agenda intuitiva, visualmente similar a Google Calendar, sin copiar su producto ni incorporar funciones incompatibles con las reglas del centro.

La agenda debe permitir comprender rápidamente:

- qué turnos existen;
- cuándo y dónde ocurren;
- paciente;
- prestador;
- servicio;
- estado;
- acciones permitidas.

---

## 1.2 Biblioteca y plugins

```text
@fullcalendar/react
@fullcalendar/timegrid
@fullcalendar/interaction
```

No se requiere vista mensual ni plugin premium.

---

## 1.3 Configuración funcional

```jsx
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
  hiddenDays={[0]}
  slotMinTime="08:00:00"
  slotMaxTime="21:00:00"
  allDaySlot={false}
  selectable
  editable={false}
  eventStartEditable={false}
  eventDurationEditable={false}
  nowIndicator
  dateClick={handleDateClick}
  eventClick={handleEventClick}
  datesSet={handleVisibleRangeChange}
/>
```

El ejemplo es orientativo. La implementación final debe respetar la API de la versión instalada.

---

## 1.4 Toolbar propia

Se recomienda una toolbar React propia para controlar:

- anterior;
- siguiente;
- hoy;
- título del rango;
- Día;
- Semana;
- selector de prestador;
- Nuevo turno.

Esto permite mantener estilos institucionales y comportamiento responsive sin depender completamente del header interno de FullCalendar.

---

## 1.5 Clic en día

En vista Semana, el encabezado del día se renderiza como un botón accesible. Al seleccionarlo:

```js
openAppointmentModal({
  date: selectedDate,
  time: null,
});
```

No se necesita habilitar all-day events.

---

## 1.6 Clic en franja horaria

`dateClick` abre el formulario con:

- fecha;
- hora;
- duración default 60;
- prestador actual cuando corresponde.

El frontend redondea a la granularidad visual configurada, pero el backend valida las duraciones permitidas.

---

## 1.7 Turnos en el calendario

### Contenido mínimo

```text
10:30–11:30
Juan Pérez
Psicopedagogía
```

Cuando se visualizan todos los prestadores:

```text
Lic. Valentina Ríos
```

En eventos de poco alto se prioriza:

- hora;
- paciente;
- estado.

El resto se muestra en detalle.

---

## 1.8 Colores y accesibilidad

Tokens por estado:

```css
--appointment-pending-bg;
--appointment-pending-border;
--appointment-confirmed-bg;
--appointment-confirmed-border;
--appointment-completed-bg;
--appointment-completed-border;
--appointment-cancelled-bg;
--appointment-cancelled-border;
--appointment-absent-bg;
--appointment-absent-border;
```

Cada evento incluye etiqueta de estado accesible. No depende solo del color.

---

## 1.9 Filtro de prestador

### Profesional

No existe selector. Backend limita a agenda propia.

### Administración, coordinación y secretaría

Opciones:

```text
Todos los prestadores
Prestador 1
Prestador 2
...
```

El valor se conserva mientras la página está montada. No se persiste.

---

## 1.10 Creación de turno

### Datos obligatorios

- paciente activo;
- prestador activo con rol adecuado;
- servicio activo;
- consultorio activo;
- fecha;
- hora;
- duración permitida.

### Servicio activo

Todos los servicios activos son seleccionables. Los servicios habituales pueden aparecer primero con una separación visual:

```text
Habituales
Otros servicios activos
```

No se bloquea la selección de “Otros”.

### Vínculo

- profesional: paciente ya vinculado;
- admin/coordinación/secretaría: backend crea vínculo automáticamente si no existe;
- la creación del vínculo y turno ocurre en una transacción.

---

## 1.11 Detalle y acciones

Modal de detalle:

- paciente y tutor;
- prestador;
- servicio;
- consultorio;
- fecha;
- inicio/fin;
- duración;
- estado;
- observación administrativa;
- notas internas según permiso;
- autoría de cancelación si aplica.

Acciones derivadas del estado:

```text
pendiente: confirmar, cancelar
confirmado: completar, ausente, cancelar
completado: lectura
cancelado: lectura
ausente: lectura
```

---

## 1.12 Sin reprogramación

No se muestran:

- editar turno;
- mover;
- redimensionar;
- reprogramar.

El flujo correcto es:

```text
cancelar original con motivo
→ crear nuevo turno
```

El frontend puede ofrecer `Crear nuevo turno` después de cancelar y precargar paciente/prestador/servicio, pero la fecha/hora debe elegirse nuevamente y se crea un ID distinto.

---

## 1.13 Notas por campo

### `observacion_administrativa`

Visible y editable por admin, coordinación, secretaría y prestador responsable.

### `notas_internas`

Visible y editable solo por coordinación y prestador responsable.

El frontend debe excluir el campo del DOM cuando el usuario no tiene permiso, no solo deshabilitarlo.

---

## 1.14 Consultas

Vista Día consulta el día. Vista Semana consulta el rango visible. Un cambio de filtro cancela la request anterior.

---

# 2. Mensajería

## 2.1 Objetivo

Proveer comunicación interna trazable y simple sin pretender reemplazar una plataforma de chat en tiempo real.

---

## 2.2 Diseño

### Escritorio

- columna izquierda: conversaciones;
- panel derecho: detalle;
- ancho de lista estable y panel flexible.

### Celular

- ruta/listado;
- conversación ocupa pantalla;
- volver conserva scroll y filtros.

---

## 2.3 Lista de conversaciones

Campos:

- título;
- categoría;
- participantes resumidos;
- paciente opcional;
- fecha del último mensaje;
- fragmento seguro;
- badge no leído;
- archivada para usuario.

El fragmento no se muestra en topbar si puede exponer contenido sensible; la topbar puede limitarse a título y participantes.

---

## 2.4 Lectura

Al abrir:

1. consulta conversación;
2. backend verifica participación;
3. renderiza historial;
4. actualiza puntero de último mensaje leído;
5. refresca contador global.

No se marca leída por hover ni por aparecer parcialmente en la lista.

---

## 2.5 Envío

- texto obligatorio;
- botón deshabilitado mientras envía;
- no se permite mensaje vacío;
- no hay edición ni eliminación;
- después de éxito se agrega respuesta y se mantiene scroll al final;
- ante error se conserva el texto.

No se implementa envío optimista irreversible. Puede mostrarse estado “Enviando…” hasta confirmación.

---

## 2.6 Participantes

Cualquier participante puede agregar usuarios activos.

Modal:

- buscar por nombre;
- seleccionar uno o varios;
- excluir participantes actuales;
- confirmar.

Los nuevos participantes ven historial completo. Su puntero inicial evita que todo el historial anterior cuente como no leído.

---

## 2.7 Archivado

Archivar afecta únicamente al participante actual.

- archivada desaparece de Todas si el filtro así lo define;
- puede verse en Archivadas;
- responder o recibir actividad no necesariamente desarchiva automáticamente salvo decisión posterior; para el MVP se mantiene el estado individual hasta que el usuario desarchive.

---

## 2.8 Alertas

- contador de conversaciones no leídas;
- polling cada 60 segundos en pestaña visible;
- actualización inmediata al leer/enviar;
- sin WebSocket;
- sin notificación del sistema operativo;
- sin email/WhatsApp/push.

---

## 2.9 Seguridad

- solo participantes;
- admin/coordinación no tienen bypass;
- no renderizar HTML;
- auditoría registra acción, nunca contenido;
- listado no expone destinatarios inactivos para nuevas conversaciones;
- conversaciones existentes conservan historial de usuarios inactivos.

---

# 3. Informes

## 3.1 Objetivo

Permitir creación, revisión, finalización, lectura e impresión de informes con controles estrictos de autoría e inmutabilidad.

---

## 3.2 Listado

### Filtros

- búsqueda título/paciente;
- estado;
- paciente;
- autor;
- tipo.

El backend limita opciones según rol.

### Columnas

- título;
- paciente;
- tipo;
- autor;
- fecha de creación/emisión;
- estado;
- acciones.

---

## 3.3 Creación

### Profesional

- solo pacientes vinculados activos;
- autor automático.

### Coordinación

- cualquier paciente activo;
- autor automático.

### Admin/secretaría

No se muestra botón Nuevo informe.

---

## 3.4 Borrador

- editable solo por autor;
- puede guardarse varias veces;
- no se elimina;
- no hay autosave;
- contenido permanece en backend tras guardado explícito.

---

## 3.5 Finalización

Condiciones:

- autor autenticado;
- estado borrador;
- campos requeridos completos;
- confirmación explícita.

Efectos:

- estado finalizado;
- fecha de emisión;
- inmutable;
- evento auditado.

---

## 3.6 Lectura

### Profesional vinculado

Lee todos los informes del paciente vinculado.

### Administración, coordinación y secretaría

Leen contenido completo según regla confirmada.

### Auditoría

Toda visualización se registra, sin contenido.

---

## 3.7 Vista imprimible

Estructura:

```text
Logo y datos institucionales
Tipo de informe
Título
Paciente
Autor
Fecha
Resumen
Contenido
```

CSS `@media print`:

- oculta sidebar/topbar/botones;
- usa ancho de hoja;
- evita cortes en encabezados;
- permite saltos naturales;
- no imprime URL ni controles visuales innecesarios cuando el navegador lo permita.

---

## 3.8 Guardar como PDF

Se usa el diálogo de impresión del navegador. No existe endpoint PDF ni archivo persistido en el MVP.

---

## 3.9 Privacidad

- no persistir borrador local;
- no copiar contenido en logs;
- no mostrar contenido en toast;
- no incluir informe en mensajes de error;
- limpiar estado del modal al cerrar/logout;
- advertir antes de perder cambios.

---

# 4. Pruebas críticas

## Agenda

- vista semana/día;
- rango lunes-sábado;
- clic día/hora;
- profesional fijo;
- servicio activo no habitual aceptado;
- conflictos 409;
- estados válidos;
- notas por rol;
- ausencia de drag/resize/reprogramar.

## Mensajería

- solo participantes;
- no leído;
- nuevo participante;
- historial no contado como no leído;
- archivado individual;
- error conserva texto.

## Informes

- botones por rol;
- autoría;
- borrador;
- confirmación final;
- inmutabilidad;
- lectura auditada;
- impresión sin navegación.

---

# Plan de implementación y pruebas — Frontend privado MVP

---

## 1. Estrategia

El panel se implementará por cortes verticales. Cada etapa debe incluir:

```text
ruta
→ pantalla
→ componentes
→ API
→ permisos
→ loading/empty/error
→ responsive
→ accesibilidad
→ pruebas
```

No se considera terminada una pantalla solo porque renderiza datos exitosos.

---

## 2. Etapa 0 — Bootstrap

### Tareas

- crear Vite React JavaScript;
- configurar alias `@`;
- ESLint y Prettier;
- Vitest y Testing Library;
- MSW;
- Playwright;
- variables de entorno;
- estructura de carpetas;
- scripts de npm;
- CI inicial.

### Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

### DoD

- build exitoso;
- lint sin errores;
- test smoke;
- `.env.example` documentado;
- PR template disponible.

---

## 3. Etapa 1 — Sistema visual y componentes base

### Tareas

- integrar tokens públicos;
- agregar tokens privados;
- reset/global/private/print CSS;
- Button, Input, Select, Textarea;
- BaseModal, FormModal, ConfirmDialog;
- Toast;
- Skeleton, EmptyState, ErrorState;
- DataTable, Pagination, StatusBadge;
- React Icons centralizados.

### Pruebas

- keyboard/focus;
- variantes;
- dialog accesible;
- toast aria-live;
- responsive básico.

---

## 4. Etapa 2 — Router y layout privado

### Tareas

- `PrivateLayout`;
- sidebar expandido/contraído/drawer;
- topbar;
- rutas lazy;
- 403/404;
- configuración de menú por permisos;
- perfil de solo lectura.

### DoD

- cada rol simulado muestra menú correcto;
- URL manual restringida termina en 403;
- foco y navegación móvil funcionan.

---

## 5. Etapa 3 — Autenticación y sesión

### Tareas

- login correo+DNI;
- authSlice;
- Axios;
- refresh único;
- ProtectedRoute;
- logout;
- BroadcastChannel;
- inactividad 30+5;
- mensajes 401/429.

### Pruebas críticas

- login exitoso/fallido;
- cuenta inactiva;
- refresh concurrente;
- refresh fallido;
- logout en otra pestaña;
- cierre por inactividad;
- no persistencia de token.

---

## 6. Etapa 4 — Resumen

### Tareas

- endpoint `/resumen`;
- tarjetas por rol;
- selección sin cambiar ruta;
- preview Pacientes inicial;
- previews restantes;
- fallos parciales.

### DoD

- máximo seis tarjetas;
- datos autorizados;
- cada preview enlaza al módulo.

---

## 7. Etapa 5 — Pacientes

### Tareas

- listado paginado;
- búsqueda/filtros;
- tabla/tarjetas;
- modal paciente+tutor;
- duplicado no bloqueante;
- edición;
- detalle con cuatro pestañas;
- vínculos;
- activar/desactivar.

### Pruebas

- profesional ve vinculados;
- alta profesional crea vínculo;
- DNI duplicado;
- warning similitud;
- CUD condicionado;
- bloqueo por turnos futuros;
- conversaciones solo participadas.

---

## 8. Etapa 6 — Usuarios, servicios y catálogos

### Usuarios

- directorio limitado para coordinación/secretaría;
- gestión admin;
- foto local;
- cambio DNI y sesiones;
- publicación pública.

### Servicios

- catálogo admin;
- imagen local;
- visibilidad pública;
- servicios habituales;
- profesional sin módulo.

### Catálogos

- consultorios;
- tipos informe;
- categorías conversación.

### Pruebas

- proyecciones por rol;
- admin único gestor;
- asociación habitual no limita turno;
- catálogos inactivos no seleccionables.

---

## 9. Etapa 7 — Agenda

### Tareas

- FullCalendar;
- toolbar propia;
- Día/Semana;
- rango 08–21;
- lunes-sábado;
- filtro prestador;
- clic día/hora;
- modal turno;
- eventos;
- detalle;
- estados;
- cancelación con motivo.

### Pruebas

- rango y timezone;
- fecha/hora precargada;
- servicio activo no habitual;
- conflictos de prestador/paciente/consultorio;
- transiciones;
- notas por rol;
- sin drag/drop.

---

## 10. Etapa 8 — Informes

### Tareas

- listado y filtros;
- modal amplio;
- borrador;
- finalización;
- lectura;
- impresión;
- auditoría de vista.

### Pruebas

- admin/secretaría solo lectura;
- coordinación/profesional crean;
- autoría;
- inmutabilidad;
- CSS print.

---

## 11. Etapa 9 — Mensajería

### Tareas

- lista/detalle;
- nueva conversación;
- respuesta;
- agregar participante;
- no leídos;
- archivado;
- polling 60s;
- alertas topbar.

### Pruebas

- participant policy;
- historial;
- puntero leído;
- participante nuevo;
- archivado individual;
- celular lista/detalle.

---

## 12. Etapa 10 — Auditoría

### Tareas

- filtros;
- paginación;
- tabla;
- detalle modal;
- campos sensibles excluidos.

### Pruebas

- solo admin;
- orden descendente;
- metadatos permitidos;
- sin edición/exportación.

---

## 13. Etapa 11 — Estabilización

- auditoría de accesibilidad;
- responsive real;
- pruebas de rendimiento;
- errores de red;
- sesión lenta;
- doble submit;
- navegación con teclado;
- cobertura;
- revisión de seguridad;
- limpieza de consola;
- build producción.

---

## 14. Estrategia de pruebas

### 14.1 Unitarias

- formatters;
- mappers;
- schemas;
- reducers/selectors;
- permissions;
- error normalizer;
- fechas.

### 14.2 Componentes

- modales;
- formularios;
- tablas;
- filtros;
- estados;
- sidebar;
- agenda wrappers;
- mensajería.

### 14.3 Integración con MSW

- requests reales del cliente;
- respuestas por rol;
- 409/422/403;
- refresh;
- cancelación;
- polling.

### 14.4 E2E Playwright

#### Administrador

```text
login
→ crear usuario
→ crear servicio
→ gestionar catálogo
→ crear turno
→ auditoría
```

#### Profesional

```text
login
→ crear paciente+tutor
→ crear turno con servicio activo
→ confirmar/completar
→ crear/finalizar informe
```

#### Secretaría

```text
login
→ ver pacientes
→ crear turno para prestador
→ cancelar con motivo
→ leer informe
```

#### Mensajería

```text
crear conversación
→ responder con otro usuario
→ agregar participante
→ comprobar no leído
→ archivar
```

---

## 15. Cobertura

Objetivo general mínimo:

```text
80 %
```

Prioridad:

- auth/session;
- permission routing;
- forms;
- appointment state/conflicts;
- report finalization;
- messaging participation;
- idle timeout.

No se fuerza cobertura en archivos declarativos sin lógica.

---

## 16. Git y GitHub

### Ramas

```text
main
feature/auth
feature/patients
feature/agenda
...
```

### Commits

```text
feat: add patient creation modal
fix: prevent duplicate refresh requests
test: cover appointment conflict flow
docs: update private frontend decisions
```

### Pull Request

Debe incluir:

- objetivo;
- capturas desktop/mobile;
- roles probados;
- endpoints;
- pruebas;
- accesibilidad;
- decisiones documentales afectadas.

---

## 17. CI

Pipeline mínimo:

```text
install
→ lint
→ unit/integration tests
→ coverage
→ build
```

Playwright puede ejecutarse en pipeline separado o antes de releases por costo/tiempo.

---

## 18. Definition of Done por feature

Una feature está terminada cuando:

- cumple permisos;
- tiene loading/empty/error;
- funciona desktop/celular;
- es operable por teclado;
- mapea errores backend;
- no filtra datos sensibles;
- tiene pruebas unitarias/integración;
- E2E crítico actualizado;
- documentación actualizada;
- no agrega warnings de consola.

---

## 19. Orden de trabajo recomendado

```text
0 Bootstrap
1 Sistema visual
2 Layout/router
3 Auth/session
4 Resumen
5 Pacientes
6 Usuarios/Servicios/Catálogos
7 Agenda
8 Informes
9 Mensajería
10 Auditoría
11 Estabilización
```

---

## 20. Criterio de cierre del frontend privado MVP

- todos los roles pueden completar sus flujos;
- ningún rol accede visualmente a acciones no autorizadas;
- backend rechaza accesos forzados;
- agenda funciona sin reprogramación;
- pacientes integran tutor;
- informes finalizados son imprimibles e inmutables;
- conversaciones respetan participantes;
- sesión expira correctamente;
- cobertura >= 80 %;
- build y CI aprobados;
- documentación sin contradicciones pendientes críticas.

---

# Ajustes del backend derivados del frontend privado — MVP

**Estado:** obligatorio para reconciliar backend v3 con decisiones posteriores  
**Precedencia:** este documento reemplaza únicamente las reglas específicas indicadas

---

## 1. Propósito

Durante la definición del frontend privado se confirmaron comportamientos que modifican o amplían documentos anteriores del backend. Este archivo evita que el equipo implemente el cliente contra contratos desactualizados.

No reescribe toda la arquitectura del backend. Define el delta obligatorio hasta una futura consolidación backend v4.

---

## 2. Contradicción principal: servicio del turno

### 2.1 Regla anterior

Documentos backend v3 indicaban que el servicio seleccionado en un turno debía estar previamente asignado al prestador mediante `usuarios_servicios`.

### 2.2 Regla definitiva

```text
Para crear un turno, el servicio debe estar activo en el catálogo.
No necesita estar asociado previamente al prestador.
```

### 2.3 Significado de `usuarios_servicios`

La relación se conserva para:

- indicar servicios habituales;
- organizar el equipo;
- ordenar primero opciones en formularios;
- mostrar información institucional interna;
- facilitar reportes futuros.

No se utiliza para:

- autorizar la creación de turnos;
- rechazar un servicio activo;
- limitar el selector del profesional.

### 2.4 Validación nueva

Eliminar del service de turnos:

```text
SERVICIO_NO_ASIGNADO
```

Mantener:

```text
SERVICIO_INACTIVO
SERVICIO_NO_ENCONTRADO
```

### 2.5 API

`POST /api/v1/turnos` valida:

1. paciente;
2. prestador;
3. servicio activo;
4. consultorio activo;
5. vínculo/policy;
6. horario;
7. solapamientos.

---

## 3. Permisos de servicios habituales

### 3.1 Regla definitiva

Pueden gestionar `usuarios_servicios`:

- administrador;
- coordinación;
- secretaría.

El profesional:

- no administra asociaciones;
- no tiene módulo Servicios;
- puede seleccionar cualquier servicio activo en su turno.

### 3.2 Contrato

Endpoints existentes pueden mantenerse:

```http
GET    /api/v1/usuarios/:id/servicios
POST   /api/v1/usuarios/:id/servicios
DELETE /api/v1/usuarios/:id/servicios/:servicioId
```

Pero los permisos y errores deben actualizarse. Ya no se bloquea quitar un servicio habitual por turnos futuros, porque la asociación no constituye requisito de agenda. Si se desea conservar esa protección organizativa, debe marcarse explícitamente como política administrativa, no como integridad del turno. Para el MVP se elimina el bloqueo.

---

## 4. Endpoint de Resumen

### 4.1 Nuevo endpoint

```http
GET /api/v1/resumen
```

### 4.2 Respuesta por rol

El backend calcula únicamente tarjetas autorizadas.

```json
{
  "data": {
    "cards": [
      {
        "key": "patients",
        "label": "Pacientes activos",
        "count": 18
      }
    ]
  }
}
```

### 4.3 Reglas

- profesional cuenta pacientes vinculados activos;
- profesional cuenta turnos propios del día;
- profesional cuenta borradores propios;
- roles globales cuentan según acceso;
- admin cuenta auditoría reciente;
- no devolver contenido clínico;
- no permitir que el cliente solicite arbitrariamente otra proyección de rol.

### 4.4 Previews

Se reutilizan endpoints de recursos con `limit=5`. No se sobrecarga `/resumen` con listados completos.

---

## 5. Agenda por intervalo

### 5.1 Query requerida

```http
GET /api/v1/turnos?desde=<ISO>&hasta=<ISO>&prestadorId=<uuid>
```

### 5.2 Semántica

- `desde` inclusivo;
- `hasta` exclusivo;
- rango máximo razonable para el MVP;
- profesional siempre queda limitado a sí mismo;
- admin/coordinación/secretaría pueden consultar todos o uno;
- backend devuelve eventos ordenados por inicio.

### 5.3 Proyección de evento

```json
{
  "id": "uuid",
  "inicioAt": "2026-08-05T10:00:00-03:00",
  "finAt": "2026-08-05T11:00:00-03:00",
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

No incluir notas internas en el listado general.

---

## 6. Acciones explícitas de turnos

Mantener endpoints de acción:

```http
PATCH /api/v1/turnos/:id/confirmar
PATCH /api/v1/turnos/:id/completar
PATCH /api/v1/turnos/:id/ausente
PATCH /api/v1/turnos/:id/cancelar
```

No crear:

```http
PATCH /api/v1/turnos/:id/reprogramar
PUT   /api/v1/turnos/:id
```

La cancelación requiere motivo.

---

## 7. Notas de turnos por campo

La proyección debe respetar:

| Campo | Admin | Coordinación | Secretaría | Prestador responsable |
|---|:---:|:---:|:---:|:---:|
| `observacionAdministrativa` | Sí | Sí | Sí | Sí |
| `notasInternas` | No | Sí | No | Sí |

Un profesional ajeno no recibe el turno completo por policy.

---

## 8. No leídos de mensajería

### 8.1 Endpoint agregado recomendado

```http
GET /api/v1/conversaciones/no-leidas/resumen?limit=5
```

Respuesta:

```json
{
  "data": {
    "count": 3,
    "items": [
      {
        "id": "uuid",
        "titulo": "Seguimiento de Juan",
        "updatedAt": "2026-07-30T18:15:00-03:00",
        "participants": ["Valentina Ríos", "Carla Domínguez"]
      }
    ]
  }
}
```

Evitar incluir fragmentos clínicos en la topbar.

### 8.2 Participante nuevo

Al agregar un participante, su puntero de lectura inicial debe ubicarse en el último mensaje existente o equivalente, para que el historial anterior no aparezca completamente como no leído.

---

## 9. Directorio interno para selectores

El profesional no tiene ruta/módulo Usuarios, pero necesita seleccionar destinatarios.

El backend debe permitir un endpoint/proyección mínima para todos los autenticados:

```http
GET /api/v1/usuarios?projection=selector&activo=true
```

o aplicar automáticamente una proyección equivalente.

Campos:

- id;
- nombre;
- apellido;
- título;
- función;
- foto.

Nunca:

- DNI;
- correo de acceso;
- teléfono personal;
- estado de sesiones.

---

## 10. Paginación y búsqueda

Asegurar soporte uniforme:

```text
page
limit
search
sort
order
```

Recursos con 20 por página:

- pacientes;
- usuarios;
- informes;
- auditoría.

La búsqueda de pacientes debe admitir nombre, apellido y DNI según permisos. Una proyección no administrativa no debe exponer DNI en respuesta aunque se use para encontrar.

---

## 11. Sesión e inactividad

El cierre por inactividad utiliza el logout normal:

```http
POST /api/v1/auth/logout
```

No hace falta un endpoint especial. El backend revoca la sesión asociada al refresh token.

El refresh debe:

- rotar o validar según diseño existente;
- devolver access token, usuario y permisos actuales;
- rechazar usuario inactivo;
- rechazar sesión revocada.

---

## 12. Uploads locales

Se mantienen ajustes del frontend público:

- `api/uploads/usuarios`;
- `api/uploads/servicios`;
- rutas almacenadas en PostgreSQL;
- endpoints multipart separados;
- almacenamiento persistente requerido en producción;
- archivos reales ignorados en Git.

El formulario administrativo puede presentar datos+foto juntos, pero el cliente coordina dos operaciones controladas.

---

## 13. Permisos de informes

Reafirmar:

- administrador: lectura total, no creación;
- secretaría: lectura total, no creación;
- coordinación: crea cualquier paciente, edita/finaliza propios;
- profesional: crea pacientes vinculados, edita/finaliza propios;
- finalizados inmutables;
- lectura auditada.

El backend no debe inferir que el administrador puede escribir por ser rol superior.

---

## 14. Conversaciones

Reafirmar:

- solo participantes;
- sin bypass admin/coordinación;
- paciente opcional;
- paciente inactivo: no nueva conversación asociada;
- conversación existente puede continuar;
- cualquier participante agrega usuarios;
- no se quitan participantes;
- mensajes inmutables.

---

## 15. Imágenes y publicación

Mantener del ajuste público:

### Usuarios

- `foto_url`;
- `funcion_publica`;
- `visible_publicamente`;
- `orden_publico`.

### Servicios

- `imagen_url`;
- `visible_publicamente`;
- `orden_publico`.

`activo` y `visible_publicamente` son independientes.

---

## 16. Auditoría adicional

Registrar, sin contenido sensible:

- consulta de informe;
- cambio de estado de turno;
- cancelación;
- alta automática de vínculo;
- cambios de servicios habituales;
- carga/reemplazo/eliminación de imagen;
- participante agregado;
- restablecimiento de acceso.

No es necesario auditar cada polling del contador de no leídos.

---

## 17. Documentos backend v3 a corregir en futura v4

### `README.md`

Reemplazar permiso de servicios asignados para “cualquier autenticado” por admin/coordinación/secretaría y aclarar que no restringe turnos.

### `02-MODELO-DATOS-Y-REGLAS-MVP.md`

- cambiar propósito de `usuarios_servicios`;
- retirar regla “servicio activo y asignado” en turnos;
- añadir campos públicos de servicios si aún faltan.

### `03-CONTRATO-API-MVP.md`

- retirar `SERVICIO_NO_ASIGNADO` de turnos;
- retirar cualquier endpoint de reprogramación listado accidentalmente;
- añadir `/resumen`;
- añadir agenda por intervalo;
- añadir no leídos resumidos;
- actualizar permisos de asignaciones.

### `04-MATRIZ-PERMISOS-AUDITORIA-MVP.md`

Actualizar servicios habituales y módulo frontend.

### `05-PLAN-IMPLEMENTACION-BACKEND-MVP.md`

Actualizar pruebas de servicio no asignado y dependencia de turnos.

---

## 18. Pruebas backend obligatorias

- profesional crea turno con servicio activo no habitual;
- servicio inactivo falla;
- profesional no modifica servicios habituales;
- coordinación/secretaría sí modifican;
- `/resumen` cambia por rol;
- profesional no fuerza `prestadorId` ajeno;
- agenda respeta rango;
- no leídos solo del participante;
- notas internas no llegan a admin/secretaría;
- no existe reprogramación;
- directorio selector no expone datos sensibles.

---

## 19. Estado de resolución

Con este documento, las contradicciones quedan resueltas por precedencia documental. No deben implementarse simultáneamente la regla vieja y la nueva.

---

# Registro de decisiones del frontend privado — MVP

---

## 1. Estados

- `CONFIRMADA`: decisión vigente.
- `REEMPLAZADA`: decisión anterior sin vigencia.
- `FUERA_MVP`: no se implementa ahora.
- `PENDIENTE_PRODUCCION`: depende del despliegue real.

---

## 2. Decisiones confirmadas

| ID | Decisión | Estado |
|---|---|---|
| FPRI-001 | Una sola aplicación React + Vite contiene público, login y privado. | CONFIRMADA |
| FPRI-002 | El frontend utiliza JavaScript ES6+, no TypeScript. | CONFIRMADA |
| FPRI-003 | El panel tiene un único layout para todos los roles. | CONFIRMADA |
| FPRI-004 | Sidebar estrecho a la izquierda y contenido amplio a la derecha. | CONFIRMADA |
| FPRI-005 | La topbar contiene Inicio, alertas de mensajes y cerrar sesión. | CONFIRMADA |
| FPRI-006 | El perfil es de solo lectura y no tiene módulo propio. | CONFIRMADA |
| FPRI-007 | La ruta inicial privada es `/app/resumen`. | CONFIRMADA |
| FPRI-008 | El Resumen usa tarjetas seleccionables sin cambiar de ruta. | CONFIRMADA |
| FPRI-009 | El detalle inicial del Resumen es Pacientes. | CONFIRMADA |
| FPRI-010 | Máximo seis tarjetas por rol. | CONFIRMADA |
| FPRI-011 | Profesional: pacientes, turnos, borradores, no leídos. | CONFIRMADA |
| FPRI-012 | Secretaría: pacientes, turnos, pendientes, no leídos, usuarios, servicios. | CONFIRMADA |
| FPRI-013 | Coordinación: pacientes, turnos, informes, no leídos, usuarios, servicios. | CONFIRMADA |
| FPRI-014 | Admin: pacientes, turnos, usuarios, servicios, no leídos, auditoría. | CONFIRMADA |
| FPRI-015 | Existe un único módulo Pacientes; tutor está dentro. | CONFIRMADA |
| FPRI-016 | No existe menú Familias ni Tutores. | CONFIRMADA |
| FPRI-017 | Nuevo/editar paciente abre modal conjunto paciente+tutor. | CONFIRMADA |
| FPRI-018 | Detalle de paciente tiene Resumen, Turnos, Informes y Conversaciones. | CONFIRMADA |
| FPRI-019 | Profesional ve solo pacientes vinculados. | CONFIRMADA |
| FPRI-020 | Profesional puede crear paciente y queda vinculado. | CONFIRMADA |
| FPRI-021 | Agenda utiliza FullCalendar con Día y Semana. | CONFIRMADA |
| FPRI-022 | Vista inicial: Semana escritorio, Día celular. | CONFIRMADA |
| FPRI-023 | Agenda muestra lunes a sábado de 08:00 a 21:00. | CONFIRMADA |
| FPRI-024 | Clic en día precarga fecha; clic en franja precarga fecha y hora. | CONFIRMADA |
| FPRI-025 | Nuevo turno abre modal. | CONFIRMADA |
| FPRI-026 | No hay vista mensual. | CONFIRMADA |
| FPRI-027 | No hay drag, resize ni reprogramación. | CONFIRMADA |
| FPRI-028 | Admin/coordinación/secretaría filtran por prestador. | CONFIRMADA |
| FPRI-029 | Profesional solo ve agenda propia. | CONFIRMADA |
| FPRI-030 | Profesional puede elegir cualquier servicio activo en un turno. | CONFIRMADA |
| FPRI-031 | `usuarios_servicios` es informativa y organizativa. | CONFIRMADA |
| FPRI-032 | Profesional no ve módulo Servicios. | CONFIRMADA |
| FPRI-033 | Admin/coordinación/secretaría gestionan servicios habituales. | CONFIRMADA |
| FPRI-034 | Informes se crean/editan en modal amplio. | CONFIRMADA |
| FPRI-035 | Informe usa texto plano, sin editor enriquecido. | CONFIRMADA |
| FPRI-036 | Finalizar informe requiere confirmación y lo vuelve inmutable. | CONFIRMADA |
| FPRI-037 | Informes finalizados se imprimen/guardan PDF con navegador. | CONFIRMADA |
| FPRI-038 | Mensajería usa dos paneles en escritorio y una vista en celular. | CONFIRMADA |
| FPRI-039 | Nueva conversación abre modal. | CONFIRMADA |
| FPRI-040 | Alertas solo representan conversaciones no leídas. | CONFIRMADA |
| FPRI-041 | No se implementan notificaciones generales en el MVP. | CONFIRMADA |
| FPRI-042 | Usuarios es directorio para coordinación/secretaría y gestión para admin. | CONFIRMADA |
| FPRI-043 | Profesional no ve módulo Usuarios. | CONFIRMADA |
| FPRI-044 | Admin es único gestor de usuarios y accesos. | CONFIRMADA |
| FPRI-045 | Servicios tiene catálogo y servicios habituales por prestador. | CONFIRMADA |
| FPRI-046 | Catálogos es exclusivo de admin. | CONFIRMADA |
| FPRI-047 | Catálogos incluye consultorios, tipos de informe y categorías. | CONFIRMADA |
| FPRI-048 | Auditoría es exclusiva de admin y solo lectura. | CONFIRMADA |
| FPRI-049 | Creaciones/ediciones usan modales reutilizables. | CONFIRMADA |
| FPRI-050 | En celular los modales de formulario son fullscreen. | CONFIRMADA |
| FPRI-051 | Toast para feedback breve; errores de campo inline. | CONFIRMADA |
| FPRI-052 | Acciones sensibles usan ConfirmDialog. | CONFIRMADA |
| FPRI-053 | Cancelar turno usa modal con motivo obligatorio. | CONFIRMADA |
| FPRI-054 | No hay autosave de formularios sensibles. | CONFIRMADA |
| FPRI-055 | Redux almacena sesión, permisos, no leídos y UI global. | CONFIRMADA |
| FPRI-056 | Pacientes, turnos e informes no se persisten globalmente. | CONFIRMADA |
| FPRI-057 | No se usa RTK Query en el MVP. | CONFIRMADA |
| FPRI-058 | Axios gestiona access token y refresh único concurrente. | CONFIRMADA |
| FPRI-059 | Tokens no se almacenan en localStorage. | CONFIRMADA |
| FPRI-060 | Cierre por inactividad: advertencia 30 min + logout 5 min. | CONFIRMADA |
| FPRI-061 | Misma identidad visual que público, con mayor densidad. | CONFIRMADA |
| FPRI-062 | React Icons es la librería de iconos. | CONFIRMADA |
| FPRI-063 | CSS Modules y design tokens centralizados. | CONFIRMADA |
| FPRI-064 | Paginación backend de 20 para pacientes, usuarios, informes y auditoría. | CONFIRMADA |
| FPRI-065 | Búsqueda con debounce de 400 ms desde 2 caracteres. | CONFIRMADA |
| FPRI-066 | Filtros son temporales y no usan localStorage. | CONFIRMADA |
| FPRI-067 | Formularios usan React Hook Form + Joi. | CONFIRMADA |
| FPRI-068 | Fechas usan date-fns. | CONFIRMADA |
| FPRI-069 | Pruebas: Vitest, RTL, MSW y Playwright. | CONFIRMADA |
| FPRI-070 | Cobertura mínima objetivo 80 %. | CONFIRMADA |
| FPRI-071 | No hay WebSocket; no leídos usan polling moderado. | CONFIRMADA |
| FPRI-072 | Profesional obtiene selector mínimo de usuarios solo en Mensajería. | CONFIRMADA |
| FPRI-073 | Admin no puede crear informes. | CONFIRMADA |
| FPRI-074 | Conversaciones solo son visibles para participantes. | CONFIRMADA |
| FPRI-075 | Notas internas solo coordinación y prestador responsable. | CONFIRMADA |
| FPRI-076 | Observación administrativa es visible para admin, coordinación, secretaría y responsable. | CONFIRMADA |

---

## 3. Decisiones reemplazadas

| Decisión anterior | Reemplazo vigente |
|---|---|
| Dashboard distinto por rol. | Un dashboard compartido con contenido por rol. |
| Módulos Familias y Niños separados. | Módulo Pacientes con tutor integrado. |
| Profesional ve Servicios. | Profesional no ve Servicios; elige servicio al crear turno. |
| Servicio debe estar asignado al prestador. | Cualquier servicio activo puede usarse. |
| Todos los autenticados gestionan `usuarios_servicios`. | Admin/coordinación/secretaría gestionan; profesional no. |
| Servicios habituales bloquean su eliminación por turnos. | La asociación es informativa; no es requisito del turno. |
| Formularios de alta como páginas dedicadas. | Modales reutilizables. |
| Agenda operativa simple tipo lista. | Agenda visual Día/Semana tipo calendario. |
| Reporte con editor avanzado. | Textarea segura en MVP. |
| Notificaciones generales. | Solo alertas de conversaciones no leídas. |

---

## 4. Fuera del MVP

- vista mensual de agenda;
- reprogramación;
- drag and drop;
- pagos/cobros;
- asistencia separada;
- seguimientos como módulo independiente;
- archivos adjuntos;
- editor enriquecido;
- PDF backend;
- WebSocket;
- push notifications;
- modo oscuro;
- edición del perfil propio;
- PWA avanzada;
- aplicación nativa;
- exportación de auditoría;
- gráficos complejos del dashboard.

---

## 5. Pendientes de producción

- proveedor de hosting;
- volumen persistente de uploads;
- dominio definitivo de API;
- política definitiva de CORS;
- retención de logs;
- monitoreo y observabilidad;
- datos reales de usuarios y centro;
- prueba de carga con volumen real;
- revisión legal de privacidad.

---

## 6. Regla de cambios

Una decisión confirmada no se modifica dentro de código sin actualizar primero este registro y los documentos afectados.

---

# Informe de validación cruzada — Frontend privado MVP

**Versión:** 1.0  
**Fecha:** 2026-07-30  
**Resultado general:** APTO CON AJUSTES BACKEND DOCUMENTADOS

---

## 1. Alcance de la validación

Se contrastaron:

- arquitectura backend v3;
- modelo de datos backend v3;
- contrato API backend v3;
- matriz de permisos y auditoría;
- plan backend;
- documentación del frontend público;
- decisiones confirmadas durante el diseño del frontend privado;
- documentos privados 01 a 09.

La validación revisó:

- roles y permisos;
- alcance de datos;
- servicios y turnos;
- pacientes y tutor;
- informes;
- mensajería;
- autenticación;
- rutas;
- estados;
- uploads;
- paginación;
- consistencia documental.

---

## 2. Contradicciones detectadas y resolución

### VAL-001 — Servicio asignado al prestador

**Contradicción:** backend v3 exigía servicio previamente asignado; decisión privada permite cualquier servicio activo.

**Resolución:** prevalece servicio activo. `usuarios_servicios` queda informativa. Documentado en `08`.

**Estado:** RESUELTA.

### VAL-002 — Permiso para gestionar servicios habituales

**Contradicción:** backend v3 permitía a cualquier autenticado; frontend confirma admin/coordinación/secretaría.

**Resolución:** se restringe la gestión. Profesional no ve módulo.

**Estado:** RESUELTA.

### VAL-003 — Endpoint de reprogramación listado accidentalmente

**Contradicción:** algunas secciones del contrato v3 listaban `PATCH /turnos/:id/reprogramar`, aunque la regla funcional lo prohibía.

**Resolución:** no existe endpoint. Cancelar + crear nuevo.

**Estado:** RESUELTA POR PRECEDENCIA; requiere limpiar backend v4.

### VAL-004 — Dashboard por rol

**Contradicción:** propuesta previa de dashboards diferentes.

**Resolución:** un único Resumen con tarjetas por rol.

**Estado:** RESUELTA.

### VAL-005 — Familias/Tutores como módulo

**Contradicción:** referencia visual externa separaba familias/niños.

**Resolución:** solo Pacientes; tutor dentro de ficha y formulario.

**Estado:** RESUELTA.

### VAL-006 — Visibilidad de profesionales y servicios

**Contradicción:** profesional no ve módulos, pero necesita destinatarios y servicio para turno.

**Resolución:** selectores mínimos específicos. No se concede acceso al módulo.

**Estado:** RESUELTA.

### VAL-007 — Administrador e informes

**Riesgo:** interpretar rol superior como escritura total.

**Resolución:** admin y secretaría solo lectura; coordinación/profesional crean según scope.

**Estado:** CONSISTENTE.

### VAL-008 — Conversaciones y roles elevados

**Riesgo:** admin/coordinación vean conversaciones ajenas.

**Resolución:** solo participantes, sin bypass.

**Estado:** CONSISTENTE.

### VAL-009 — Notas internas

**Riesgo:** agenda general exponga notas a admin/secretaría.

**Resolución:** proyección por campo; notas internas no se entregan.

**Estado:** RESUELTA.

### VAL-010 — Uploads locales

**Riesgo:** GitHub o despliegue efímero pierda archivos.

**Resolución:** Git ignora archivos dinámicos; producción requiere almacenamiento persistente y backup. Pendiente de proveedor.

**Estado:** RESUELTA PARA DESARROLLO / PENDIENTE PRODUCCIÓN.

---

## 3. Matriz de trazabilidad

| Dominio | Regla backend | Representación frontend | Estado |
|---|---|---|---|
| Auth | email + DNI | Login sin registro/recuperación | OK |
| Sesión | access + refresh cookie | token memoria + refresh Axios | OK |
| Usuarios | admin gestiona | módulo completo solo admin | OK |
| Directorio | activos con proyección | coordinación/secretaría + selector mensajes | OK |
| Paciente | tutor 1:1 | formulario y ficha conjunta | OK |
| Vínculos | permanentes hasta baja | gestión en resumen de paciente | OK |
| Turnos | estados cerrados | acciones contextuales | OK |
| Reprogramación | prohibida | sin drag/editar; cancelar+nuevo | OK |
| Servicio turno | activo | selector de todos activos | AJUSTE BACKEND |
| Informes | autoría/inmutabilidad | modal borrador + vista final | OK |
| Mensajes | participantes | dos paneles y policy | OK |
| Catálogos | admin | pestañas admin | OK |
| Auditoría | admin lectura | tabla + modal | OK |
| Público | visibilidad independiente | administración desde usuario/servicio | OK |

---

## 4. Validación de permisos por módulo

| Caso | Resultado |
|---|---|
| Profesional no ve Usuarios | PASS |
| Profesional no ve Servicios | PASS |
| Profesional selecciona servicio activo en turno | PASS con ajuste backend |
| Secretaría no administra cuentas | PASS |
| Coordinación puede ser prestador | PASS |
| Admin es único en Catálogos/Auditoría | PASS |
| Admin no crea informes | PASS |
| Secretaría lee informe completo | PASS |
| Mensajes solo participantes | PASS |
| Profesional solo pacientes vinculados | PASS |

---

## 5. Validación de rutas

- todas las rutas privadas usan `/app`;
- `/app` redirige a `/app/resumen`;
- rutas administrativas tienen guard;
- detalles dependen de policy backend;
- formularios de alta no requieren rutas propias;
- login está fuera de PrivateLayout;
- Home pública se conserva accesible desde topbar.

**Resultado:** PASS.

---

## 6. Validación de estados

### Turnos

```text
pendiente → confirmado | cancelado
confirmado → completado | ausente | cancelado
```

No existen transiciones inversas ni edición estructural.

### Informes

```text
borrador → finalizado
```

Finalizado inmutable.

### Entidades

Activación/desactivación lógica, sin borrado histórico.

**Resultado:** PASS.

---

## 7. Validación de seguridad del cliente

- refresh token no accesible a React;
- access token no persistido;
- datos clínicos no persistidos;
- sin HTML de usuario;
- cierre por inactividad;
- filtros de UI no equivalen a autorización;
- selectores usan proyecciones mínimas;
- polling sin contenido sensible;
- mensajes de error no exponen backend.

**Resultado:** PASS.

---

## 8. Validación de experiencia responsive

- sidebar drawer;
- agenda Día;
- tablas como tarjetas;
- modales fullscreen;
- mensajería una vista por vez;
- informes editables, aunque se recomienda escritorio;
- sin funciones bloqueadas por dispositivo.

**Resultado:** PASS.

---

## 9. Validación de pruebas

Cobertura planificada:

- unitarias;
- componentes;
- integración MSW;
- E2E Playwright;
- objetivo 80 %;
- flujos críticos por rol.

**Resultado:** PASS DOCUMENTAL. La validación ejecutable corresponde a la implementación.

---

## 10. Pendientes no bloqueantes

- proveedor de producción y volumen de uploads;
- versiones exactas de dependencias al inicializar;
- datos reales del centro;
- URL final API/files;
- prueba de rendimiento con cantidad real;
- revisión legal.

---

## 11. Comprobaciones automatizadas del paquete

El paquete se valida mediante script para verificar:

- archivos requeridos;
- enlaces relativos internos;
- bloques de código balanceados;
- presencia de decisiones críticas;
- ausencia de reglas prohibidas en docs privadas;
- hashes SHA-256.

El resultado exacto de la ejecución se incorpora al final de este documento al empaquetar.

---

## 12. Conclusión

La documentación privada es coherente internamente y con el producto confirmado. Las discrepancias heredadas del backend están identificadas y tienen una única resolución explícita en `08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md`.

El frontend privado puede comenzar a implementarse cuando el contrato backend adopte esos ajustes o los mocks MSW los representen temporalmente.

---

## 13. Resultado automatizado de empaquetado

```text
Comprobaciones ejecutadas: 39
Aprobadas: 39
Fallidas: 0

- archivos requeridos: PASS
- bloques de código balanceados: PASS
- enlaces relativos internos: PASS
- decisiones críticas presentes: PASS
- regla obsoleta de servicio asignado ausente en docs núcleo: PASS
```

El detalle estructurado se incluye en `validation-results.json`.
