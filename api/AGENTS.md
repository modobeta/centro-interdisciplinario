# AGENTS.md — API

## Alcance

Estas instrucciones se aplican a todo `api/`. Definen cómo trabajar en el
backend; no sustituyen las especificaciones funcionales ni autorizan ampliar el
MVP.

## Autoridad documental

La autoridad se determina por incumbencia:

- `docs/contrato-api.md`: interfaz HTTP, entradas, respuestas, status y códigos;
- `docs/matriz-permisos.md`: roles, acciones, scopes, policies y campos;
- `docs/modelo-datos.md`: persistencia, relaciones, índices, constraints y
  transacciones;
- `docs/arquitectura-backend.md`: estructura, capas, stack y criterios técnicos.

Una incompatibilidad transversal detiene la parte afectada hasta armonizar las
fuentes. Ningún documento prevalece fuera de su incumbencia.

Este archivo contiene reglas operativas comunes. El `AGENTS.md` más cercano
puede especializarlas para su carpeta, pero nunca modificar el contrato, los
permisos, el modelo de datos ni la arquitectura normativa.

## Contexto estable

- Node.js, Express 5, JavaScript CommonJS y Joi.
- PostgreSQL 16 y Sequelize 6.
- Monolito modular con flujo Route → Middleware → Validation → Controller →
  Service → Model/PostgreSQL.
- Cuatro roles fijos y una instalación independiente por centro.
- API en español con nombres públicos `camelCase`; PostgreSQL en `snake_case`.
- Migraciones como fuente de verdad; no usar `sequelize.sync()`.

El árbol descrito en arquitectura es el objetivo. Antes de implementar, comprobar
qué parte del scaffold existe realmente y no asumir que los archivos vacíos ya
ofrecen comportamiento.

## Guardrails comunes

- Mantener controllers delgados y reglas de negocio en services.
- Validar forma con Joi, reglas dependientes de datos en services e integridad
  crítica en PostgreSQL.
- Aplicar autorización en backend por rol, scope, recurso y proyección de campos.
- Usar `404` para ocultar recursos privados solicitados por UUID y `403` para
  acciones, campos o filtros prohibidos sobre recursos visibles.
- Compartir una única transacción entre todas las escrituras de un caso de uso.
- Traducir conflictos conocidos al contrato sin exponer SQL ni nombres de
  constraints.
- No registrar tokens, credenciales, contenido clínico, mensajes ni cuerpos
  completos.
- No agregar endpoints, tablas, permisos, dependencias o abstracciones fuera del
  MVP documentado.

## AGENTS especializados

- `src/shared/database/AGENTS.md`
- `src/modules/auth/AGENTS.md`
- `src/modules/usuarios/AGENTS.md`
- `src/modules/pacientes/AGENTS.md`
- `src/modules/vinculos/AGENTS.md`
- `src/modules/turnos/AGENTS.md`
- `src/modules/informes/AGENTS.md`
- `src/modules/mensajeria/AGENTS.md`
- `src/modules/servicios/AGENTS.md`
- `src/modules/public/AGENTS.md`
- `src/modules/auditoria/AGENTS.md`

## Procedimiento de cambio

1. Identificar las fuentes normativas y el `AGENTS.md` más cercano.
2. Inspeccionar implementación, migraciones y pruebas existentes.
3. Delimitar el caso de uso, transacción, policy, proyección y errores afectados.
4. Implementar el cambio mínimo coherente con el scaffold actual.
5. Actualizar conjuntamente toda fuente normativa afectada.
6. Ejecutar los scripts realmente definidos en `package.json`; no declarar
   verificaciones que el scaffold todavía no permita ejecutar.
7. Informar supuestos, riesgos y comprobaciones omitidas.

## Verificación mínima

- rutas, validaciones, controllers y services conectados;
- permisos y proyecciones probados por rol y scope;
- migraciones reversibles, asociaciones coherentes y constraints verificadas;
- concurrencia probada en operaciones sensibles;
- errores y status acordes al contrato;
- lint, tests y arranque ejecutados cuando existan scripts para ello;
- diff limitado al alcance solicitado.

## Deuda no bloqueante

Solo permanece abierta la deuda registrada en los documentos normativos:
retención y particionado de auditoría, storage productivo de imágenes, caché
pública, búsqueda textual avanzada y calendarios personalizados o feriados. No
resolverla incidentalmente dentro de otro cambio.
