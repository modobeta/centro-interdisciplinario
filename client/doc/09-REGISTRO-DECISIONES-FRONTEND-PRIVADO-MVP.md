# Registro de decisiones del frontend privado — MVP

---

## 1. Estados

- `CONFIRMADA`: decisión vigente.
- `REEMPLAZADA`: decisión anterior sin vigencia.
- `FUERA_MVP`: no se implementa ahora.
- `PENDIENTE_PRODUCCION`: depende del despliegue real.

---

## 2. Decisiones confirmadas

| ID | Decisión | Estado |
|---|---|---|
| FPRI-001 | Una sola aplicación React + Vite contiene público, login y privado. | CONFIRMADA |
| FPRI-002 | El frontend utiliza JavaScript ES6+, no TypeScript. | CONFIRMADA |
| FPRI-003 | El panel tiene un único layout para todos los roles. | CONFIRMADA |
| FPRI-004 | Sidebar estrecho a la izquierda y contenido amplio a la derecha. | CONFIRMADA |
| FPRI-005 | La topbar contiene Inicio, alertas de mensajes y cerrar sesión. | CONFIRMADA |
| FPRI-006 | El perfil es de solo lectura y no tiene módulo propio. | CONFIRMADA |
| FPRI-007 | La ruta inicial privada es `/app/resumen`. | CONFIRMADA |
| FPRI-008 | El Resumen usa tarjetas seleccionables sin cambiar de ruta. | CONFIRMADA |
| FPRI-009 | El detalle inicial del Resumen es Pacientes. | CONFIRMADA |
| FPRI-010 | Máximo seis tarjetas por rol. | CONFIRMADA |
| FPRI-011 | Profesional: pacientes, turnos, borradores, no leídos. | CONFIRMADA |
| FPRI-012 | Secretaría: pacientes, turnos, pendientes, no leídos, usuarios, servicios. | CONFIRMADA |
| FPRI-013 | Coordinación: pacientes, turnos, informes, no leídos, usuarios, servicios. | CONFIRMADA |
| FPRI-014 | Admin: pacientes, turnos, usuarios, servicios, no leídos, auditoría. | CONFIRMADA |
| FPRI-015 | Existe un único módulo Pacientes; tutor está dentro. | CONFIRMADA |
| FPRI-016 | No existe menú Familias ni Tutores. | CONFIRMADA |
| FPRI-017 | Nuevo/editar paciente abre modal conjunto paciente+tutor. | CONFIRMADA |
| FPRI-018 | Detalle de paciente tiene Resumen, Turnos, Informes y Conversaciones. | CONFIRMADA |
| FPRI-019 | Profesional ve solo pacientes vinculados. | CONFIRMADA |
| FPRI-020 | Profesional puede crear paciente y queda vinculado. | CONFIRMADA |
| FPRI-021 | Agenda utiliza FullCalendar con Día y Semana. | CONFIRMADA |
| FPRI-022 | Vista inicial: Semana escritorio, Día celular. | CONFIRMADA |
| FPRI-023 | Agenda muestra lunes a sábado de 08:00 a 21:00. | CONFIRMADA |
| FPRI-024 | Clic en día precarga fecha; clic en franja precarga fecha y hora. | CONFIRMADA |
| FPRI-025 | Nuevo turno abre modal. | CONFIRMADA |
| FPRI-026 | No hay vista mensual. | CONFIRMADA |
| FPRI-027 | No hay drag, resize ni reprogramación. | CONFIRMADA |
| FPRI-028 | Admin/coordinación/secretaría filtran por prestador. | CONFIRMADA |
| FPRI-029 | Profesional solo ve agenda propia. | CONFIRMADA |
| FPRI-030 | Profesional puede elegir cualquier servicio activo en un turno. | CONFIRMADA |
| FPRI-031 | `usuarios_servicios` es informativa y organizativa. | CONFIRMADA |
| FPRI-032 | Profesional no ve módulo Servicios. | CONFIRMADA |
| FPRI-033 | Admin/coordinación/secretaría gestionan servicios habituales. | CONFIRMADA |
| FPRI-034 | Informes se crean/editan en modal amplio. | CONFIRMADA |
| FPRI-035 | Informe usa texto plano, sin editor enriquecido. | CONFIRMADA |
| FPRI-036 | Finalizar informe requiere confirmación y lo vuelve inmutable. | CONFIRMADA |
| FPRI-037 | Informes finalizados se imprimen/guardan PDF con navegador. | CONFIRMADA |
| FPRI-038 | Mensajería usa dos paneles en escritorio y una vista en celular. | CONFIRMADA |
| FPRI-039 | Nueva conversación abre modal. | CONFIRMADA |
| FPRI-040 | Alertas solo representan conversaciones no leídas. | CONFIRMADA |
| FPRI-041 | No se implementan notificaciones generales en el MVP. | CONFIRMADA |
| FPRI-042 | Usuarios es directorio para coordinación/secretaría y gestión para admin. | CONFIRMADA |
| FPRI-043 | Profesional no ve módulo Usuarios. | CONFIRMADA |
| FPRI-044 | Admin es único gestor de usuarios y accesos. | CONFIRMADA |
| FPRI-045 | Servicios tiene catálogo y servicios habituales por prestador. | CONFIRMADA |
| FPRI-046 | Catálogos es exclusivo de admin. | CONFIRMADA |
| FPRI-047 | Catálogos incluye consultorios, tipos de informe y categorías. | CONFIRMADA |
| FPRI-048 | Auditoría es exclusiva de admin y solo lectura. | CONFIRMADA |
| FPRI-049 | Creaciones/ediciones usan modales reutilizables. | CONFIRMADA |
| FPRI-050 | En celular los modales de formulario son fullscreen. | CONFIRMADA |
| FPRI-051 | Toast para feedback breve; errores de campo inline. | CONFIRMADA |
| FPRI-052 | Acciones sensibles usan ConfirmDialog. | CONFIRMADA |
| FPRI-053 | Cancelar turno usa modal con motivo obligatorio. | CONFIRMADA |
| FPRI-054 | No hay autosave de formularios sensibles. | CONFIRMADA |
| FPRI-055 | Redux almacena sesión, permisos, no leídos y UI global. | CONFIRMADA |
| FPRI-056 | Pacientes, turnos e informes no se persisten globalmente. | CONFIRMADA |
| FPRI-057 | No se usa RTK Query en el MVP. | CONFIRMADA |
| FPRI-058 | Axios gestiona access token y refresh único concurrente. | CONFIRMADA |
| FPRI-059 | Tokens no se almacenan en localStorage. | CONFIRMADA |
| FPRI-060 | Cierre por inactividad: advertencia 30 min + logout 5 min. | CONFIRMADA |
| FPRI-061 | Misma identidad visual que público, con mayor densidad. | CONFIRMADA |
| FPRI-062 | React Icons es la librería de iconos. | CONFIRMADA |
| FPRI-063 | CSS Modules y design tokens centralizados. | CONFIRMADA |
| FPRI-064 | Paginación backend de 20 para pacientes, usuarios, informes y auditoría. | CONFIRMADA |
| FPRI-065 | Búsqueda con debounce de 400 ms desde 2 caracteres. | CONFIRMADA |
| FPRI-066 | Filtros son temporales y no usan localStorage. | CONFIRMADA |
| FPRI-067 | Formularios usan React Hook Form + Joi. | CONFIRMADA |
| FPRI-068 | Fechas usan date-fns. | CONFIRMADA |
| FPRI-069 | Pruebas: Vitest, RTL, MSW y Playwright. | CONFIRMADA |
| FPRI-070 | Cobertura mínima objetivo 80 %. | CONFIRMADA |
| FPRI-071 | No hay WebSocket; no leídos usan polling moderado. | CONFIRMADA |
| FPRI-072 | Profesional obtiene selector mínimo de usuarios solo en Mensajería. | CONFIRMADA |
| FPRI-073 | Admin no puede crear informes. | CONFIRMADA |
| FPRI-074 | Conversaciones solo son visibles para participantes. | CONFIRMADA |
| FPRI-075 | Notas internas solo coordinación y prestador responsable. | CONFIRMADA |
| FPRI-076 | Observación administrativa es visible para admin, coordinación, secretaría y responsable. | CONFIRMADA |

---

## 3. Decisiones reemplazadas

| Decisión anterior | Reemplazo vigente |
|---|---|
| Dashboard distinto por rol. | Un dashboard compartido con contenido por rol. |
| Módulos Familias y Niños separados. | Módulo Pacientes con tutor integrado. |
| Profesional ve Servicios. | Profesional no ve Servicios; elige servicio al crear turno. |
| Servicio debe estar asignado al prestador. | Cualquier servicio activo puede usarse. |
| Todos los autenticados gestionan `usuarios_servicios`. | Admin/coordinación/secretaría gestionan; profesional no. |
| Servicios habituales bloquean su eliminación por turnos. | La asociación es informativa; no es requisito del turno. |
| Formularios de alta como páginas dedicadas. | Modales reutilizables. |
| Agenda operativa simple tipo lista. | Agenda visual Día/Semana tipo calendario. |
| Reporte con editor avanzado. | Textarea segura en MVP. |
| Notificaciones generales. | Solo alertas de conversaciones no leídas. |

---

## 4. Fuera del MVP

- vista mensual de agenda;
- reprogramación;
- drag and drop;
- pagos/cobros;
- asistencia separada;
- seguimientos como módulo independiente;
- archivos adjuntos;
- editor enriquecido;
- PDF backend;
- WebSocket;
- push notifications;
- modo oscuro;
- edición del perfil propio;
- PWA avanzada;
- aplicación nativa;
- exportación de auditoría;
- gráficos complejos del dashboard.

---

## 5. Pendientes de producción

- proveedor de hosting;
- volumen persistente de uploads;
- dominio definitivo de API;
- política definitiva de CORS;
- retención de logs;
- monitoreo y observabilidad;
- datos reales de usuarios y centro;
- prueba de carga con volumen real;
- revisión legal de privacidad.

---

## 6. Regla de cambios

Una decisión confirmada no se modifica dentro de código sin actualizar primero este registro y los documentos afectados.
