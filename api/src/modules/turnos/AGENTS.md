# AGENTS.md — Turnos

## Alcance

Aplica a agenda, disponibilidad, creación y transiciones de turnos.

## Fuentes normativas

El contrato define operaciones y errores, la matriz define alcance y campos, y
el modelo define estados, antisolapamientos, bloqueos e índices. No duplicar
esos catálogos aquí.

## Guardrails

- Usar prestadorId en HTTP y prestador_id en persistencia.
- La disponibilidad ofrece inicios en intervalos de 15 minutos.
- Si se reciben prestador y consultorio, devolver la intersección de ambas
  disponibilidades.
- Crear un turno bloquea paciente, prestador, servicio y consultorio en orden
  estable antes de validar y escribir.
- Desactivar cualquiera de esos recursos aplica el mismo criterio de bloqueo
  antes de comprobar turnos futuros.
- PostgreSQL decide el conflicto final mediante constraints de
  antisolapamiento.
- Traducir conflictos atribuibles al recurso específico y usar el conflicto
  genérico cuando concurren varios o no puede atribuirse de forma estable.
- No reprogramar: cancelar y crear un turno nuevo.
- Notas internas y acciones propias respetan las proyecciones y policies de la
  matriz.

## Procedimiento y verificación

1. Normalizar el intervalo a la zona del centro y persistir instantes UTC.
2. Resolver scope, estados de recursos y vínculo cuando corresponda.
3. Adquirir bloqueos, recalcular disponibilidad y crear en una sola transacción.
4. Probar límites de intervalo, cambio de día y horario de verano.
5. Ejecutar solicitudes simultáneas contra cada constraint de solapamiento.
6. Probar transiciones válidas, inválidas y concurrentes con auditoría.

## Deuda no bloqueante

Disponibilidad personalizada por prestador y feriados quedan fuera del MVP y
requieren diseño propio.
