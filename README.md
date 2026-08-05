# Centro Educativo Interdisciplinario Terapéutico

Sistema web full stack para la operación y presencia institucional de un centro educativo, interdisciplinario y terapéutico. El repositorio reúne una API REST con PostgreSQL y una aplicación React que, dentro del MVP, debe contener el sitio público, el acceso y el panel privado.

## Estado del proyecto

| Área | Estado actual |
|---|---|
| API | MVP implementado y documentado, con migraciones, seeders, autenticación, permisos y suites Jest. |
| Base de datos | Esquema PostgreSQL administrado exclusivamente mediante migraciones Sequelize. |
| Frontend | Scaffold React + Vite y estructura modular creados; funcionalidades y dependencias principales todavía en desarrollo. |
| Documentación | Especificaciones de backend, frontend público y frontend privado versionadas dentro del repositorio. |
| Despliegue | Proveedor, dominio, almacenamiento persistente y observabilidad de producción pendientes. |

No debe interpretarse la arquitectura objetivo del frontend como funcionalidad ya terminada. La fuente ejecutable para conocer dependencias y comandos disponibles son los archivos `package.json` de `api/` y `client/`.

## Propósito del MVP

El producto cubre dos superficies dentro de una misma solución:

### Sitio público

- Home institucional.
- Presentación del centro y su enfoque.
- Servicios publicados.
- Equipo visible públicamente.
- Información de contacto, mapa y coberturas informativas.
- Página de privacidad.
- Acceso al login.
- SEO y accesibilidad básicos.

El área pública no incluye formulario de contacto, reservas de turnos, CMS, blog, analítica, cookies publicitarias, fichas individuales, galería ni carrusel. WhatsApp, correo y teléfono se ofrecen mediante enlaces externos.

### Panel privado

- Autenticación con correo y DNI.
- Sesiones con access token y refresh seguro.
- Resumen operativo adaptado por permisos.
- Administración de pacientes y tutor.
- Vínculos entre pacientes y prestadores.
- Agenda de turnos.
- Informes clínicos.
- Mensajería interna.
- Directorio y administración de usuarios.
- Servicios y servicios habituales.
- Catálogos operativos.
- Auditoría.
- Gestión de imágenes públicas de servicios y equipo.

Los roles del MVP son:

| Rol | Responsabilidad general |
|---|---|
| `administrador` | Gestiona usuarios, accesos, catálogos y configuración operativa; consulta auditoría. |
| `coordinacion` | Coordina la operación y también puede actuar como prestador. |
| `secretaria` | Gestiona tareas administrativas, agenda y directorios permitidos. |
| `profesional` | Trabaja con sus pacientes vinculados, turnos, informes y conversaciones. |

Los roles orientan la interfaz, pero el acceso real depende de permisos y policies por recurso evaluados por la API.

## Reglas funcionales esenciales

- Cada paciente tiene un único tutor obligatorio dentro del MVP.
- El alta de paciente y tutor se ejecuta como una sola operación transaccional.
- Un prestador es un usuario activo con rol `profesional` o `coordinacion` habilitado para atender.
- Los vínculos prestador-paciente permanecen vigentes hasta una desvinculación autorizada.
- Los servicios habituales de un prestador son informativos; cualquier servicio activo permitido puede utilizarse en un turno.
- Todo turno se crea como `pendiente`.
- Los turnos no se reprograman: se cancela el original y se crea uno nuevo.
- PostgreSQL y la capa de servicio protegen contra superposición de turnos.
- Los informes pueden ser creados por profesionales y coordinación según su alcance.
- Solo el autor puede modificar y finalizar su borrador; un informe finalizado es inmutable.
- Administración y secretaría no crean informes clínicos.
- Las conversaciones son visibles únicamente para sus participantes, sin excepción por rol elevado.
- Las desactivaciones son lógicas; no se elimina físicamente el historial clínico.
- No existe edición del perfil propio ni recuperación automática de contraseña en el MVP.
- No forman parte del MVP pagos, facturación, videollamadas, adjuntos, WebSocket, notificaciones externas, modo oscuro ni aplicación móvil nativa.

## Arquitectura del repositorio

```text
centro-interdisciplinario/
├── api/       # API REST, persistencia, migraciones, seeders y pruebas
├── client/    # SPA React, recursos públicos, features y pruebas previstas
└── README.md  # guía integral del repositorio
```

`api/` y `client/` son proyectos npm independientes. Actualmente no existe un `package.json` en la raíz ni un comando único que inicie ambos procesos.

### Backend

La API utiliza un monolito modular. Cada dominio conserva sus rutas, validaciones, controllers, servicios, policies y proyecciones, mientras que el despliegue sigue siendo una sola aplicación.

```text
api/
├── docs/          # arquitectura, modelo, permisos y contrato HTTP
├── migrations/    # evolución reversible del esquema
├── seeders/       # catálogos base y datos ficticios de desarrollo
├── scripts/       # tareas operativas y validadores
├── src/
│   ├── config/    # entorno, CORS, logging y conexión
│   ├── modules/   # dominios funcionales
│   ├── routes/    # composición de rutas públicas y privadas
│   ├── shared/    # infraestructura y modelos compartidos
│   ├── app.js     # composición de Express
│   └── server.js  # inicio y apagado controlado
└── tests/
    ├── unit/
    ├── integration/
    └── concurrency/
```

Flujo habitual de una solicitud privada:

```text
Route → Middleware → Validation → Controller → Service → Model/PostgreSQL
```

Las migraciones son la única fuente de verdad del esquema; la aplicación no usa `sequelize.sync()`.

### Frontend

La aplicación cliente se organiza por features y capas transversales:

```text
client/
├── doc/           # especificaciones públicas y privadas del frontend
├── public/        # archivos servidos sin transformación
├── src/
│   ├── app/       # providers y estado global
│   ├── config/    # entorno, rutas, permisos y contenido institucional
│   ├── router/    # rutas públicas, invitadas y protegidas
│   ├── layouts/   # layouts público, de acceso y privado
│   ├── components/# UI compartida
│   ├── pages/     # páginas públicas y de error
│   ├── features/  # módulos funcionales
│   ├── services/  # transporte, sesión y errores
│   ├── styles/    # tokens y estilos globales
│   └── utils/     # utilidades transversales
└── tests/         # mocks, fixtures y E2E previstos
```

El sitio público se diseña mobile-first. El panel privado es desktop-first responsive y debe conservar todas las funciones en tablet y móvil.

## Tecnologías

### Backend implementado

| Área | Tecnología |
|---|---|
| Runtime | Node.js 22.19 |
| HTTP | Express 5 |
| Lenguaje | JavaScript CommonJS |
| Base de datos | PostgreSQL 16+ |
| ORM y migraciones | Sequelize 6 y Sequelize CLI |
| Validación | Joi |
| Autenticación | JWT, refresh opaco y bcrypt |
| Seguridad HTTP | Helmet, CORS y rate limiting |
| Uploads | Multer |
| Fechas | Luxon |
| Logging | Pino |
| Pruebas | Jest y Supertest |
| Calidad | ESLint |

### Frontend disponible actualmente

- React 19.
- React DOM 19.
- Vite 8.
- JavaScript con módulos ES.
- ESLint.

### Frontend previsto por la arquitectura

React Router, Axios, Redux Toolkit, React Hook Form, Joi, date-fns, FullCalendar, React Icons, React Helmet Async, Vitest, React Testing Library, MSW y Playwright se incorporarán por etapas. No deben considerarse instalados hasta que figuren en `client/package.json` y su configuración sea ejecutable.

## Requisitos locales

- Node.js `22.19.x` para la API.
- npm `9.5.0` o superior.
- PostgreSQL `16` o superior.
- Una base de desarrollo.
- Una base de pruebas separada y desechable para las suites de integración y concurrencia.

La versión de Node del backend también está declarada en `api/.nvmrc`.

## Puesta en marcha

### 1. Instalar la API

Desde la raíz:

```bash
cd api
npm install
```

Para reproducir exactamente el lockfile en CI:

```bash
npm ci
```

### 2. Configurar el entorno del backend

En macOS o Linux:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Configurar como mínimo:

| Variable | Propósito |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL de desarrollo. |
| `TEST_DATABASE_URL` | Base desechable para integración y concurrencia. |
| `JWT_ACCESS_SECRET` | Firma de access tokens; mínimo 32 caracteres. |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por coma. |

`api/src/config/env.js` valida el contrato completo durante el arranque. Consultar [api/.env.example](api/.env.example) para límites, cookies, pool, logging, uploads y credenciales iniciales de administración.

Nunca versionar `.env`, contraseñas, tokens, DNI reales ni secretos.

### 3. Preparar PostgreSQL

Crear previamente las bases indicadas en `DATABASE_URL` y `TEST_DATABASE_URL`. Luego, desde `api/`:

```bash
npm run db:migrate
npm run db:status
npm run db:validate
```

No ejecutar pruebas destructivas contra una base persistente o con datos reales.

### 4. Cargar datos

Catálogos mínimos de roles y asuntos:

```bash
npm run db:seed:base
```

Datos ficticios para desarrollo:

```bash
npm run db:seed:development
```

El seeder de desarrollo solo debe utilizar contenido ficticio y se omite fuera de `NODE_ENV=development`.

Para crear el primer administrador de una instalación real, definir temporalmente `ADMIN_NOMBRE`, `ADMIN_APELLIDO`, `ADMIN_DNI` y `ADMIN_EMAIL` y ejecutar:

```bash
node scripts/create-admin.js
```

Las credenciales iniciales deben cambiarse antes de habilitar el sistema.

### 5. Iniciar la API

```bash
npm run dev
```

Para ejecución normal:

```bash
npm start
```

La API publica:

- `GET /health`: estado del proceso HTTP.
- `GET /ready`: disponibilidad de PostgreSQL.
- `/api/v1`: API versionada.

### 6. Instalar e iniciar el cliente

En otra terminal, desde la raíz:

```bash
cd client
npm install
npm run dev
```

El contrato de entorno del frontend todavía no está implementado. La documentación prevé una URL de API, una URL base de archivos y el nombre de la aplicación; sus nombres definitivos deben normalizarse en `client/src/config/env.js` y reflejarse en `client/.env.example` antes de usarlos.

Las variables `VITE_*` son públicas para el navegador y nunca deben contener secretos.

## Scripts disponibles

### API

| Comando desde `api/` | Función |
|---|---|
| `npm start` | Inicia el servidor con Node. |
| `npm run dev` | Inicia el servidor con recarga mediante Nodemon. |
| `npm run lint` | Ejecuta ESLint. |
| `npm test` | Ejecuta todos los proyectos Jest secuencialmente. |
| `npm run test:unit` | Ejecuta pruebas unitarias sin PostgreSQL. |
| `npm run test:integration` | Ejecuta pruebas HTTP con la base de test. |
| `npm run test:concurrency` | Verifica garantías concurrentes con la base de test. |
| `npm run test:coverage` | Genera cobertura Jest. |
| `npm run db:migrate` | Aplica migraciones pendientes. |
| `npm run db:migrate:undo` | Revierte la última migración. |
| `npm run db:status` | Muestra el estado de migraciones. |
| `npm run db:seed:base` | Carga catálogos mínimos. |
| `npm run db:seed:development` | Carga todos los seeders de desarrollo. |
| `npm run db:validate` | Contrasta la base con el esquema esperado. |
| `npm run docs:validate` | Valida estructura y consistencia documental de la API. |

### Cliente

| Comando desde `client/` | Función |
|---|---|
| `npm run dev` | Inicia Vite en desarrollo. |
| `npm run build` | Genera el build de producción. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run preview` | Sirve localmente el build generado. |

El cliente todavía no tiene scripts ejecutables de pruebas. Vitest, Testing Library, MSW y Playwright pertenecen a la estrategia prevista.

## API y sesiones

La API utiliza respuestas JSON consistentes bajo `/api/v1`.

Respuesta exitosa:

```json
{
  "data": {
    "id": "uuid"
  }
}
```

Respuesta paginada:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

Error esperado:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisá los datos enviados.",
    "details": []
  }
}
```

Flujo de autenticación:

1. El usuario inicia sesión con correo y DNI.
2. La API devuelve un access token de corta duración.
3. El refresh token se entrega mediante cookie `HttpOnly` y se almacena hasheado en el backend.
4. Cada solicitud privada valida JWT, sesión persistida y estado actual del usuario.
5. El refresh rota el token; reutilizar uno anterior revoca la sesión afectada.
6. El frontend mantiene el access token en memoria y nunca persiste credenciales o contenido clínico.

El frontend debe tratar explícitamente respuestas `401`, `403`, `409` y `422`. Ocultar una acción no reemplaza la autorización del servidor.

## Seguridad y privacidad

- Utilizar HTTPS y `COOKIE_SECURE=true` en producción.
- Configurar `CORS_ORIGINS` mediante allowlist explícita.
- No registrar tokens, cookies, DNI, mensajes, notas internas ni contenido clínico.
- No persistir datos sensibles en `localStorage` o `sessionStorage`.
- No confiar en nombres o tipos MIME enviados por el cliente al validar imágenes.
- Mantener `UPLOAD_ROOT` en almacenamiento persistente y con estrategia de backup.
- No versionar uploads dinámicos ni datos reales.
- No editar migraciones ya aplicadas; crear una migración nueva y reversible.
- La auditoría nunca almacena contraseñas, tokens, DNI, mensajes ni contenido de informes.
- Los datos ficticios de desarrollo no deben aparecer como reales en producción.
- La política de privacidad pública requiere revisión legal antes de una publicación real.

## Verificación

### Backend

Desde `api/`:

```bash
npm run lint
npm run test:unit
npm run test:integration
npm run test:concurrency
npm run docs:validate
```

Las suites de integración y concurrencia requieren `TEST_DATABASE_URL`. Las unitarias no necesitan PostgreSQL.

### Frontend

Desde `client/`:

```bash
npm run lint
npm run build
```

La estrategia futura exige pruebas unitarias, de componentes, integración con MSW y E2E con Playwright. El objetivo documental de cobertura es al menos 80 %, priorizando autenticación, permisos, pacientes, agenda, informes, mensajería y rutas públicas.

## Documentación

### Backend

- [README de la API](api/README.md)
- [Arquitectura del backend](api/docs/arquitectura-backend.md)
- [Modelo de datos](api/docs/modelo-datos.md)
- [Contrato de la API](api/docs/contrato-api.md)
- [Matriz de permisos](api/docs/matriz-permisos.md)

### Frontend

- [README del cliente](client/README.md)
- [Arquitectura del frontend privado](client/doc/01-ARQUITECTURA-FRONTEND-PRIVADO-MVP.md)
- [Arquitectura del frontend público](client/doc/01-ARQUITECTURA-FRONTEND-PUBLICO-MVP.md)
- [Decisiones del frontend privado](client/doc/09-REGISTRO-DECISIONES-FRONTEND-PRIVADO-MVP.md)
- [Decisiones del frontend público](client/doc/07-REGISTRO-DECISIONES-PUBLICO-MVP.md)
- [Validación cruzada del MVP](client/doc/10-INFORME-VALIDACION-CRUZADA-MVP.md)
- [Documentación privada consolidada](client/doc/DOCUMENTACION-FRONTEND-PRIVADO-MVP-CONSOLIDADA.md)
- [Documentación pública consolidada](client/doc/DOCUMENTACION-FRONTEND-PUBLICO-MVP-CONSOLIDADA.md)

## Precedencia documental

Ante contradicciones:

1. Reglas de negocio confirmadas del MVP.
2. Ajustes backend derivados de los frontends.
3. Matriz de permisos y contrato HTTP del backend.
4. Modelo de datos y migraciones aplicables.
5. Registros vigentes de decisiones privadas y públicas.
6. Documentos consolidados y documentos temáticos.
7. Ejemplos, prototipos y material histórico.

Una decisión confirmada no debe cambiarse silenciosamente en código. Si un cambio afecta contrato, permisos, datos o comportamiento público, actualizar también la documentación y las pruebas correspondientes.

## Flujo recomendado de contribución

1. Leer el `AGENTS.md` del área afectada.
2. Consultar el documento normativo y el contrato correspondiente.
3. Verificar el estado real en `package.json`, migraciones y código.
4. Mantener el cambio dentro del módulo o feature responsable.
5. Actualizar documentación cuando cambien interfaces, permisos o reglas.
6. Ejecutar lint, pruebas y build aplicables.
7. Informar claramente cualquier comprobación que no haya podido ejecutarse.

## Pendientes para producción

- Seleccionar proveedor de hosting y estrategia de despliegue.
- Definir dominio y URLs definitivas.
- Proveer almacenamiento persistente y backup para uploads.
- Cerrar política de CORS y cookies para el entorno real.
- Configurar monitoreo, observabilidad y retención de logs.
- Sustituir o confirmar todos los datos e imágenes ficticios.
- Revisar textos legales y responsable del tratamiento de datos.
- Ejecutar pruebas de carga con volumen representativo.
- Incorporar CI/CD cuando el flujo de entrega esté definido.

El proyecto no debe anunciarse como listo para producción hasta resolver estos puntos y validar ambos proyectos en el entorno de destino.
