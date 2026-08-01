# AGENTS.md — API pública

## 1. Alcance y precedencia

Estas instrucciones se aplican a:

```text
api/src/modules/public/
```

También deben respetarse al modificar componentes relacionados:

```text
api/src/modules/usuarios/
api/src/modules/servicios/
api/src/shared/http/
api/src/shared/errors/
api/src/shared/files/
api/src/app.js
api/tests/
```

Este archivo complementa `api/AGENTS.md`. Antes de modificar la API pública,
consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/modules/usuarios/AGENTS.md
api/src/modules/servicios/AGENTS.md
```

Si alguno no existe en el checkout, no inventar su contenido. Aplicar las
decisiones normativas disponibles y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada vigente;
3. este archivo especializado;
4. `api/AGENTS.md`.

Ante una contradicción, detener únicamente la parte afectada y solicitar una
decisión. No ampliar el contrato ni la exposición de datos para adaptar una
implementación existente.

---

## 2. Comandos habituales

Ejecutar desde `api/` y comprobar primero que cada script exista en
`package.json`:

```bash
npm test
npm run test:coverage
npm run test:integration
npm run lint
```

Reglas operativas:

- utilizar PostgreSQL real y una base exclusiva para integración;
- crear el esquema de pruebas mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas contra development o production;
- usar nombres, biografías, imágenes y UUID completamente ficticios;
- no imprimir respuestas completas, datos personales, cabeceras sensibles ni
  parámetros de conexión;
- probar los endpoints sin sesión, cookie ni token;
- probar que cookies o credenciales incidentales no cambien la respuesta;
- probar listas vacías, límites y combinaciones de publicación;
- no rediseñar Usuarios, Servicios, Archivos o el frontend público como parte
  incidental de una tarea de este módulo.

---

## 3. Decisiones obligatorias del MVP

```text
Naturaleza:                 capa HTTP pública de solo lectura
Autenticación:              no requerida
Endpoints:                  equipo y servicios
Escrituras:                 ninguna
Fuente de equipo:           Usuarios
Fuente de servicios:        Servicios
Visibilidad:                activo y visible públicamente
Parámetro común:            limit opcional, de 1 a 50
Paginación:                 no existe
Búsqueda y filtros:         no existen
Auditoría funcional:        no se genera por lecturas públicas
```

Reglas centrales:

- `public` no representa una entidad ni un CRUD.
- Solo expone información institucional expresamente publicable.
- Todos sus endpoints funcionan sin autenticación.
- No debe incorporar middleware que exija access token, refresh token, sesión,
  rol o permiso.
- `activo=true` no alcanza para publicar un registro.
- `visiblePublicamente=true` no publica un registro inactivo.
- El administrador nunca aparece en el equipo público.
- La respuesta pública se construye mediante listas positivas exactas.
- Una lista sin resultados responde `200`, no `404`.
- El módulo no crea modelos, tablas, migraciones ni asociaciones.
- Los errores y logs nunca revelan datos privados o estructura interna.

No ampliar el MVP con contacto persistente, reserva de turnos, pacientes,
tutores, informes, mensajería, autenticación, configuración institucional,
novedades, búsqueda, filtros, páginas individuales o escritura pública.

> Decisión contraintuitiva: el sitio tiene una página de contacto, pero no
> existe `POST /api/v1/public/contacto`; utiliza enlaces externos y datos
> estáticos configurados en el frontend.

---

## 4. Responsabilidad y límites

`public` es responsable de:

- declarar las rutas HTTP públicas aprobadas;
- validar el único query param admitido;
- coordinar los casos de uso internos de Usuarios y Servicios;
- aplicar el envelope público;
- garantizar la lista positiva de cada DTO;
- impedir exposición accidental de campos internos;
- aplicar controles transversales públicos aprobados;
- traducir errores conocidos sin filtrar detalles internos.

`public` no es responsable de:

- administrar usuarios o servicios;
- decidir desde cero qué registro está activo o publicado;
- duplicar consultas y reglas pertenecientes a Usuarios o Servicios;
- gestionar imágenes o archivos;
- autenticar o autorizar actores;
- registrar auditoría funcional por cada lectura;
- almacenar consultas de contacto;
- exponer configuración institucional estática del frontend.

Distribución de responsabilidades:

```text
Usuarios  -> elegibilidad, orden y datos públicos del equipo
Servicios -> elegibilidad, orden y datos públicos del catálogo
Public    -> rutas, validación, composición y contrato HTTP sin autenticación
Archivos  -> publicación segura de imágenes bajo rutas controladas
```

El módulo público debe consumir interfaces internas pequeñas y explícitas. No
importar controllers, routes o instancias privadas de otros módulos.

---

## 5. Estructura orientativa

Crear únicamente archivos con responsabilidad real:

```text
src/modules/public/
├── public.routes.js
├── public.validation.js
├── public.controller.js
├── public.service.js
├── public.projection.js
└── AGENTS.md
```

`public.projection.js` actúa como última barrera del contrato HTTP. Si Usuarios
o Servicios ya exponen constructores internos de DTO público, reutilizarlos y
evitar una segunda definición divergente; aun así, probar en este módulo la
lista positiva final que cruza la frontera HTTP.

No crear:

- modelos Sequelize dentro de `public`;
- migraciones o seeders exclusivos del módulo;
- repositories paralelos;
- tablas de contenido público;
- archivos vacíos para completar la estructura.

---

## 6. Responsabilidades por capa

### Routes

- Declaran únicamente los dos `GET` contractuales.
- Componen validación, controles HTTP transversales y controller.
- No exigen autenticación ni autorización.
- No consultan modelos ni construyen DTO.
- No aceptan aliases o trailing paths con semántica nueva.
- No agregan CORS, caché o rate limiting locales si ya existen globalmente.

### Validation

- Valida únicamente `limit`.
- Rechaza parámetros inesperados.
- No consulta PostgreSQL.
- No aplica reglas de publicación.
- No interpreta cookies, tokens ni cabeceras como filtros.

### Controllers

- Reciben query ya validada.
- Pasan valores primitivos al service.
- Construyen status y envelope contractuales.
- No acceden a modelos ni filtran campos manualmente.
- No contienen reglas de visibilidad u orden.

### Services

- Coordinan las interfaces internas de Usuarios y Servicios.
- Propagan `limit` validado.
- No duplican condiciones SQL si el módulo fuente ofrece el caso de uso.
- No cargan registros privados para filtrarlos posteriormente en memoria.
- No inician transacciones para consultas simples.
- No reciben `req` ni `res`.

### Projections

- Construyen objetos nuevos mediante listas positivas.
- Transforman nombres de persistencia a camelCase contractual.
- No parten de una proyección administrativa para quitar campos.
- No serializan instancias Sequelize ni asociaciones completas.
- No incluyen propiedades `null` no contempladas por el contrato.

---

## 7. Endpoints contractuales

| Método | Ruta | Acceso | Query |
|---|---|---|---|
| `GET` | `/api/v1/public/equipo` | Público | `limit` opcional. |
| `GET` | `/api/v1/public/servicios` | Público | `limit` opcional. |

No existen en el MVP:

```text
POST   /api/v1/public/contacto
POST   /api/v1/public/turnos
GET    /api/v1/public/pacientes
GET    /api/v1/public/usuarios
GET    /api/v1/public/equipo/:id
GET    /api/v1/public/servicios/:id
POST   /api/v1/public/servicios
PUT    /api/v1/public/*
PATCH  /api/v1/public/*
DELETE /api/v1/public/*
```

No crear endpoints de health check, configuración o archivos dentro de este
módulo por analogía. Esas responsabilidades son transversales.

---

## 8. Query y envelope

Ambos endpoints aceptan únicamente:

```text
limit
```

Reglas de `limit`:

- opcional;
- entero decimal;
- mínimo `1`;
- máximo `50`;
- no se corrige ni trunca silenciosamente;
- un valor ausente devuelve todos los registros publicables del MVP;
- valores repetidos, fraccionarios, negativos, cero o no numéricos se rechazan.

No admitir:

```text
page
offset
search
sort
order
activo
visiblePublicamente
rol
especialidad
```

Respuesta exitosa:

```json
{
  "data": [],
  "meta": {
    "count": 0
  }
}
```

Reglas:

- `data` siempre es un array;
- `meta.count` es la cantidad de elementos efectivamente devueltos;
- no incluir `page`, `limit`, `total`, `totalPages` o cursores;
- no realizar una consulta adicional de conteo total;
- lista vacía responde `200` con `count: 0`;
- mantener `correlationId` únicamente donde lo exija el envelope transversal
  vigente, sin modificar este contrato por intuición.

---

## 9. Equipo público

`GET /api/v1/public/equipo` selecciona únicamente usuarios que cumplen en la
misma consulta:

```text
activo = true
AND visible_publicamente = true
AND rol IN (coordinacion, secretaria, profesional)
```

El rol `administrador` queda excluido incluso si existe un dato histórico
inconsistente con `visible_publicamente=true`.

Orden estable:

```text
orden_publico ASC
apellido ASC
nombre ASC
id ASC
```

Aplicar la convención SQL compartida aprobada para la posición de valores
`NULL` en `orden_publico`. Si todavía no está definida, no inventar un orden
distinto entre backend y frontend; registrar la decisión pendiente.

DTO exacto:

```json
{
  "id": "uuid",
  "nombre": "Valentina",
  "apellido": "Ríos",
  "titulo": "Licenciada en Psicopedagogía",
  "especialidad": "Psicopedagogía Clínica",
  "funcionPublica": "Psicopedagoga clínica",
  "bio": "Biografía pública completa...",
  "fotoUrl": "/uploads/usuarios/uuid.webp",
  "ordenPublico": 3
}
```

Lista positiva exacta:

```text
id
nombre
apellido
titulo
especialidad
funcionPublica
bio
fotoUrl
ordenPublico
```

No publicar:

- DNI;
- email de acceso;
- teléfono personal;
- `passwordHash`;
- rol técnico o permisos;
- estado de actividad o visibilidad;
- tokens, sesiones o hashes;
- servicios habituales;
- agenda, vínculos, pacientes o informes;
- timestamps o campos de auditoría.

Coordinación, secretaría y profesionales usan la misma proyección. No agregar
marcadores de jerarquía ni inferir títulos desde el rol técnico.

---

## 10. Servicios públicos

`GET /api/v1/public/servicios` selecciona únicamente servicios que cumplen en
la misma consulta:

```text
activo = true
AND visible_publicamente = true
```

Orden estable:

```text
orden_publico ASC
nombre ASC
id ASC
```

Aplicar la convención compartida aprobada para valores `NULL` de
`orden_publico`.

DTO exacto:

```json
{
  "id": "uuid",
  "nombre": "Psicopedagogía Clínica",
  "descripcion": "Descripción completa.",
  "imagenUrl": "/uploads/servicios/uuid.webp",
  "ordenPublico": 1
}
```

Lista positiva exacta:

```text
id
nombre
descripcion
imagenUrl
ordenPublico
```

No publicar:

- `activo`;
- `visiblePublicamente`;
- timestamps;
- prestadores habituales;
- turnos, estadísticas o cantidades de uso;
- precios, duración, sedes, categorías o campos inexistentes;
- asociaciones o nombres de persistencia.

La ausencia de imagen no excluye un servicio publicable salvo decisión
contractual posterior.

---

## 11. Consultas y rendimiento

- Aplicar elegibilidad y `limit` en PostgreSQL.
- Seleccionar únicamente las columnas necesarias para el DTO público.
- No cargar proyecciones administrativas para sanitizarlas en memoria.
- No incluir asociaciones que multipliquen filas.
- No ejecutar `COUNT(*)` porque el contrato no informa total.
- Mantener un orden secundario estable por `id`.
- Parametrizar el límite y cualquier valor dinámico.
- Reutilizar índices parciales aprobados para publicación y orden.
- Evitar N+1; estos endpoints no necesitan asociaciones por elemento.

No introducir Redis, una tabla de caché, materialized views, búsqueda de texto o
un CDN como parte incidental del MVP.

---

## 12. Autenticación, CORS y cookies

Los endpoints públicos:

- funcionan sin header `Authorization`;
- no exigen ni rotan refresh tokens;
- no crean sesiones;
- no emiten cookies;
- no alteran su scope según cookies o credenciales recibidas;
- no devuelven `401` o `403` por ausencia de autenticación;
- no confían en el navegador para ocultar campos.

CORS debe seguir la configuración transversal de la API. No responder con
`Access-Control-Allow-Origin: *` si la política global aprobada utiliza una
allowlist, y no habilitar credenciales solo para estos listados.

La presencia de una sesión válida no convierte la respuesta pública en una
proyección privada.

---

## 13. Rate limiting y abuso

Aplicar el limitador público compartido en el punto de montaje aprobado por la
arquitectura.

Reglas:

- no crear un contador en memoria por módulo si la aplicación ya posee uno;
- no utilizar IDs de usuario porque la ruta no está autenticada;
- considerar correctamente proxies confiables según la configuración global;
- devolver el status y headers de rate limit establecidos transversalmente;
- no incluir datos del request ni información de infraestructura en el error;
- probar que el control alcance ambos endpoints;
- no elegir umbral, ventana o estrategia distribuida por intuición.

El valor exacto del límite y su almacenamiento son decisiones operativas
transversales, no responsabilidades de `public`.

---

## 14. Caché HTTP

Para el MVP:

- las imágenes pueden usar caché prolongada si sus nombres cambian al
  reemplazarlas;
- el JSON público puede solicitarse al montar la página;
- un `ETag` o caché corta de JSON es admisible únicamente mediante una política
  transversal aprobada;
- una respuesta cacheada nunca debe variar por cookie, token o rol;
- los cambios de publicación deben reflejarse dentro del tiempo máximo definido
  por esa política.

No definir por intuición:

- duración de `Cache-Control`;
- invalidación manual;
- caché en memoria por proceso;
- Redis;
- `stale-while-revalidate`;
- combinación de `public`, `private` o `no-store`.

Hasta que exista una decisión operativa explícita, conservar el comportamiento
HTTP transversal vigente y no agregar una caché propia.

---

## 15. Imágenes y URLs

- `fotoUrl` e `imagenUrl` provienen de rutas públicas controladas.
- No devolver rutas absolutas del filesystem.
- No devolver nombres originales de archivos.
- No aceptar una URL desde query para proxy, redirección o lectura remota.
- No leer binarios para construir la respuesta JSON.
- No comprobar la imagen mediante requests externos por cada listado.
- El placeholder visual pertenece al frontend, salvo decisión distinta.
- La seguridad y caché de `/uploads` pertenecen a la capa compartida de
  archivos/servidor estático.

La API pública no administra cargas, reemplazos ni eliminaciones de imágenes.

---

## 16. Privacidad y minimización

Toda propiedad pública debe estar expresamente autorizada. Una propiedad nueva
en los modelos de Usuario o Servicio es privada por defecto.

Reglas:

- construir DTO con listas positivas;
- no usar object spread sobre modelos o proyecciones administrativas;
- no serializar `dataValues` completos;
- no incluir asociaciones por conveniencia;
- no exponer campos ocultos mediante errores, debug, logs o métricas;
- no inferir públicamente roles, permisos, disponibilidad o carga laboral;
- no devolver datos clínicos o relaciones con pacientes bajo ninguna
  circunstancia;
- no usar información pública real en fixtures o snapshots.

Los datos deliberadamente publicados siguen siendo datos personales. Evitar
copiarlos a logs y metadata técnica sin necesidad operativa.

---

## 17. Errores contractuales

Errores aplicables:

```text
400 VALIDATION_ERROR
429 RATE_LIMIT_EXCEEDED
500 INTERNAL_ERROR
```

Usar los códigos y el envelope transversal exactos si la documentación general
define nombres diferentes. No crear aliases locales.

Reglas:

- parámetros desconocidos o `limit` inválido responden error de validación;
- ausencia de registros publicables responde `200`, no error;
- un fallo interno no revela si existen registros privados;
- no devolver mensajes crudos de PostgreSQL;
- no incluir SQL, nombres de tablas, constraints, stacks o rutas absolutas;
- no cambiar un error interno por una lista vacía, porque ocultaría fallas;
- conservar el `correlationId` según el contrato transversal.

---

## 18. Auditoría, logs y observabilidad

Las lecturas públicas no generan eventos funcionales en la tabla de auditoría.
No crear eventos como:

```text
EQUIPO_PUBLICO_CONSULTADO
SERVICIOS_PUBLICOS_CONSULTADOS
VISITA_PUBLICA_REGISTRADA
```

La observabilidad técnica puede registrar, según la política global:

- método y patrón normalizado de ruta;
- status;
- duración;
- `correlationId`;
- resultado agregado del rate limiter.

No registrar:

- bodies o respuestas completas;
- nombres, biografías o UUID devueltos;
- cookies, tokens o headers completos;
- IP sin la política de privacidad y retención correspondiente;
- SQL, parámetros o datos de conexión;
- user-agent completo si no existe una necesidad aprobada.

No persistir analítica de visitantes dentro de este módulo.

---

## 19. Integración con Usuarios

Usuarios debe ofrecer una interfaz interna que:

- seleccione únicamente usuarios activos y visibles;
- limite roles a coordinación, secretaría y profesional;
- excluya administrador de forma defensiva;
- aplique orden estable;
- seleccione solo columnas públicas;
- acepte el `limit` ya validado;
- devuelva datos aptos para el DTO público.

`public` no debe:

- llamar al endpoint privado de Usuarios por HTTP;
- reutilizar la proyección administrativa;
- consultar sesiones, permisos o servicios habituales;
- inferir `titulo`, `funcionPublica` o `especialidad` desde el rol;
- exponer un usuario inactivo aunque conserve visibilidad histórica.

---

## 20. Integración con Servicios

Servicios debe ofrecer una interfaz interna que:

- seleccione únicamente servicios activos y visibles;
- aplique orden estable;
- seleccione solo columnas públicas;
- acepte el `limit` ya validado;
- devuelva datos aptos para el DTO público.

`public` no debe:

- llamar al endpoint privado de Servicios por HTTP;
- reutilizar la proyección administrativa;
- consultar `usuarios_servicios`;
- exponer servicios inactivos aunque conserven visibilidad histórica;
- condicionar la publicación a prestadores habituales, turnos o imagen.

---

## 21. Pruebas mínimas

### Unitarias

- `limit` ausente y válido;
- rechazo de `limit` fuera de `1..50`;
- rechazo de query params inesperados;
- lista positiva exacta del integrante;
- lista positiva exacta del servicio;
- transformación a camelCase;
- envelope y `meta.count`;
- respuesta vacía con `count: 0`.

### Integración

- ambos endpoints responden sin token ni cookie;
- una sesión incidental no amplía la proyección;
- solo aparecen registros activos y visibles;
- usuario administrador nunca aparece;
- coordinación, secretaría y profesional publicables sí aparecen;
- servicio activo pero no visible no aparece;
- servicio visible pero inactivo no aparece;
- usuario visible pero inactivo no aparece;
- orden y desempates son estables;
- `limit` se aplica en la consulta y coincide con `meta.count`;
- no existe paginación, búsqueda ni filtros adicionales;
- no existen métodos de escritura ni endpoints individuales;
- no existe `POST /public/contacto` ni reserva pública;
- un fallo de PostgreSQL no se convierte en lista vacía.

### Seguridad y privacidad

- equipo no expone DNI, email, teléfono, rol, permisos, sesiones o timestamps;
- servicios no exponen estado, visibilidad, timestamps o asociaciones;
- propiedades nuevas del modelo no aparecen automáticamente;
- los errores no filtran SQL ni existencia de registros privados;
- logs y auditoría no contienen los DTO devueltos;
- el rate limiter público alcanza ambos endpoints;
- las URLs de imágenes no revelan rutas locales ni nombres originales.

---

## 22. Acciones prohibidas

No:

- exigir autenticación o roles en las rutas públicas;
- devolver una proyección privada si llega una sesión válida;
- crear endpoints distintos de los dos `GET` aprobados;
- implementar contacto, turnos o reservas públicas;
- agregar modelos, tablas o migraciones de `public`;
- consultar todos los registros para filtrarlos en memoria;
- reutilizar modelos Sequelize serializados;
- usar listas negativas para ocultar campos;
- devolver administrador en el equipo;
- publicar usuarios o servicios inactivos;
- publicar registros activos sin visibilidad explícita;
- aceptar búsqueda, orden, paginación o filtros no contractuales;
- inventar límites, TTL o estrategia de caché;
- crear eventos de auditoría por cada lectura;
- registrar respuestas o datos personales;
- agregar Redis, CDN o analítica por intuición;
- duplicar reglas de Usuarios o Servicios;
- resolver decisiones pendientes sin aprobación.

---

## 23. Procedimiento de trabajo

Antes de implementar:

1. identificar el endpoint y DTO afectados;
2. revisar el contrato y los AGENTS de Usuarios o Servicios;
3. enumerar la lista positiva exacta;
4. comprobar elegibilidad y orden en la consulta SQL;
5. verificar que no se incorporó autenticación;
6. validar `limit` y rechazo de propiedades inesperadas;
7. revisar envelope, count y comportamiento vacío;
8. comprobar logs, errores y rutas de imágenes;
9. agregar pruebas de filtración ante cada campo privado;
10. verificar rate limiting y configuración HTTP transversal;
11. actualizar documentación antes de ampliar el contrato.

Si la tarea exige una decisión no aprobada, detener esa parte y solicitarla.

---

## 24. Definition of Done

Un cambio está completo solo si:

- conserva exactamente los dos endpoints `GET` públicos;
- funciona sin autenticación;
- acepta únicamente `limit` entre 1 y 50;
- aplica actividad y visibilidad en PostgreSQL;
- excluye siempre al administrador del equipo;
- mantiene orden estable;
- devuelve únicamente las listas positivas contractuales;
- usa `{ data, meta: { count } }` sin paginación;
- responde `200` con una lista vacía cuando corresponde;
- no duplica lógica de Usuarios o Servicios;
- no crea escritura, tablas, modelos ni auditoría funcional;
- protege datos personales, clínicos y administrativos;
- respeta controles transversales de errores, CORS y rate limiting;
- incluye pruebas unitarias, de integración y privacidad pertinentes;
- no incorpora alcance excluido;
- informa qué validaciones se ejecutaron y cuáles no.

---

## 25. Decisiones pendientes

Los agentes no deben resolver por intuición:

1. posición exacta de `orden_publico=null` si aún no está fijada por una
   convención SQL compartida;
2. valores exactos y almacenamiento del rate limiter público;
3. política de caché JSON, `ETag`, TTL e invalidación;
4. política de CORS y proxies confiables si no está consolidada globalmente;
5. formato absoluto o relativo definitivo para URLs de imágenes;
6. comportamiento contractual de campos públicos opcionales con valor `null`;
7. incorporación futura de configuración institucional o novedades dinámicas;
8. política de analítica, retención y tratamiento de IP si alguna vez se
   incorpora observabilidad de visitantes.

Hasta contar con una decisión expresa:

- mantener el contrato mínimo de dos listados;
- no agregar caché propia;
- no persistir analítica;
- no introducir nuevos campos o endpoints;
- seguir las configuraciones transversales vigentes;
- tratar todo campo nuevo como privado por defecto.
