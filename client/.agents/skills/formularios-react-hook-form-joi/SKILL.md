---
name: formularios-react-hook-form-joi
description: Crear, ampliar o corregir formularios y modales de alta o edición en React/Vite con React Hook Form y Joi. Usar cuando una tarea involucre schemas, resolvers, defaultValues, mappers, FormField, inputs controlados, errores 409/422, errores de servidor, doble envío, isSubmitting, estados de carga, cambios sin guardar, ConfirmDialog, FormModal, foco accesible o formularios responsive y fullscreen en móvil.
---

# Formularios React Hook Form + Joi

## Objetivo

Construir formularios consistentes, accesibles y seguros, con validación cliente alineada a la API, errores del servidor preservados, un único envío activo, protección ante cambios sin guardar y adaptación clara entre modal de escritorio y fullscreen móvil.

## 1. Inspeccionar el flujo completo

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Revisar `package.json` y confirmar React Hook Form, Joi y `@hookform/resolvers` antes de importarlos.
3. Inspeccionar componentes base de formularios y modales, `useUnsavedChanges`, normalizador de errores y una feature análoga.
4. Consultar en `client/doc/` el formulario, permisos, campos, transiciones y feedback afectados.
5. Verificar en `api/docs/contrato-api.md` payload, campos obligatorios, nulabilidad, errores `409`/`422` y reglas por recurso.

No asumir que un archivo vacío implementa el patrón. No copiar la validación del backend sin adaptar mensajes y forma al frontend.

## 2. Distribuir responsabilidades

| Pieza | Responsabilidad | Evitar |
|---|---|---|
| `<Feature>Form.jsx` | `useForm`, campos, errores y submit semántico | Axios directo, navegación y toasts globales |
| `<Feature>FormModal.jsx` | Apertura, modo, carga inicial, mutación, cierre y confirmación | Duplicar inputs o schema |
| `<feature>Schema.js` | Reglas Joi sin efectos y mensajes de validación cliente | Consultas, permisos o unicidad remota |
| `<feature>Mappers.js` | `entity → defaultValues` y `formValues → payload` | Estado React o mutaciones de argumentos |
| Módulo API | Crear/actualizar y devolver datos normalizados | Manejo visual de errores |
| Componentes base | Label, ayuda, error, descripción y estados comunes | Conocimiento del dominio |

Mantener separados el modo `create` y `edit`, aunque compartan campos. No inferir el modo solo por valores truthy ambiguos.

## 3. Diseñar el schema Joi

- Crear un schema por formulario o intención cuando las reglas difieran de forma real.
- Alinear nombres con los valores `camelCase` del frontend y transformar únicamente en el mapper de frontera.
- Definir obligatoriedad, formato, longitud, rangos, valores permitidos y reglas condicionales confirmadas.
- Configurar el resolver para reunir todos los errores relevantes, no solo el primero, cuando la UX lo necesite.
- Escribir mensajes comprensibles y asociados al campo; no mostrar códigos Joi crudos.
- Normalizar strings vacíos, `null`, fechas y números de manera explícita.
- No validar en cliente unicidad, permisos, disponibilidad, vínculos ni conflictos que dependen de PostgreSQL.
- Mantener el backend como autoridad incluso cuando el schema cliente sea equivalente.

Evitar schemas gigantes compartidos entre altas, filtros y ediciones si sus contratos no son idénticos.

## 4. Inicializar y restablecer valores

- Definir `defaultValues` completos y estables para evitar inputs uncontrolled/controlled.
- Para edición, mapear la entidad cargada antes de llamar a `reset`.
- Ejecutar `reset(mappedValues)` al abrir una entidad distinta o después de un guardado exitoso.
- No sobrescribir valores escritos por el usuario cuando llegue una respuesta tardía o cambie una consulta auxiliar.
- Separar carga de la entidad de carga de catálogos o selects.
- En modo alta, aplicar valores precargados del contexto —por ejemplo paciente, fecha u hora— solo al iniciar el formulario.
- No enviar IDs, metadatos o campos de solo lectura que la API no acepte.

## 5. Componer campos accesibles

- Usar `FormField` para asociar label, control, ayuda y error mediante `id`, `htmlFor`, `aria-describedby` y `aria-invalid`.
- Mantener labels visibles; no usar placeholder como único nombre.
- Usar `register` para controles nativos y `Controller` solo cuando el componente no exponga una interfaz compatible.
- Mantener checkboxes, selects, multiselects, fechas y horas con semántica y navegación por teclado.
- Agrupar campos relacionados con `fieldset` y `legend` cuando corresponda.
- Anunciar errores globales con una región accesible sin mover el foco a un toast.
- Al fallar validación, enfocar el primer campo inválido visible y mantener un resumen para formularios largos.
- No comunicar requerido, inválido o guardado únicamente mediante color.

## 6. Ejecutar el submit una sola vez

- Usar `handleSubmit` como única entrada de envío válido.
- Deshabilitar la acción principal desde el primer submit hasta que la promesa termine.
- Combinar `formState.isSubmitting` con el estado de mutación cuando existan capas asíncronas separadas.
- Mostrar loading dentro del botón sin cambiar su ancho ni su nombre de acción.
- Bloquear cierre por Escape, backdrop y botón cerrar mientras el guardado esté en una fase no interrumpible.
- No confiar únicamente en `disabled`: mantener una guarda lógica contra invocaciones duplicadas.
- No reintentar automáticamente mutaciones que puedan duplicar altas.
- Mantener el modal y los valores abiertos si la API falla.

En éxito:

1. Actualizar o invalidar el recurso afectado.
2. Ejecutar `reset` con los datos confirmados para limpiar `isDirty`.
3. Mostrar feedback breve.
4. Cerrar solo cuando el flujo documentado lo requiera.

## 7. Mapear errores del servidor

- Consumir el contrato producido por `errorNormalizer.js`; no interpretar Axios en cada formulario.
- Para `422`, mapear `fieldErrors` con `setError(campo, { type: 'server', message })`.
- Colocar errores sin campo conocido en `root.server` o en un resumen del formulario.
- Para `409`, mantener el modal abierto y explicar el conflicto en su contexto, como duplicado o disponibilidad.
- Para `403`, conservar sesión y mostrar denegación sin revelar datos restringidos.
- Para `401`, permitir que la capa de sesión ejecute refresh o logout; el formulario no implementa interceptores.
- Para red o timeout, conservar valores y ofrecer reintento manual cuando sea seguro.
- Limpiar un error de servidor del campo cuando el usuario lo edite o cuando una nueva respuesta válida lo reemplace.
- No mostrar mensajes crudos, stack traces, SQL ni detalles sensibles.

Si el backend devuelve un campo que el formulario no reconoce, mostrar un resumen seguro y registrar la incompatibilidad sin perder el resto de los errores.

## 8. Proteger cambios sin guardar

- Usar `formState.isDirty` como señal primaria, no comparaciones JSON ad hoc.
- Interceptar cierre por botón, Escape, backdrop, cambio de modal y navegación cuando existan cambios.
- Mostrar `UnsavedChangesDialog` con acciones explícitas: continuar editando o descartar.
- Mantener el foco en el diálogo y devolverlo al formulario si se continúa editando.
- Usar `beforeunload` solo mientras haya cambios y limpiar el listener al guardar, descartar o desmontar.
- Integrar un blocker de navegación compatible con la versión instalada del router; no parchear el historial manualmente.
- No advertir después de `reset` exitoso ni cuando el formulario nunca cambió.
- No persistir borradores sensibles en `localStorage`.

Un diálogo de cambios sin guardar no reemplaza la confirmación de una acción de negocio irreversible.

## 9. Implementar modales accesibles y responsive

- Usar el componente modal compartido con `role="dialog"`, `aria-modal="true"` y título asociado.
- Enfocar el título o primer campo útil al abrir, atrapar el foco y devolverlo al disparador al cerrar.
- Permitir Escape cuando no haya guardado activo ni confirmación pendiente.
- Separar encabezado, cuerpo desplazable y acciones; evitar que toda la página detrás se desplace.
- En escritorio, usar ancho según complejidad; informes pueden usar modal amplio.
- En móvil, convertir formularios a fullscreen sin perder título, acciones ni navegación por teclado.
- Mantener acciones principales visibles y targets táctiles adecuados.
- No crear un wizard si una sola pantalla agrupada sigue siendo comprensible.
- Paciente y tutor permanecen en un formulario conjunto; la cancelación de turno usa un modal específico con motivo obligatorio.

## 10. Gestionar carga y datos auxiliares

- Diferenciar carga inicial de entidad, carga de opciones, submit y actualización posterior.
- Mostrar skeleton o estado estable antes de renderizar edición con datos incompletos.
- Deshabilitar solo los campos dependientes cuando carga un catálogo; no bloquear innecesariamente todo el formulario.
- Representar error y reintento de opciones sin perder otros valores ingresados.
- Cancelar lecturas auxiliares obsoletas cuando cambie la dependencia o cierre el modal.
- No cancelar una mutación enviada salvo soporte explícito del backend.
- Evitar que una respuesta tardía actualice un modal ya cerrado o una entidad distinta.

## 11. Tratar archivos cuando corresponda

- Mantener metadatos y carga de imagen en operaciones separadas si así lo define la API.
- Validar tipo y tamaño en cliente solo como feedback temprano; el backend vuelve a validar.
- Liberar URLs creadas con `URL.createObjectURL` al reemplazar archivo o desmontar.
- No asumir éxito total si guardar datos funciona y subir imagen falla; comunicar el resultado parcial y permitir reintento seguro.
- No incluir archivos en un payload JSON ni registrar su contenido.

## 12. Probar los escenarios críticos

- Alta con valores válidos y edición con datos precargados.
- Campos obligatorios, reglas condicionales y múltiples errores Joi.
- Mapper de entidad a defaults y de formulario a payload.
- Error `422` asociado a campos y resumen global.
- Conflicto `409` con modal abierto y valores conservados.
- Doble clic o Enter repetido produce una sola mutación.
- Botón loading y controles bloqueados durante submit.
- Error de red sin pérdida de información.
- `isDirty`, descarte, continuar editando, navegación y `beforeunload`.
- Foco inicial, trap, Escape, retorno de foco y primer campo inválido.
- Modal centrado en escritorio y fullscreen en móvil.
- Respuesta tardía después de cerrar o cambiar entidad.
- Ejecutar lint, pruebas y build existentes; informar lo no disponible.

## Guardrails

- No importar React Hook Form, Joi o resolvers si no están instalados.
- No duplicar schemas, mappers o campos entre modal y formulario.
- No cerrar el modal automáticamente ante errores.
- No permitir doble submit ni ocultar el estado pendiente.
- No reemplazar errores de campo por un toast genérico.
- No descartar cambios sin confirmación.
- No guardar formularios sensibles o credenciales en almacenamiento web.
- No convertir reglas remotas en falsas garantías cliente.
- No crear formularios de alta como páginas si el flujo confirmado usa modal.
- No declarar completado el flujo sin probar éxito, error, carga y responsive.

## Entrega esperada

Resumir:

- formulario, schema, mapper y modal afectados;
- contrato de valores y payload;
- errores cliente y servidor manejados;
- estrategia contra doble envío y cambios sin guardar;
- comportamiento responsive y de foco;
- pruebas y verificaciones ejecutadas.
