# API — Sistema de Gestión para Centros Interdisciplinarios

Backend del sistema de gestión para centros educativos, interdisciplinarios y terapéuticos. Proporciona una API REST para administrar usuarios, pacientes, tutores, profesionales, servicios, consultorios, turnos, informes, mensajería y auditoría.

> Este directorio contiene únicamente el backend. La aplicación frontend se encuentra en `../client/`.

## Tecnologías principales

- Node.js 22.19.0
- Express 5
- JavaScript con CommonJS
- PostgreSQL 16+
- Sequelize 6
- Joi
- JSON Web Token
- bcrypt
- Pino
- Jest
- Supertest

## Requisitos previos

Antes de iniciar el proyecto, es necesario tener instalado:

- Node.js 22.19.0
- npm
- PostgreSQL 16 o superior
- Git

## Instalación

Desde la carpeta `api/`, instalar las dependencias:

```bash
npm install
```

Para una instalación reproducible en CI o después de clonar el repositorio:

```bash
npm ci
```

Copiá `.env.example` como `.env`, reemplazá todos los valores sensibles y creá las bases de desarrollo y prueba. La aplicación exige PostgreSQL 16 o superior; no usa `sequelize.sync()`.

## Base de datos

```bash
npm run db:migrate
npx sequelize-cli db:seed:all
npm run db:status
npm run db:validate
```

Las 21 migraciones crean exactamente las 17 tablas de la baseline v4.2. Los seeders productivos cargan únicamente los cuatro roles y los cinco asuntos canónicos.

Para crear el primer administrador, definí temporalmente `ADMIN_NOMBRE`, `ADMIN_APELLIDO`, `ADMIN_DNI` y `ADMIN_EMAIL`, y ejecutá:

```bash
node scripts/create-admin.js
```

El DNI normalizado se usa como credencial inicial y se almacena exclusivamente como hash bcrypt. Cambialo mediante el flujo administrativo antes de habilitar el sistema a usuarios reales.

## Ejecución

```bash
npm run dev
# o
npm start
```

- `GET /health` comprueba el proceso sin acceder a PostgreSQL.
- `GET /ready` devuelve `200` solo cuando PostgreSQL responde.
- La API versionada se publica bajo `/api/v1`.

## Verificación

```bash
npm run lint
npm run test:unit
npm run test:integration
npm run test:concurrency
npm run docs:validate
```

Las pruebas de integración y concurrencia requieren una instancia PostgreSQL 16 desechable en `TEST_DATABASE_URL`. No apuntes esos comandos a una base persistente. Si el entorno no dispone de PostgreSQL, esas verificaciones quedan pendientes y no deben informarse como aprobadas.

## Documentación normativa

- `docs/contrato-api.md`: interfaz HTTP.
- `docs/matriz-permisos.md`: autorización, scopes y campos.
- `docs/modelo-datos.md`: persistencia e integridad.
- `docs/arquitectura-backend.md`: estructura y criterios técnicos.

Cada documento es autoridad únicamente en su incumbencia. `AGENTS.md` y las skills locales describen el procedimiento de trabajo, pero no reemplazan estas especificaciones.

## Seguridad operativa

- No registres tokens, cookies, DNI, contenido clínico ni mensajes.
- En producción usá HTTPS, `COOKIE_SECURE=true` y una allowlist CORS explícita.
- Conservá `UPLOAD_ROOT` en almacenamiento persistente y fuera de artefactos efímeros.
- Las migraciones aplicadas no se editan: cualquier evolución se agrega como una nueva migración reversible.
