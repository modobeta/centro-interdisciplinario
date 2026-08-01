# AGENTS.md — Auditoría funcional

## Alcance

Aplica al registro y consulta administrativa de eventos funcionales sensibles.

## Fuentes normativas

El contrato gobierna la consulta y sus respuestas; la matriz gobierna el acceso;
el modelo define persistencia e índices; la arquitectura separa auditoría de
logs técnicos. Este archivo no inventa eventos ni metadata.

## Guardrails

- Los módulos dueños deciden qué acción auditar y en qué punto del caso de uso.
- Un evento exitoso obligatorio comparte la transacción de la operación; si la
  auditoría falla, el éxito también se revierte.
- Los intentos fallidos se registran después del rollback en una transacción
  separada de mejor esfuerzo.
- La lectura de contenido clínico es fail-closed: sin evento persistido no se
  entrega el contenido.
- La auditoría es append-only desde la aplicación; no ofrecer edición ni borrado.
- Metadata usa allowlist y nunca contiene credenciales, tokens, DNI, contenido
  clínico, mensajes, cuerpos completos ni stack traces.
- Logs técnicos y auditoría no se sustituyen ni duplican entre sí.
- La consulta requiere autorización explícita y filtros acotados.

## Procedimiento y verificación

1. Definir actor, acción, recurso, resultado y metadata mínima desde el módulo
   dueño.
2. Recibir y respetar la transacción existente para eventos exitosos.
3. Sanitizar metadata antes de persistir.
4. Probar commit conjunto y rollback conjunto.
5. Probar el mejor esfuerzo de intentos fallidos sin alterar el error original.
6. Probar lectura clínica con auditoría disponible y fallida.
7. Verificar que la consulta no permita modificar ni revelar datos sensibles.

## Deuda no bloqueante

Protección física append-only, retención, particionado y eventual outbox se
evaluarán por volumen y requisitos operativos; no bloquean el MVP.
