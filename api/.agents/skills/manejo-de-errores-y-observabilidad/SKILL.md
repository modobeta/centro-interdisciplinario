---
name: manejo-de-errores-y-observabilidad
description: Implementa o revisa errores controlados, errorHandler, logger, CORS, rate limiting y observabilidad HTTP de esta API. Usar al agregar fallos funcionales o configuración transversal. No usar para inventar códigos ni registrar auditoría funcional como logs.
---

# Manejo de errores y observabilidad

## Objetivo

Producir respuestas estables y diagnósticos operativos útiles sin revelar
detalles internos ni información sensible.

## Fuentes obligatorias

1. Leer api/AGENTS.md.
2. Leer envelopes, status y catálogo de errores en api/docs/contrato-api.md.
3. Leer logging, auditoría y seguridad HTTP en arquitectura.
4. Leer campos prohibidos y eventos en api/docs/matriz-permisos.md.
5. Inspeccionar AppError.js, errorCodes.js, errorHandler.js, logger.js, cors.js y
   rateLimit.js antes de definir interfaces.

## Entradas mínimas

- condición de fallo;
- status y código funcional contractual;
- datos seguros para el mensaje y details;
- severidad, correlationId y contexto técnico mínimo;
- controles HTTP o límites afectados.

## Procedimiento

1. Reutilizar un código existente con el mismo significado o armonizar el
   contrato antes de crear uno.
2. Lanzar AppError desde el límite que conoce la causa funcional.
3. Mantener errorHandler como traductor central de errores esperados,
   validación, Sequelize y fallos inesperados.
4. Emitir el envelope exacto sin stack, SQL ni nombres de constraints.
5. Registrar correlationId, código, método y ruta con metadata allowlist.
6. Configurar CORS con orígenes explícitos y credenciales solo donde corresponda.
7. Aplicar rate limiting general y específico sin convertirlo en autorización.
8. Separar eventos funcionales de auditoría de los logs técnicos.

## Guardrails

- No registrar bodies, cookies, tokens, hashes, DNI, informes, diagnósticos,
  mensajes, notas internas ni datos completos del tutor.
- No devolver mensajes diferentes que permitan enumerar credenciales.
- No exponer excepciones de librerías o detalles de infraestructura.
- No registrar dos veces el mismo error en cada capa.
- No responder 200 con un error embebido.
- No usar logs como sustituto de auditoría ni auditoría como logging técnico.
- No ampliar CORS con wildcard cuando se usan credenciales.

## Verificación y salida esperada

- Probar cada error esperado con status, code, message y details correctos.
- Probar error desconocido y confirmar respuesta genérica.
- Inspeccionar logs de éxito y fallo para detectar datos prohibidos.
- Probar CORS permitido y rechazado, rate limit y correlationId.
- Entregar códigos afectados y ejemplos sanitizados de respuesta y log.

## Coordinación

Usar validacion-y-sanitizacion-api para errores de entrada,
auditoria-de-operaciones para eventos funcionales y
seguridad-de-datos-sensibles para la revisión final.
