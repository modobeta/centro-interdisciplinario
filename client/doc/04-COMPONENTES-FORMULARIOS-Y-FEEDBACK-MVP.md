# Componentes, formularios y feedback — Frontend privado MVP

---

## 1. Objetivo

Definir componentes reutilizables y reglas uniformes para formularios, modales, tablas, estados y mensajes. La meta es evitar que cada módulo implemente una experiencia diferente.

---

## 2. Catálogo de componentes

### 2.1 Layout y navegación

- `PrivateLayout`
- `PrivateSidebar`
- `PrivateTopbar`
- `SidebarNavItem`
- `MobileDrawer`
- `PageHeader`
- `Breadcrumbs`
- `UserSummaryButton`
- `AlertsButton`
- `SkipToContent`

### 2.2 Botones

- `Button`
- `IconButton`
- `LinkButton`
- `DangerButton`
- `SplitAction` solo si un caso real lo requiere

Variantes:

```text
primary
secondary
outline
ghost
danger
```

Tamaños mediante tokens. Todo botón debe tener estado `disabled`, `loading` y foco visible.

### 2.3 Formularios

- `FormField`
- `Input`
- `PasswordInput`
- `Select`
- `AsyncSelect`
- `MultiSelect`
- `Textarea`
- `Checkbox`
- `DateInput`
- `TimeInput`
- `DurationSelect`
- `FileInput`
- `FormSection`
- `FormErrorSummary`
- `RequiredMark`

### 2.4 Feedback

- `ToastContainer`
- `Toast`
- `Alert`
- `InlineError`
- `LoadingSpinner`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `UnauthorizedState`
- `SessionExpiredNotice`

### 2.5 Modales

- `BaseModal`
- `FormModal`
- `FullScreenFormModal`
- `ConfirmDialog`
- `ReadOnlyDialog`
- `IdleWarningDialog`

### 2.6 Datos

- `DataTable`
- `ResponsiveDataList`
- `Pagination`
- `SearchInput`
- `FilterBar`
- `FilterDrawer`
- `SortSelect`
- `StatusBadge`
- `Avatar`
- `DefinitionList`
- `Tabs`

### 2.7 Dominio compartido

- `PatientSummary`
- `TutorSummary`
- `UserSummary`
- `AppointmentStatusBadge`
- `ReportStatusBadge`
- `ConversationUnreadBadge`

---

## 3. Patrón de modal

### 3.1 Estructura

```text
Dialog
├── Header fijo
│   ├── título
│   └── cerrar
├── Body desplazable
│   └── formulario/contenido
└── Footer fijo
    ├── cancelar
    └── acción principal
```

### 3.2 Reglas

- `role="dialog"`;
- `aria-modal="true"`;
- `aria-labelledby` apuntando al título;
- foco inicial en título o primer campo;
- foco atrapado;
- `Escape` cierra salvo guardado activo;
- retorno de foco al disparador;
- bloqueo de scroll del fondo;
- confirmación si hay cambios no guardados.

### 3.3 Tamaños

- `sm`: confirmaciones;
- `md`: catálogos;
- `lg`: turnos, usuarios, servicios;
- `xl`: paciente+tutor;
- `fullscreen`: informes y celulares.

En celular, todos los formularios relevantes ocupan la pantalla completa.

---

## 4. Formularios con React Hook Form y Joi

### 4.1 Flujo

```text
Joi schema
→ resolver
→ React Hook Form
→ submit mapper
→ API
→ field errors o éxito
```

### 4.2 Validación por capas

Frontend valida:

- obligatorios;
- formatos;
- dependencias simples;
- longitudes;
- fechas evidentes;
- experiencia inmediata.

Backend valida definitivamente:

- permisos;
- unicidad;
- relaciones;
- estados;
- solapamientos;
- integridad transaccional.

### 4.3 Errores del backend

Formato esperado:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Revisá los datos enviados.",
    "fields": {
      "tutor.telefono": "El teléfono es obligatorio."
    }
  }
}
```

El mapper debe asociar rutas anidadas con `setError`.

---

## 5. Formulario de paciente y tutor

### 5.1 Secciones

```text
Datos del paciente
CUD
Datos del tutor
Información adicional
```

### 5.2 Dependencias

- `cudFechaVencimiento` se muestra y exige si `poseeCud=true`;
- DNI es opcional, pero si existe se valida formato;
- edad se calcula, no se guarda manualmente;
- tutor siempre obligatorio;
- el formulario se envía como una sola operación.

### 5.3 Advertencia de duplicado

El backend puede responder una advertencia con coincidencias similares. La UI muestra un segundo diálogo:

```text
Encontramos un paciente con datos similares.
[Revisar datos] [Crear de todas formas]
```

La segunda solicitud incluye un indicador explícito autorizado por contrato, nunca omite validaciones.

---

## 6. Formulario de turno

### 6.1 Campos

- paciente;
- prestador;
- servicio;
- consultorio;
- fecha;
- hora;
- duración;
- observación administrativa;
- notas internas autorizadas.

### 6.2 Dependencias

- profesional autenticado: prestador fijo;
- paciente: solo vinculados para profesional;
- servicio: todos los activos, habituales primero opcionalmente;
- fin mostrado se calcula desde inicio+duración;
- fecha/hora pueden precargarse desde agenda.

### 6.3 Conflicto

Ante `409` el modal permanece abierto y destaca el tipo de conflicto:

- prestador;
- paciente;
- consultorio.

No se ocultan los campos ya ingresados.

---

## 7. Formulario de informe

### 7.1 Modal amplio

Campos:

- paciente;
- tipo;
- título;
- resumen;
- contenido.

### 7.2 Acciones

- Cancelar;
- Guardar borrador;
- Finalizar informe.

### 7.3 Sin editor enriquecido

El contenido es texto plano multilínea. React renderiza preservando saltos de línea mediante CSS seguro. No se procesa HTML del usuario.

### 7.4 Finalización

`Finalizar` abre confirmación independiente y solo continúa si el borrador cumple todas las validaciones.

---

## 8. Formulario de conversación

- destinatarios múltiples;
- categoría;
- paciente opcional;
- título;
- primer mensaje.

El selector de destinatarios usa el directorio interno mínimo, incluso para profesionales, sin exponer el módulo Usuarios.

No se permite destinatario inactivo.

---

## 9. Formulario de usuario

### 9.1 Acceso

- nombre;
- apellido;
- DNI;
- correo;
- rol.

### 9.2 Profesional/institucional

- título;
- especialidad;
- teléfono;
- biografía;
- función pública;
- publicación;
- orden;
- fotografía.

### 9.3 Reglas

- especialidad requerida para rol profesional;
- admin nunca publicable;
- cambio de DNI advierte sobre regeneración de credencial y revocación de sesiones;
- fotografía usa endpoint multipart separado, aunque la UI lo presente integrada.

---

## 10. Feedback global

### 10.1 Toast

Uso:

- creación exitosa;
- actualización;
- confirmación de estado;
- mensaje enviado;
- error breve recuperable.

No usar toast para:

- contenido clínico;
- confirmaciones;
- errores de campos;
- mensajes que requieran lectura prolongada.

### 10.2 Duración

- éxito: 4 segundos;
- info: 5 segundos;
- error: permanece más tiempo o requiere cierre manual según gravedad.

### 10.3 Accesibilidad

- `role="status"` para éxito/info;
- `role="alert"` para error;
- no mover el foco automáticamente al toast.

---

## 11. Cargas

### 11.1 Página

Skeletons compatibles con la forma final.

### 11.2 Acción

El botón cambia texto:

```text
Guardando…
Enviando…
Confirmando…
Cancelando…
```

### 11.3 Agenda

No desaparece el calendario. Se muestra una capa discreta o indicador en toolbar.

### 11.4 Doble envío

El submit se deshabilita desde el primer envío hasta resolución.

---

## 12. Estados vacíos

Cada estado vacío debe explicar el contexto y ofrecer acción autorizada.

Ejemplos:

```text
No se encontraron pacientes.
No hay turnos para el período seleccionado.
No hay informes que coincidan con los filtros.
Todavía no participás en conversaciones.
```

No mostrar botones de creación a roles sin permiso.

---

## 13. Confirmaciones sensibles

Requieren `ConfirmDialog`:

- activar/desactivar usuario;
- activar/desactivar paciente;
- vincular/desvincular prestador cuando corresponda;
- restablecer acceso;
- quitar servicio habitual;
- finalizar informe;
- activar/desactivar catálogo;
- eliminar foto o imagen;
- descartar cambios.

### 13.1 Cancelar turno

Utiliza modal específico con motivo obligatorio, no un diálogo genérico.

---

## 14. Estados y badges

### 14.1 Turnos

- pendiente;
- confirmado;
- completado;
- cancelado;
- ausente.

### 14.2 Informes

- borrador;
- finalizado.

### 14.3 Entidades

- activo;
- inactivo;
- visible públicamente;
- oculto públicamente.

Todo badge incluye texto; el color es complementario.

---

## 15. Tablas y tarjetas móviles

### 15.1 Tabla

- encabezados accesibles;
- ordenamiento explícito;
- acciones en última columna;
- filas seleccionables solo si se comunica correctamente;
- no colocar cinco botones visibles por fila: usar menú contextual cuando sea necesario.

### 15.2 Celular

`ResponsiveDataList` convierte cada registro en tarjeta con etiqueta-valor. Las acciones principales se mantienen visibles.

---

## 16. Filtros y búsquedas

### 16.1 Búsqueda

- debounce 400 ms;
- comienza con 2 caracteres;
- limpiar;
- vuelve a página 1;
- no persiste al recargar.

### 16.2 Filtros

- escritorio: barra visible;
- celular: drawer;
- aplicación inmediata;
- `Limpiar filtros`;
- estado temporal por módulo.

---

## 17. Cambios sin guardar

Se detectan mediante `formState.isDirty`.

Al cerrar:

```text
Hay cambios sin guardar.
[Continuar editando] [Descartar cambios]
```

No se usa `beforeunload` de forma indiscriminada; se limita a formularios extensos abiertos y según soporte del navegador.

---

## 18. Errores HTTP normalizados

| HTTP | Tratamiento |
|---|---|
| 400 | mensaje general de solicitud inválida |
| 401 | refresh o cierre de sesión |
| 403 | sin permiso |
| 404 | recurso no disponible |
| 409 | conflicto de negocio contextual |
| 422 | campos y resumen de validación |
| 429 | límite de intentos |
| 500 | error genérico + correlation ID opcional |

No se muestra stack trace ni mensaje interno.

---

## 19. Pruebas mínimas de componentes

- foco y cierre de modal;
- confirmación de cambios;
- mapeo de errores de campos;
- botón loading;
- toast accesible;
- tabla y tarjeta móvil;
- PermissionGate;
- estados vacíos;
- formularios con dependencias;
- cancelación de turno con motivo.

---

## 20. Criterios de aceptación

- Todos los formularios usan el mismo patrón.
- Los errores no borran información ingresada.
- Los diálogos devuelven el foco.
- No hay valores visuales mágicos repetidos.
- No hay HTML de usuario renderizado.
- Las acciones sensibles siempre confirman.
- Las cargas evitan doble submit.
- Los estados vacíos son específicos.
