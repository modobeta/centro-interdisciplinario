---
name: informes-privados-e-impresion
description: Implementar, ampliar, corregir o revisar informes clínicos privados en React/Vite. Usar cuando una tarea involucre listado, filtros, borradores, autoría, edición, expectedVersion, finalización inmutable, permisos de lectura o escritura, modal amplio, contenido clínico en texto plano, privacidad, ReportDocument, ReportDetailPage, CSS `@media print`, impresión o Guardar como PDF mediante el diálogo nativo del navegador.
---

# Informes privados e impresión

## Objetivo

Construir el ciclo de informes con controles estrictos de alcance, autoría, concurrencia e inmutabilidad. Mantener el contenido clínico privado durante edición, lectura e impresión y usar una única representación semántica para pantalla y papel.

## 1. Inspeccionar antes de implementar

1. Leer `client/AGENTS.md` y `features/reports/AGENTS.md` completos.
2. Consultar la especificación de Informes en `client/doc/` y el contrato vigente en `api/docs/`.
3. Revisar permisos, scope, proyecciones, errores y campos de concurrencia reales.
4. Inspeccionar página, hooks, API, schema, mappers, modal, documento y `styles/print.css`.
5. Confirmar infraestructura de formularios, routing, impresión y pruebas instalada.
6. Distinguir archivos vacíos del scaffold de una implementación funcional.

No inferir permisos por jerarquía de rol. No implementar endpoints, PDF o acciones ausentes del contrato.

## 2. Distribuir responsabilidades

| Pieza | Responsabilidad | Evitar |
|---|---|---|
| `ReportsPage.jsx` | Listado, filtros, paginación y entrada a acciones | Contenido clínico completo en filas |
| `ReportTable.jsx` | Proyección resumida y acciones autorizadas | Resolver permisos por rol fijo |
| `useReports.js` | Consultar listado, cancelar y refrescar | Guardar informes globalmente |
| `useReport.js` | Cargar detalle y coordinar mutaciones | Renderizar formulario o impresión |
| `reportsApi.js` | Ocultar HTTP y devolver contratos normalizados | Toasters, navegación o DOM |
| `ReportFormModal.jsx` | Orquestar alta/edición, guardado y finalización | Duplicar campos del formulario |
| `ReportForm.jsx` | Estado, validación y submit explícito | Axios y permisos remotos |
| `reportSchema.js` | Reglas del formulario | Autoría, vínculo o concurrencia |
| `reportMappers.js` | Entidad a defaults y valores a payload | Mutar respuesta o estado React |
| `ReportDetailPage.jsx` | Lectura autorizada y acción Imprimir | Otra versión divergente del contenido |
| `ReportDocument.jsx` | Documento semántico para pantalla/papel | Lógica HTTP o de permisos |
| `styles/print.css` | Ocultar shell y paginar de forma legible | Alterar datos o autorización |

Mantener listado y detalle en estado de feature. No usar Redux Persist, `localStorage` ni un store global de informes.

## 3. Aplicar la matriz de acceso

### Lectura

- Administrador, coordinación y secretaría pueden listar y leer informes dentro del alcance global confirmado.
- Profesional puede listar y leer informes de pacientes con vínculo activo.
- Solicitar detalle solo después de autorizar ruta y recurso, pero dejar la decisión final al backend.
- Ante recurso no visible, tratar `404` sin revelar si existe.
- No mostrar fragmentos del contenido en previews, toasts, títulos del documento, breadcrumbs o estados previos a la autorización.

### Creación

- Coordinación puede crear sobre cualquier paciente activo y queda como autor.
- Profesional puede crear sobre un paciente activo con vínculo y queda como autor.
- Administrador y secretaría nunca ven Nuevo informe.
- No enviar autor ni estado: el backend asigna autor actual y `borrador`.

### Edición y finalización

- Permitirlas únicamente al autor activo de un borrador.
- Para profesional, exigir además vínculo activo con el paciente.
- No conceder excepción a administrador, secretaría ni otra coordinación.
- Usar `puedeEditar` y `puedeFinalizar` devueltos por backend como ayuda de UX, sin convertirlos en autorización final.
- Mantener borradores de autor inactivo bloqueados y sin reasignación.
- Conservar informes finalizados y autoría histórica aunque el autor quede inactivo.

## 4. Implementar listado sin sobreexponer

- Consumir `GET /informes` con paginación backend de 20 elementos.
- Permitir búsqueda por título/paciente y filtros de estado, paciente, autor y tipo dentro del scope.
- Aplicar debounce de 400 ms desde 2 caracteres y volver a página 1 al cambiar filtros.
- Mantener filtros solo mientras la feature esté montada.
- Mostrar título, paciente, tipo, autor, fecha relevante, estado y acciones permitidas.
- Distinguir `borrador` y `finalizado` con texto además de color.
- No esperar `contenido` en el listado ni construir resúmenes clínicos en cliente.
- Representar loading, empty, error y retry sin perder el resto del panel.
- Cancelar consultas obsoletas y no mostrar cancelaciones como error.

El backend limita filtros y filas. Un filtro manipulado nunca amplía alcance.

## 5. Crear un borrador

Enviar mediante `POST /informes`:

- `pacienteId`;
- `tipoInformeId`;
- `titulo` de hasta 200 caracteres;
- `resumen` no vacío;
- `contenido` no vacío en texto plano.

- Mostrar solo pacientes seleccionables según el actor.
- Mostrar tipos de informe activos al crear.
- Mantener autor como información derivada de sesión/backend, no como selector.
- Usar un modal amplio en escritorio y fullscreen en celular.
- Guardar únicamente mediante acción explícita; no implementar autosave.
- Mantener el formulario abierto y valores intactos ante error.
- Evitar doble submit y actualización optimista.
- Tras éxito, usar el detalle devuelto con `version`, autor y estado confirmados.

No persistir borradores incompletos en almacenamiento web.

## 6. Editar un borrador propio

- Cargar el detalle autorizado antes de inicializar el formulario.
- Mapear `tipoInformeId`, título, resumen y contenido a valores estables.
- No permitir cambiar paciente, autor o estado.
- Enviar `expectedVersion` obligatorio con `PUT /informes/:id`.
- Actualizar defaults y versión únicamente con la respuesta confirmada.
- Permitir conservar el tipo actual si quedó inactivo, pero no seleccionar otro tipo inactivo.
- Bloquear la edición si el backend informa autor inactivo, informe finalizado o pérdida de vínculo.
- Advertir antes de cerrar o navegar con cambios sin guardar.
- Limpiar el contenido al cambiar de informe, cerrar deliberadamente o hacer logout.

No sobrescribir datos recibidos después de que la persona comenzó a editar sin resolver primero la concurrencia.

## 7. Manejar concurrencia y errores

- Para `INFORME_VERSION_CONFLICTO`, conservar el texto local y volver a obtener la versión actual.
- Mostrar que el informe cambió en otra sesión sin incluir su contenido en un toast.
- Permitir comparar o reabrir la versión actual de manera segura; no fusionar automáticamente texto clínico.
- Exigir una nueva acción explícita antes de guardar sobre la versión actualizada.
- Para `INFORME_FINALIZADO`, cerrar el modo edición y mostrar el detalle inmutable.
- Para `INFORME_AUTOR_INACTIVO`, conservar autoría y bloquear acciones de escritura.
- Para `INFORME_NO_ES_AUTOR` o falta de vínculo, retirar edición y mantener solo lectura si el backend todavía la autoriza.
- Para `422`, asociar errores a campos y conservar el resto del formulario.
- No reintentar automáticamente guardado o finalización.
- No mostrar respuestas, stack traces o contenido clínico en errores.

## 8. Separar Guardar borrador de Finalizar

- Presentar acciones distintas y con nombres inequívocos.
- Guardar borrador permite continuar editando después.
- Finalizar abre una confirmación reforzada e independiente.
- Explicar antes de confirmar que el informe quedará inmutable.
- Validar todos los campos requeridos antes de finalizar.
- Si existen cambios sin guardar, guardarlos explícitamente primero y usar la versión devuelta para finalizar; no fingir una operación atómica cliente.
- Enviar únicamente `expectedVersion` a `PATCH /informes/:id/finalizar`.
- Bloquear doble envío durante toda la secuencia.
- Mantener el modal y contenido ante cualquier fallo.
- Tras éxito, reemplazar el borrador por la respuesta finalizada, cerrar edición y navegar o mostrar lectura según el flujo.

La finalización completa `fechaEmision` en backend. El frontend no la inventa ni cambia estado local antes de la confirmación.

## 9. Garantizar inmutabilidad

Para un informe `finalizado`:

- no mostrar Editar, Guardar, Finalizar nuevamente, Reabrir o Eliminar;
- no montar controles editables ocultos;
- no enviar `PUT` ni otra mutación;
- mostrar `ReportDetailPage` en modo de solo lectura;
- conservar autor, tipo, paciente, fecha de emisión y contenido recibido;
- permitir únicamente lectura e impresión dentro del permiso vigente.

No existe `DELETE /informes/:id`, reapertura, transferencia de autoría ni generación backend de PDF en el MVP.

## 10. Renderizar contenido clínico como texto

- Usar textarea multilínea durante edición.
- Renderizar con interpolación normal de React.
- Preservar saltos con CSS seguro, como `white-space: pre-wrap`.
- No usar `dangerouslySetInnerHTML`, `innerHTML`, Markdown o editor enriquecido.
- No autoconvertir URLs del contenido en enlaces ejecutables.
- No truncar el contenido en la vista de detalle o impresión.
- Mantener título, resumen y contenido en regiones semánticas diferenciadas.

## 11. Construir una única vista de lectura

Usar `ReportDocument` como representación estable de:

- logo y datos institucionales confirmados;
- tipo de informe;
- título;
- paciente;
- autor, incluso si está inactivo;
- fecha de emisión o fecha relevante autorizada;
- resumen;
- contenido completo.

- Reutilizar el mismo documento dentro de `ReportDetailPage` para pantalla e impresión.
- No duplicar markup de impresión que pueda divergir del detalle.
- Mantener el `<title>` de la pestaña genérico; no incluir paciente ni título clínico.
- No renderizar controles, permisos, correlation IDs o metadatos técnicos dentro del documento.
- Mostrar error genérico si la lectura auditada falla y el backend no entrega contenido.

La lectura exitosa es auditada por backend sin copiar título, resumen o contenido.

## 12. Imprimir mediante el navegador

- Ofrecer un botón `Imprimir / Guardar como PDF` solo después de cargar el detalle autorizado.
- Ejecutar `window.print()` desde una acción directa de la persona.
- Usar el diálogo nativo para impresora o Guardar como PDF.
- No agregar librerías de PDF, canvas, captura HTML, endpoint PDF ni archivo persistido.
- No enviar contenido a servicios externos.
- Evitar abrir ventanas auxiliares con copias del informe salvo una necesidad demostrada.
- Restaurar foco y estado normal después de cerrar el diálogo cuando el navegador lo permita.

El navegador controla nombre de impresora, destino, márgenes y encabezados/pies propios. CSS no puede garantizar que la URL del navegador nunca aparezca; documentar esa limitación en lugar de prometerla.

## 13. Diseñar `print.css`

Dentro de `@media print`:

- ocultar sidebar, topbar, navegación, botones, toasts, breadcrumbs y controles con una clase compartida como `noPrint`;
- mostrar únicamente el documento y datos institucionales autorizados;
- quitar sombras, fondos operativos y anchos máximos de pantalla innecesarios;
- usar color oscuro sobre fondo blanco y tipografía legible;
- definir tamaño y márgenes de página con `@page` cuando ayude;
- conservar logo con dimensiones proporcionadas y sin deformación;
- evitar cortes inmediatos después de títulos;
- evitar dividir bloques breves de identidad o firma entre páginas;
- permitir saltos naturales en contenido largo;
- preservar saltos de línea y palabras extensas sin desbordar;
- no fijar encabezados o pies que se superpongan al contenido.

Usar reglas de impresión globales solo para el shell y clases locales/semánticas para el documento. No depender del color como única señal de estado.

## 14. Mantener privacidad durante todo el flujo

- No guardar borradores, informes completos o filtros sensibles en almacenamiento persistente.
- No registrar contenido, resumen, título clínico, payloads ni respuestas completas en consola.
- No incluir contenido del informe en toast, error, auditoría cliente o notificación del sistema.
- No enviar información clínica a analytics, generadores PDF o servicios externos.
- Limpiar detalle, formulario, errors y requests al cambiar informe, paciente o sesión.
- Evitar que una respuesta tardía repueble estado después de logout o cambio de recurso.
- No precargar detalles de informes que la pantalla no está mostrando.
- Mantener fixtures y screenshots con datos completamente ficticios.
- No mostrar fragmentos antes de que la API confirme acceso.

## 15. Mantener modal amplio y accesible

- Usar tamaño amplio o casi fullscreen en escritorio y fullscreen en celular.
- Mantener título, acción cerrar y botones Guardar/Finalizar visibles.
- Hacer el cuerpo desplazable sin perder las acciones.
- Enfocar el título o primer campo útil al abrir, atrapar foco y restaurarlo al cerrar.
- Bloquear cierre durante una mutación no interrumpible.
- Confirmar descarte cuando `isDirty` sea verdadero.
- Mantener labels visibles, errores asociados y resumen accesible.
- No convertir el formulario en wizard si una pantalla agrupada sigue siendo comprensible.

## 16. Probar escenarios críticos

- Coordinación crea informe para cualquier paciente activo.
- Profesional crea solo para paciente vinculado.
- Administrador y secretaría no ven creación pero leen contenido autorizado.
- Solo autor activo edita y finaliza.
- Autor inactivo permanece identificado; finalizado visible y borrador bloqueado.
- Alta asigna autor y estado en backend.
- Guardados sucesivos actualizan `version`.
- `INFORME_VERSION_CONFLICTO` conserva contenido local y no sobrescribe automáticamente.
- Finalización requiere confirmación y vuelve el recurso inmutable.
- Informe finalizado no monta acciones de escritura.
- Contenido con etiquetas HTML se muestra como texto.
- Error de guardado/finalización no pierde datos ni duplica requests.
- Logout y cambio de recurso limpian contenido sensible.
- Vista impresa contiene datos autorizados y excluye navegación, botones y metadatos técnicos.
- Impresión de múltiples páginas conserva headings, saltos y legibilidad.

Ejecutar lint, pruebas, build y E2E disponibles. Revisar la vista impresa mediante preview real del navegador cuando el entorno lo permita.

## Guardrails

- No permitir que un rol superior edite un borrador ajeno.
- No reasignar autoría ni borrar informes.
- No implementar autosave o persistencia local.
- No omitir `expectedVersion` ni resolver conflictos sobrescribiendo.
- No finalizar sin confirmación explícita.
- No reabrir ni modificar informes finalizados.
- No renderizar HTML o rich text.
- No incluir contenido clínico en logs, toasts o títulos de pestaña.
- No crear PDF mediante backend o librería cliente.
- No mantener dos versiones divergentes para lectura e impresión.

## Entrega esperada

Resumir:

- listado, detalle y formulario afectados;
- reglas de autoría, permisos y estados aplicadas;
- versionado, guardado y finalización manejados;
- privacidad y limpieza del contenido;
- estructura de `ReportDocument` y CSS de impresión;
- pruebas y verificaciones ejecutadas.
