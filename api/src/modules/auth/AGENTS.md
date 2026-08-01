# AGENTS.md — Autenticación y sesiones

## 1. Alcance

Estas instrucciones se aplican a:

```text
api/src/modules/auth/
```

También deben respetarse al modificar piezas relacionadas ubicadas fuera del
módulo, especialmente:

```text
api/src/shared/middlewares/
api/src/shared/permissions/
api/src/shared/database/models/
api/src/config/
api/migrations/
api/tests/
api/.env.example
```

Este archivo complementa `api/AGENTS.md`; no reemplaza las reglas generales del
backend.

Antes de modificar autenticación, consultar:

```text
api/AGENTS.md
docs/arquitectura-backend.md
docs/contrato-api.md
docs/matriz-permisos.md
docs/modelo-datos.md
api/src/shared/database/AGENTS.md
```

Si `docs/modelo-datos.md` todavía no existe, no inventar decisiones que dependan
de él. Utilizar únicamente las decisiones consolidadas en la documentación
vigente y señalar el vacío.

Precedencia:

1. requerimientos y decisiones expresamente aprobadas;
2. documentación normativa consolidada;
3. este archivo especializado;
4. `api/AGENTS.md`.

Ante una contradicción, detener la parte afectada, documentar la inconsistencia
y solicitar una decisión. No modificar documentación normativa para justificar
una implementación incompatible.

---

## 2. Comandos habituales

Ejecutar desde `api/` y comprobar primero que los scripts existan en
`package.json`:

```bash
npm test
npm run test:coverage
npm run test:integration
npm run lint
npm run db:migrate
```

Reglas operativas:

- usar una base PostgreSQL exclusiva para pruebas de integración;
- crear el esquema de prueba mediante migraciones;
- no utilizar `sequelize.sync()` ni SQLite;
- no ejecutar pruebas de autenticación contra development o production;
- no copiar tokens, cookies, hashes ni credenciales de una prueba a logs;
- no afirmar que rotación o revocación son seguras sin pruebas concurrentes
  reales;
- no actualizar dependencias de seguridad o versiones mayores como parte
  incidental de otra tarea.

---

## 3. Responsabilidad del módulo

`auth` es dueño de:

- login;
- emisión y verificación de access tokens;
- creación, renovación y revocación de sesiones;
- rotación del refresh token;
- cookies de sesión;
- respuesta del contexto autenticado;
- coordinación con permisos vigentes;
- eventos de auditoría propios de autenticación.

Estructura orientativa, no obligatoria si el proyecto ya adoptó nombres
equivalentes:

```text
src/modules/auth/
├── auth.routes.js
├── auth.validation.js
├── auth.controller.js
├── auth.service.js
├── auth.tokens.js
├── auth.cookies.js
├── auth.constants.js
└── AGENTS.md
```

No crear archivos vacíos ni separar helpers sin una responsabilidad real.

Los modelos `Usuario` y `Sesion` permanecen centralizados en
`src/shared/database/models/`. Auth no define modelos Sequelize paralelos.

---

## 4. Responsabilidades por capa

### Routes

- declaran método y ruta;
- aplican rate limiting específico;
- ejecutan validación Joi;
- exigen autenticación solo donde indica el contrato;
- delegan al controller.

### Validation

- valida forma, longitud y presencia de `email` y `dni`;
- rechaza body en endpoints que no lo admiten cuando corresponda;
- no consulta la base;
- no compara credenciales;
- no determina si una sesión está activa.

### Controllers

- leen datos HTTP ya validados;
- obtienen la cookie mediante el parser central;
- pasan al service valores primitivos y contexto de seguridad sanitizado;
- establecen o limpian cookies;
- construyen el status y envelope contractuales;
- no contienen reglas de autenticación, consultas ni transacciones.

### Services

- normalizan credenciales;
- verifican hashes;
- validan usuario y sesión;
- abren y propagan transacciones;
- crean, rotan y revocan sesiones;
- generan tokens mediante helpers especializados;
- recalculan usuario y permisos vigentes;
- traducen errores internos a códigos funcionales;
- registran auditoría sin información sensible.

Los services no reciben `req`, `res` ni objetos de cookies de Express.

### Middlewares compartidos

- extraen y verifican el access token;
- construyen el actor autenticado según la estrategia aprobada;
- rechazan tokens ausentes, inválidos o vencidos;
- no sustituyen policies de recursos;
- no confían en `permissions` enviadas por el cliente.

---

## 5. Decisiones obligatorias del MVP

```text
Credencial de login:  email + DNI
Access token:         JWT, 15 minutos
Refresh token:        rotativo, 7 días
Transporte refresh:   cookie HttpOnly
Persistencia refresh: únicamente hash
Sesiones por usuario: múltiples
Zona de instantes:    UTC mediante TIMESTAMPTZ
```

El uso del DNI como credencial es una simplificación deliberada y un riesgo
aceptado del MVP. No “corregir” esta decisión agregando registro público,
contraseña personal, recuperación por correo o proveedores externos sin una
decisión arquitectónica nueva.

El riesgo aceptado no autoriza a almacenar, comparar, registrar ni transportar
el DNI como secreto en texto plano fuera del flujo estrictamente necesario.

---

## 6. Endpoints del módulo

| Método | Ruta | Acceso | Resultado |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Público | Crea sesión, cookie y access token. |
| `POST` | `/api/v1/auth/refresh` | Cookie refresh | Rota refresh y renueva el contexto. |
| `POST` | `/api/v1/auth/logout` | Autenticado | Revoca la sesión actual y limpia la cookie. |
| `POST` | `/api/v1/auth/logout-todas` | Autenticado | Revoca todas las sesiones propias y limpia la cookie actual. |

No incorporar rutas alternativas, aliases ni versiones no documentadas.

En particular, no existen en el MVP:

```text
POST  /auth/registro
POST  /auth/recuperar-password
POST  /auth/restablecer-password
PATCH /usuarios/:id/password
```

---

## 7. Login

### Entrada

```json
{
  "email": "persona@centro.com",
  "dni": "30111222"
}
```

Reglas:

- `email` es obligatorio, válido, de máximo 254 caracteres y se normaliza a
  minúsculas;
- `dni` es obligatorio y queda entre 7 y 20 dígitos después de retirar los
  separadores admitidos;
- utilizar una única utilidad de normalización compartida con la gestión de
  usuarios;
- no modificar silenciosamente caracteres no admitidos;
- verificar el DNI normalizado mediante `bcrypt.compare` contra
  `password_hash`;
- el costo bcrypt se obtiene de configuración validada;
- solo un usuario activo puede iniciar sesión;
- cada login exitoso crea una sesión nueva; no revoca las demás.

### Respuesta

La respuesta `200` contiene exactamente el contexto permitido por el contrato:

```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "uuid",
      "nombre": "Ana",
      "apellido": "Pérez",
      "rol": "profesional",
      "titulo": "Lic.",
      "especialidad": "Psicopedagogía",
      "funcion": "Psicopedagoga clínica",
      "fotoUrl": "/uploads/usuarios/uuid.webp"
    },
    "permissions": [
      "patients.readLinked",
      "appointments.manageOwn"
    ]
  }
}
```

El refresh token se envía mediante `Set-Cookie`. Nunca aparece en JSON.

### Fallos

Usuario inexistente, usuario inactivo y DNI incorrecto producen el mismo error:

```text
401 CREDENCIALES_INVALIDAS
```

No indicar qué campo falló ni si el email está registrado.

El formato inválido se responde según el contrato como:

```text
400 VALIDATION_ERROR
```

El límite contractual de login es más de cinco fallos en quince minutos para la
combinación protegida:

```text
429 LOGIN_LIMITE_EXCEDIDO
```

La clave exacta del rate limiter no debe inventarse si todavía no está definida
por configuración o decisión normativa.

---

## 8. Access token

El access token:

- es un JWT firmado;
- vence a los 15 minutos;
- se devuelve solamente en el JSON de login y refresh;
- se utiliza como `Authorization: Bearer <accessToken>`;
- incluye la expiración y los identificadores mínimos aprobados;
- utiliza `sid` para identificar la sesión cuando así lo define el modelo de
  datos;
- nunca es la única fuente de autorización sobre un recurso.

No incluir en claims:

- DNI;
- email;
- teléfono;
- nombre o apellido si no son imprescindibles y aprobados;
- diagnósticos, pacientes, informes, mensajes o notas;
- cookie o refresh token;
- hashes;
- secretos;
- cuerpos de requests;
- la lista completa de permisos salvo decisión normativa expresa.

No definir por intuición el conjunto final de claims. `sub`, `sid`, `iat` y
`exp` deben utilizarse según la estrategia aprobada; cualquier claim adicional,
incluidos rol, issuer y audience, debe estar documentado y probado.

La firma se configura por entorno. El arranque debe fallar si el secreto es
ausente, inseguro o incompatible con la configuración aprobada.

El middleware distingue sin filtrar detalles internos:

```text
sin token        → 401 AUTHENTICATION_REQUIRED
token inválido   → 401 TOKEN_INVALIDO
token vencido    → 401 TOKEN_EXPIRADO
sesión revocada  → 401 SESION_REVOCADA
usuario inactivo → 401 USUARIO_INACTIVO
```

La posibilidad de detectar sesión revocada o usuario inactivo en cada request
depende de una decisión pendiente. No afirmar que existe revocación inmediata
del access token si el middleware no consulta estado persistido.

---

## 9. Refresh token

El refresh token:

- vence a los 7 días;
- viaja exclusivamente en cookie HttpOnly;
- no se acepta por body, query, fragmento, header custom ni
  `Authorization`;
- se persiste exclusivamente como hash;
- rota en cada renovación exitosa;
- no se reutiliza como access token;
- no se devuelve a JavaScript.

La base nunca almacena el token plano. El valor plano solo puede existir en
memoria durante el tiempo mínimo necesario para generar la cookie.

No elegir formato ni algoritmo de hash mientras esas decisiones sigan
pendientes. La combinación elegida debe permitir:

- localizar o verificar la sesión de manera segura;
- mantener unicidad de `refresh_token_hash`;
- rotar atómicamente;
- detectar conflictos conocidos;
- probar concurrencia y, si se aprueba, reutilización.

No usar cifrado reversible para cumplir el requisito de hash. No usar el DNI,
email, UUID de usuario o identificadores predecibles como refresh token.

---

## 10. Persistencia de sesiones

La tabla `sesiones` representa sesiones de refresh revocables.

Campos normativos actuales:

```text
id                  UUID PK; también sid del access token
usuario_id          UUID FK a usuarios
refresh_token_hash  VARCHAR(255), único, nunca token plano
expires_at          TIMESTAMPTZ, 7 días
revoked_at          TIMESTAMPTZ nullable
last_used_at        TIMESTAMPTZ nullable
ip                  INET nullable
user_agent          VARCHAR(500) nullable y truncado
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

Reglas:

- se permiten varias filas activas por usuario;
- una sesión está inhabilitada si fue revocada o expiró;
- `refresh_token_hash` es único;
- los instantes se persisten en UTC;
- IP y user agent son contexto de seguridad, no credenciales;
- nunca exponer el modelo completo mediante una respuesta;
- no permitir endpoints para listar sesiones, hashes o cookies en el MVP;
- `ON DELETE CASCADE` desde usuarios es solo limpieza técnica; los usuarios no
  se eliminan normalmente.

El esquema físico y sus índices se modifican mediante migraciones. No utilizar
`sync()`.

---

## 11. Rotación

`POST /auth/refresh` no requiere un access token vigente; requiere la cookie de
refresh válida.

Flujo funcional:

1. leer la cookie configurada;
2. verificar o localizar la sesión mediante la estrategia aprobada;
3. comprobar que la sesión no esté revocada ni expirada;
4. cargar y comprobar que el usuario continúe activo;
5. generar un refresh nuevo y su hash;
6. reemplazar el hash anterior y actualizar `last_used_at` dentro de la misma
   transacción;
7. calcular nuevamente la proyección de usuario y los permisos vigentes;
8. emitir un access token nuevo de 15 minutos;
9. registrar `SESION_RENOVADA` sin datos sensibles;
10. confirmar la transacción;
11. reemplazar la cookie y responder `200`.

El service devuelve al controller un resultado interno mínimo. El controller
establece la cookie solo después de una operación persistente exitosa.

La respuesta posee la misma estructura que login:

```text
data.accessToken
data.user
data.permissions
```

Errores contractuales:

```text
401 REFRESH_INVALIDO
401 SESION_REVOCADA
401 SESION_EXPIRADA
401 USUARIO_INACTIVO
```

No utilizar siempre `REFRESH_INVALIDO` si el contrato exige un código más
específico y este puede determinarse sin exponer información peligrosa.

La transacción es obligatoria, pero no define por sí sola el comportamiento de
dos refreshes simultáneos. No introducir bloqueos, ventanas de tolerancia,
familias de tokens ni revocación por reutilización sin la decisión pendiente
correspondiente.

---

## 12. Cookies

La cookie de refresh debe:

- utilizar `HttpOnly` siempre;
- utilizar `Secure` obligatoriamente en producción;
- configurarse desde variables de entorno validadas;
- respetar la duración de 7 días;
- viajar solo a los orígenes y rutas aprobados;
- limpiarse con los mismos atributos con los que fue creada.

No establecer CORS con `*` cuando se usan credenciales. Configurar orígenes
explícitos y `credentials` únicamente donde corresponde.

Las operaciones basadas en cookie deben validar `Origin` según la arquitectura
vigente. Esta medida mínima no sustituye la decisión pendiente sobre la
estrategia CSRF definitiva.

No decidir sin aprobación:

- nombre final de la cookie;
- `SameSite`;
- `Domain`;
- `Path`;
- comportamiento entre dominios reales;
- mecanismo CSRF adicional.

No leer la cookie desde JavaScript, no duplicarla en almacenamiento local y no
devolverla en headers de depuración.

---

## 13. Logout de la sesión actual

`POST /auth/logout`:

- requiere actor autenticado según el contrato;
- no admite body;
- identifica la sesión actual mediante el contexto autenticado y la cookie
  vigente;
- no acepta un `sessionId` elegido por el cliente;
- revoca solo la sesión actual;
- establece `revoked_at` una única vez;
- limpia la cookie;
- registra `LOGOUT`;
- responde `204 No Content` sin envelope.

La revocación debe ser idempotente: repetir la operación sobre una sesión ya
revocada no crea errores internos ni eventos contradictorios. Si la solicitud
alcanza el handler, se limpia la cookie aunque la sesión ya no pueda renovarse.

No revocar todas las sesiones como simplificación del logout normal.

---

## 14. Logout de todas las sesiones

`POST /auth/logout-todas`:

- requiere actor autenticado;
- no admite body;
- toma el usuario exclusivamente del actor autenticado;
- revoca todas sus sesiones todavía activas dentro de una transacción;
- nunca acepta otro `usuarioId` desde body, params o query;
- limpia la cookie actual;
- registra un único evento funcional `LOGOUT_TODAS` con conteo no sensible si
  está aprobado;
- responde `204 No Content`.

La operación no permite que ningún rol cierre sesiones de otro usuario mediante
este endpoint.

Las revocaciones administrativas de otra cuenta pertenecen a los casos de uso
de `usuarios`, que coordinan auth mediante una interfaz de service explícita.

---

## 15. Integraciones con usuarios

Auth debe ofrecer una función de service pequeña y reutilizable para revocar
sesiones de un usuario dentro de una transacción recibida.

Deben revocarse todas las sesiones cuando:

- se desactiva un usuario;
- se restablece su acceso;
- cambia su DNI y se recalcula `password_hash`;
- otra regla normativa lo ordena expresamente.

La operación que modifica al usuario es dueña de la transacción y pasa esa misma
instancia a la revocación y auditoría. No abrir una transacción independiente
dentro de otra.

No asumir que un cambio de rol invalida de inmediato todos los access tokens.
La consecuencia exacta del cambio de rol sigue pendiente y debe resolverse antes
de implementar ese caso.

No permitir que auth modifique perfil, rol, servicios habituales ni visibilidad
pública.

---

## 16. Permisos y contexto autenticado

Login y refresh recalculan `permissions` a partir de la matriz vigente y del rol
actual. No reutilizar una lista enviada por el cliente ni una copia desactualizada
persistida en la sesión.

Convención única:

```text
patients.create
patients.readLinked
appointments.manageOwn
reports.createLinked
```

No crear una nomenclatura paralela en español o con `:`.

La lista ayuda al frontend a construir navegación y controles. No autoriza
operaciones: cada endpoint aplica RBAC, alcance de filas, policy del recurso y
permisos de campo en el backend.

La proyección `user` de login y refresh contiene solo los campos contractuales.
No incluir DNI, email de acceso, teléfono, estado de sesiones, hashes ni datos
administrativos adicionales.

---

## 17. Rate limiting y enumeración

Aplicar límites específicos a login y refresh, además del límite general.

Reglas:

- el límite de login respeta el umbral contractual;
- respuestas y tiempos no deben revelar si un email existe;
- los mensajes de credenciales son genéricos;
- no incluir email o DNI en la clave de logs;
- no devolver contadores internos, TTL del bloqueo ni estructura del limiter;
- el store local es un riesgo aceptado mientras exista una única instancia;
- al escalar horizontalmente se requiere un store compartido antes de declarar
  equivalente la protección.

No confiar en rate limiting como reemplazo de bcrypt, revocación, validación de
estado o respuestas genéricas.

---

## 18. Errores y respuestas

Utilizar el envelope estándar de `docs/contrato-api.md`.

Errores propios del módulo:

```text
CREDENCIALES_INVALIDAS
LOGIN_LIMITE_EXCEDIDO
TOKEN_INVALIDO
TOKEN_EXPIRADO
REFRESH_INVALIDO
SESION_REVOCADA
SESION_EXPIRADA
USUARIO_INACTIVO
```

No devolver:

- mensajes crudos de JWT, bcrypt, Sequelize o PostgreSQL;
- nombres de tablas, columnas, índices o constraints;
- SQL y parámetros;
- stack trace;
- valor o fragmento de token;
- cookie completa;
- hash;
- secreto, algoritmo interno o configuración;
- email o DNI usado en el intento.

Cada error conserva `X-Correlation-Id` en el header y `correlationId` en el
envelope. `details` es un arreglo y solo contiene errores de campos seguros
cuando corresponde.

---

## 19. Logs y auditoría

Los logs técnicos y la auditoría funcional son mecanismos diferentes.

Eventos mínimos de autenticación:

```text
LOGIN_EXITOSO
LOGIN_FALLIDO
SESION_RENOVADA
LOGOUT
LOGOUT_TODAS
```

Nunca registrar en logs, auditoría o metadata:

- DNI;
- email usado como credencial si permite identificar el intento;
- `Authorization`;
- access token;
- refresh token;
- cookie;
- `password_hash`;
- `refresh_token_hash`;
- cuerpos HTTP completos;
- secretos;
- stack o SQL.

Una auditoría de fallo puede guardar causa técnica normalizada y contexto
permitido, pero no el valor de las credenciales. Los eventos exitosos que forman
parte de una operación transaccional comparten la misma transacción.

El `user_agent` persistido se trunca al máximo documentado y nunca se utiliza
como prueba única de identidad.

---

## 20. Transacciones y concurrencia

Casos transaccionales obligatorios:

- creación de sesión al iniciar sesión, cuando incluye auditoría dependiente;
- rotación de refresh;
- revocación de sesión actual;
- revocación total;
- desactivación o restablecimiento de usuario con revocación;
- cambio de DNI, actualización del hash y revocación;
- auditoría que forma parte del resultado funcional.

Reglas:

- el service dueño abre la transacción;
- todas las consultas y escrituras relacionadas reciben la misma instancia;
- no confirmar datos parciales;
- no capturar un error para continuar silenciosamente;
- mantener la transacción breve;
- no realizar llamadas externas dentro de ella;
- no asumir que la transacción evita carreras por sí sola;
- adquirir locks solo después de aprobar la estrategia de concurrencia;
- traducir conflictos conocidos sin exponer internals.

La rotación debe probarse con solicitudes simultáneas contra PostgreSQL real.
Mientras no se apruebe el comportamiento de refreshes concurrentes legítimos,
la prueba debe documentar el resultado observado y la implementación de esa
parte debe permanecer detenida.

---

## 21. Pruebas obligatorias

### Login

- email y DNI válidos;
- normalización autorizada;
- formatos inválidos;
- usuario inexistente;
- DNI incorrecto;
- usuario inactivo;
- mismo error genérico para los tres fallos anteriores;
- creación de varias sesiones para el mismo usuario;
- cookie sin aparecer en JSON;
- rate limit y recuperación conforme a la estrategia aprobada;
- ausencia de credenciales en logs y auditoría.

### Access token

- token válido;
- ausente;
- firma inválida;
- vencido;
- claims prohibidos ausentes;
- `sid` relacionado con la sesión correcta;
- códigos funcionales contractuales;
- ninguna autorización basada solo en permisos del cliente.

### Refresh

- cookie válida;
- cookie ausente o inválida;
- sesión revocada;
- sesión expirada;
- usuario inactivo;
- rotación cambia el valor y el hash;
- hash anterior deja de renovar;
- `last_used_at` se actualiza;
- permisos y usuario se recalculan;
- cookie nueva y access token nuevo;
- rollback completo ante fallo;
- solicitudes simultáneas reales;
- ausencia de token o cookie en logs.

### Logout

- revoca únicamente la sesión actual;
- conserva otras sesiones del mismo usuario;
- limpia cookie con atributos coincidentes;
- es idempotente;
- responde `204` sin body;
- logout total revoca todas las sesiones propias;
- no permite elegir otro usuario;
- registra los eventos correctos sin datos sensibles.

### Integración administrativa

- desactivar usuario revoca sesiones en la misma transacción;
- restablecer acceso revoca sesiones;
- cambiar DNI recalcula bcrypt y revoca sesiones;
- rollback restaura tanto usuario como sesiones y auditoría;
- un usuario inactivo no vuelve a iniciar ni renovar.

No reemplazar pruebas de integración y concurrencia con mocks de Sequelize.

---

## 22. Acciones prohibidas

No realizar ninguna de estas acciones:

- almacenar refresh tokens en texto plano;
- comparar DNI directamente con `password_hash`;
- guardar access o refresh tokens en logs;
- devolver refresh en JSON;
- aceptar refresh por body, query o `Authorization`;
- guardar refresh en `localStorage` desde el backend o recomendarlo al frontend;
- incluir información personal o clínica en JWT;
- confiar en un UUID o en un claim como autorización completa;
- permitir login de usuarios inactivos;
- renovar sesiones revocadas o expiradas;
- reutilizar el mismo refresh después de una rotación exitosa;
- omitir transacciones en rotación o revocación múltiple;
- revocar todas las sesiones en un logout normal;
- aceptar identificadores de usuario o sesión elegidos por el cliente para
  logout;
- establecer cookies sin `HttpOnly`;
- utilizar cookies no seguras en producción;
- habilitar CORS `*` con credenciales;
- inventar una estrategia CSRF;
- crear registro público o recuperación de contraseña;
- exponer hashes mediante proyecciones administrativas;
- usar `sequelize.sync()`;
- declarar resuelta la revocación inmediata de access tokens sin la estrategia
  aprobada;
- hacer pasar pruebas debilitando seguridad, validación o auditoría.

---

## 23. Procedimiento de trabajo

### Antes del cambio

1. Leer `api/AGENTS.md` y este archivo.
2. Consultar arquitectura, contrato, matriz y modelo de datos.
3. Inspeccionar migrations, modelos, configuración y tests existentes.
4. Identificar qué endpoint y flujo se modifica.
5. Revisar exposición de credenciales, cookies y PII.
6. Revisar límites transaccionales y concurrencia.
7. Comprobar si la tarea depende de una decisión pendiente.
8. Detener y solicitar definición cuando corresponda.

### Durante el cambio

1. Mantener routes, controllers y services separados.
2. Centralizar constantes, cookies, tokens y permisos.
3. Usar transacción en operaciones compuestas.
4. Mantener tokens planos fuera de persistencia y logs.
5. Traducir errores al contrato.
6. Agregar auditoría segura.
7. Incorporar pruebas unitarias, integración y concurrencia.
8. Actualizar únicamente la documentación afectada.

### Después del cambio

1. Ejecutar lint.
2. Ejecutar unit tests.
3. Ejecutar integración contra PostgreSQL real.
4. Ejecutar pruebas concurrentes si se tocó refresh o revocación.
5. Inspeccionar logs de prueba para detectar secretos o PII.
6. Verificar atributos de set y clear cookie.
7. Verificar tiempos de expiración.
8. Verificar códigos y envelopes.
9. Informar comandos ejecutados y resultados.
10. Informar cualquier validación no realizada o decisión aún pendiente.

No declarar la tarea terminada si las validaciones relevantes no se ejecutaron.

---

## 24. Definition of Done

Un cambio de autenticación está completo solamente cuando:

- respeta los cuatro endpoints contractuales;
- no agrega endpoints excluidos;
- el login normaliza y verifica mediante bcrypt;
- usuario inexistente, inactivo y credencial incorrecta no se distinguen;
- access dura 15 minutos;
- refresh dura 7 días y rota;
- el refresh solo viaja por cookie HttpOnly;
- producción exige cookie segura;
- solo se persiste el hash del refresh;
- se conservan sesiones simultáneas;
- logout actual y total revocan el alcance correcto;
- las operaciones compuestas son atómicas;
- login y refresh devuelven usuario y permisos vigentes;
- las permissions no sustituyen policies;
- JWT, respuestas, logs y auditoría no contienen datos prohibidos;
- los errores coinciden con el contrato;
- las cookies se limpian con atributos compatibles;
- las pruebas relevantes pasan contra PostgreSQL;
- la concurrencia se probó cuando corresponde;
- lint pasa;
- la documentación afectada está sincronizada;
- cualquier decisión pendiente continúa visible y no fue inventada.

---

## 25. Decisiones pendientes

No resolver por cuenta propia:

1. formato definitivo del refresh token;
2. algoritmo exacto para almacenar su hash;
3. estrategia de detección de reutilización;
4. alcance de revocación al detectar reutilización;
5. tratamiento de refreshes concurrentes legítimos;
6. consulta de sesión y usuario en cada request autenticada;
7. efecto inmediato de cambio de rol o desactivación sobre access tokens
   vigentes;
8. atributos finales de cookie según los dominios reales;
9. estrategia CSRF definitiva;
10. protección para evitar quedar sin administradores activos;
11. conjunto definitivo de claims adicionales a `sub`, `sid`, `iat` y `exp`;
12. clave exacta y política completa del rate limiter de login y refresh.

Cuando una tarea dependa de uno de estos puntos:

1. detener únicamente la parte afectada;
2. explicar el riesgo y las opciones;
3. señalar qué documentos y pruebas cambiarían;
4. solicitar una decisión explícita;
5. no completar el vacío con una convención personal o de una librería.

