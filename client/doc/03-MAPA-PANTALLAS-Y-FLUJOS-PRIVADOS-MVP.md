# Mapa de pantallas y flujos privados — MVP

---

## 1. Inventario general

| Pantalla | Ruta | Presentación |
|---|---|---|
| Login | `/login` | Página |
| Resumen | `/app/resumen` | Página |
| Pacientes | `/app/pacientes` | Página |
| Detalle de paciente | `/app/pacientes/:id` | Página con pestañas |
| Nuevo/editar paciente | — | Modal |
| Agenda | `/app/agenda` | Página FullCalendar |
| Nuevo turno | — | Modal |
| Detalle/cancelación de turno | — | Modal |
| Mensajes | `/app/mensajes` | Página de dos paneles |
| Nueva conversación | — | Modal |
| Informes | `/app/informes` | Página |
| Nuevo/editar informe | — | Modal amplio |
| Informe finalizado | `/app/informes/:id` | Página imprimible |
| Usuarios | `/app/usuarios` | Página |
| Nuevo/editar usuario | — | Modal |
| Servicios | `/app/servicios` | Página con secciones |
| Nuevo/editar servicio | — | Modal |
| Servicios habituales | — | Modal |
| Catálogos | `/app/catalogos` | Página con pestañas |
| Nuevo/editar catálogo | — | Modal |
| Auditoría | `/app/auditoria` | Página |
| Detalle de auditoría | — | Modal de lectura |
| Sin permiso | `/app/403` | Página |

---

# 2. Login

## 2.1 Contenido

- logo;
- correo electrónico;
- DNI con visualización tipo contraseña;
- mostrar/ocultar DNI;
- botón Ingresar;
- volver al sitio público;
- mensajes de error.

No incluye registro, recuperación, proveedores sociales ni selector de rol.

## 2.2 Flujo

```text
Ingresar credenciales
→ POST /auth/login
→ guardar access token en memoria
→ backend deja refresh cookie HttpOnly
→ cargar usuario y permisos
→ redirigir a ruta previa o /app/resumen
```

## 2.3 Errores

- credenciales: mensaje genérico;
- cuenta inactiva: comunicarse con administración;
- `429`: esperar e intentar más tarde;
- sin conexión: error de disponibilidad.

---

# 3. Resumen

## 3.1 Encabezado

- saludo simple;
- fecha actual;
- sin mensajes motivacionales aleatorios;
- sin gráficos decorativos.

## 3.2 Tarjetas

Cada tarjeta contiene:

- icono;
- etiqueta;
- cantidad;
- estado de carga independiente;
- estado seleccionado.

## 3.3 Detalle inferior

La selección inicial es Pacientes. El detalle muestra cinco elementos como máximo y un enlace al módulo completo.

## 3.4 Flujo

```text
GET /resumen
→ renderizar tarjetas autorizadas
→ seleccionar tarjeta
→ consultar preview con endpoint del módulo si no está cargado
→ mostrar lista resumida
```

---

# 4. Pacientes

## 4.1 Listado `/app/pacientes`

### Encabezado

- título;
- botón Nuevo paciente;
- buscador por nombre, apellido o DNI;
- filtro estado;
- filtro prestador vinculado para roles globales;
- limpiar filtros.

### Tabla de escritorio

- paciente;
- edad;
- tutor;
- estado;
- prestadores vinculados;
- acciones.

### Tarjeta móvil

- nombre;
- edad;
- tutor;
- estado;
- botón Ver detalle;
- menú de acciones autorizado.

### Paginación

20 registros por página, controlada por backend.

## 4.2 Nuevo paciente

Modal conjunto con:

### Paciente obligatorio

- nombre;
- apellido;
- fecha de nacimiento.

### Paciente opcional

- DNI;
- escuela;
- diagnóstico;
- observaciones;
- posee CUD;
- vencimiento de CUD condicionado.

### Tutor obligatorio

- nombre;
- apellido;
- vínculo/parentesco;
- teléfono.

### Tutor opcional

- correo;
- dirección;
- observaciones.

## 4.3 Duplicado posible

Coincidencia por nombre, apellido y fecha genera advertencia no bloqueante. DNI repetido bloquea.

## 4.4 Creación por profesional

El backend crea paciente, tutor y vínculo con el profesional en una transacción.

## 4.5 Edición

Reutiliza el formulario de alta, precargado. Activación/desactivación son acciones separadas.

## 4.6 Detalle `/app/pacientes/:id`

Pestañas:

```text
Resumen
Turnos
Informes
Conversaciones
```

### Resumen

- datos personales;
- tutor completo;
- CUD;
- observaciones;
- vínculos activos;
- estado;
- acciones según permiso.

### Turnos

- próximos;
- históricos;
- Nuevo turno con paciente precargado.

### Informes

- listado según permiso;
- Nuevo informe para coordinación/profesional autorizado.

### Conversaciones

Solo conversaciones asociadas al paciente donde el usuario participa.

## 4.7 Desactivación

Confirmación explícita. Si existen turnos futuros activos, backend responde conflicto y la UI ofrece Ver agenda.

---

# 5. Agenda

## 5.1 Ruta

```text
/app/agenda
```

## 5.2 Toolbar

- Hoy;
- anterior;
- siguiente;
- rango visible;
- Día;
- Semana;
- filtro de prestador para admin/coordinación/secretaría;
- Nuevo turno.

## 5.3 Vista inicial

- escritorio: Semana;
- celular: Día;
- lunes a sábado;
- 08:00 a 21:00;
- línea de hora actual.

## 5.4 Creación

### Botón Nuevo turno

Formulario sin fecha/hora, salvo prestador propio cuando corresponde.

### Clic en encabezado del día

Fecha precargada, hora vacía.

### Clic en franja

Fecha y hora precargadas, duración 60 minutos.

### Campos

- paciente;
- prestador;
- servicio activo;
- consultorio;
- fecha;
- hora;
- duración;
- observación administrativa;
- notas internas según permiso.

## 5.5 Servicio

El selector incluye todos los servicios activos del centro. Los habituales pueden ordenarse primero, pero no son una restricción.

## 5.6 Detalle de turno

Clic en evento abre modal con datos y acciones válidas.

No existe edición general. Cambios de fecha/hora/duración/consultorio/servicio/prestador requieren cancelar y crear otro.

## 5.7 Estados

```text
pendiente → confirmado | cancelado
confirmado → completado | ausente | cancelado
```

No hay transiciones desde completado, ausente o cancelado.

---

# 6. Informes

## 6.1 Listado `/app/informes`

- búsqueda;
- estado;
- paciente;
- autor;
- tipo;
- tabla/tarjetas;
- paginación de 20.

Columnas:

- título;
- paciente;
- tipo;
- autor;
- fecha;
- estado;
- acciones.

## 6.2 Alta/edición

Modal amplio con:

- paciente;
- tipo;
- título;
- resumen;
- contenido.

Acciones:

- Cancelar;
- Guardar borrador;
- Finalizar informe.

No hay autosave ni editor enriquecido.

## 6.3 Finalización

Confirmación reforzada. El informe se vuelve inmutable.

## 6.4 Lectura e impresión

Ruta de solo lectura con botón Imprimir / Guardar como PDF del navegador.

Los estilos de impresión ocultan navegación y acciones.

## 6.5 Autor inactivo

- informes finalizados siguen visibles;
- borradores quedan bloqueados;
- no se reasignan;
- admin y coordinación pueden verlos según backend.

---

# 7. Mensajería

## 7.1 Escritorio

```text
Lista de conversaciones | Conversación seleccionada
```

## 7.2 Celular

- listado;
- selección abre conversación;
- botón Volver.

## 7.3 Lista

- Nueva conversación;
- buscar;
- filtros Todas / No leídas / Archivadas;
- título;
- participantes;
- último mensaje resumido;
- fecha;
- badge no leído.

## 7.4 Conversación

- título;
- categoría;
- paciente opcional;
- participantes;
- historial;
- respuesta;
- agregar participante;
- archivar/desarchivar.

## 7.5 Nueva conversación

Modal:

- uno o más destinatarios;
- categoría;
- paciente opcional;
- título;
- primer mensaje.

## 7.6 Reglas

- creador incluido automáticamente;
- solo participantes ven y responden;
- cualquier participante agrega usuarios;
- nuevos participantes ven historial, pero el historial previo no nace como no leído;
- no se quitan participantes;
- mensajes inmutables;
- sin adjuntos, reacciones o menciones.

---

# 8. Usuarios

## 8.1 Vista directorio

Coordinación y secretaría ven usuarios activos con proyección limitada:

- foto;
- nombre;
- título;
- función;
- especialidad;
- rol;
- servicios habituales.

No ven DNI, correo de acceso, teléfono personal ni usuarios inactivos.

## 8.2 Vista administrativa

Administrador ve activos e inactivos y puede:

- crear;
- editar;
- cambiar rol;
- activar/desactivar;
- restablecer acceso;
- gestionar publicación;
- cargar/reemplazar/eliminar foto.

## 8.3 Formulario

Secciones:

### Acceso

- nombre;
- apellido;
- DNI;
- correo;
- rol.

### Información profesional

- título;
- especialidad condicionada;
- teléfono;
- biografía.

### Presentación pública

- foto;
- función pública;
- visible públicamente;
- orden público.

## 8.4 Cambio de DNI

Debe mostrar advertencia: actualiza la credencial y cierra todas las sesiones.

---

# 9. Servicios

## 9.1 Secciones

```text
Servicios del centro
Servicios habituales por prestador
```

## 9.2 Servicios del centro

- imagen;
- nombre;
- descripción;
- activo;
- visible públicamente;
- orden público.

Solo admin crea y modifica catálogo/publicación.

## 9.3 Servicios habituales

Admin, coordinación y secretaría pueden asociar servicios a prestadores. La asociación sirve para organización y orden preferente en formularios.

No impide elegir otro servicio activo en un turno.

---

# 10. Catálogos

Ruta exclusiva del administrador con pestañas:

- Consultorios;
- Tipos de informe;
- Categorías de conversación.

Cada pestaña permite:

- listar;
- crear;
- editar;
- activar/desactivar;
- buscar.

No se eliminan físicamente registros usados.

---

# 11. Auditoría

## 11.1 Listado

- fecha;
- usuario;
- acción;
- recurso;
- resultado;
- IP;
- filtros;
- 20 por página;
- orden descendente.

## 11.2 Detalle

Modal de solo lectura con metadatos permitidos y correlation ID.

Nunca muestra credenciales, DNI, mensajes, contenido clínico ni notas internas.

---

# 12. Flujos críticos E2E

## 12.1 Profesional crea paciente y turno

```text
Login
→ Pacientes
→ Nuevo paciente
→ completar paciente+tutor
→ crear y vincular
→ abrir detalle
→ Nuevo turno
→ elegir servicio activo
→ guardar pendiente
→ verificar agenda propia
```

## 12.2 Secretaría agenda primer turno

```text
Agenda
→ clic en franja
→ seleccionar paciente y prestador
→ backend crea vínculo si no existe
→ turno pendiente
→ aparece en calendario
```

## 12.3 Cancelación y nuevo turno

```text
Abrir turno
→ Cancelar
→ motivo obligatorio
→ confirmar
→ horario liberado
→ clic en nuevo horario
→ crear turno nuevo
```

No existe reprogramación.

## 12.4 Informe

```text
Paciente vinculado
→ Informes
→ Nuevo informe
→ guardar borrador
→ editar
→ finalizar con confirmación
→ vista de lectura
→ imprimir/guardar PDF
```

## 12.5 Mensajería

```text
Nueva conversación
→ elegir participantes/categoría/paciente
→ enviar primer mensaje
→ otro participante responde
→ contador no leído cambia
→ abrir conversación marca lectura
```

---

# 13. Criterios de aceptación del mapa

- Todas las acciones de alta/edición confirmadas abren modal.
- El detalle de paciente conserva cuatro pestañas.
- Agenda ofrece Día y Semana, sin mes.
- No se arrastran eventos.
- Informes finalizados no muestran editar.
- Conversaciones no participantes no aparecen.
- Profesional no dispone de pantallas Usuarios o Servicios.
- Auditoría es solo lectura.
- Cada pantalla tiene loading, empty y error.
