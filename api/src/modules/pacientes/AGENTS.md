# AGENTS.md — Pacientes

## Alcance

Aplica al módulo pacientes, incluida la ficha del paciente y su tutor único.

## Fuentes normativas

El contrato define entradas y respuestas, la matriz define scopes y campos, y
el modelo de datos define ficha, tutor, índices y ciclo de vida. Este archivo no
crea reglas adicionales.

## Guardrails

- Paciente y tutor forman una única ficha; no crear un CRUD independiente de
  tutores.
- Un profesional solo accede a pacientes cubiertos por un vínculo activo.
- Desactivar un paciente conserva vínculos e historia, pero impide nuevas
  operaciones.
- Reactivar un paciente no crea, reabre ni modifica relaciones.
- Un borrador previo puede continuar según las reglas específicas de Informes.
- Respetar proyecciones por rol y no exponer datos clínicos en listados o logs.
- No ampliar el MVP a múltiples tutores, cuentas familiares ni adjuntos.

## Procedimiento y verificación

1. Resolver scope y policy antes de consultar o mutar la ficha.
2. Persistir paciente, tutor, vínculos automáticos y auditoría en una sola
   transacción cuando formen el mismo caso de uso.
3. Verificar DNI normalizado y demás unicidades con prevalidación y constraint.
4. Probar acceso global, vinculado, recurso ajeno e identificador inexistente.
5. Probar desactivación, continuidad histórica y reactivación sin reaperturas.
6. Confirmar que filtros y orden no amplían el scope.

## Deuda no bloqueante

La búsqueda textual avanzada puede agregarse cuando exista necesidad medida; el
MVP conserva búsquedas indexables simples.
