# Frontend del Centro Educativo Interdisciplinario Terapéutico

Aplicación web del MVP del Centro Educativo Interdisciplinario Terapéutico. El proyecto reúne en una única SPA el sitio institucional público, el acceso y el panel privado para administración, coordinación, secretaría y profesionales.

> Estado actual: frontend MVP integrado en desarrollo. El sitio público, la sesión, el router con permisos y las superficies privadas principales ya están conectados al contrato REST. Los datos institucionales reales, la revisión legal y la infraestructura productiva continúan bloqueando la publicación, no el desarrollo local.

## Alcance del MVP

### Área pública

El sitio público contempla:

- Home institucional.
- Nosotros.
- Servicios.
- Nuestro equipo.
- Contacto.
- Privacidad.
- Acceso al login.
- Servicios y equipo obtenidos desde la API pública.
- Contenido institucional centralizado en configuración local.
- SEO básico, accesibilidad y diseño responsive mobile-first.

No existe formulario público de contacto. WhatsApp, correo y teléfono se ofrecen mediante enlaces externos. Tampoco se incluyen CMS, analítica, cookies publicitarias, fichas individuales de servicios ni galerías de instalaciones en el MVP.

### Área privada

El panel autenticado contempla:

- Inicio de sesión con correo y DNI.
- Renovación y cierre seguro de sesión.
- Resumen operativo único adaptado a cada rol.
- Pacientes y tutor único.
- Agenda de turnos.
- Informes.
- Mensajería interna.
- Directorio y administración de usuarios.
- Servicios y servicios habituales por prestador.
- Catálogos.
- Auditoría.
- Gestión administrativa de imágenes.

Los roles del MVP son `administrador`, `coordinacion`, `secretaria` y `profesional`. El frontend adapta navegación y acciones a los permisos recibidos, pero el backend es siempre la autoridad final de autenticación, autorización y reglas de negocio.

Quedan fuera del MVP el registro público, recuperación automática de contraseña, edición del perfil propio, pagos, facturación, videollamadas, adjuntos en mensajes, notificaciones externas, modo oscuro, aplicación móvil nativa y reprogramación de turnos mediante arrastre.

## Estado actual y arquitectura

### Disponible actualmente

- React 19.
- Vite 8.
- JavaScript con módulos ES.
- ESLint.
- React Router, Axios, Redux Toolkit y sesión segura en memoria.
- React Hook Form con Joi, FullCalendar, iconos y Helmet.
- Vitest, Testing Library, MSW y Playwright.
- CSS Modules, tokens globales, layouts responsive y estilos de impresión.

| Comando | Función |
|---|---|
| `npm run dev` | Inicia Vite en desarrollo. |
| `npm run build` | Genera el build de producción. |
| `npm run lint` | Ejecuta ESLint sobre el cliente. |
| `npm run preview` | Sirve localmente el build generado. |
| `npm run format` | Verifica formato con Prettier. |
| `npm run test:run` | Ejecuta Vitest una vez. |
| `npm run test:coverage` | Ejecuta pruebas y genera cobertura V8. |
| `npm run test:e2e` | Ejecuta los escenarios Playwright. |

### Tecnologías del MVP

| Responsabilidad | Tecnología prevista |
|---|---|
| Rutas | React Router |
| Cliente HTTP | Axios |
| Estado global privado | Redux Toolkit |
| Formularios | React Hook Form |
| Validación de formularios | Esquemas alineados con el contrato de la API |
| Agenda | FullCalendar React con TimeGrid e Interaction |
| Iconos | React Icons mediante una capa centralizada |
| Estilos | CSS Modules y CSS Custom Properties |
| Pruebas unitarias y de componentes | Vitest y React Testing Library |
| Mock HTTP | MSW |
| Pruebas E2E | Playwright |
| SEO por ruta | React Helmet Async |

Las versiones instaladas y reproducibles se encuentran en `package-lock.json`.

## Arquitectura funcional

La aplicación se organiza por capas y funcionalidades:

```text
src/
├── app/          # providers, store y composición global
├── config/       # entorno, rutas, permisos y configuración institucional
├── router/       # rutas públicas, invitadas y protegidas
├── layouts/      # layouts público, de acceso y privado
├── components/   # componentes compartidos de UI
├── pages/        # páginas públicas y de error
├── features/     # módulos funcionales y su lógica local
├── hooks/        # hooks reutilizables transversales
├── services/     # transporte HTTP, sesión y normalización de errores
├── store/        # estado global transversal
├── styles/       # tokens y estilos globales
└── utils/        # utilidades sin estado
```

Cada feature puede contener `api`, `components`, `hooks`, `pages`, `schemas`, `store` y `utils` cuando esas capas sean necesarias. Las páginas coordinan; los componentes presentan; los hooks encapsulan estado y flujos; los módulos de API ocultan detalles HTTP.

## Rutas previstas

Rutas públicas:

- `/`
- `/nosotros`
- `/servicios`
- `/equipo`
- `/contacto`
- `/privacidad`
- `/login`

El panel utiliza el prefijo `/app`. `/app` debe redirigir a `/app/resumen`, y las rutas privadas se protegen mediante sesión y permisos. Los accesos autenticados sin permiso conducen a `/app/403`; las rutas inexistentes muestran una página 404.

## Integración con la API

- La API versionada utiliza el prefijo `/api/v1`.
- Los payloads JavaScript usan `camelCase`; la persistencia del backend usa `snake_case`.
- Una única instancia de transporte debe centralizar URL base, credenciales, renovación de sesión y normalización de errores.
- Servicios y equipo públicos mantienen estados independientes de carga, éxito, vacío y error.
- Las rutas de imágenes devueltas por la API son relativas; el frontend construye la URL pública mediante configuración de entorno.
- El frontend debe tratar de forma explícita respuestas `401`, `403`, `409` y `422`.

La capa visual nunca reemplaza las validaciones ni las políticas de recurso del backend.

## Variables de entorno

`src/config/env.js` valida y normaliza estas variables públicas:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_FILES_BASE_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
VITE_APP_NAME=C.E.I.T. Mentes Luminosas
```

El área pública también necesita la URL canónica del sitio para metadatos. Antes de incorporarla debe normalizarse su nombre en `env.js` y documentarse en `.env.example`.

Las variables `VITE_*` son visibles en el navegador: nunca deben contener contraseñas, tokens, claves privadas ni secretos del backend.

## Instalación y uso actual

Requisitos:

- Node.js compatible con Vite 8.
- npm.

Desde `client/`:

```bash
npm install
npm run dev
```

Validación:

```bash
npm run lint
npm run test:run
npm run test:coverage
npm run build
npm run test:e2e
```

Playwright necesita sus navegadores instalados (`npx playwright install chromium`) en la máquina o imagen de CI.

## Reglas de seguridad y privacidad

- El refresh token permanece exclusivamente en una cookie `HttpOnly` gestionada por el backend.
- Los tokens, DNI, contenido clínico y otros datos sensibles no se persisten en `localStorage`.
- La sesión privada se conserva en memoria y se recupera mediante el backend.
- La interfaz oculta acciones no autorizadas, pero siempre acepta que el servidor puede responder `401` o `403`.
- Informes y notas clínicas no deben aparecer en logs, telemetría ni mensajes de error genéricos.
- Los datos ficticios utilizados durante el desarrollo no deben publicarse como información real.
- No se exponen campos privados en endpoints o pantallas públicas.

## Criterios de interfaz

- Sitio público mobile-first.
- Panel privado desktop-first, pero utilizable en tablet y móvil.
- CSS Modules para estilos locales y tokens globales para color, tipografía, espaciado, radios y sombras.
- React Icons como única familia general de iconos.
- Estados explícitos de carga, vacío, error, éxito y actualización.
- Formularios accesibles con etiqueta, ayuda, error asociado y foco controlado.
- Las acciones destructivas requieren confirmación y representan desactivación lógica o cambio de estado, no borrado físico de información clínica.

## Estrategia de pruebas prevista

La implementación deberá cubrir:

- Utilidades, esquemas y reducers con pruebas unitarias.
- Componentes y formularios desde el comportamiento observable.
- Integración HTTP con MSW.
- Flujos críticos E2E con Playwright.
- Permisos de rutas y acciones.
- Sesión, refresh e inactividad.
- Pacientes, agenda, informes y mensajería.
- Rutas públicas, contacto externo, servicios, equipo y estados parciales de error.
- Responsive y accesibilidad básica.

El objetivo documental de cobertura es al menos 80 %, priorizando los flujos críticos sobre métricas superficiales.

## Fuentes de verdad

Ante contradicciones se aplica esta precedencia:

1. Reglas de negocio confirmadas para el MVP.
2. Ajustes de backend derivados de los frontends.
3. Matriz de permisos y contrato de la API del backend.
4. Modelo de datos del backend.
5. Decisiones consolidadas del frontend privado.
6. Decisiones consolidadas del frontend público.
7. Ejemplos, prototipos y documentos históricos.

No se modifica una regla de negocio para simplificar una pantalla. Todo cambio relevante debe revisar su impacto en frontend, API, persistencia, permisos y pruebas.
