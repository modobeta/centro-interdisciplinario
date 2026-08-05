---
name: archivos-e-imagenes-administrativas
description: Implementar, ampliar, corregir o revisar la gestión administrativa de fotografías de profesionales e imágenes de servicios en React/Vite. Usar cuando una tarea involucre endpoints separados de upload, `multipart/form-data`, `FormData`, selección y preview local, reemplazo, eliminación, validación JPEG/PNG/WebP y 5 MB, URLs `/uploads`, cache, placeholders, fallbacks visuales, permisos administrativos o errores de archivos.
---

# Archivos e imágenes administrativas

## Objetivo

Gestionar fotos de usuarios e imágenes de servicios con operaciones independientes de los formularios JSON. Proporcionar preview y feedback claros, preservar la imagen confirmada ante fallos y consumir únicamente rutas públicas devueltas por el backend.

## 1. Inspeccionar antes de implementar

1. Leer `client/AGENTS.md` y los `AGENTS.md` aplicables a Usuarios o Servicios.
2. Consultar las secciones de archivos, usuarios, servicios y permisos en `client/doc/` y `api/docs/`.
3. Verificar endpoints, campo multipart, formatos, límite, respuestas y errores vigentes.
4. Inspeccionar `apiClient`, `errorNormalizer`, `fileUrl`, features, formularios, modales y placeholders existentes.
5. Confirmar dependencias y scripts reales en `package.json`.
6. Distinguir archivos vacíos del scaffold de una implementación completa.

No asumir que la edición JSON admite `fotoUrl`, `imagenUrl`, blobs o rutas locales. No crear otra estrategia de almacenamiento desde el frontend.

## 2. Respetar los contratos separados

| Recurso | Cargar o reemplazar | Eliminar | Campo | Respuesta |
|---|---|---|---|---|
| Foto de usuario | `PUT /usuarios/:id/foto` | `DELETE /usuarios/:id/foto` | `imagen` | `{ fotoUrl }` |
| Imagen de servicio | `PUT /servicios/:id/imagen` | `DELETE /servicios/:id/imagen` | `imagen` | `{ imagenUrl }` |

- Consumir rutas relativas desde el cliente HTTP cuya base termina en `/api/v1`.
- Enviar un solo archivo mediante `multipart/form-data` en cada `PUT`.
- No enviar body en los `DELETE`.
- Extraer `data.fotoUrl` o `data.imagenUrl`; no propagar la respuesta HTTP cruda.
- Mantener `POST` y `PUT` de datos de usuario o servicio como JSON sin campos de imagen.
- No convertir el alta o edición completa en multipart.

La UI puede presentar datos e imagen en un mismo modal, pero debe ejecutar y explicar dos operaciones independientes.

## 3. Aplicar permisos y alcance

- Mostrar carga, reemplazo y eliminación solo a administración.
- Ocultar y deshabilitar acciones para coordinación, secretaría y profesional.
- No confiar en controles visuales: el backend es la autoridad final.
- Impedir que un administrador modifique su propia foto mediante la operación administrativa.
- Manejar `403 USUARIO_AUTOMODIFICACION_DENEGADA` sin intentar sortear la regla.
- No inferir autorización desde la existencia de una URL o desde la visibilidad pública del registro.
- Permitir gestionar la imagen de un servicio únicamente dentro del módulo administrativo autorizado.

Visibilidad pública, estado activo e imagen son decisiones independientes. Una imagen cargada no debe publicar automáticamente un usuario o servicio.

## 4. Encapsular operaciones en las API de feature

Implementar funciones equivalentes a:

```text
uploadUserPhoto(id, file)
deleteUserPhoto(id)
uploadServiceImage(id, file)
deleteServiceImage(id)
```

- Construir un `FormData` nuevo por upload y ejecutar `formData.append('imagen', file)`.
- No fijar manualmente el header `Content-Type`; dejar que el navegador incluya el boundary correcto.
- Usar la única instancia HTTP centralizada y enviar credenciales privadas según su configuración.
- No serializar `FormData`, no envolverlo en JSON y no convertir el archivo a base64.
- No cancelar una mutación ya enviada salvo soporte contractual explícito.
- No reintentar uploads o eliminaciones automáticamente.
- Devolver la ruta relativa confirmada o `null` en vez de mutar componentes desde la capa API.

## 5. Validar antes de subir

Aceptar una sola imagen que cumpla:

- MIME declarado `image/jpeg`, `image/png` o `image/webp`;
- tamaño máximo contractual de 5 MB;
- archivo presente y no vacío.

- Configurar el input con `type="file"` y `accept="image/jpeg,image/png,image/webp"`.
- Validar tipo y tamaño inmediatamente al seleccionar y nuevamente antes de enviar.
- Mostrar el error junto al control y anunciarlo de forma accesible.
- Restablecer el valor del input cuando sea necesario para permitir volver a elegir el mismo archivo.
- Mantener el máximo en una constante compartida por los dos flujos si no oculta el contrato.
- No confiar en extensión, nombre o MIME del navegador como control de seguridad.

La validación cliente mejora UX. El backend valida tamaño, MIME y firma real y puede rechazar un archivo que el navegador aceptó.

## 6. Crear y limpiar el preview local

- Crear el preview con `URL.createObjectURL(file)` solo después de la validación cliente.
- Mantener separadas `confirmedImageUrl` y `previewObjectUrl`.
- Revocar el object URL anterior antes de reemplazar la selección.
- Ejecutar `URL.revokeObjectURL` al limpiar, cerrar el modal, desmontar o completar la operación.
- Mostrar el archivo seleccionado sin convertirlo a base64 ni guardarlo en Redux.
- Permitir quitar la selección local sin eliminar la imagen persistida.
- Conservar dimensiones y proporción para evitar saltos de layout.
- Usar alt descriptivo: nombre completo para una foto profesional y nombre del servicio para su imagen.

Si el upload falla, conservar la selección y su preview para que la persona pueda corregir o reintentar. No confundir ese preview con una URL ya persistida.

## 7. Coordinar alta o edición con upload

Cuando la UI muestre una sola acción Guardar:

1. Validar datos JSON y archivo local.
2. Crear o actualizar primero la entidad mediante su endpoint JSON.
3. Obtener el `id` confirmado.
4. Subir la imagen por el endpoint específico solo si existe una selección nueva.
5. Actualizar la entidad visible con la ruta devuelta.
6. Informar por separado cualquier fallo parcial.

- Deshabilitar doble submit durante la secuencia.
- No iniciar el upload si el guardado JSON falló.
- Si el JSON tuvo éxito y el upload falló, conservar la entidad guardada y permitir reintentar únicamente la imagen.
- No repetir el alta o edición JSON al reintentar el upload.
- No afirmar que toda la operación falló cuando el registro quedó guardado.
- Mantener el modal abierto cuando ayude a recuperar la carga fallida.
- Revocar el preview solo cuando se descarte o ya no se necesite.

No intentar una transacción cliente entre JSON y archivo. Comunicar con precisión qué parte fue confirmada.

## 8. Reemplazar sin perder la imagen vigente

- Mostrar la imagen confirmada hasta que exista una selección válida para preview.
- Enviar directamente el archivo nuevo con `PUT`; no eliminar primero la imagen anterior.
- Mantener la URL confirmada previa mientras la solicitud está pendiente.
- Reemplazar el estado local únicamente con `fotoUrl` o `imagenUrl` de la respuesta `200`.
- Ante error, restaurar visualmente la imagen confirmada o mantener el preview claramente marcado como no guardado.
- No agregar query strings aleatorios para romper cache.
- Usar la nueva ruta generada por el servidor como identidad cacheable del archivo reemplazado.
- Actualizar lista, detalle, modal y superficies públicas afectadas mediante la estrategia explícita de invalidación del proyecto.

El backend compensa el archivo nuevo si falla la persistencia y elimina la imagen anterior después de confirmar el reemplazo. El frontend no debe reproducir esa compensación.

## 9. Eliminar con confirmación

- Mostrar Eliminar foto o Eliminar imagen solo cuando exista una imagen confirmada y la acción esté autorizada.
- Abrir `ConfirmDialog` y explicar que se retirará la imagen, no el usuario ni el servicio.
- Bloquear confirmaciones duplicadas mientras el `DELETE` esté pendiente.
- Actualizar la ruta local a `null` solo después de la respuesta `200`.
- Cambiar inmediatamente al placeholder correspondiente tras el éxito.
- Tratar la eliminación como idempotente si la imagen ya no existe.
- Ante error, conservar la imagen confirmada y permitir reintento manual.
- Restaurar foco al control que abrió el diálogo.

No usar la eliminación de imagen como sustituto de desactivar o dejar de publicar el registro.

## 10. Construir URLs de archivos de forma centralizada

- Recibir `fotoUrl` e `imagenUrl` como rutas relativas, normalmente bajo `/uploads/usuarios/` y `/uploads/servicios/`.
- Resolverlas mediante el helper central `buildFileUrl` y la base de archivos validada por la configuración.
- No leer variables `VITE_*` directamente desde cada componente.
- Retornar `null` ante rutas ausentes o inválidas.
- Normalizar barras y permitir solo protocolos y orígenes configurados.
- No concatenar nombres originales, rutas locales o valores introducidos por usuarios finales.
- Recordar que la base de archivos puede diferir de la base de API.

No guardar URLs `blob:` fuera del componente ni enviarlas al backend.

## 11. Aplicar fallback visual una sola vez

- Definir un placeholder canónico para persona y otro para servicio.
- Mostrar placeholder cuando la ruta sea `null`, inválida o falle la carga.
- Cambiar a fallback una sola vez en `onError` y retirar el handler o registrar el estado.
- Evitar bucles si el placeholder también falla.
- No mostrar iconos rotos ni reintentar indefinidamente la imagen.
- Mantener tamaño, proporción, texto y acciones aunque falte la imagen.
- Usar iniciales accesibles como alternativa de persona solo si el sistema visual ya las define.
- No inventar fotografías o imágenes de servicios.

El fallback visual no modifica la entidad ni dispara un `DELETE` automático.

## 12. Manejar errores con estados recuperables

- `413 IMAGEN_DEMASIADO_GRANDE`: indicar el máximo de 5 MB y conservar el formulario.
- `422 IMAGEN_REQUERIDA`: solicitar seleccionar un archivo válido.
- `422 IMAGEN_TIPO_INVALIDO`: indicar JPEG, PNG o WebP y permitir reemplazar la selección.
- `404 USUARIO_NO_ENCONTRADO` o `SERVICIO_NO_ENCONTRADO`: cerrar el flujo de mutación y refrescar el recurso.
- `403`: retirar la acción y conservar una vista segura de solo lectura si corresponde.
- Error de red o servidor: conservar selección, preview, entidad confirmada y acción de reintento manual.
- Normalizar errores mediante la capa compartida y no mostrar respuestas, rutas físicas o stack traces.
- No registrar el archivo, buffer, base64, payload multipart ni datos personales.

No repetir automáticamente una carga tras una respuesta ambigua. Permitir que la persona refresque el registro antes de decidir si reintenta.

## 13. Mantener accesibilidad y responsive

- Usar label visible para el input y ayuda con formatos y tamaño máximo.
- Permitir selección, reemplazo, limpieza y eliminación con teclado.
- Mostrar nombre y tamaño del archivo seleccionado como texto, sin depender del preview.
- Asociar errores al input mediante `aria-describedby` y usar `aria-live` para el resultado del upload.
- No mover el foco al toast; enfocar el error de campo cuando bloquee el submit.
- Mantener botones Guardar, Reemplazar y Eliminar con estados loading y disabled claros.
- Usar modal fullscreen en celular cuando forme parte de un formulario administrativo.
- Evitar que el preview desborde; preservar relación de aspecto con `object-fit` apropiado.

## 14. Probar escenarios críticos

- Solo administración ve y ejecuta las cuatro operaciones.
- Un administrador no puede cambiar su propia foto.
- El formulario JSON nunca incluye `fotoUrl` o `imagenUrl`.
- `FormData` contiene exactamente un campo `imagen` y conserva el boundary del navegador.
- JPEG, PNG y WebP válidos pasan la validación; tipo inválido, archivo vacío y más de 5 MB se bloquean o muestran el error backend correcto.
- El backend sigue rechazando contenido cuya firma real no coincide con su MIME.
- Seleccionar, cambiar y limpiar archivos revoca cada object URL temporal.
- Upload exitoso usa la ruta devuelta y limpia el preview temporal.
- Error de upload conserva archivo, preview y entidad confirmada.
- Alta JSON exitosa con upload fallido no duplica la entidad al reintentar.
- Reemplazo no elimina primero la imagen anterior y adopta la nueva URL tras éxito.
- Eliminación requiere confirmación, es idempotente y cambia al placeholder.
- Error de eliminación conserva la imagen actual.
- Ruta nula, inválida, `404` y placeholder roto no generan bucles.
- Listado, detalle y vista pública reflejan la nueva ruta según invalidación.
- No se guardan base64, blobs ni rutas físicas en estado persistente o logs.

Ejecutar lint, pruebas y build disponibles. Usar MSW para contratos multipart y errores cuando el stack esté instalado; comprobar también revocación de object URLs y estados de éxito parcial.

## Guardrails

- No mezclar campos de imagen con los payloads JSON de la entidad.
- No fijar manualmente el boundary multipart.
- No confiar en extensión o MIME cliente como seguridad.
- No subir más de un archivo ni aceptar formatos fuera del contrato.
- No eliminar la imagen anterior antes de confirmar el reemplazo.
- No guardar base64, blobs o archivos en Redux o almacenamiento web.
- No filtrar rutas físicas, nombres originales o contenido de archivos.
- No reintentar mutaciones automáticamente.
- No usar cache-busting aleatorio.
- No hacer que una imagen controle por sí sola el estado o publicación.
- No implementar subida anónima ni servir directorios.

## Entrega esperada

Resumir:

- feature, API y componentes afectados;
- endpoints y permisos aplicados;
- validaciones y manejo multipart;
- ciclo de preview y revocación de object URLs;
- reemplazo, eliminación y éxito parcial;
- construcción de URL y fallbacks;
- pruebas y verificaciones ejecutadas.
