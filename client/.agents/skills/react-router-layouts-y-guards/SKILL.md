---
name: react-router-layouts-y-guards
description: Crear, ampliar o corregir routing en aplicaciones React con React Router y Vite. Usar cuando una tarea involucre AppRouter, rutas públicas o privadas, PublicLayout, AuthLayout, PrivateLayout, carga lazy, Suspense, ProtectedRoute, PermissionRoute, GuestRoute, redirects, errores 401/403/404, restauración de scroll o gestión accesible del foco al navegar.
---

# React Router: Layouts y Guards

## Objetivo

Construir navegación declarativa y accesible, con shells estables y controles separados para sesión, permisos de módulo y policies de recurso. Mantener rutas y metadatos centralizados sin presentar los guards del frontend como controles de seguridad.

## 1. Inspeccionar el contrato de navegación

1. Leer los `AGENTS.md` aplicables desde la raíz de `client/` hasta el área modificada.
2. Revisar `package.json` y confirmar que React Router esté instalado antes de usarlo. Si solo está documentado como arquitectura objetivo, no inventar imports ni resultados ejecutables.
3. Inspeccionar `src/router/`, `src/layouts/`, `src/config/routes.js`, `src/config/permissions.js`, `src/config/private-menu.js`, autenticación y páginas de error.
4. Consultar el mapa de rutas, layouts y permisos pertinente en `client/doc/`.
5. Revisar una ruta análoga implementada y conservar la versión y API de React Router ya utilizadas.

No reemplazar la estructura completa cuando una ampliación puntual sea suficiente.

## 2. Diseñar el árbol de rutas

Agrupar por shell y condición de acceso:

```text
AppRouter
├── PublicLayout
│   └── rutas públicas
├── GuestRoute
│   └── AuthLayout
│       └── login
├── ProtectedRoute
│   └── PrivateLayout
│       ├── rutas privadas comunes
│       ├── PermissionRoute
│       │   └── rutas por permiso
│       └── /app/403
└── 404 global
```

- Mantener rutas públicas `/`, `/nosotros`, `/servicios`, `/equipo`, `/contacto` y `/privacidad` bajo `PublicLayout`.
- Mantener `/login` bajo `AuthLayout` y `GuestRoute`.
- Mantener el panel bajo `/app` y redirigir `/app` a `/app/resumen`.
- Conservar `/app/403` dentro del contexto autenticado.
- Declarar un catch-all deliberado para 404; no depender de una pantalla en blanco.
- Centralizar paths, labels y claves de permiso. No repetir strings de ruta entre router, menú, breadcrumbs y navegación contextual.

## 3. Delimitar layouts

### PublicLayout

- Componer header público, `<main>`, footer y acceso flotante permitido.
- Incluir `<Outlet />` y comportamiento de scroll/foco sin lógica de negocio.
- Mantener navegación responsive y cierre del menú móvil al cambiar de ruta.
- No montar providers privados ni consultas autenticadas.

### AuthLayout

- Proporcionar un shell sobrio para login y futuros estados de acceso.
- No duplicar la lógica de `GuestRoute` ni decidir por sí mismo si hay sesión.
- Mantener el formulario como dueño de su estado y el layout como estructura visual.

### PrivateLayout

- Componer sidebar, topbar, breadcrumbs o encabezado y `<main>` con `<Outlet />`.
- Montar comportamiento transversal privado, como advertencia de inactividad y contador moderado de no leídos.
- Derivar menú de permisos confirmados y no renderizar módulos inaccesibles.
- Mantener el shell estable durante navegación lazy para evitar saltos y pérdida de contexto.
- No buscar datos de cada feature desde el layout.

## 4. Implementar guards con una responsabilidad

### ProtectedRoute

- Esperar a que termine la restauración inicial de sesión.
- Mostrar un fallback estable mientras el estado sea indeterminado.
- Renderizar `<Outlet />` o children cuando exista una sesión válida.
- Redirigir a `/login` cuando la sesión sea anónima, conservando solo una ruta interna segura como destino de retorno.
- No comprobar permisos de módulo ni policies de recurso.

### GuestRoute

- Permitir acceso a usuarios anónimos.
- Redirigir una sesión autenticada a `/app/resumen` o al destino interno válido previsto.
- Esperar la restauración de sesión para evitar parpadeos entre login y panel.

### PermissionRoute

- Ejecutarse dentro de `ProtectedRoute`.
- Comprobar una clave de permiso explícita recibida del backend.
- Redirigir a `/app/403` cuando falte el permiso.
- No inferir permisos por rol si el contrato entrega permisos efectivos.
- No resolver policies por recurso solo con parámetros de URL; la API debe validar el recurso concreto.

### PublicRoute

- Mantenerlo únicamente si aporta comportamiento real y consistente, como una política pública compartida.
- No crear wrappers vacíos por simetría con los guards privados.

## 5. Diferenciar 401, 403 y 404

| Caso | Comportamiento |
|---|---|
| `401` | Intentar el flujo centralizado de refresh cuando corresponda; si falla, limpiar sesión y redirigir a login. |
| `403` | Mantener la sesión y mostrar `/app/403` o un estado inline cuando la operación puntual fue denegada. |
| `404` | Mostrar recurso o ruta inexistente sin revelar si el dato existe pero está restringido. |

- No cerrar sesión ante un `403`.
- No convertir todos los errores de carga en navegación a 404.
- No revelar nombres, IDs o metadatos de recursos inaccesibles.
- Usar `UnexpectedErrorPage` para fallos inesperados de render o estados no recuperables, no para validaciones conocidas.
- Permitir reintento inline cuando un fallo de red no invalide toda la ruta.

## 6. Aplicar lazy loading y Suspense

- Usar `React.lazy` para páginas no iniciales y rutas privadas cuando la dependencia y estructura estén operativas.
- Mantener layouts, guards y componentes críticos de navegación fuera de chunks excesivamente fragmentados.
- Colocar límites `Suspense` en el nivel de ruta o contenido, conservando visible el shell del layout.
- Usar fallbacks con tamaño estable, nombre accesible y forma aproximada al contenido.
- No envolver cada componente pequeño en un boundary independiente.
- Gestionar errores de carga de chunks mediante el boundary global previsto; no crear bucles de recarga automática.
- Evitar declarar loaders, actions o data routers si el proyecto usa routing declarativo simple y la tarea no requiere migrarlo.

## 7. Gestionar scroll y foco al navegar

- Observar cambios de `pathname`, no cada render.
- Llevar el scroll al inicio para navegación normal entre páginas; respetar anclas y comportamientos explícitos documentados.
- Después del cambio de ruta, mover el foco al encabezado principal o al `<main tabIndex="-1">` una vez montado el contenido.
- No enfocar `body` ni elementos ocultos.
- Evitar que `ScrollToTop` robe el foco al escribir, cerrar un modal o actualizar query params sin cambio de página.
- Mantener un único `<main>` visible por layout y un `h1` coherente por página.
- Cerrar drawers al navegar, liberar el focus trap y devolver el foco solo cuando no se haya producido una navegación completa.
- Actualizar el título del documento por ruta para que el cambio sea perceptible también fuera de la vista.
- Respetar `prefers-reduced-motion`; no forzar scroll animado.

## 8. Integrar menú, breadcrumbs y navegación contextual

- Generar el menú privado desde configuración filtrada por permisos, no desde JSX duplicado por rol.
- Marcar enlaces activos con semántica adecuada y no solo con color.
- Construir breadcrumbs desde metadatos de rutas o configuración estable; no inferir labels presentables desde segmentos crudos.
- Para detalles con datos remotos, usar un label seguro y un fallback mientras carga.
- No incluir en breadcrumbs contenido clínico, DNI ni otros datos sensibles.
- Validar destinos contextuales antes de navegar y evitar redirects abiertos provenientes de query o state.

## 9. Probar el comportamiento

- Probar con `MemoryRouter` o el router de memoria compatible con la versión instalada.
- Cubrir sesión indeterminada, anónima y autenticada.
- Cubrir permiso presente y ausente.
- Verificar redirect de `/app` a `/app/resumen` y usuario autenticado fuera de `/login`.
- Verificar 401 con refresh exitoso y fallido, 403 sin logout y 404 sin filtración.
- Verificar carga lazy, fallback y permanencia del layout.
- Verificar navegación por teclado, enlace activo, cierre de drawer, scroll y foco en el destino.
- Probar acceso directo por URL y refresh del navegador, no solo navegación mediante enlaces.
- Ejecutar lint, pruebas y build disponibles en `package.json`; informar lo que no pueda verificarse.

## Guardrails

- No tratar guards, menús u ocultamiento de botones como seguridad.
- No mezclar autenticación, permiso de módulo y policy de recurso en un guard único.
- No consultar la API desde componentes de layout salvo comportamiento transversal documentado.
- No duplicar rutas, labels o claves de permiso.
- No crear redirects circulares ni devolver a destinos externos suministrados por el usuario.
- No mostrar contenido privado durante la restauración de sesión.
- No introducir una versión o API de React Router distinta sin justificar una migración completa.
- No declarar rutas planificadas como implementadas solo porque sus archivos existen.

## Entrega esperada

Resumir:

- árbol de rutas y layouts afectado;
- responsabilidad de cada guard;
- redirects y estados 401/403/404;
- estrategia lazy y fallback;
- comportamiento de scroll y foco;
- pruebas y verificaciones ejecutadas.
