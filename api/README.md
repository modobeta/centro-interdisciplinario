# API del Centro Educativo Interdisciplinario Terapéutico

Backend REST para gestionar la operación de un centro educativo, interdisciplinario y terapéutico. La API centraliza autenticación, usuarios, pacientes, vínculos profesionales, agenda, informes, mensajería, catálogos y auditoría.

Este directorio contiene únicamente el backend. El frontend, cuando está disponible en el mismo repositorio, vive en `../client/`.

## Estado y alcance

El proyecto implementa el MVP documentado. Usa un monolito modular: todos los módulos se despliegan juntos, pero cada dominio conserva sus rutas, validaciones, controllers, servicios y policies.

Las reglas funcionales se encuentran en `docs/`. El código no debe ampliar endpoints, permisos o estructuras de datos sin actualizar primero la documentación normativa correspondiente.

## Stack tecnológico

| Área | Tecnología | Responsabilidad |
|---|---|---|
| Runtime | Node.js 22.19 | Ejecución del backend |
| Framework HTTP | Express 5 | Rutas, middlewares y respuestas REST |
| Lenguaje | JavaScript CommonJS | Implementación del servidor |
| Base de datos | PostgreSQL 16+ | Persistencia e integridad concurrente |
| ORM | Sequelize 6 | Modelos, consultas y transacciones |
| Validación | Joi | Validación y normalización de entradas |
| Autenticación | JWT, refresh opaco y bcrypt | Sesiones, tokens y credenciales |
| Logging | Pino | Logs estructurados con campos sensibles ocultos |
| Pruebas | Jest y Supertest | Pruebas unitarias, HTTP y de concurrencia |
| Calidad | ESLint | Reglas estáticas del código |

## Requisitos

- Node.js `22.19.x`.
- npm `9.5.0` o superior.
- PostgreSQL `16` o superior.
- Una base de desarrollo y, para la suite completa, una base de pruebas desechable.

La versión esperada de Node también está declarada en `.nvmrc`.

## Instalación

Desde la carpeta `api/`:

```bash
npm install
```

En CI o cuando se necesita reproducir exactamente `package-lock.json`:

```bash
npm ci
```

## Configuración del entorno

Copiar el contrato de ejemplo:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

Luego ajustar como mínimo:

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión PostgreSQL de desarrollo |
| `TEST_DATABASE_URL` | Base desechable usada por pruebas de integración |
| `JWT_ACCESS_SECRET` | Firma de access tokens; debe tener al menos 32 caracteres |
| `CORS_ORIGINS` | Orígenes web permitidos, separados por coma |

`src/config/env.js` valida todas las variables durante el arranque. La API falla de forma temprana cuando la configuración requerida es inválida; esto evita descubrir el problema después de aceptar tráfico.

No se deben versionar archivos `.env`, credenciales, tokens ni datos reales.

## Preparación de PostgreSQL

La aplicación no usa `sequelize.sync()`. Las migraciones son la única fuente de verdad del esquema.

Aplicar y comprobar migraciones:

```bash
npm run db:migrate
npm run db:status
npm run db:validate
```

### Datos iniciales mínimos

Para cargar solamente roles y asuntos canónicos:

```bash
npm run db:seed:base
```

### Datos ficticios de desarrollo

Para disponer de usuarios, servicios, consultorios y tipos de informe con los que explorar la aplicación:

```bash
npm run db:seed:development
```

El seeder de desarrollo:

- se omite fuera de `NODE_ENV=development`;
- puede ejecutarse más de una vez sin duplicar registros;
- guarda los DNI iniciales mediante bcrypt;
- carga perfiles y contenidos completamente ficticios;
- crea asignaciones habituales de servicios para los prestadores.

Las credenciales ficticias están declaradas en `seeders/0003-seed-development-data.js` para facilitar el trabajo local. No deben reutilizarse en una instalación real.

### Primer administrador de una instalación real

Definir temporalmente `ADMIN_NOMBRE`, `ADMIN_APELLIDO`, `ADMIN_DNI` y `ADMIN_EMAIL` en `.env`, y ejecutar:

```bash
node scripts/create-admin.js
```

El script valida los datos, busca el rol canónico y persiste sólo el hash bcrypt del DNI. Debe utilizarse de forma controlada y las credenciales iniciales deben cambiarse antes de habilitar el sistema.

## Ejecución

Desarrollo con reinicio automático:

```bash
npm run dev
```

Ejecución normal:

```bash
npm start
```

Por defecto, la API escucha en el puerto configurado por `PORT` y publica:

- `GET /health`: comprueba que el proceso HTTP responde, sin consultar PostgreSQL.
- `GET /ready`: comprueba que PostgreSQL está disponible.
- `/api/v1`: prefijo de la API versionada.

## Autenticación en pocas palabras

1. El usuario inicia sesión con correo y DNI.
2. La API devuelve un access token de duración corta.
3. El refresh token se entrega mediante cookie `HttpOnly` y nunca se guarda en texto plano.
4. Cada solicitud privada verifica el JWT, la sesión persistida y el estado actual del usuario.
5. Renovar la sesión rota el refresh token; reutilizar el anterior revoca la sesión afectada.

La lista de permisos devuelta en el login ayuda a construir la interfaz, pero no reemplaza las policies del backend.

## Organización del código

```text
api/
├── docs/                       Especificaciones normativas y contrato HTTP
├── migrations/                 Evolución reversible del esquema PostgreSQL
├── seeders/                    Catálogos base y datos ficticios de desarrollo
├── scripts/                    Tareas operativas y validadores manuales
├── src/
│   ├── config/                 Entorno, CORS, logging y Sequelize CLI
│   ├── modules/                Dominios funcionales de la aplicación
│   │   └── <modulo>/
│   │       ├── *.routes.js     Método, URL y middlewares
│   │       ├── *.validation.js Forma válida de la entrada
│   │       ├── *.controller.js Adaptación entre HTTP y negocio
│   │       ├── *.service.js    Casos de uso y transacciones
│   │       ├── *.policy.js     Decisiones de acceso por recurso
│   │       └── *.projection.js Campos permitidos en la respuesta
│   ├── routes/                 Composición de rutas públicas y privadas
│   ├── shared/                 Infraestructura reutilizable y modelos
│   ├── app.js                  Composición de Express sin abrir el puerto
│   └── server.js               Arranque y apagado controlado
└── tests/
    ├── unit/                   Reglas puras y validaciones rápidas
    ├── integration/            Contrato HTTP con PostgreSQL
    └── concurrency/            Garantías que requieren solicitudes simultáneas
```

El flujo habitual de una solicitud privada es:

```text
Route → Middleware → Validation → Controller → Service → Model/PostgreSQL
```

Los controllers deben permanecer delgados. Las reglas que necesitan consultar datos o coordinar escrituras pertenecen a los services; las garantías críticas de unicidad y concurrencia también se respaldan en PostgreSQL.

## API y documentación

La referencia detallada de endpoints está en [docs/contrato-api.md](docs/contrato-api.md). Allí se documentan:

- método y URL;
- autenticación y permisos;
- parámetros de ruta y query;
- cuerpos de solicitud;
- respuestas y códigos HTTP;
- errores funcionales esperados.

Documentos complementarios:

- [docs/matriz-permisos.md](docs/matriz-permisos.md): roles, alcance y campos visibles.
- [docs/modelo-datos.md](docs/modelo-datos.md): tablas, relaciones, índices y constraints.
- [docs/arquitectura-backend.md](docs/arquitectura-backend.md): capas, seguridad y criterios técnicos.

## Respuestas HTTP

Respuesta exitosa simple:

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

## Verificación y calidad

```bash
npm run lint
npm run test:unit
npm run test:integration
npm run test:concurrency
npm run docs:validate
```

Consideraciones:

- Las pruebas unitarias no requieren PostgreSQL.
- Las pruebas de integración y concurrencia requieren una base desechable en `TEST_DATABASE_URL`.
- Nunca se deben ejecutar pruebas destructivas contra una base persistente.
- `docs:validate` comprueba estructura Markdown, inventario de endpoints y catálogo de errores.

## Seguridad operativa

- Usar HTTPS y `COOKIE_SECURE=true` en producción.
- Configurar una allowlist explícita en `CORS_ORIGINS`.
- No registrar tokens, cookies, DNI, mensajes ni contenido clínico.
- Mantener `UPLOAD_ROOT` en almacenamiento persistente y fuera de artefactos efímeros.
- No editar migraciones ya aplicadas; cualquier cambio de esquema requiere una migración nueva y reversible.
- No confiar en nombres o tipos MIME enviados por el cliente para validar imágenes.

## Procedimiento recomendado para contribuir

1. Leer el `AGENTS.md` del área afectada.
2. Consultar el documento normativo correspondiente.
3. Mantener el cambio dentro del módulo dueño del caso de uso.
4. Actualizar contrato, permisos o modelo cuando cambie comportamiento público.
5. Ejecutar las verificaciones relevantes antes de entregar el cambio.
