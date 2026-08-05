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
