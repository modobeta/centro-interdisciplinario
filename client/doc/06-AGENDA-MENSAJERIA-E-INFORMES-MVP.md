# Agenda, mensajería e informes — Especificación profunda del MVP

---

# 1. Agenda

## 1.1 Objetivo

Ofrecer una agenda intuitiva, visualmente similar a Google Calendar, sin copiar su producto ni incorporar funciones incompatibles con las reglas del centro.

La agenda debe permitir comprender rápidamente:

- qué turnos existen;
- cuándo y dónde ocurren;
- paciente;
- prestador;
- servicio;
- estado;
- acciones permitidas.

---

## 1.2 Biblioteca y plugins

```text
@fullcalendar/react
@fullcalendar/timegrid
@fullcalendar/interaction
```

No se requiere vista mensual ni plugin premium.

---

## 1.3 Configuración funcional

```jsx
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
  hiddenDays={[0]}
  slotMinTime="08:00:00"
  slotMaxTime="21:00:00"
  allDaySlot={false}
  selectable
  editable={false}
  eventStartEditable={false}
  eventDurationEditable={false}
  nowIndicator
  dateClick={handleDateClick}
  eventClick={handleEventClick}
  datesSet={handleVisibleRangeChange}
/>
```

El ejemplo es orientativo. La implementación final debe respetar la API de la versión instalada.

---

## 1.4 Toolbar propia

Se recomienda una toolbar React propia para controlar:

- anterior;
- siguiente;
- hoy;
- título del rango;
- Día;
- Semana;
- selector de prestador;
- Nuevo turno.

Esto permite mantener estilos institucionales y comportamiento responsive sin depender completamente del header interno de FullCalendar.

---

## 1.5 Clic en día

En vista Semana, el encabezado del día se renderiza como un botón accesible. Al seleccionarlo:

```js
openAppointmentModal({
  date: selectedDate,
  time: null,
});
```

No se necesita habilitar all-day events.

---

## 1.6 Clic en franja horaria

`dateClick` abre el formulario con:

- fecha;
- hora;
- duración default 60;
- prestador actual cuando corresponde.

El frontend redondea a la granularidad visual configurada, pero el backend valida las duraciones permitidas.

---

## 1.7 Turnos en el calendario

### Contenido mínimo

```text
10:30–11:30
Juan Pérez
Psicopedagogía
```

Cuando se visualizan todos los prestadores:

```text
Lic. Valentina Ríos
```

En eventos de poco alto se prioriza:

- hora;
- paciente;
- estado.

El resto se muestra en detalle.

---

## 1.8 Colores y accesibilidad

Tokens por estado:

```css
--appointment-pending-bg;
--appointment-pending-border;
--appointment-confirmed-bg;
--appointment-confirmed-border;
--appointment-completed-bg;
--appointment-completed-border;
--appointment-cancelled-bg;
--appointment-cancelled-border;
--appointment-absent-bg;
--appointment-absent-border;
```

Cada evento incluye etiqueta de estado accesible. No depende solo del color.

---

## 1.9 Filtro de prestador

### Profesional

No existe selector. Backend limita a agenda propia.

### Administración, coordinación y secretaría

Opciones:

```text
Todos los prestadores
Prestador 1
Prestador 2
...
```

El valor se conserva mientras la página está montada. No se persiste.

---

## 1.10 Creación de turno

### Datos obligatorios

- paciente activo;
- prestador activo con rol adecuado;
- servicio activo;
- consultorio activo;
- fecha;
- hora;
- duración permitida.

### Servicio activo

Todos los servicios activos son seleccionables. Los servicios habituales pueden aparecer primero con una separación visual:

```text
Habituales
Otros servicios activos
```

No se bloquea la selección de “Otros”.

### Vínculo

- profesional: paciente ya vinculado;
- admin/coordinación/secretaría: backend crea vínculo automáticamente si no existe;
- la creación del vínculo y turno ocurre en una transacción.

---

## 1.11 Detalle y acciones

Modal de detalle:

- paciente y tutor;
- prestador;
- servicio;
- consultorio;
- fecha;
- inicio/fin;
- duración;
- estado;
- observación administrativa;
- notas internas según permiso;
- autoría de cancelación si aplica.

Acciones derivadas del estado:

```text
pendiente: confirmar, cancelar
confirmado: completar, ausente, cancelar
completado: lectura
cancelado: lectura
ausente: lectura
```

---

## 1.12 Sin reprogramación

No se muestran:

- editar turno;
- mover;
- redimensionar;
- reprogramar.

El flujo correcto es:

```text
cancelar original con motivo
→ crear nuevo turno
```

El frontend puede ofrecer `Crear nuevo turno` después de cancelar y precargar paciente/prestador/servicio, pero la fecha/hora debe elegirse nuevamente y se crea un ID distinto.

---

## 1.13 Notas por campo

### `observacion_administrativa`

Visible y editable por admin, coordinación, secretaría y prestador responsable.

### `notas_internas`

Visible y editable solo por coordinación y prestador responsable.

El frontend debe excluir el campo del DOM cuando el usuario no tiene permiso, no solo deshabilitarlo.

---

## 1.14 Consultas

Vista Día consulta el día. Vista Semana consulta el rango visible. Un cambio de filtro cancela la request anterior.

---

# 2. Mensajería

## 2.1 Objetivo

Proveer comunicación interna trazable y simple sin pretender reemplazar una plataforma de chat en tiempo real.

---

## 2.2 Diseño

### Escritorio

- columna izquierda: conversaciones;
- panel derecho: detalle;
- ancho de lista estable y panel flexible.

### Celular

- ruta/listado;
- conversación ocupa pantalla;
- volver conserva scroll y filtros.

---

## 2.3 Lista de conversaciones

Campos:

- título;
- categoría;
- participantes resumidos;
- paciente opcional;
- fecha del último mensaje;
- fragmento seguro;
- badge no leído;
- archivada para usuario.

El fragmento no se muestra en topbar si puede exponer contenido sensible; la topbar puede limitarse a título y participantes.

---

## 2.4 Lectura

Al abrir:

1. consulta conversación;
2. backend verifica participación;
3. renderiza historial;
4. actualiza puntero de último mensaje leído;
5. refresca contador global.

No se marca leída por hover ni por aparecer parcialmente en la lista.

---

## 2.5 Envío

- texto obligatorio;
- botón deshabilitado mientras envía;
- no se permite mensaje vacío;
- no hay edición ni eliminación;
- después de éxito se agrega respuesta y se mantiene scroll al final;
- ante error se conserva el texto.

No se implementa envío optimista irreversible. Puede mostrarse estado “Enviando…” hasta confirmación.

---

## 2.6 Participantes

Cualquier participante puede agregar usuarios activos.

Modal:

- buscar por nombre;
- seleccionar uno o varios;
- excluir participantes actuales;
- confirmar.

Los nuevos participantes ven historial completo. Su puntero inicial evita que todo el historial anterior cuente como no leído.

---

## 2.7 Archivado

Archivar afecta únicamente al participante actual.

- archivada desaparece de Todas si el filtro así lo define;
- puede verse en Archivadas;
- responder o recibir actividad no necesariamente desarchiva automáticamente salvo decisión posterior; para el MVP se mantiene el estado individual hasta que el usuario desarchive.

---

## 2.8 Alertas

- contador de conversaciones no leídas;
- polling cada 60 segundos en pestaña visible;
- actualización inmediata al leer/enviar;
- sin WebSocket;
- sin notificación del sistema operativo;
- sin email/WhatsApp/push.

---

## 2.9 Seguridad

- solo participantes;
- admin/coordinación no tienen bypass;
- no renderizar HTML;
- auditoría registra acción, nunca contenido;
- listado no expone destinatarios inactivos para nuevas conversaciones;
- conversaciones existentes conservan historial de usuarios inactivos.

---

# 3. Informes

## 3.1 Objetivo

Permitir creación, revisión, finalización, lectura e impresión de informes con controles estrictos de autoría e inmutabilidad.

---

## 3.2 Listado

### Filtros

- búsqueda título/paciente;
- estado;
- paciente;
- autor;
- tipo.

El backend limita opciones según rol.

### Columnas

- título;
- paciente;
- tipo;
- autor;
- fecha de creación/emisión;
- estado;
- acciones.

---

## 3.3 Creación

### Profesional

- solo pacientes vinculados activos;
- autor automático.

### Coordinación

- cualquier paciente activo;
- autor automático.

### Admin/secretaría

No se muestra botón Nuevo informe.

---

## 3.4 Borrador

- editable solo por autor;
- puede guardarse varias veces;
- no se elimina;
- no hay autosave;
- contenido permanece en backend tras guardado explícito.

---

## 3.5 Finalización

Condiciones:

- autor autenticado;
- estado borrador;
- campos requeridos completos;
- confirmación explícita.

Efectos:

- estado finalizado;
- fecha de emisión;
- inmutable;
- evento auditado.

---

## 3.6 Lectura

### Profesional vinculado

Lee todos los informes del paciente vinculado.

### Administración, coordinación y secretaría

Leen contenido completo según regla confirmada.

### Auditoría

Toda visualización se registra, sin contenido.

---

## 3.7 Vista imprimible

Estructura:

```text
Logo y datos institucionales
Tipo de informe
Título
Paciente
Autor
Fecha
Resumen
Contenido
```

CSS `@media print`:

- oculta sidebar/topbar/botones;
- usa ancho de hoja;
- evita cortes en encabezados;
- permite saltos naturales;
- no imprime URL ni controles visuales innecesarios cuando el navegador lo permita.

---

## 3.8 Guardar como PDF

Se usa el diálogo de impresión del navegador. No existe endpoint PDF ni archivo persistido en el MVP.

---

## 3.9 Privacidad

- no persistir borrador local;
- no copiar contenido en logs;
- no mostrar contenido en toast;
- no incluir informe en mensajes de error;
- limpiar estado del modal al cerrar/logout;
- advertir antes de perder cambios.

---

# 4. Pruebas críticas

## Agenda

- vista semana/día;
- rango lunes-sábado;
- clic día/hora;
- profesional fijo;
- servicio activo no habitual aceptado;
- conflictos 409;
- estados válidos;
- notas por rol;
- ausencia de drag/resize/reprogramar.

## Mensajería

- solo participantes;
- no leído;
- nuevo participante;
- historial no contado como no leído;
- archivado individual;
- error conserva texto.

## Informes

- botones por rol;
- autoría;
- borrador;
- confirmación final;
- inmutabilidad;
- lectura auditada;
- impresión sin navegación.
