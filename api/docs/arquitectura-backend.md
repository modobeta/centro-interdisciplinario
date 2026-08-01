# Centro Educativo Interdisciplinario Terapéutico
## Arquitectura del backend — MVP

**Versión documental:** 4.1
**Fecha:** 1 de agosto de 2026  
**Estado:** baseline normativo para implementación  
**Alcance:** estructura, capas, tecnologías y criterios generales del backend

---

## 1. Propósito

Este documento define la arquitectura técnica obligatoria del backend del MVP. Establece:

- estilo arquitectónico;
- stack aprobado;
- estructura de carpetas;
- responsabilidades y dependencias entre capas;
- criterios de configuración, persistencia, seguridad y operación;
- estrategia de pruebas;
- riesgos aceptados y deuda técnica no bloqueante.

Debe leerse junto con:

- `docs/contrato-api.md`: interfaz HTTP, endpoints, entradas, respuestas y errores;
- `docs/matriz-permisos.md`: autorización por rol, recurso, acción y campo;
- `docs/modelo-datos.md`: entidades, relaciones, índices y constraints;
- `api/AGENTS.md` y los `AGENTS.md` especializados: instrucciones operativas para agentes y desarrolladores.

Este archivo no reemplaza el contrato de API, la matriz de permisos ni el modelo de datos. Cuando una decisión afecte esas fuentes, todas deben actualizarse de manera coordinada.

---

## 2. Autoridad documental y jerarquía operativa

Cada fuente es autoridad dentro de su incumbencia:

| Fuente | Autoridad |
|---|---|
| `docs/contrato-api.md` | Método, URL, entrada, salida, status y códigos. |
| `docs/matriz-permisos.md` | Rol, acción, scope, policy y campos. |
| `docs/modelo-datos.md` | Tablas, relaciones, índices, constraints y transacciones. |
| Este documento | Estructura, capas, stack y criterios técnicos. |

Los requerimientos y decisiones expresamente aprobadas originan los cambios,
pero deben incorporarse en todas las fuentes afectadas. Ningún documento
prevalece fuera de su incumbencia; una incompatibilidad transversal detiene la
parte afectada hasta armonizarla.

`api/AGENTS.md` contiene reglas operativas comunes. El `AGENTS.md` más cercano
especializa cómo trabajar dentro de su carpeta y prevalece sobre el raíz solo en
detalles operativos de ese alcance. Ningún `AGENTS.md` modifica comportamiento,
permisos, esquema o contrato normativo.

Si dos fuentes se contradicen, la implementación afectada debe detenerse hasta obtener una decisión. No se elige por conveniencia técnica ni se modifica la documentación para justificar código incompatible.

---

## 3. Contexto del sistema

El producto se divide en dos aplicaciones independientes dentro del mismo proyecto:

```text
centro-educativo-interdisciplinario-terapeutico/
├── api/       Backend Node.js + Express
└── client/    Frontend React + Vite
```

El frontend contiene el sitio público y el panel privado en una misma aplicación React. El backend expone:

- una API REST versionada bajo `/api/v1`;
- endpoints operativos en `/health` y `/ready`;
- imágenes públicas controladas bajo `/uploads`.

La comunicación de negocio se realiza mediante HTTPS y JSON, excepto las rutas administrativas de imágenes, que reciben `multipart/form-data`.

### 3.1 Unidad de despliegue

Cada centro utiliza:

- una instalación independiente del backend;
- una base PostgreSQL independiente;
- su propia configuración y almacenamiento de imágenes.

El MVP no implementa multi-tenancy dentro de una base compartida. No debe agregarse `tenant_id` de manera preventiva ni introducirse aislamiento lógico entre centros dentro de una misma instalación.

---

## 4. Estilo arquitectónico

El backend es un **monolito modular**:

- un único proceso de aplicación;
- un único artefacto desplegable;
- una única conexión lógica a PostgreSQL;
- módulos separados por funcionalidad de negocio;
- infraestructura transversal compartida de forma controlada.

No se utilizan microservicios, DDD completo, CQRS, event sourcing ni una capa Repository durante el MVP.

### 4.1 Razones de la decisión

El monolito modular es apropiado porque:

- el dominio pertenece a una sola institución por despliegue;
- el equipo necesita una estructura clara y de baja complejidad operativa;
- numerosas operaciones atraviesan módulos y requieren una única transacción;
- no existe una necesidad aprobada de escalar módulos por separado;
- reduce fallos de red internos, infraestructura distribuida y duplicación de observabilidad;
- permite evolucionar por módulos sin asumir anticipadamente el costo de microservicios.

### 4.2 Decisiones deliberadamente excluidas

No realizar durante el MVP:

- migración a TypeScript;
- migración de CommonJS a ES Modules;
- división en microservicios;
- introducción de una capa Repository genérica;
- DDD completo con capas `domain`, `application`, `infrastructure` y `presentation`;
- abstracciones genéricas sin un caso de uso concreto;
- reemplazo de PostgreSQL o Sequelize;
- uso de MongoDB o Mongoose;
- roles configurables desde la interfaz;
- multi-tenancy compartido;
- sincronización del esquema con `sequelize.sync()`.

Estas exclusiones son decisiones de alcance y simplicidad. Un agente no debe “modernizar” el proyecto contradiciéndolas.

---

## 5. Vista lógica

```text
Frontend React
  │
  │ HTTPS / JSON o multipart
  ▼
Express
  ├── seguridad HTTP y contexto de request
  ├── autenticación y permiso general
  ├── validación Joi
  ├── controllers
  ├── services, policies y proyecciones
  └── Sequelize
        │
        │ pool y transacciones
        ▼
PostgreSQL
  ├── claves y relaciones
  ├── UNIQUE y CHECK
  ├── índices
  └── exclusiones de rangos
```

La API es la autoridad sobre reglas, permisos y datos. El frontend puede anticipar errores y ocultar acciones no disponibles, pero nunca constituye una barrera de seguridad.

---

## 6. Flujo obligatorio de una solicitud

Toda solicitud funcional sigue este recorrido:

```text
Route
→ Middleware
→ Validation
→ Controller
→ Service
→ Model / PostgreSQL
→ Proyección
→ Controller
→ Respuesta HTTP
```

Una operación privada debe resolver, según corresponda:

1. autenticación;
2. vigencia de usuario y sesión;
3. permiso general del rol;
4. validación de `params`, `query` y `body`;
5. acceso del actor al recurso;
6. regla de negocio y transición de estado;
7. transacción e integridad;
8. proyección de filas y campos;
9. auditoría funcional;
10. respuesta conforme al contrato.

No se saltan capas para acelerar una implementación.

---

## 7. Responsabilidades por capa

### 7.1 Routes

Las routes:

- declaran método y URL;
- componen middlewares;
- vinculan validation y controller;
- documentan de forma visible el orden de la cadena HTTP.

No deben:

- consultar modelos;
- implementar reglas de negocio;
- iniciar transacciones;
- construir respuestas complejas;
- decidir acceso por recurso.

### 7.2 Middlewares

Los middlewares transversales pueden:

- generar o validar `correlation_id`;
- configurar seguridad HTTP;
- autenticar access tokens;
- comprobar permisos generales;
- aplicar rate limiting;
- validar la forma de entradas mediante Joi;
- normalizar `404` y errores finales.

No deben reemplazar las policies dependientes del recurso. Un middleware puede comprobar que el actor posee `appointments.manageOwn`, pero el service debe verificar que el turno concreto pertenece a ese actor.

### 7.3 Validation

Los schemas Joi validan:

- `params`;
- `query`;
- `body`;
- tipos, formatos, enums y longitudes;
- presencia, opcionalidad y nulabilidad;
- listas blancas de filtros y orden;
- propiedades inesperadas.

No deben:

- consultar PostgreSQL;
- decidir permisos sobre un recurso existente;
- verificar solapamientos;
- reemplazar constraints;
- implementar transiciones dependientes del estado persistido.

### 7.4 Controllers

Los controllers:

- reciben entradas ya validadas;
- obtienen al actor desde el contexto autenticado;
- invocan un caso de uso del service;
- seleccionan el status HTTP;
- devuelven el envelope definido por el contrato.

No deben:

- acceder directamente a Sequelize;
- implementar negocio o autorización por recurso;
- controlar transacciones;
- devolver instancias completas de modelos;
- contener lógica divergente de serialización por rol.

### 7.5 Services

Los services son la capa principal de negocio. Deben:

- recibir explícitamente al actor cuando exista autorización;
- consultar y modificar modelos Sequelize;
- aplicar policies por recurso;
- validar estados, relaciones y transiciones;
- coordinar otros services mediante interfaces públicas pequeñas;
- abrir y propagar transacciones;
- traducir conflictos conocidos a errores funcionales;
- seleccionar la proyección autorizada;
- generar auditoría cuando corresponda.

Los services no dependen de `req`, `res`, cookies ni status HTTP.

### 7.6 Policies

Las policies resuelven autorización dependiente de datos, por ejemplo:

```text
canAccessPatient(actor, patient)
canManagePatientLinks(actor, patient)
canAccessAppointment(actor, appointment)
canReadAppointmentInternalNotes(actor, appointment)
canAccessReport(actor, report)
canEditReport(actor, report)
canAccessConversation(actor, conversation)
canRequestUserProjection(actor, projection, filters)
```

Deben ser explícitas, testeables y reutilizadas por el service dueño del recurso. No concentrar toda la autorización en un único condicional por rol ni duplicarla en controllers.

### 7.7 Proyecciones y serialización

Una proyección define qué filas, relaciones y campos puede recibir el actor.

Reglas:

- utilizar listas positivas de atributos;
- no devolver `model.toJSON()` como respuesta final;
- no confiar únicamente en `exclude` para datos sensibles;
- cargar solo asociaciones necesarias;
- evitar consultas N+1;
- mantener separadas las proyecciones pública, selector, directorio, administrativa y de detalle;
- aplicar la proyección en el backend aunque el frontend no muestre el campo.

### 7.8 Models y PostgreSQL

Los modelos Sequelize:

- reflejan tablas, columnas y asociaciones;
- centralizan el mapping entre `camelCase` y `snake_case`;
- no implementan casos de uso completos;
- no esconden reglas críticas únicamente en hooks;
- deben permanecer alineados con las migraciones.

PostgreSQL es el garante final de integridad y concurrencia. Debe sostener las reglas que no pueden depender solo de una verificación previa en JavaScript.

---

## 8. Comunicación entre módulos

Una operación compleja pertenece al módulo que representa el caso de uso principal. Ese service puede invocar funciones públicas y acotadas de otros services.

Ejemplo conceptual actualizado:

```text
turnos.service.createAppointment()
  → pacientes.service.requireActivePatient()
  → usuarios.service.requireActiveProvider()
  → servicios.service.requireActiveService()
  → consultorios.service.requireActiveRoom()
  → vinculos.service.ensureAutomaticLinkWhenAllowed()
  → Turno.create(..., { transaction })
  → auditoria.service.record(..., { transaction })
```

El servicio activo del turno no necesita ser un servicio habitual del prestador.

Para evitar dependencias circulares:

- no realizar imports bidireccionales entre services;
- exportar funciones pequeñas de dominio;
- registrar asociaciones Sequelize en un punto central;
- no importar modelos internos de otro módulo desde controllers;
- mover una utilidad a `shared/` solo cuando sea genuinamente transversal y no contenga negocio de un módulo.

No se adopta un bus de eventos interno durante el MVP. Las operaciones síncronas y transaccionales deben mantenerse visibles.

---

## 9. Estructura de carpetas

El siguiente árbol es la estructura objetivo del MVP, no una afirmación de que
todos los archivos ya estén implementados. El scaffold puede contener módulos
vacíos o carecer temporalmente de piezas futuras; una tarea solo crea las piezas
necesarias para su alcance y conserva esta distribución.

```text
api/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   ├── cors.js
│   │   └── logger.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── private.routes.js
│   │   └── public.routes.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── resumen/
│   │   ├── usuarios/
│   │   ├── pacientes/
│   │   ├── vinculos/
│   │   ├── turnos/
│   │   ├── informes/
│   │   ├── mensajeria/
│   │   ├── servicios/
│   │   ├── consultorios/
│   │   ├── asuntos/
│   │   ├── tipos-informe/
│   │   ├── auditoria/
│   │   └── public/
│   └── shared/
│       ├── database/
│       │   ├── models/
│       │   ├── sequelize.js
│       │   ├── associations.js
│       │   └── transaction.js
│       ├── errors/
│       ├── files/
│       ├── logging/
│       ├── middlewares/
│       ├── permissions/
│       └── utils/
├── migrations/
├── seeders/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── factories/
│   └── helpers/
├── uploads/
│   ├── usuarios/
│   └── servicios/
├── scripts/
├── docs/
├── .env.example
├── .sequelizerc
├── AGENTS.md
├── eslint.config.js
├── jest.config.js
├── package.json
└── package-lock.json
```

### 9.1 Estructura interna de un módulo

Cada módulo incorpora únicamente las piezas que necesita:

```text
src/modules/turnos/
├── turno.routes.js
├── turno.validation.js
├── turno.controller.js
├── turno.service.js
├── turno.policy.js
├── turno.projection.js
├── turno.constants.js
└── AGENTS.md
```

Los modelos Sequelize se centralizan en `src/shared/database/models/`. Esta decisión evita asociaciones circulares y mantiene el registro del esquema en un único punto. La lógica de negocio continúa dentro del módulo dueño del recurso.

No todo módulo requiere `policy`, `projection`, `constants` o `AGENTS.md`. Se agregan solo cuando la complejidad real lo justifica.

### 9.2 Responsabilidad de archivos raíz

- `src/app.js`: construye Express, monta middlewares y rutas; no escucha el puerto.
- `src/server.js`: valida dependencias, inicia HTTP y gestiona el apagado.
- `src/routes/index.js`: compone las rutas versionadas de los módulos.
- `migrations/`: evolución versionada del esquema.
- `seeders/`: catálogos iniciales y datos no sensibles.
- `scripts/`: operaciones administrativas controladas, como crear el primer administrador.
- `uploads/`: archivos gestionados por el backend; los binarios reales no se versionan.

---

## 10. Convenciones de nombres

### 10.1 JavaScript

- archivos: minúsculas, con sufijo de responsabilidad;
- variables y funciones: `camelCase`;
- modelos y clases: `PascalCase`;
- constantes: `UPPER_SNAKE_CASE`;
- módulos: nombres en español coherentes con las rutas existentes;
- CommonJS mediante `require` y `module.exports`.

Ejemplos:

```text
turno.routes.js
turno.validation.js
turno.controller.js
turno.service.js
Turno
APPOINTMENT_OVERLAP
```

### 10.2 PostgreSQL

- tablas y columnas: `snake_case`;
- claves primarias: UUID;
- claves foráneas y constraints: nombres estables y descriptivos;
- instantes: `TIMESTAMPTZ`;
- fechas civiles: `DATE`;
- columnas de sistema: `created_at`, `updated_at` cuando correspondan.

### 10.3 API

- rutas REST: sustantivos plurales en español;
- permisos de sesión: identificadores estables en inglés con puntos;
- errores funcionales: mayúsculas con guion bajo;
- campos JSON: `camelCase`;
- IDs serializados como UUID en minúsculas.

No mantener dos nomenclaturas paralelas de permisos.

---

## 11. Stack técnico obligatorio

| Área | Tecnología o decisión |
|---|---|
| Runtime | Node.js LTS fijado en `.nvmrc` y `engines`. |
| Lenguaje | JavaScript. |
| Módulos | CommonJS. |
| HTTP | Express 5. |
| API | REST bajo `/api/v1`. |
| Base de datos | PostgreSQL 16 o superior. |
| ORM | Sequelize 6. |
| Driver | `pg`; cualquier complemento debe justificarse. |
| Migraciones | Sequelize CLI. |
| Validación | Joi. |
| Autenticación | JWT, refresh tokens rotativos y bcrypt. |
| Cookies | Cookie HttpOnly para refresh. |
| Seguridad HTTP | Helmet, CORS explícito, límites de payload y rate limiting. |
| Logging | Pino. |
| Uploads | Multer en endpoints administrativos específicos. |
| Pruebas | Jest y Supertest. |
| Calidad | ESLint; formateo definido por el proyecto. |

Las versiones exactas se fijan al inicializar el proyecto y quedan registradas en `package.json` y `package-lock.json`. No realizar actualizaciones mayores como parte incidental de otra tarea.

---

## 12. Configuración por entorno

Solo `src/config/env.js` puede leer `process.env`. El resto del sistema consume un objeto validado e inmutable.

### 12.1 Familias de configuración

`.env.example` debe documentar, sin valores reales:

- entorno y puerto;
- zona horaria del negocio;
- conexión y pool de PostgreSQL;
- secretos y expiraciones JWT;
- costo de bcrypt;
- nombre y atributos de la cookie;
- origen CORS;
- proxy confiable;
- límites de body e imágenes;
- nivel de logs;
- ruta o configuración del almacenamiento persistente.

### 12.2 Validación de arranque

La aplicación debe fallar antes de escuchar el puerto cuando:

- falta una variable obligatoria;
- una variable posee un formato inválido;
- los secretos son iguales o inseguros;
- `DATABASE_URL` es inválida;
- la zona horaria no es la aprobada o no puede interpretarse;
- producción utiliza cookie no segura;
- producción habilita CORS con `*`;
- la configuración de almacenamiento no garantiza escritura persistente.

### 12.3 Entornos

- `development`: base local, uploads locales y logs legibles.
- `test`: base y directorio de uploads aislados y descartables.
- `staging`: configuración equivalente a producción, sin datos personales reales.
- `production`: HTTPS, cookies seguras, logs estructurados, almacenamiento persistente y backups.

No incluir `.env`, credenciales, backups ni datos reales en Git.

---

## 13. Construcción de Express

Orden recomendado en `src/app.js`:

1. Helmet y cabeceras de seguridad;
2. CORS con origen explícito;
3. parser de cookies;
4. parser JSON con límite;
5. contexto de request y `correlation_id`;
6. logger HTTP sanitizado;
7. rate limiting global y específico;
8. `/health`, `/ready` y archivos públicos;
9. rutas `/api/v1`;
10. middleware de ruta no encontrada;
11. middleware central de errores.

El parser multipart no debe instalarse globalmente. Multer se aplica solo en los cuatro endpoints administrativos de imágenes documentados por el contrato.

---

## 14. Persistencia y Sequelize

### 14.1 Migraciones como fuente de verdad

Las migraciones son la única autoridad sobre el esquema físico.

Reglas:

- no usar `sequelize.sync()` en ningún entorno;
- crear una migración nueva para cada evolución;
- no editar una migración aplicada en un entorno compartido;
- definir `up` y un `down` seguro cuando sea posible;
- mantener migración, modelo y documentación alineados;
- ejecutar migraciones como un paso de despliegue, no desde cada réplica al arrancar;
- ejecutar las pruebas de integración contra una base creada mediante migraciones.

Las extensiones de PostgreSQL requeridas por UUID y constraints temporales deben declararse en migraciones y documentarse en `modelo-datos.md`.

### 14.2 Integridad en profundidad

Las reglas se sostienen en varias capas:

1. frontend: prevención y feedback temprano;
2. Joi: forma de entrada;
3. service: negocio, estado y autorización;
4. PostgreSQL: integridad final ante concurrencia.

La verificación previa de disponibilidad no reemplaza un constraint.

### 14.3 Constraints mínimos

PostgreSQL debe garantizar, según `modelo-datos.md`:

- claves primarias y foráneas;
- unicidad de identificadores funcionales;
- nulabilidad;
- estados válidos;
- integridad histórica;
- ausencia de solapamientos de prestador, paciente y consultorio;
- índices necesarios para listados, búsqueda, relaciones y cursores.

No eliminar un constraint para facilitar una prueba o simplificar un service.

### 14.4 Transacciones

Una transacción es obligatoria cuando varias escrituras constituyen una unidad funcional, entre ellas:

- paciente, tutor y relación;
- turno y vínculo automático;
- conversación, participantes y primer mensaje;
- incorporación de participante y estado inicial de lectura;
- refresh anterior y nueva sesión o token;
- cambio de rol y cierre de relaciones asociadas;
- desactivación y revocación de sesiones;
- transición de estado con auditoría;
- finalización de informe con auditoría.

Todas las operaciones relacionadas reciben la misma instancia de transacción. No abrir transacciones anidadas independientes ni confirmar resultados parciales.

### 14.5 Concurrencia

Las validaciones previas brindan mensajes claros, pero PostgreSQL decide el conflicto final.

Ante una violación de unicidad, exclusión o integridad:

1. Sequelize captura el error;
2. el service identifica el conflicto conocido;
3. se traduce a un código funcional estable;
4. la API responde conforme al contrato, normalmente `409`;
5. no se exponen SQL, constraints ni estructura interna.

La agenda y la rotación de sesiones requieren pruebas con solicitudes simultáneas reales.

Estrategias aprobadas:

- crear turnos o desactivar recursos bloquea paciente, prestador, servicio y
  consultorio en orden estable antes de validar;
- las transiciones de turno bloquean la fila del turno;
- editar o finalizar informes usa versión optimista y `expectedVersion`;
- incorporar participantes y enviar mensajes bloquea la conversación;
- avanzar lectura bloquea la participación y compara `(created_at, id)`;
- cambiar o desactivar al último administrador utiliza un advisory lock
  transaccional común.

---

## 15. Fechas, horas y zona horaria

La zona horaria del negocio es:

```text
America/Argentina/Cordoba
```

Reglas:

- almacenar instantes en UTC mediante `TIMESTAMPTZ`;
- almacenar fechas civiles mediante `DATE`;
- interpretar fecha y hora de agenda en la zona del centro;
- devolver instantes ISO 8601 conforme al contrato;
- centralizar conversiones en una utilidad testeada;
- no utilizar el huso horario local del servidor como regla;
- no concatenar manualmente fecha y hora para construir instantes;
- tratar `desde` como inclusivo y `hasta` como exclusivo en intervalos de agenda.
- ofrecer disponibilidad sobre una grilla de 15 minutos;
- cuando se filtra por prestador y consultorio, calcular la intersección de
  ambas disponibilidades.

Las reglas de días y franjas horarias pertenecen al módulo Turnos y a su documentación especializada.

---

## 16. Autenticación y sesiones

### 16.1 Compromisos arquitectónicos

- login con email y DNI durante el MVP;
- el DNI se normaliza y verifica contra un hash bcrypt;
- mensajes de autenticación genéricos;
- access token de corta duración;
- refresh token rotativo;
- refresh en cookie HttpOnly;
- refresh persistido únicamente como hash;
- varias sesiones simultáneas por usuario;
- revocación de sesión actual y de todas las sesiones;
- login y refresh sujetos a rate limiting y controles de estado;
- tokens sin DNI, email, teléfono ni datos clínicos.
- refresh opaco `<sessionId>.<secret>` con secreto aleatorio de 256 bits;
- digest SHA-256 vigente y anterior persistidos para rotación y detección de
  reutilización inmediata;
- consulta de sesión y usuario en PostgreSQL en cada request privada.

El uso del DNI como credencial es una simplificación funcional y un riesgo aceptado del MVP. No debe degradarse almacenándolo o comparándolo como texto plano.

### 16.2 Duraciones aprobadas

- access token: 15 minutos;
- refresh token: 7 días.

El refresh devuelve el usuario y los permisos vigentes, además del nuevo access token. La lista de permisos ayuda al frontend, pero no reemplaza la autorización del servidor.

### 16.3 Rotación, cookies y revocación

- refresh bloquea la fila de sesión y rota los digests atómicamente;
- reutilizar el digest anterior revoca esa sesión;
- una segunda renovación concurrente del mismo token se trata como
  reutilización y obliga a iniciar sesión nuevamente;
- consultar sesión y usuario en cada request hace inmediatos logout,
  desactivación y cambios de acceso;
- la cookie utiliza `HttpOnly`, `Path=/api/v1/auth`, sin `Domain`,
  `SameSite=Lax` por defecto y `Secure` obligatorio en producción;
- `SameSite=None` requiere `Secure` y configuración explícita;
- operaciones de cookie validan `Origin` contra una allowlist;
- el MVP no agrega un token CSRF adicional.

Desactivar o cambiar el rol del último administrador activo se impide mediante
una operación serializada en PostgreSQL.

---

## 17. Autorización y privacidad

La autorización se evalúa en cuatro dimensiones:

1. **rol y acción general**;
2. **alcance de filas**;
3. **policy sobre el recurso concreto**;
4. **proyección de campos**.

Reglas transversales:

- no existe herencia automática por jerarquía de rol;
- administrador y coordinación no tienen acceso implícito a conversaciones ajenas;
- administración y secretaría no reciben notas internas de turnos;
- un profesional no accede a pacientes no vinculados;
- el autor de un informe no obtiene permisos sobre borradores ajenos;
- UUID no sustituye una comprobación de acceso;
- todo acceso directo por ID debe protegerse contra IDOR;
- filtros, búsquedas y orden nunca amplían el scope;
- `403` y `404` deben seguir el criterio contractual del recurso;
- ningún usuario, incluido el administrador, modifica su propio perfil mediante endpoints administrativos.

La matriz de permisos es la fuente normativa. No duplicar tablas completas de permisos en este archivo.

---

## 18. Validación

### 18.1 Joi

Joi valida forma, tipos, límites y campos admitidos. Los errores se convierten al formato contractual y deben incluir todos los campos relevantes sin exponer valores sensibles.

### 18.2 Service

El service valida reglas dependientes de datos, por ejemplo:

- existencia y estado;
- vínculo con el paciente;
- autoría y participación;
- transiciones de estado;
- disponibilidad y solapamientos;
- inmutabilidad;
- permisos por campo;
- compatibilidad entre recursos.

### 18.3 PostgreSQL

La base valida las garantías estructurales y concurrentes. No reemplazar constraints por Joi o condicionales JavaScript.

---

## 19. Respuestas y errores

La forma exacta de las respuestas pertenece a `docs/contrato-api.md`.

Principios:

- respuestas exitosas bajo `data` y, cuando corresponda, `meta`;
- respuestas de error bajo `error`;
- códigos funcionales estables;
- `correlationId` disponible para rastreo;
- un `204` no incluye body;
- errores centralizados en el middleware final;
- errores conocidos de PostgreSQL traducidos a conceptos del dominio;
- errores inesperados convertidos a `500 INTERNAL_ERROR`.

Nunca devolver:

- stack traces;
- mensajes crudos de Sequelize;
- SQL;
- nombres internos de constraints;
- secretos;
- rutas físicas;
- detalles de infraestructura.

No crear un segundo envelope incompatible con el contrato.

---

## 20. Logging y auditoría

### 20.1 Logs técnicos

Pino registra información operativa como:

- inicio y apagado;
- método y ruta normalizada;
- status HTTP y duración;
- `correlation_id`;
- código funcional de error;
- fallos de conexión o infraestructura.

Debe redactar:

- cabecera `Authorization`;
- cookies;
- DNI;
- contraseñas y hashes;
- access y refresh tokens;
- informes, diagnósticos y notas;
- contenido de mensajes;
- cuerpos HTTP completos.

### 20.2 Auditoría funcional

La auditoría registra quién realizó una acción relevante, sobre qué recurso, cuándo, con qué resultado y con metadatos mínimos no sensibles.

No es un duplicado del request ni del recurso. No almacena texto clínico, mensajes, notas internas, DNI, credenciales, tokens, nombres originales de archivos ni rutas absolutas.

Cuando una auditoría forma parte de una operación exitosa, se escribe dentro de
la misma transacción. La lectura clínica es fail-closed: si falla
`INFORME_VISUALIZADO`, no se entrega el contenido. Los intentos fallidos se
registran en una transacción independiente de mejor esfuerzo después del
rollback; si esa escritura falla, se conserva la respuesta original y se emite
un log técnico sanitizado.

No auditar cada polling del contador de no leídos.

---

## 21. Imágenes y almacenamiento de archivos

El MVP permite imágenes de usuarios y servicios mediante endpoints administrativos separados.

### 21.1 Diseño

```text
src/shared/files/
├── file-storage.service.js
├── local-storage.service.js
├── image-upload.middleware.js
└── image-validation.js
```

La implementación inicial utiliza almacenamiento local persistente:

```text
uploads/usuarios/
uploads/servicios/
```

PostgreSQL almacena únicamente la ruta pública controlada, nunca el binario ni una ruta absoluta del servidor.

La lógica se centraliza detrás de funciones simples para permitir una futura migración a almacenamiento externo sin modificar controllers ni reglas de dominio.

### 21.2 Seguridad

- solo administrador carga, reemplaza o elimina imágenes;
- Multer se aplica únicamente a las rutas de imagen;
- una imagen por operación;
- máximo 5 MB;
- formatos JPEG, PNG y WebP;
- validación de MIME y, cuando sea posible, firma real;
- nombre generado por el servidor mediante UUID;
- extensión normalizada;
- prevención de path traversal;
- prohibición de ejecutables y nombres enviados por el cliente;
- directorios no listables;
- `X-Content-Type-Options: nosniff`;
- archivos reales ignorados por Git.

### 21.3 Consistencia entre filesystem y PostgreSQL

El filesystem no participa en transacciones PostgreSQL. Se utiliza compensación:

**Reemplazo**

1. validar el archivo;
2. guardar el nuevo;
3. actualizar la ruta en PostgreSQL;
4. si falla PostgreSQL, eliminar el nuevo;
5. si confirma, intentar eliminar el anterior;
6. si falla la limpieza anterior, registrar warning sin revertir la operación confirmada.

**Eliminación**

1. obtener la ruta vigente;
2. actualizar PostgreSQL a `NULL`;
3. eliminar el archivo físico;
4. si no existe, conservar el estado correcto en PostgreSQL;
5. registrar warning ante un fallo no crítico de limpieza.

### 21.4 Infraestructura productiva no bloqueante

El proveedor final de despliegue es deuda operativa no bloqueante para la
implementación del MVP. Antes de producción debe confirmarse:

- volumen persistente;
- permisos de escritura;
- límites y monitoreo de disco;
- URL pública final;
- backup conjunto de base e imágenes;
- restauración coherente;
- eventual migración a storage externo si no existe persistencia local.

No desplegar uploads sobre un filesystem efímero.

---

## 22. Seguridad HTTP y datos sensibles

Medidas mínimas:

- HTTPS en producción;
- Helmet;
- CORS con orígenes explícitos y credenciales solo donde corresponde;
- validación de `Origin` en operaciones basadas en cookie;
- límites de JSON y multipart;
- rate limiting general y específico;
- consultas parametrizadas mediante Sequelize;
- sanitización de entradas;
- proyecciones positivas;
- usuario PostgreSQL con privilegios mínimos;
- secretos inyectados por entorno;
- proceso no root en contenedor;
- lockfile versionado;
- protección contra IDOR.

Está prohibido:

- registrar o exponer datos clínicos, DNI, credenciales, cookies o tokens;
- utilizar datos personales reales en seeders, fixtures o ejemplos;
- aceptar SQL dinámico sin parametrización;
- persistir información sensible dentro de JWT;
- desactivar autorización para hacer pasar una prueba;
- servir listados de directorios de uploads;
- exponer un endpoint público de contacto persistente.

---

## 23. Rendimiento y consultas

Para el MVP se prioriza claridad y corrección. Aun así:

- paginar listados según el contrato;
- utilizar listas blancas de orden;
- seleccionar solo columnas autorizadas y necesarias;
- incluir asociaciones de manera explícita;
- detectar y evitar N+1;
- respaldar filtros frecuentes con índices documentados;
- utilizar cursor en mensajes;
- limitar rangos de agenda;
- no cargar contenido clínico en el resumen ni en previews;
- no introducir caché distribuida sin medición y necesidad aprobada.

Todo índice nuevo debe vincularse con una consulta real y validarse con PostgreSQL. No optimizar mediante duplicación de datos sin una decisión en `modelo-datos.md`.

---

## 24. Inicio, disponibilidad y apagado

### 24.1 Inicio

El proceso sigue este orden:

1. validar configuración;
2. crear logger;
3. inicializar Sequelize;
4. autenticar la conexión;
5. registrar modelos y asociaciones;
6. construir Express;
7. iniciar el servidor HTTP.

Las migraciones se ejecutan antes del despliegue mediante un proceso controlado, no automáticamente en `server.js`.

### 24.2 Health checks

- `GET /health`: confirma que el proceso responde; no consulta PostgreSQL.
- `GET /ready`: realiza una consulta liviana a PostgreSQL y responde `503` si la aplicación no puede operar.

No exponer host, versión interna, SQL, variables ni credenciales en estos endpoints.

### 24.3 Apagado controlado

Ante `SIGINT` o `SIGTERM`:

1. dejar de aceptar nuevas requests;
2. esperar solicitudes en curso durante un límite definido;
3. cerrar el pool de Sequelize;
4. finalizar con el código apropiado.

---

## 25. Pruebas

### 25.1 Unitarias

Aplicar a:

- services aislables;
- policies;
- proyecciones;
- transiciones de estado;
- normalización;
- conversión temporal;
- códigos y utilidades.

### 25.2 Integración

Aplicar a:

- migraciones;
- constraints;
- transacciones y rollback;
- endpoints y envelopes;
- cookies y tokens;
- autorización por rol y recurso;
- proyecciones por campo;
- auditoría;
- uploads y compensaciones;
- health y readiness.

### 25.3 Seguridad

Casos obligatorios:

- acceso directo por UUID a un recurso ajeno;
- profesional frente a paciente no vinculado;
- administrador frente a conversación donde no participa;
- secretaría frente a edición de informe;
- administración y secretaría frente a notas internas;
- usuario frente a su propia modificación administrativa;
- sesión revocada y usuario inactivo;
- ausencia de DNI, tokens y contenido sensible en logs;
- archivo inválido, excesivo o con path traversal.

### 25.4 Concurrencia

Probar contra PostgreSQL real:

- turnos simultáneos que solapan prestador;
- turnos simultáneos que solapan paciente;
- turnos simultáneos que solapan consultorio;
- refreshes concurrentes según la estrategia aprobada;
- duplicados protegidos por unicidad.

Una validación unitaria simulada no reemplaza una prueba del constraint real.

### 25.5 Cobertura

No se fija un porcentaje normativo de cobertura hasta que el proyecto lo apruebe. La cobertura es una señal auxiliar y no sustituye escenarios críticos por rol, recurso, campo, transacción y concurrencia.

---

## 26. Docker, CI/CD y backups

### 26.1 Contenedor

La imagen de producción debe:

- fijar una versión oficial compatible de Node;
- instalar mediante `npm ci`;
- ejecutar con `NODE_ENV=production`;
- utilizar usuario no root;
- contener solo dependencias necesarias;
- no copiar secretos, `.env`, backups ni uploads reales;
- permitir health checks;
- escribir uploads únicamente en un volumen persistente montado.

### 26.2 Pipeline mínimo

```text
checkout
→ setup Node
→ npm ci
→ lint
→ iniciar PostgreSQL de test
→ ejecutar migraciones
→ ejecutar pruebas
→ construir imagen
→ publicar/desplegar
→ ejecutar migraciones una sola vez
→ verificar readiness
```

No omitir una validación fallida ni ejecutar migraciones simultáneamente desde varias réplicas.

### 26.3 Backups

Antes de producción deben definirse:

- frecuencia;
- retención;
- cifrado;
- ubicación separada;
- responsable operativo;
- restauración conjunta de PostgreSQL e imágenes;
- prueba periódica de restauración.

Un backup no probado no constituye una estrategia de recuperación.

---

## 27. Escalabilidad prevista

La primera versión opera como una única instancia por centro.

La arquitectura permite evolucionar sin aplicar esos cambios de antemano:

| Necesidad futura | Evolución posible |
|---|---|
| Varias réplicas | Store compartido para rate limit y estrategia coordinada de sesiones. |
| Mayor volumen de imágenes | Adaptador de storage externo manteniendo la interfaz de archivos. |
| Mensajería inmediata | SSE o WebSocket después de medir la necesidad. |
| Consultas complejas repetidas | Query services o repositories específicos, no una capa genérica global. |
| Varios centros en una plataforma | Proyecto de multi-tenancy separado, con análisis de aislamiento y migración. |
| Mayor observabilidad | Métricas y trazas sin contenido sensible. |

No introducir estas soluciones mientras no exista un requerimiento aprobado.

---

## 28. Riesgos y deuda técnica aceptada

| Riesgo o límite | Tratamiento en el MVP | Condición de revisión |
|---|---|---|
| DNI como credencial | Hash bcrypt, rate limit, mensajes genéricos y sesiones revocables. | Migrar a contraseña personal o invitación segura. |
| Rate limit local | Aceptable con una sola instancia. | Adoptar store compartido al escalar horizontalmente. |
| CommonJS | Reduce la curva de aprendizaje del equipo. | Evaluar ESM solo mediante migración planificada. |
| Sin Repository | Services acceden directamente a Sequelize. | Agregar abstracción específica ante consultas complejas o segunda fuente. |
| Roles fijos | Cuatro roles estables. | Revisar solo si aparece administración dinámica real. |
| Polling en mensajería | Resumen de no leídos sin contenido sensible. | Evaluar tiempo real por necesidad medida. |
| Uploads locales | Servicio centralizado y volumen persistente. | Migrar si el proveedor o el volumen lo requieren. |
| Una instalación por centro | Aislamiento operativo sencillo. | Analizar multi-tenancy como iniciativa independiente. |
| Auditoría fallida | Éxitos atómicos, lectura clínica fail-closed e intentos fallidos de mejor esfuerzo fuera del rollback. | Revisar si el volumen exige outbox o cola. |

---

## 29. Alcance funcional excluido

La arquitectura del MVP no contempla:

- facturación, cobros o caja;
- historia clínica avanzada o firma digital;
- acceso de pacientes o tutores;
- múltiples tutores por paciente;
- recordatorios automáticos por WhatsApp, email o SMS;
- notificaciones push;
- adjuntos en conversaciones o informes;
- edición o eliminación de mensajes;
- reprogramación de turnos;
- turnos recurrentes;
- disponibilidad personalizada por prestador;
- bloqueo automático de feriados;
- reserva pública de turnos;
- endpoint público que persista consultas de contacto;
- roles configurables;
- multi-tenancy compartido;
- aplicación móvil nativa.

No crear endpoints, tablas o capas para estas funciones por analogía con otros sistemas.

---

## 30. Decisiones arquitectónicas consolidadas

| ID | Decisión |
|---|---|
| ADR-001 | `api/` y `client/` son proyectos independientes. |
| ADR-002 | El backend utiliza JavaScript CommonJS. |
| ADR-003 | Express 5 expone una API REST bajo `/api/v1`. |
| ADR-004 | El sistema es un monolito modular. |
| ADR-005 | Se utiliza el flujo Route → Middleware → Validation → Controller → Service → Model/PostgreSQL. |
| ADR-006 | No se implementan DDD completo, microservicios ni Repository genérico durante el MVP. |
| ADR-007 | PostgreSQL 16+ y Sequelize 6 conforman la persistencia. |
| ADR-008 | Las migraciones son la fuente de verdad; `sequelize.sync()` está prohibido. |
| ADR-009 | Los modelos Sequelize y asociaciones se centralizan en infraestructura de base de datos. |
| ADR-010 | El módulo dueño contiene negocio, policies y proyecciones; su service orquesta transacciones y casos de uso. |
| ADR-011 | UUID es el identificador estándar. |
| ADR-012 | Instantes en UTC y agenda interpretada en `America/Argentina/Cordoba`. |
| ADR-013 | Existe una instalación y una base independientes por centro. |
| ADR-014 | Autorización en cuatro dimensiones: rol, filas, recurso y campos. |
| ADR-015 | Access JWT corto y refresh rotativo en cookie HttpOnly. |
| ADR-016 | Los logs técnicos y la auditoría funcional son mecanismos distintos. |
| ADR-017 | La integridad crítica se respalda en PostgreSQL. |
| ADR-018 | Usuarios, pacientes y catálogos utilizan baja lógica; la historia no se elimina físicamente. |
| ADR-019 | Los turnos no se reprograman; se cancela y crea uno nuevo. |
| ADR-020 | Informes finalizados y mensajes enviados son inmutables; la edición y finalización de borradores usa versión optimista. |
| ADR-021 | Las conversaciones solo son visibles para participantes. |
| ADR-022 | Las imágenes se gestionan mediante endpoints separados y almacenamiento local abstraído. |
| ADR-023 | Un turno puede utilizar cualquier servicio activo, aunque no sea habitual del prestador. |
| ADR-024 | El proveedor de producción y su almacenamiento persistente son deuda operativa no bloqueante antes del despliegue. |
| ADR-025 | Solo crear un mensaje actualiza la actividad global de una conversación y desarchiva la conversación para sus receptores. |
| ADR-026 | La disponibilidad usa intervalos de 15 minutos e interseca prestador y consultorio cuando ambos filtros están presentes. |

---

## 31. Criterio de cambio

Una modificación arquitectónica requiere:

1. identificar la decisión vigente;
2. explicar el problema verificable;
3. describir la alternativa y su impacto;
4. enumerar módulos, datos, seguridad y operación afectados;
5. registrar la aprobación;
6. actualizar los documentos normativos;
7. agregar o modificar migraciones y pruebas;
8. actualizar `AGENTS.md` cuando cambien instrucciones operativas.

No convertir una preferencia de implementación en una decisión arquitectónica sin aprobación.

---

## 32. Criterio de conformidad

Una implementación respeta esta arquitectura cuando:

- conserva el monolito modular y el stack aprobado;
- respeta la dirección de dependencias entre capas;
- mantiene controllers livianos y negocio en services;
- aplica policies y proyecciones en el backend;
- utiliza migraciones y constraints;
- controla transacciones y concurrencia;
- no expone datos sensibles;
- conserva logs y auditoría separados;
- implementa uploads con almacenamiento persistente y compensación;
- incluye pruebas unitarias y de integración relevantes;
- mantiene contrato, matriz, modelo y código sincronizados;
- no resuelve silenciosamente incompatibilidades ni deuda técnica;
- no incorpora alcance excluido ni abstracciones innecesarias.

