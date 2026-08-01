---
name: gestion-de-turnos
description: Implementa o modifica agenda, disponibilidad, creación y transiciones de turnos en esta API. Usar para horarios, estados, conflictos, cancelación o notas del turno. No usar para reprogramación directa, recurrencia, feriados o disponibilidad personalizada fuera del MVP.
---

# Gestión de turnos

## Objetivo

Mantener una agenda consistente ante solicitudes simultáneas, con estados,
visibilidad y reglas temporales acordes al MVP.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/modules/turnos/AGENTS.md.
2. Leer Turnos y Agenda en api/docs/contrato-api.md.
3. Leer acciones, scopes y campos de turnos en la matriz de permisos.
4. Leer turnos, transacciones e integridad en api/docs/modelo-datos.md.
5. Leer fechas, concurrencia y autorización en arquitectura.

## Entradas mínimas

- acción solicitada y actor;
- paciente, prestador, servicio y consultorio involucrados;
- intervalo local o turno existente;
- estado actual y transición destino;
- campos visibles y escribibles para el rol.

## Procedimiento

1. Interpretar fecha y hora en America/Argentina/Cordoba y persistir UTC.
2. Validar fecha, día, franja y duración contractuales.
3. Resolver scope propio o global, vínculo y campos internos autorizados.
4. Para disponibilidad, producir comienzos cada 15 minutos e intersecar prestador
   y consultorio cuando ambos estén presentes.
5. Para crear, bloquear paciente, prestador, servicio y consultorio en ese orden.
6. Revalidar estados y disponibilidad dentro de la transacción.
7. Permitir cualquier servicio activo aunque no sea habitual del prestador.
8. Dejar que constraints de PostgreSQL resuelvan el conflicto concurrente final.
9. Traducir conflicto único al recurso específico y conflicto múltiple o no
   atribuible al código horario genérico.
10. Aplicar únicamente transiciones documentadas y auditar la acción.

## Guardrails

- Usar prestadorId en HTTP y prestador_id en PostgreSQL.
- No reprogramar: cancelar y crear un turno nuevo.
- No aceptar un prestador ajeno desde un profesional.
- No mostrar notas internas a administración o secretaría.
- No confiar solo en una consulta previa para evitar solapamientos.
- No modificar estructura ni estado de un turno terminal.
- No implementar recurrencia, feriados ni calendarios personalizados.

## Verificación y salida esperada

- Probar límites 08:00–21:00, lunes a sábado y duraciones permitidas.
- Probar disponibilidad individual e intersección sobre grilla de 15 minutos.
- Probar turnos consecutivos y solapamientos de cada recurso.
- Ejecutar creaciones simultáneas y confirmar una única reserva válida.
- Probar cada transición, rol, scope y proyección de notas.
- Entregar reglas cubiertas, constraints ejercitados y pruebas ejecutadas.

## Coordinación

Usar express-api-modular, postgresql-y-sequelize,
autenticacion-y-autorizacion, auditoria-de-operaciones y testing-api-jest.
Coordinar pacientes-tutores-y-vinculos cuando se cree un vínculo automático.
