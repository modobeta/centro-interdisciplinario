# Instrucciones de agenda y turnos

## Alcance

Estas reglas aplican a `src/features/appointments/` y complementan `client/AGENTS.md`.

## Reglas de dominio

- Todo turno nuevo comienza en estado `pendiente`.
- Los estados terminales son `completado`, `ausente` y `cancelado`.
- No existe reprogramación en el MVP. Para cambiar fecha u horario, cancelar el turno original y crear uno nuevo.
- No implementar drag-and-drop ni resize de eventos para modificar turnos.
- Un turno selecciona un servicio activo. La asignación de servicios habituales del prestador es informativa y no restringe la agenda.
- Respetar vínculos prestador-paciente y permisos definidos por el backend.
- Los conflictos de horario son autoridad del backend; mostrar respuestas `409` y conservar los datos útiles del formulario.

## Calendario

- La agenda utiliza vistas Día y Semana con una toolbar propia.
- `useCalendarRange` centraliza el rango visible y evita consultas fuera del período requerido.
- `calendarEvents.js` transforma turnos a eventos de FullCalendar; no mezclar allí llamadas HTTP ni reglas de permisos.
- `AppointmentEvent` muestra información mínima y legible; no exponer notas internas en el bloque del calendario.
- Los estados usan color más texto, etiqueta o icono para conservar accesibilidad.
- El profesional ve su propia agenda. Los roles habilitados pueden filtrar por prestador según permisos.

## Creación y detalle

- Permitir alta desde el botón Nuevo turno, el encabezado de un día o una franja horaria cuando la interacción esté habilitada.
- Precompletar fecha y hora desde el calendario sin omitir la validación final.
- Los campos de paciente, prestador, servicio, fecha, inicio y fin deben ajustarse al contrato vigente.
- No usar la UI para garantizar disponibilidad: validar nuevamente al guardar.
- Mantener `observacionAdministrativa` y `notasInternas` separadas y visibles solo para los roles autorizados.
- `AppointmentDetailModal` muestra únicamente acciones válidas para el estado actual y los permisos efectivos.
- `CancelAppointmentModal` exige confirmación y motivo cuando lo requiera el contrato.

## Estado y sincronización

- Consultar por rango visible y cancelar solicitudes obsoletas al navegar rápidamente.
- Tras crear, cancelar o cambiar estado, actualizar el evento afectado y las métricas relacionadas.
- Evitar actualizaciones optimistas para conflictos de agenda si no existe una estrategia de reversión clara.
- Diferenciar calendario vacío, carga, error de consulta y error de mutación.

## Pruebas críticas

- Carga y cambio entre vistas Día y Semana.
- Creación desde botón, día y franja con valores precompletados.
- Selección de cualquier servicio activo permitido, aunque no sea habitual.
- Conflicto de horario `409` sin pérdida de datos.
- Filtros de prestador según rol.
- Transiciones de estado permitidas y acciones ocultas cuando no corresponden.
- Cancelación y creación de un nuevo turno en lugar de reprogramación.
- Ausencia de drag-and-drop y protección de notas restringidas.
