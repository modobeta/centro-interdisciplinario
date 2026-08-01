# AGENTS.md — Vínculos

## Alcance

Aplica a relaciones entre pacientes y prestadores, incluidas creación
automática, cierre y comprobación de vínculo activo.

## Fuentes normativas

La matriz de permisos gobierna quién puede crear o cerrar relaciones; el
contrato gobierna su interfaz y el modelo de datos su vigencia e integridad.
Este archivo solo especializa su implementación.

## Guardrails

- El acceso profesional dependiente de un vínculo exige que este esté activo.
- La creación automática solo ocurre desde los casos de uso aprobados y dentro
  de la transacción de su módulo dueño.
- Cerrar una relación registra motivo y fecha; no elimina historia.
- Un vínculo no puede cerrarse si existen turnos futuros activos entre el mismo
  paciente y prestador.
- Los cierres derivados de cambios de rol o estado pertenecen a la transacción
  que origina el cambio.
- La desactivación de un paciente conserva las relaciones; una reactivación no
  las reabre ni crea.
- Exponer helpers acotados para consultar o exigir vigencia; no duplicar la
  lógica en otros módulos.

## Procedimiento y verificación

1. Identificar el módulo dueño y recibir su transacción cuando corresponda.
2. Bloquear las filas necesarias antes de evaluar vigencia o turnos futuros.
3. Aplicar policy y scope antes de revelar la relación.
4. Probar creación manual, automática, duplicada y cierres concurrentes.
5. Probar la pérdida inmediata de acceso después del cierre.
6. Confirmar que las operaciones históricas siguen consultables según permisos.

## Deuda no bloqueante

No se prevén solicitudes, invitaciones, vencimientos automáticos ni historial
separado de estados para el MVP.
