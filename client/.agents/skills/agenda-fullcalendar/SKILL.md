---
name: agenda-fullcalendar
description: Implementar, ampliar, corregir o revisar Agenda y turnos en React/Vite con FullCalendar. Usar cuando una tarea involucre vistas Día/Semana, toolbar, lunes a sábado, horario 08:00–21:00, zona `America/Argentina/Cordoba`, rango visible, filtros de prestador, eventos, clic en día o franja, alta de turnos, disponibilidad, estados, cancelación, permisos o conflictos HTTP 409; también para impedir drag-and-drop, resize, edición general y reprogramación.
---

# Agenda con FullCalendar

## Objetivo

Construir una agenda clara y accesible que consulte únicamente el rango visible, respete la zona horaria institucional y permita crear y gestionar turnos dentro de las reglas del backend. Mantener el alcance del MVP en vistas Día y Semana, sin edición libre ni reprogramación.

## 1. Inspeccionar antes de implementar

1. Leer `client/AGENTS.md` y `features/appointments/AGENTS.md` completos.
2. Consultar la especificación de Agenda en `client/doc/` y el contrato vigente de turnos en `api/docs/`.
3. Revisar `package.json` y confirmar FullCalendar, plugins y utilidades de fecha instalados.
4. Inspeccionar página, componentes, hooks, API, schema, mappers, tokens y pruebas de appointments.
5. Verificar permisos por rol, proyecciones de evento/detalle y códigos de error reales.
6. Distinguir archivos vacíos del scaffold de una implementación funcional.

No importar FullCalendar ni afirmar Agenda operativa si `@fullcalendar/react`, `@fullcalendar/timegrid` y `@fullcalendar/interaction` no están instalados. Adaptar opciones a la API de la versión realmente incorporada.

## 2. Distribuir responsabilidades

| Pieza | Responsabilidad | Evitar |
|---|---|---|
| `AgendaPage.jsx` | Componer toolbar, filtros, calendario, estados y modales | Mapear HTTP o fechas inline |
| `AppointmentCalendar.jsx` | Configurar FullCalendar y traducir callbacks | Consultas, permisos o mutaciones |
| `AppointmentEvent.jsx` | Renderizar contenido accesible del evento | Decidir transiciones de negocio |
| `useCalendarRange.js` | Mantener vista, fecha y rango visible exclusivo | Formatear eventos visuales |
| `useAppointments.js` | Consultar, cancelar lecturas, refrescar y mutar | Conocer detalles de layout |
| `appointmentsApi.js` | Ocultar endpoints y devolver datos normalizados | Mostrar toasts o abrir modales |
| `calendarEvents.js` | Transformar turnos en eventos FullCalendar | HTTP, permisos o estado React |
| `appointmentMappers.js` | Separar entidad, formulario y payload | Mutar objetos recibidos |

Mantener filtros, fecha, vista y modales como estado local de la página o sus hooks. No persistir turnos, filtros o notas en Redux Persist o `localStorage`.

## 3. Configurar FullCalendar dentro del MVP

- Usar `timeGridDay` y `timeGridWeek` como únicas vistas.
- Iniciar en Semana en escritorio y Día en celular.
- Mostrar lunes a sábado con `firstDay={1}` y domingo oculto.
- Limitar la grilla visible de 08:00 a 21:00 y ocultar all-day.
- Mostrar indicador de hora actual cuando la versión lo soporte.
- Usar locale español y formatos de fecha/hora institucionales.
- Desactivar el header nativo si la toolbar propia lo reemplaza.
- Permitir `dateClick` o selección puntual solo para iniciar un alta.
- Configurar explícitamente `editable={false}`, `eventStartEditable={false}` y `eventDurationEditable={false}`.
- No registrar callbacks de `eventDrop`, `eventResize` o actualización de evento.
- Evitar vista Mes, recursos premium y plugins no requeridos.

La grilla visual no autoriza horarios. El formulario y el backend vuelven a validar fecha, duración, disponibilidad y permisos.

## 4. Construir una toolbar propia

Incluir:

- anterior;
- siguiente;
- hoy;
- título del rango;
- selector Día/Semana;
- filtro de prestador cuando esté permitido;
- botón Nuevo turno cuando exista permiso.

- Controlar FullCalendar mediante su API pública, no manipulando su DOM.
- Mantener botón activo y nombre accesible para la vista seleccionada.
- Conservar la fecha de referencia al cambiar Día/Semana.
- Adaptar la toolbar a móvil sin ocultar acciones esenciales.
- Cambiar a vista Día al entrar desde móvil; si se responde a cambios de tamaño, evitar bucles y pérdida de contexto.
- Mantener navegación completa por teclado y foco visible.

## 5. Gestionar rango visible

- Capturar `activeStart`/`activeEnd` o el rango equivalente emitido por `datesSet` según la versión instalada.
- Tratar `desde` como inclusivo y `hasta` como exclusivo.
- Consultar el día visible en Día y el intervalo lunes–lunes correspondiente en Semana, mostrando lunes a sábado.
- No calcular el rango a partir de celdas renderizadas ni del ancho del viewport.
- Enviar ambos extremos juntos como instantes ISO válidos.
- No superar el máximo backend de 31 días.
- Volver a consultar al cambiar rango, vista o filtro autorizado.
- Cancelar la request anterior al navegar rápidamente.
- Ignorar cancelaciones como error visible y evitar respuestas fuera de orden.
- Mantener el calendario visible durante una actualización; usar indicador discreto en toolbar o capa no bloqueante.

No descargar un listado general para filtrar fechas en el cliente.

## 6. Respetar zona horaria e intervalos

- Interpretar la agenda en `America/Argentina/Cordoba`.
- Recibir instantes del backend en ISO 8601 UTC y presentarlos en la zona institucional.
- Enviar al crear `fecha` civil `YYYY-MM-DD`, `horaInicio` `HH:mm` y `duracionMinutos`.
- No convertir una fecha civil a medianoche usando la zona local del dispositivo.
- No depender de que navegador, servidor y centro compartan timezone.
- Calcular el fin mostrado desde inicio y duración como ayuda visual; el backend lo recalcula.
- Tratar turnos como intervalos `[inicio, fin)`, por lo que dos turnos consecutivos no se solapan.
- Mantener grilla de inicio de 15 minutos y duraciones permitidas de 30, 45, 60, 90 o 120 minutos.
- Impedir fin posterior a las 21:00 y fechas pasadas mediante feedback temprano, sin sustituir validación backend.

Centralizar parsing, conversión y formato. Probar el código con una zona del dispositivo distinta a la institucional.

## 7. Aplicar filtros según rol

### Profesional

- No mostrar selector de prestador.
- Consultar la agenda propia sin permitir forzar `prestadorId` ajeno.
- Fijar el prestador autenticado en el formulario.
- Mostrar solo pacientes vinculados según la proyección del backend.

### Administrador, coordinación y secretaría

- Mostrar `Todos los prestadores` y prestadores activos permitidos.
- Enviar `prestadorId` solo al seleccionar uno concreto.
- Mantener el filtro mientras la página esté montada y limpiarlo al salir.
- No persistirlo en almacenamiento web.

El backend conserva la autoridad de alcance. Un filtro oculto o manipulado debe ser ignorado o rechazado por la API.

## 8. Mapear turnos a eventos

- Usar el UUID del turno como `id` del evento.
- Mapear `inicioAt` y `finAt` sin alterar el instante.
- Mantener estado y proyección mínima en `extendedProps`.
- Mostrar como mínimo hora, paciente y servicio.
- Incluir prestador cuando se visualicen todos.
- En eventos bajos, priorizar hora, paciente y estado; mover el resto al detalle.
- Usar tokens visuales distintos para `pendiente`, `confirmado`, `completado`, `cancelado` y `ausente`.
- Comunicar estado con texto o etiqueta accesible además del color.
- No incluir `notasInternas` en eventos de listado.
- Hacer el evento operable con teclado y abrir el detalle mediante una acción semántica.

No mezclar en `calendarEvents.js` permisos, requests ni lógica de transición.

## 9. Abrir el alta desde tres entradas

### Botón Nuevo turno

- Abrir el formulario sin fecha ni hora predeterminadas.
- Precompletar el prestador propio cuando corresponda.

### Encabezado del día

- Renderizar el encabezado como botón accesible en Semana.
- Precompletar solo la fecha seleccionada.
- No habilitar eventos all-day para resolver esta acción.

### Franja horaria

- Abrir desde `dateClick` con fecha, hora y duración inicial de 60 minutos.
- Precompletar el prestador filtrado o propio cuando corresponda.
- Redondear a la granularidad visual sin alterar silenciosamente un valor elegido.

En todos los casos, mantener valores precargados como defaults editables según permiso y volver a validar antes del submit.

## 10. Crear turnos con el contrato vigente

Solicitar:

- paciente activo;
- prestador activo con rol adecuado;
- cualquier servicio activo;
- consultorio activo;
- fecha de lunes a sábado y no pasada;
- hora de inicio;
- duración permitida;
- observación administrativa autorizada;
- notas internas solo para coordinación o prestador responsable.

- Mostrar servicios habituales primero solo como preferencia visual.
- Permitir seleccionar cualquier otro servicio activo.
- No exigir asociación habitual entre servicio y prestador.
- Excluir `notasInternas` del DOM para quien no tenga permiso.
- Deshabilitar submit desde el primer envío y evitar doble alta.
- No aplicar actualización optimista a la creación.
- Tras éxito, insertar o volver a consultar el rango visible y actualizar métricas relacionadas.
- Mantener el estado inicial `pendiente` devuelto por backend.

## 11. Consultar disponibilidad con cautela

- Usar `GET /turnos/disponibilidad` solo como ayuda previa cuando el flujo lo requiera.
- Enviar fecha, duración y al menos prestador o consultorio.
- Interpretar la franja 08:00–21:00 y comienzos cada 15 minutos.
- Cancelar consultas obsoletas al cambiar fecha, duración o recurso.
- No presentar una franja disponible como reserva garantizada.
- Volver a manejar `409` durante la creación por concurrencia.

## 12. Manejar conflictos `409`

- Mantener el modal abierto y conservar todos los valores ingresados.
- No limpiar el formulario ni navegar fuera.
- Distinguir `TURNO_CONFLICTO_PRESTADOR`, `TURNO_CONFLICTO_PACIENTE`, `TURNO_CONFLICTO_CONSULTORIO` y el conflicto horario genérico.
- Destacar el recurso en conflicto y ofrecer elegir otra hora, prestador o consultorio según permiso.
- No reintentar automáticamente una mutación conflictiva.
- No asumir que disponibilidad previa evita carreras.
- Mostrar mensajes normalizados, no constraints, SQL ni payloads crudos.
- Refrescar el rango visible después del conflicto si ayuda a mostrar la ocupación actual.

Tratar `TURNO_TRANSICION_INVALIDA` como conflicto de estado y volver a cargar el detalle antes de ofrecer nuevas acciones.

## 13. Mostrar detalle y acciones válidas

- Abrir `AppointmentDetailModal` mediante `eventClick` y consultar detalle autorizado cuando sea necesario.
- Mostrar paciente/tutor, prestador, servicio, consultorio, horario, duración, estado y campos permitidos.
- Omitir notas internas si la API no las devuelve; no mostrar un campo vacío que revele su existencia.
- Derivar acciones de permisos efectivos y estado actual:

```text
pendiente  → confirmar | cancelar
confirmado → completar | ausente | cancelar
completado → lectura
ausente    → lectura
cancelado  → lectura
```

- Confirmar acciones sensibles.
- Exigir motivo en `CancelAppointmentModal`.
- Mantener terminales `completado`, `ausente` y `cancelado` sin nuevas transiciones.
- Actualizar evento, detalle y métricas tras una mutación confirmada.

El backend vuelve a validar toda transición; ocultar una acción no constituye autorización.

## 14. Prohibir reprogramación

No implementar ni mostrar:

- edición general de turno;
- cambio de fecha u hora sobre el mismo ID;
- drag-and-drop;
- resize;
- endpoint `reprogramar`;
- `PUT /turnos/:id` para modificar datos estructurales.

El único flujo admitido es:

```text
cancelar turno original con motivo
→ crear un turno nuevo con otro ID
```

Puede precargarse paciente, prestador y servicio después de cancelar. La persona debe elegir nuevamente fecha y hora. No llamar a este flujo “reprogramar” ni ocultar que son dos operaciones separadas.

## 15. Mantener responsive y accesibilidad

- Mostrar Semana como vista inicial de escritorio y Día en celular.
- Mantener toolbar y filtros utilizables sin scroll horizontal global.
- Convertir filtros en drawer cuando sea necesario.
- Hacer encabezados de día, eventos y acciones navegables por teclado.
- Conservar foco al abrir/cerrar modales y devolverlo al disparador.
- Usar labels y nombres accesibles para navegación, vistas y estados.
- No depender solo de color para estado o selección.
- Mantener targets táctiles adecuados.
- Respetar `prefers-reduced-motion` en indicadores y transiciones.

## 16. Probar escenarios críticos

- Día y Semana, navegación anterior/siguiente/hoy y rango `[desde, hasta)` correcto.
- Lunes a sábado, 08:00–21:00, locale y zona institucional con dispositivo en otra zona.
- Cambio rápido de rango cancela la request anterior.
- Profesional sin filtro y limitado a agenda propia.
- Roles globales con filtro de prestador temporal.
- Alta desde botón, encabezado y franja con defaults correctos.
- Cualquier servicio activo, incluido uno no habitual.
- Duraciones, grilla de 15 minutos y turnos consecutivos.
- Conflictos `409` por prestador, paciente, consultorio y genérico sin pérdida de datos.
- Estados y acciones permitidas, cancelación con motivo y terminales de solo lectura.
- Campos restringidos ausentes del DOM.
- Ausencia de drag, resize, edición y endpoints de reprogramación.
- Responsive móvil, teclado, foco y estado sin dependencia exclusiva del color.

Ejecutar lint, pruebas, build y E2E disponibles. Informar con precisión si FullCalendar, el API o el stack de pruebas todavía no permiten ejecutar el flujo.

## Guardrails

- No instalar FullCalendar sin autorización para cambiar dependencias.
- No implementar vista Mes ni plugins premium.
- No consultar fuera del rango visible.
- No usar la zona del dispositivo como zona del negocio.
- No permitir que el profesional fuerce otro prestador.
- No restringir servicios a los habituales.
- No ocultar o borrar valores ante un `409`.
- No usar actualizaciones optimistas para conflictos de agenda sin reversión segura.
- No exponer notas internas en listado o DOM sin permiso.
- No implementar drag/drop, resize, edición general ni reprogramación.

## Entrega esperada

Resumir:

- vista, rango y configuración FullCalendar afectados;
- tratamiento de zona horaria y mapeo de eventos;
- filtros, permisos y entradas de alta;
- conflictos, estados y cancelación cubiertos;
- evidencia de ausencia de reprogramación y edición por arrastre;
- pruebas y verificaciones ejecutadas.
