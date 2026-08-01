# AGENTS.md — Backend API

## 1. Alcance

Este archivo establece las instrucciones operativas para todo el código contenido en `api/`.

Estas reglas deben ser respetadas por:

* Codex;
* OpenCode;
* otros agentes de programación;
* desarrolladores humanos.

Un archivo `AGENTS.md` ubicado en una subcarpeta puede añadir o especializar estas instrucciones para ese sector del backend. Las instrucciones más específicas prevalecen únicamente dentro de su ámbito.

No modificar decisiones arquitectónicas, reglas de negocio, permisos o contratos sin aprobación explícita.

---

## 2. Comandos principales

Ejecutar todos los comandos desde la carpeta `api/`.

Antes de utilizar un script, comprobar que exista en `package.json`. No inventar scripts ni asumir nombres diferentes.

```bash
npm install
npm run dev
npm start
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run lint:fix
npm run db:migrate
npm run db:migrate:undo
npm run db:seed
npm run db:seed:undo
```

Reglas:

* No ejecutar migraciones destructivas en entornos compartidos sin autorización.
* No modificar una migración que ya haya sido aplicada.
* No utilizar `sequelize.sync()` para crear o alterar tablas.
* No ejecutar seeders con datos de prueba en producción.
* No agregar dependencias sin justificar su necesidad.
* Mantener `package-lock.json` versionado y actualizado.
* No ignorar errores de lint o pruebas para completar una tarea.

---

## 3. Fuentes normativas

Antes de modificar una ruta, entidad, permiso, respuesta o regla de negocio, consultar los documentos correspondientes dentro de `docs/`.

```text
docs/
├── contrato-api.md
├── matriz-permisos.md
├── modelo-datos.md
└── arquitectura-backend.md
```

Cada documento tiene una responsabilidad:

* `contrato-api.md`: endpoints, parámetros, respuestas y códigos HTTP.
* `matriz-permisos.md`: permisos por rol, recurso, acción y campo.
* `modelo-datos.md`: entidades, atributos, relaciones, índices y constraints.
* `arquitectura-backend.md`: estructura, capas, tecnologías y criterios generales.

### Precedencia

Aplicar el siguiente orden:

1. Requerimientos funcionales y decisiones expresamente aprobadas.
2. Contrato de la API.
3. Matriz de permisos.
4. Modelo de datos.
5. Arquitectura del backend.
6. Instrucciones del `AGENTS.md` más cercano al archivo modificado.
7. Este archivo.

Un `AGENTS.md` especializado puede detallar cómo implementar una regla, pero no debe contradecir los documentos normativos.

Si dos fuentes normativas se contradicen:

1. detener la implementación afectada;
2. identificar los documentos y reglas incompatibles;
3. explicar el impacto técnico y funcional;
4. solicitar una decisión;
5. no elegir silenciosamente una interpretación.

No modificar la documentación para justificar una implementación incompatible.

---

## 4. Stack obligatorio

Utilizar las tecnologías aprobadas para el MVP:

* Node.js LTS;
* Express 5;
* JavaScript;
* CommonJS;
* PostgreSQL 16 o superior;
* Sequelize 6;
* Joi;
* JSON Web Token;
* refresh tokens rotativos;
* bcrypt;
* Pino;
* Jest;
* Supertest.

### Decisiones arquitectónicas que no deben reinterpretarse

Durante el MVP:

* No convertir el proyecto a TypeScript.
* No migrar CommonJS a ES Modules.
* No dividir el backend en microservicios.
* No introducir una capa Repository.
* No implementar DDD completo.
* No reemplazar PostgreSQL.
* No reemplazar Sequelize.
* No sustituir Joi por otra biblioteca.
* No distribuir los modelos Sequelize dentro de cada módulo.
* No agregar abstracciones genéricas sin una necesidad demostrable.
* No crear endpoints que no estén aprobados en el contrato.

Los services acceden directamente a los modelos Sequelize.

---

## 5. Estructura del backend

```text
api/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── modules/
│   ├── shared/
│   └── routes/
├── migrations/
├── seeders/
├── tests/
├── scripts/
├── docs/
├── .env.example
├── .sequelizerc
├── AGENTS.md
├── eslint.config.js
├── jest.config.js
├── package.json
└── README.md
```

Responsabilidades:

```text
src/config/       Configuración de entorno, CORS y logs
src/modules/      Módulos funcionales del negocio
src/shared/       Infraestructura y utilidades reutilizables
src/routes/       Composición de rutas públicas y privadas
migrations/       Evolución controlada del esquema PostgreSQL
seeders/          Datos iniciales y datos de desarrollo
tests/            Pruebas unitarias y de integración
scripts/          Operaciones administrativas explícitas
docs/             Documentación técnica normativa
```

`src/app.js` configura Express, los middlewares y las rutas. No debe abrir el puerto ni ejecutar migraciones.

`src/server.js` inicializa las dependencias necesarias y comienza a escuchar solicitudes.

---

## 6. Arquitectura obligatoria

Toda solicitud debe respetar este flujo:

```text
Route
→ Middleware
→ Validation
→ Controller
→ Service
→ Model / PostgreSQL
```

No saltar capas por conveniencia.

### Routes

Las routes:

* declaran el método y la ruta HTTP;
* componen middlewares;
* conectan autenticación, autorización y validación;
* delegan en el controller.

No deben:

* contener reglas de negocio;
* consultar modelos;
* iniciar transacciones;
* construir consultas SQL;
* realizar proyecciones complejas.

### Middlewares

Los middlewares pueden:

* autenticar;
* verificar permisos generales por rol;
* validar entradas;
* aplicar rate limiting;
* asignar contexto controlado a la request;
* normalizar errores transversales.

No deben reemplazar las policies por recurso.

### Validation

Los schemas Joi deben:

* validar `params`, `query` y `body`;
* aplicar límites de longitud y formato;
* normalizar solamente cuando esté documentado;
* rechazar propiedades inesperadas cuando corresponda;
* diferenciar campos opcionales de valores nulos;
* producir errores normalizados.

La validación Joi no debe:

* consultar la base de datos;
* decidir permisos;
* reemplazar constraints de PostgreSQL;
* contener reglas dependientes del estado de otros recursos.

### Controllers

Los controllers deben:

* recibir los datos HTTP ya validados;
* obtener el actor autenticado desde el contexto seguro;
* invocar al service;
* seleccionar el código HTTP;
* construir la respuesta normalizada.

Los controllers no deben:

* acceder directamente a modelos Sequelize;
* ejecutar reglas de negocio;
* implementar autorización por recurso;
* iniciar o confirmar transacciones;
* devolver instancias Sequelize completas;
* capturar errores únicamente para ocultarlos.

### Services

Los services deben:

* implementar las reglas de negocio;
* consultar y modificar modelos Sequelize;
* aplicar policies por recurso;
* verificar permisos dependientes del estado;
* controlar transacciones;
* aplicar proyecciones de datos;
* generar eventos de auditoría cuando corresponda;
* traducir conflictos conocidos a errores funcionales.

Cada operación debe recibir explícitamente el actor cuando su resultado dependa de permisos.

No confiar en datos de identidad o rol proporcionados por el body, los params o la query.

### Models y PostgreSQL

Los modelos Sequelize representan el esquema, pero las migraciones son la fuente de verdad.

PostgreSQL debe garantizar, cuando corresponda:

* claves primarias;
* claves foráneas;
* unicidad;
* nulabilidad;
* valores válidos;
* integridad referencial;
* restricciones temporales;
* ausencia de solapamientos;
* índices necesarios.

No reemplazar una garantía de integridad de PostgreSQL por una comprobación exclusivamente en JavaScript.

---

## 7. Convenciones

### JavaScript

* Archivos JavaScript: minúsculas.
* Variables y funciones: `camelCase`.
* Clases y modelos: `PascalCase`.
* Constantes globales: `UPPER_SNAKE_CASE`.
* Utilizar CommonJS con `require` y `module.exports`.
* Mantener funciones pequeñas y responsabilidades explícitas.
* Evitar valores mágicos; utilizar constantes compartidas cuando representen reglas estables.

Ejemplos:

```javascript
const appointmentStates = require('../../shared/constants/appointmentStates');

async function createAppointment(input, actor, transaction) {
  // ...
}

module.exports = {
  createAppointment,
};
```

### PostgreSQL

* Tablas y columnas: `snake_case`.
* Identificadores: UUID.
* Fechas persistidas: UTC.
* Claves foráneas con nombres explícitos.
* Constraints e índices con nombres estables y descriptivos.

### Tiempo y agenda

* Persistir instantes temporales en UTC.
* Interpretar la agenda del centro en `America/Argentina/Cordoba`.
* No utilizar el huso horario local del servidor como regla de negocio.
* Centralizar la conversión y validación temporal.
* No calcular horarios mediante concatenación manual de cadenas.
* Considerar cambios futuros de configuración aunque actualmente no exista horario de verano.

### Códigos funcionales

Los códigos de error deben ser estables y escribirse en mayúsculas con guion bajo.

Ejemplos:

```text
VALIDATION_ERROR
RESOURCE_NOT_FOUND
FORBIDDEN_RESOURCE
APPOINTMENT_OVERLAP
INVALID_STATE_TRANSITION
SESSION_REVOKED
```

No cambiar un código consumido por el frontend sin actualizar el contrato y sus consumidores.

---

## 8. Respuestas HTTP

### Respuesta exitosa

```json
{
  "success": true,
  "data": {}
}
```

### Respuesta paginada

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "pages": 0
  }
}
```

### Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "El recurso solicitado no existe."
  }
}
```

Reglas:

* Mantener el contrato de respuesta documentado.
* No devolver stacks.
* No exponer consultas SQL.
* No revelar nombres internos de tablas o constraints.
* No incluir detalles de infraestructura.
* No devolver errores crudos de Sequelize o PostgreSQL.
* Traducir errores esperables a códigos funcionales estables.
* Utilizar `409 Conflict` para conflictos de integridad, estado o concurrencia cuando así lo establezca el contrato.
* Centralizar la conversión final de errores en `errorHandler`.
* No responder con mensajes que permitan enumerar usuarios o recursos sensibles.

La política entre `403 Forbidden` y `404 Not Found` debe seguir el contrato y las reglas específicas del módulo. No unificarla arbitrariamente.

---

## 9. Autenticación, autorización y proyección

Todo endpoint privado debe comprobar, según corresponda:

1. autenticación;
2. estado de la sesión;
3. estado del usuario;
4. permiso general por rol;
5. permiso sobre el recurso solicitado;
6. permiso sobre la acción;
7. permiso sobre cada campo devuelto o modificado.

La autenticación no implica autorización.

### Reglas obligatorias

* El frontend no constituye una barrera de seguridad.
* Ocultar un botón no reemplaza una validación en el backend.
* Verificar la relación entre el actor y el recurso para evitar IDOR.
* No confiar en un identificador de usuario enviado por el cliente.
* Aplicar proyecciones explícitas antes de responder.
* No devolver directamente `model.toJSON()` sin seleccionar campos.
* No utilizar exclusiones incompletas como única protección de datos sensibles.
* Las policies por recurso deben ejecutarse en el backend.
* Los mensajes de login deben ser genéricos.
* Los refresh tokens deben viajar mediante cookies HttpOnly según la configuración aprobada.
* No incluir contraseñas, DNI, tokens, cookies ni datos clínicos en JWT.
* No registrar access tokens ni refresh tokens.

### Decisiones pendientes de autenticación

No implementar ni completar por cuenta propia las siguientes decisiones:

* formato definitivo del refresh token;
* algoritmo de almacenamiento de su hash;
* estrategia exacta de detección de reutilización;
* alcance de la revocación ante reutilización;
* control de refreshes concurrentes;
* verificación de sesión en cada solicitud autenticada;
* efecto inmediato de cambio de rol o desactivación;
* atributos definitivos de la cookie en producción;
* estrategia CSRF según dominios de despliegue;
* reglas para impedir que el sistema quede sin administradores activos.

Si una tarea depende de alguna de estas decisiones:

1. identificar la decisión pendiente;
2. explicar las alternativas y su impacto;
3. solicitar confirmación;
4. no adoptar silenciosamente una solución.

---

## 10. Reglas críticas del dominio

Estas reglas son deliberadas y no deben ser “corregidas” por un agente aunque parezcan inusuales.

### Instalación

* Cada centro utiliza una instalación y una base de datos independientes.
* El MVP no implementa multi-tenancy dentro de una base compartida.

### Usuarios y roles

* Ningún usuario puede modificar su propio perfil.
* Coordinación también puede actuar como prestador.
* Cualquier usuario autenticado puede asignar o quitar servicios a un prestador, según el contrato aprobado.
* Los cambios de rol deben respetar las consecuencias documentadas sobre asignaciones y vínculos.
* No eliminar físicamente usuarios con historial relacionado.

### Pacientes y vínculos

* Un paciente inactivo conserva todo su historial.
* Un paciente inactivo no admite nuevas operaciones, salvo las excepciones expresamente documentadas.
* Sus conversaciones históricas pueden continuar funcionando.
* Al crear un paciente, el vínculo automático con el creador solamente corresponde cuando el creador es profesional.
* Un profesional vinculado puede incorporar a otro prestador.
* Un profesional vinculado no puede desvincular a otro prestador.

### Turnos

* Los turnos no se reprograman.
* Para cambiar fecha, hora, profesional, servicio o consultorio se cancela el turno original y se crea uno nuevo.
* PostgreSQL debe impedir solapamientos de profesional, paciente y consultorio.
* Un profesional necesita vínculo previo con el paciente para crear un turno.
* El vínculo automático asociado a la creación de un turno corresponde a administrador, coordinación o secretaría, según el contrato.
* El administrador no puede ver las `notas_internas` de un turno.
* No asumir que un rol con mayores facultades administrativas puede leer todos los campos.

### Informes

* El administrador no puede crear informes.
* Secretaría puede leer informes completos.
* Los informes finalizados son inmutables.
* Solamente el autor puede editar y finalizar su borrador.
* Los profesionales requieren el vínculo correspondiente para acceder según la operación.
* Coordinación puede actuar conforme a las excepciones documentadas.
* No existe eliminación física de informes.
* No registrar contenido clínico en la auditoría.

### Mensajería

* El acceso a una conversación depende de la participación.
* El administrador no puede leer conversaciones ajenas si no participa.
* Un participante puede agregar usuarios según las reglas aprobadas.
* El nuevo participante accede al historial completo de la conversación.
* Los mensajes enviados son inmutables.
* El archivo de una conversación es individual para cada participante.
* No registrar el contenido de mensajes en logs ni auditoría.

### Endpoints inexistentes

* No crear un endpoint de contacto público que persista mensajes.
* No agregar endpoints por analogía con otras aplicaciones.
* No implementar operaciones de eliminación o reprogramación ausentes del contrato.
* No exponer información interna a través del módulo público.

---

## 11. Transacciones

Utilizar transacciones cuando una operación modifique varios registros que deban confirmarse o revertirse como una unidad.

Ejemplos:

* creación de paciente, tutor y relación;
* creación de turno y vínculo automático;
* creación de conversación y participantes;
* incorporación de participantes;
* rotación de refresh token;
* revocación de sesiones;
* cambio de rol y cierre de relaciones;
* actualización de estado acompañada de auditoría;
* cualquier operación con múltiples escrituras dependientes.

Reglas:

* Pasar la misma transacción a todas las operaciones relacionadas.
* No iniciar transacciones independientes dentro de una transacción existente.
* No confirmar parcialmente una operación.
* Permitir que el error provoque rollback.
* No capturar un error y continuar silenciosamente.
* Realizar dentro de la transacción la auditoría de operaciones exitosas cuando deba compartir atomicidad.
* No intentar conservar auditoría de una operación fallida dentro de una transacción que será revertida.

El mecanismo definitivo de auditoría para operaciones fallidas continúa pendiente de decisión. No improvisarlo.

---

## 12. Concurrencia e integridad

Las validaciones previas mejoran los mensajes, pero no garantizan integridad ante solicitudes simultáneas.

Para reglas expuestas a concurrencia:

* respaldar la regla con constraints o bloqueos apropiados;
* utilizar transacciones;
* capturar el error real de PostgreSQL;
* traducirlo a una respuesta funcional estable;
* agregar pruebas concurrentes.

En agenda, una consulta previa de disponibilidad no reemplaza los constraints de antisolapamiento.

No eliminar un constraint para hacer pasar una prueba o simplificar una implementación.

---

## 13. Migraciones y modelos

Las migraciones constituyen la fuente de verdad del esquema.

Toda modificación del esquema debe:

1. crear una migración nueva;
2. definir `up`;
3. definir un `down` seguro cuando sea posible;
4. mantener el modelo Sequelize alineado;
5. actualizar asociaciones;
6. revisar claves foráneas;
7. revisar índices y constraints;
8. actualizar la documentación;
9. incluir pruebas de integración.

Reglas:

* No modificar migraciones ya aplicadas.
* No depender del orden de carga accidental de modelos.
* Mantener nombres de tablas y columnas explícitos.
* Definir nulabilidad de manera consciente.
* No utilizar `CASCADE` sin evaluar el historial.
* No eliminar físicamente información histórica.
* No agregar índices sin identificar la consulta que justifican su existencia.
* No utilizar `sequelize.sync()`, ni siquiera como solución temporal para pruebas de integración.

Las pruebas deben ejecutar las migraciones sobre una base controlada.

---

## 14. Seguridad y privacidad

Está prohibido incluir en el repositorio:

* secretos;
* contraseñas reales;
* tokens;
* cookies reales;
* claves privadas;
* credenciales de bases de datos;
* datos personales reales;
* historias clínicas reales;
* conversaciones reales.

Está prohibido registrar:

* contraseñas;
* DNI;
* access tokens;
* refresh tokens;
* cookies;
* cabeceras de autorización;
* diagnósticos;
* informes;
* mensajes;
* notas internas;
* cuerpos HTTP completos sin sanitización.

También está prohibido:

* devolver atributos completos de Sequelize;
* construir SQL dinámico con entradas sin parametrizar;
* desactivar permisos para resolver una prueba;
* confiar en validaciones realizadas únicamente por el frontend;
* utilizar fixtures con información personal real;
* incluir contenido sensible dentro de eventos de auditoría;
* filtrar la existencia de recursos protegidos cuando el contrato establezca ocultamiento.

Exigir:

* validación de todas las entradas externas;
* consultas parametrizadas;
* proyección explícita de campos;
* mínimos privilegios;
* rate limiting en endpoints sensibles;
* sanitización de logs;
* mensajes genéricos de autenticación;
* protección contra IDOR;
* auditoría funcional sin contenido sensible;
* revisión de CORS y `Origin` según el entorno.

---

## 15. Logging y auditoría

Pino se utiliza para logs técnicos.

Los logs técnicos y la auditoría funcional son mecanismos diferentes.

### Logs técnicos

Pueden registrar:

* identificador de solicitud;
* ruta normalizada;
* método HTTP;
* código de estado;
* duración;
* código funcional del error;
* identificadores técnicos no sensibles cuando sean necesarios.

No deben registrar contenido clínico, credenciales ni cuerpos completos.

### Auditoría funcional

Debe registrar acciones relevantes del dominio según la documentación, por ejemplo:

* actor;
* acción;
* tipo de recurso;
* identificador del recurso;
* fecha;
* resultado;
* metadatos mínimos no sensibles.

La auditoría no debe almacenar:

* texto de informes;
* contenido de mensajes;
* diagnósticos;
* notas internas;
* tokens;
* contraseñas;
* DNI completos;
* copias completas del recurso.

Las lecturas sensibles deben auditarse solamente cuando así lo establezcan el contrato o la matriz.

---

## 16. Pruebas

Toda modificación debe incorporar o actualizar las pruebas pertinentes.

### Pruebas unitarias

Utilizarlas para:

* reglas aisladas;
* normalización;
* validaciones auxiliares;
* policies puras;
* transiciones de estado;
* proyecciones;
* utilidades temporales.

### Pruebas de integración

Utilizarlas para:

* endpoints;
* middlewares;
* autenticación;
* autorización;
* acceso por recurso;
* transacciones;
* asociaciones;
* migraciones;
* constraints;
* códigos HTTP;
* estructura exacta de respuestas.

### Casos mínimos según corresponda

* operación autorizada;
* usuario no autenticado;
* rol no autorizado;
* recurso ajeno;
* IDOR;
* datos inválidos;
* propiedades inesperadas;
* recurso inexistente;
* recurso inactivo;
* transición inválida;
* conflicto de integridad;
* rollback;
* concurrencia;
* proyección por rol;
* ausencia de filtración de campos;
* respuesta y código funcional esperados.

Para turnos, sesiones y otras operaciones concurrentes, incluir solicitudes simultáneas reales contra PostgreSQL.

No simular en tests unitarios una garantía que corresponde verificar en la base de datos.

No reducir la calidad de una prueba para adaptarla a una implementación incorrecta.

---

## 17. Documentación sincronizada

Cuando cambie el comportamiento del backend, revisar y actualizar según corresponda:

* `docs/contrato-api.md`;
* `docs/matriz-permisos.md`;
* `docs/modelo-datos.md`;
* `docs/arquitectura-backend.md`;
* migraciones;
* modelos;
* asociaciones;
* schemas Joi;
* constantes;
* códigos de error;
* pruebas;
* `.env.example`;
* README;
* consumo esperado por el frontend;
* `AGENTS.md` especializado.

No actualizar documentos que no resulten afectados.

Si el cambio solicitado contradice una decisión vigente, presentar primero:

* la contradicción;
* el comportamiento actual;
* el comportamiento propuesto;
* los módulos afectados;
* las migraciones necesarias;
* los riesgos;
* las pruebas requeridas.

Esperar aprobación antes de alterar una regla normativa.

---

## 18. Dependencias

Antes de agregar una dependencia:

1. comprobar si la funcionalidad ya existe en el proyecto;
2. evaluar si puede resolverse claramente con la plataforma o biblioteca actual;
3. revisar mantenimiento, seguridad y compatibilidad;
4. justificar su incorporación;
5. actualizar `package.json` y `package-lock.json`;
6. documentar configuración o variables nuevas;
7. agregar pruebas.

No:

* incorporar varias bibliotecas para resolver el mismo problema;
* reemplazar dependencias centrales sin aprobación;
* agregar frameworks arquitectónicos no contemplados;
* ejecutar actualizaciones mayores como parte incidental de otra tarea.

---

## 19. Forma de trabajar

Antes de implementar:

1. leer el `AGENTS.md` aplicable;
2. revisar los documentos normativos relevantes;
3. inspeccionar el código existente;
4. identificar módulos afectados;
5. detectar decisiones pendientes;
6. comprobar el contrato y los permisos;
7. proponer cambios si existe una contradicción.

Durante la implementación:

1. mantener el alcance solicitado;
2. respetar las capas;
3. reutilizar patrones existentes;
4. aplicar transacciones cuando correspondan;
5. conservar la privacidad;
6. agregar pruebas;
7. evitar refactors no relacionados.

Después de implementar:

1. ejecutar pruebas relevantes;
2. ejecutar la suite completa cuando sea razonable;
3. ejecutar lint;
4. verificar migraciones;
5. revisar campos expuestos;
6. revisar autorización;
7. actualizar documentación;
8. informar cualquier validación que no haya podido ejecutarse.

No afirmar que una tarea está validada si los comandos correspondientes no fueron ejecutados.

---

## 20. Definition of Done

Una tarea del backend está completa solamente cuando:

* respeta la arquitectura establecida;
* mantiene el alcance aprobado;
* cumple el contrato de la API;
* aplica autenticación cuando corresponde;
* aplica autorización por rol y recurso;
* aplica proyección por campo;
* previene IDOR;
* mantiene migraciones y modelos alineados;
* utiliza transacciones cuando son necesarias;
* conserva los constraints de integridad;
* considera concurrencia;
* no filtra información sensible;
* genera auditoría cuando corresponde;
* incluye pruebas relevantes;
* supera las pruebas ejecutadas;
* supera lint;
* actualiza la documentación afectada;
* actualiza `.env.example` si agrega configuración;
* no incorpora dependencias innecesarias;
* no deja decisiones arquitectónicas implícitas;
* no resuelve silenciosamente una ambigüedad normativa.

---

## 21. Instrucciones especializadas

Los siguientes archivos complementan estas reglas dentro de sus respectivas carpetas:

```text
src/shared/database/AGENTS.md
src/modules/auth/AGENTS.md
src/modules/turnos/AGENTS.md
src/modules/informes/AGENTS.md
src/modules/mensajeria/AGENTS.md
```

Responsabilidades:

* `src/shared/database/AGENTS.md`: migraciones, modelos, asociaciones, índices, constraints e integridad.
* `src/modules/auth/AGENTS.md`: login, tokens, sesiones, cookies, rotación y revocación.
* `src/modules/turnos/AGENTS.md`: agenda, horarios, estados, permisos, vínculos y concurrencia.
* `src/modules/informes/AGENTS.md`: autoría, acceso clínico, finalización, inmutabilidad y auditoría.
* `src/modules/mensajeria/AGENTS.md`: participación, privacidad, historial, mensajes, no leídos y archivo individual.

No crear un `AGENTS.md` adicional para cada módulo sencillo salvo que aparezcan reglas suficientemente complejas, sensibles o contraintuitivas que justifiquen su mantenimiento independiente.
