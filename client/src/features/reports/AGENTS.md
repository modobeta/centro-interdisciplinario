# Instrucciones de informes

## Alcance

Estas reglas aplican a `src/features/reports/` y complementan `client/AGENTS.md`. Los informes contienen información clínica sensible y requieren especial cuidado de autorización, privacidad e impresión.

## Reglas de dominio

- Solo `profesional` y `coordinacion` pueden crear informes cuando la policy del recurso lo permite.
- Administración y secretaría no crean informes clínicos.
- Un borrador solo puede ser modificado y finalizado por su autor.
- Un informe finalizado es inmutable: no mostrar edición, reapertura ni sobrescritura.
- Los permisos de lectura dependen del rol, el vínculo con el paciente y la policy del backend.
- Un autor inactivo continúa identificado en informes históricos; no eliminar ni reemplazar su autoría.
- No implementar generación de PDF en el backend para el MVP. La descarga se resuelve mediante la vista imprimible del navegador.

## Listado y detalle

- `ReportsPage` aplica filtros y paginación mediante parámetros soportados por la API.
- Mostrar estado, paciente, autor y fechas solo cuando sean visibles para el usuario actual.
- `ReportDetailPage` es la fuente visual de lectura y coordina la impresión; no duplicar una versión divergente del contenido.
- Un usuario sin acceso no debe recibir fragmentos del informe en estados previos, títulos de documento, toasts o caches de UI.
- Distinguir claramente borradores de informes finalizados sin depender únicamente del color.

## Formulario

- `ReportFormModal` puede ser amplio, pero debe mantener foco, navegación por teclado y acciones visibles.
- `reportSchema.js` debe reflejar los campos y límites vigentes del contrato.
- `reportMappers.js` transforma formulario y respuesta; no dispersar conversiones en componentes.
- Guardar borrador y finalizar son intenciones diferentes y deben tener acciones explícitas.
- Antes de finalizar, pedir confirmación e informar que el contenido quedará inmutable.
- Ante error al guardar o finalizar, conservar el contenido editado y evitar envíos duplicados.
- No aplicar autosave ni edición colaborativa en el MVP.

## Impresión y privacidad

- `ReportDocument` define una representación semántica y estable para lectura e impresión.
- Usar `styles/print.css` para ocultar navegación y controles, conservar identificación necesaria y producir páginas legibles.
- No incluir controles interactivos, mensajes internos ni metadatos técnicos en la impresión.
- No enviar contenido clínico a servicios externos para generar documentos.
- No registrar cuerpos, extractos o errores que reproduzcan el contenido del informe.
- Limpiar estado sensible al cambiar de informe, paciente o sesión.

## Pruebas críticas

- Creación permitida para profesional y coordinación.
- Ausencia de creación para administración y secretaría.
- Edición y finalización solo por el autor del borrador.
- Inmutabilidad después de finalizar.
- Lectura condicionada por rol y vínculo.
- Autor inactivo conservado en el histórico.
- Error de guardado sin pérdida de contenido.
- Vista imprimible sin navegación, acciones ni información no autorizada.
