---
name: seguridad-de-datos-sensibles
description: Revisa o endurece esta API contra filtraciones de credenciales, DNI, datos clínicos y mensajes. Usar para respuestas, projections, errores, logs, auditoría, fixtures, seeders, archivos o variables de entorno. No usar como sustituto de autorización o validación funcional.
---

# Seguridad de datos sensibles

## Objetivo

Evitar que información privada abandone su contexto autorizado por respuestas,
diagnósticos, persistencia auxiliar o artefactos de desarrollo.

## Fuentes obligatorias

1. Leer api/AGENTS.md y el AGENTS.md del módulo.
2. Leer campos nunca expuestos y errores en api/docs/contrato-api.md.
3. Leer campos por rol, metadata permitida y datos prohibidos en la matriz.
4. Leer seguridad HTTP, logging, auditoría e imágenes en arquitectura.
5. Inspeccionar projections, errors, logger, fixtures, seeders, env y gitignore.

## Entradas mínimas

- flujo o diff revisado;
- actor y proyección esperada;
- datos sensibles procesados;
- destinos posibles: HTTP, log, auditoría, archivo, fixture o entorno;
- controles de acceso y retención existentes.

## Procedimiento

1. Inventariar datos sensibles que entran, se transforman, persisten y salen.
2. Comprobar autenticación, policy de recurso y projection allowlist.
3. Revisar listados, filtros, relaciones incluidas y serialización de errores.
4. Inspeccionar logs y auditoría en caminos exitosos y fallidos.
5. Verificar que fixtures y seeders sean ficticios y no reutilicen información
   real.
6. Confirmar que secretos solo provengan del entorno y que archivos locales
   estén ignorados.
7. Revisar uploads por tipo real, tamaño, nombre generado, path traversal y
   exposición pública.
8. Agregar pruebas negativas que demuestren ausencia de campos.

## Guardrails

- No registrar o devolver tokens, cookies, hashes, DNI innecesario, diagnósticos,
  informes, mensajes, notas internas, bodies completos, SQL o stacks.
- No confiar en ocultamiento del frontend.
- No serializar modelos completos ni usar denylist como única proyección.
- No incluir secretos reales en documentación, ejemplos o tests.
- No debilitar validación, cifrado, hashing o permisos para facilitar debugging.
- No afirmar anonimización cuando solo se removieron algunos campos.
- No ampliar exposición pública por conocer una URL o UUID.

## Verificación y salida esperada

- Probar cada rol y proyección afectada.
- Buscar nombres de campos sensibles en respuestas, logs y snapshots.
- Probar recursos ajenos, errores y fallos parciales.
- Revisar git diff por secretos, datos reales y artefactos.
- Confirmar que auditoría y logs usan metadata mínima diferente.
- Entregar hallazgos, correcciones y evidencia negativa de exposición.

## Coordinación

Usar autenticacion-y-autorizacion para acceso,
manejo-de-errores-y-observabilidad para logs,
auditoria-de-operaciones para metadata y testing-api-jest para regresiones.
