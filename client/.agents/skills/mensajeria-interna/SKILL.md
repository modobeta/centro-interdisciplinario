---
name: mensajeria-interna
description: Implementar, ampliar, corregir o revisar conversaciones, mensajes y alertas internas en React/Vite. Usar cuando una tarea involucre listado o detalle de conversaciones, participantes, creación, historial paginado, envío, lectura, contador no leído, polling de 60 segundos, visibilidad de pestaña, archivado individual, diseño responsive, privacidad, preservación del texto ante errores o ausencia de WebSocket.
---

# Mensajería interna

## Objetivo

Construir una mensajería privada, trazable y simple para participantes autenticados. Mantener lista, detalle, lectura, no leídos y archivado coherentes sin convertir el MVP en un chat en tiempo real ni exponer contenido sensible.

## 1. Inspeccionar antes de implementar

1. Leer `client/AGENTS.md` y `features/messages/AGENTS.md` completos.
2. Consultar la especificación de Mensajería en `client/doc/` y el contrato vigente en `api/docs/`.
3. Verificar endpoints, proyecciones, paginación, errores y reglas de participación actuales.
4. Inspeccionar página, componentes, hooks, API, schema, router, topbar y estado de sesión.
5. Confirmar en `package.json` qué dependencias y scripts están instalados.
6. Distinguir archivos vacíos del scaffold de una implementación funcional.

Aplicar la fuente de verdad definida por el repositorio cuando un documento histórico contradiga el contrato backend. No inventar endpoints, permisos ni tiempo real.

## 2. Distribuir responsabilidades

| Pieza | Responsabilidad | Evitar |
|---|---|---|
| `MessagesPage.jsx` | Coordinar filtros, selección y layout lista/detalle | Ejecutar HTTP o renderizar cada mensaje |
| `ConversationList.jsx` | Estados de lista, paginación, búsqueda y selección | Asumir que siempre hay selección |
| `ConversationItem.jsx` | Resumen autorizado, fecha y badge no leído | Mostrar cuerpos completos o datos extra |
| `ConversationDetail.jsx` | Encabezado, participantes, historial y acciones | Guardar sesión o permisos globales |
| `MessageList.jsx` | Historial cronológico y carga de mensajes anteriores | Descargar todo el historial de una vez |
| `MessageComposer.jsx` | Borrador efímero, validación, envío y error | Vaciar texto antes de una respuesta exitosa |
| `ConversationFormModal.jsx` | Crear conversación y primer mensaje | Crear usuarios, asuntos o pacientes |
| `useConversations.js` | Consultas, selección, mutaciones y sincronización | Renderizar UI o crear otro cliente HTTP |
| `useUnreadConversations.js` | Resumen mínimo y ciclo de polling | Descargar conversaciones o mensajes completos |
| `messagesApi.js` | Ocultar HTTP y devolver contratos normalizados | Toasts, navegación o acceso al DOM |
| `conversationSchema.js` | Validar alta y texto ingresado | Decidir autorización o participación |

Mantener los cuerpos de mensajes y borradores dentro de la feature. No usar Redux Persist, `localStorage` ni almacenamiento duradero.

## 3. Aplicar acceso por participación

- Permitir crear conversaciones a cualquier usuario autenticado activo.
- Exigir al menos un destinatario activo distinto del creador.
- Permitir listar, abrir, leer, responder, agregar participantes y archivar solo cuando el actor participa.
- No conceder acceso global a administración, coordinación o secretaría.
- Tratar `404 CONVERSACION_NO_ENCONTRADA` de forma genérica para no revelar conversaciones ajenas.
- Usar permisos visuales únicamente para UX; dejar la autorización final al backend.
- No solicitar conversaciones ajenas para ocultarlas después en cliente.
- Conservar en el historial la identidad recibida de participantes o remitentes inactivos.

No permitir editar o eliminar mensajes, eliminar conversaciones ni quitar participantes: esas operaciones no existen en el MVP.

## 4. Implementar el listado

- Consumir `GET /conversaciones` con paginación backend.
- Enviar únicamente filtros soportados: búsqueda, asunto, paciente, archivada, solo no leídas, orden y paginación.
- Volver a la primera página cuando cambien filtros relevantes.
- Mostrar título, asunto, participantes resumidos, paciente opcional, fecha del último mensaje, preview seguro, no leídos y estado archivado.
- Usar el preview limitado recibido; no derivar otro desde un cuerpo completo.
- Diferenciar loading, refreshing, empty, error y retry.
- Cancelar consultas obsoletas y descartar respuestas pertenecientes a filtros o sesiones anteriores.
- Mantener selección válida al refrescar y retirarla si deja de pertenecer al resultado actual.

Renderizar el badge con texto o nombre accesible; no comunicar no leídos solo mediante color.

## 5. Crear una conversación

Enviar mediante `POST /conversaciones`:

- `asuntoId` activo;
- `pacienteId` activo o `null`;
- `titulo` de hasta 200 caracteres;
- `participanteIds` sin duplicados y con al menos otro usuario activo;
- `mensajeInicial` en texto plano, entre 1 y 4.000 caracteres después de recortar extremos.

- Buscar destinatarios por nombre mediante el selector mínimo autorizado.
- Permitir uno o varios destinatarios y excluir al creador y selecciones duplicadas.
- No limitar destinatarios por rol, acceso al módulo Usuarios o vínculo con el paciente.
- No exigir vínculo con el paciente, pero impedir seleccionar uno inactivo para una conversación nueva.
- Conservar todos los campos y el mensaje inicial ante error.
- Deshabilitar doble envío y actualizar UI solo con la respuesta `201` confirmada.
- Tras éxito, incorporar la conversación devuelta, seleccionarla y sincronizar lista y contador afectados.

No crear grupos, adjuntos, email, WhatsApp, push ni contactos externos fuera del contrato.

## 6. Cargar detalle e historial

Al abrir una conversación:

1. Consultar `GET /conversaciones/:id`.
2. Esperar la verificación de participación del backend.
3. Consultar `GET /conversaciones/:id/mensajes` con cursor.
4. Ordenar visualmente de más antiguo a más reciente sin romper el cursor estable recibido.
5. Renderizar el historial autorizado.
6. Avanzar lectura hasta el último mensaje realmente abierto.
7. Sincronizar lista y contador global después de confirmar la lectura.

- Cargar mensajes anteriores por cursor con `beforeCreatedAt` y `beforeId`; no renderizar historiales ilimitados de una vez.
- Insertar páginas antiguas sin duplicar mensajes ni mover inesperadamente el scroll.
- Cancelar detalle e historial obsoletos al cambiar rápido de conversación.
- No precargar cuerpos de conversaciones que la persona no abrió.
- No marcar como leído por hover, foco de una fila o visibilidad parcial en el listado.

## 7. Avanzar el estado de lectura

- Enviar el último mensaje visible y abierto mediante `PATCH /conversaciones/:id/leida`.
- No reducir contadores antes de confirmar cuando no exista una reversión fiable.
- Mantener el puntero monotónico; nunca enviar un mensaje anterior al ya confirmado.
- Evitar solicitudes repetidas para el mismo `ultimoMensajeLeidoId`.
- Manejar `LECTURA_NO_PUEDE_RETROCEDER` refrescando el detalle en vez de forzar estado local.
- Actualizar `noLeidos`, resumen de topbar y fila de lista con la respuesta confirmada.

El contador agregado representa conversaciones con al menos un mensaje no leído, no la cantidad total de mensajes.

## 8. Enviar mensajes sin perder el borrador

- Aceptar únicamente texto plano no vacío de 1 a 4.000 caracteres tras recortar extremos.
- Conservar el valor del textarea mientras `POST /conversaciones/:id/mensajes` está pendiente.
- Deshabilitar el envío duplicado y anunciar `Enviando…` de forma accesible.
- No agregar un mensaje irreversible antes de la confirmación del backend.
- Ante éxito, insertar la proyección devuelta una sola vez, limpiar el textarea y mantener el scroll al final cuando corresponda.
- Ante `404`, `422`, red interrumpida o error inesperado, conservar texto, foco y posibilidad de reintento.
- No reintentar automáticamente un envío: podría duplicarse si el servidor lo procesó y se perdió la respuesta.
- Sincronizar actividad, lista, detalle y resumen de no leídas después del éxito.

Mantener el borrador solo en memoria. Limpiarlo deliberadamente al cerrar la conversación, cambiar de usuario o cerrar sesión; advertir antes de perder texto si la navegación fue accidental.

## 9. Agregar participantes

- Permitir la acción a cualquier participante actual.
- Buscar usuarios activos, excluir participantes existentes y permitir selección múltiple.
- Enviar el lote mediante `POST /conversaciones/:id/participantes`.
- Tratar el lote como atómico: ante `409 PARTICIPANTE_YA_EXISTE`, no asumir que se agregó parcialmente.
- Refrescar encabezado y lista solo tras la respuesta confirmada.
- Explicar que los nuevos participantes podrán acceder al historial completo.
- Confiar en el backend para fijar su punto inicial de lectura en el último mensaje existente.

No implementar remoción de participantes. No contar el historial previo como no leído para una incorporación nueva.

## 10. Archivar de forma individual

- Usar `PATCH /conversaciones/:id/archivar` y `/desarchivar` sin body.
- Tratar ambas operaciones como idempotentes y exclusivas del participante actual.
- No eliminar mensajes, cambiar participantes ni modificar el estado de otros usuarios.
- Actualizar filtros, lista y selección después de confirmar el `204`.
- Mantener una vista o filtro claro de archivadas y una acción explícita para desarchivar.
- No modificar artificialmente `updatedAt` al archivar o desarchivar.
- Respetar el contrato vigente: un mensaje nuevo desarchiva para los receptores, pero no cambia el archivo del remitente.

No presentar archivar como borrar ni solicitar confirmaciones que prometan eliminación.

## 11. Implementar alertas con polling

- Consultar inmediatamente `GET /conversaciones/no-leidas/resumen?limit=5` al montar el panel autenticado.
- Repetir cada 60 segundos únicamente mientras `document.hidden === false`.
- Pausar el intervalo cuando la pestaña quede oculta y refrescar al volver a estar visible.
- Limpiar intervalo, listener y request en curso al desmontar o cerrar sesión.
- Evitar solapar polls; mantener una sola consulta de resumen en vuelo.
- Refrescar también después de leer, enviar, archivar o desarchivar.
- Conservar el último contador confirmado durante un refresh silencioso y mostrar un error no invasivo si falla.
- Representar `count` como cantidad de conversaciones y consumir `items` solo para el resumen autorizado.

El resumen puede mostrar identificador, título, participantes y fecha recibidos. Nunca incluir preview, paciente, contenido ni datos clínicos en topbar, notificaciones o logs.

No introducir WebSocket, Server-Sent Events, notificaciones del sistema operativo, email, WhatsApp ni push en el MVP.

## 12. Diseñar lista y detalle responsive

- En escritorio, usar dos paneles: lista de ancho estable y detalle flexible.
- En celular, mostrar lista o conversación, nunca ambas simultáneamente.
- Proporcionar una acción Volver con nombre accesible y conservar scroll, filtros y posición del listado.
- Mantener encabezado y compositor utilizables sin ocultar el historial.
- Llevar el foco al título del detalle al navegar y devolverlo al elemento correspondiente al volver.
- Permitir operar lista, historial, carga anterior, participantes, archivo y envío con teclado.
- Anunciar mensajes nuevos, errores y cambios de no leídos mediante regiones `aria-live` proporcionadas.
- Evitar invertir el DOM con CSS; conservar un orden cronológico comprensible para tecnologías de asistencia.

## 13. Proteger texto y privacidad

- Renderizar mensajes con interpolación normal de React y `white-space: pre-wrap`.
- No usar `dangerouslySetInnerHTML`, `innerHTML`, Markdown ni editor enriquecido.
- No convertir automáticamente URLs del mensaje en enlaces ejecutables.
- No registrar cuerpos, previews, payloads, respuestas completas, nombres clínicos ni identificadores sensibles.
- No colocar contenido en URLs, analytics, errores, toasts o notificaciones del sistema.
- Limpiar conversación, historial, borradores, errores y requests al cambiar de usuario o cerrar sesión.
- Impedir que respuestas tardías repueblen estado después de logout o cambio de conversación.
- Usar únicamente datos ficticios y mínimos en fixtures y capturas.

Las alertas globales deben revelar lo mínimo; el cuerpo completo solo aparece dentro del detalle autorizado.

## 14. Manejar errores sin filtrar información

- Normalizar errores en la capa HTTP compartida antes de entregarlos a la feature.
- Tratar `401` mediante el flujo de sesión central.
- Tratar `404 CONVERSACION_NO_ENCONTRADA` sin distinguir inexistencia de falta de participación.
- Asociar `422` a campos o texto sin volcar el payload remoto.
- Mostrar `409 PARTICIPANTE_YA_EXISTE` y `LECTURA_NO_PUEDE_RETROCEDER` con recuperación específica.
- Mantener lista utilizable si falla un detalle y mantener detalle utilizable si falla el polling.
- Preservar borradores en cualquier error de creación o envío.
- No reintentar automáticamente mutaciones ni mostrar stack traces.

## 15. Probar escenarios críticos

- Todos los roles crean conversaciones con al menos un destinatario activo.
- Solo participantes listan, abren, leen, responden, agregan y archivan.
- Un rol elevado no participante recibe `404` sin contenido previo.
- Creación conserva campos y primer mensaje ante error o `422`.
- Historial por cursor mantiene orden, no duplica filas y preserva scroll.
- Apertura avanza lectura; hover y selección parcial no lo hacen.
- El puntero de lectura no retrocede y el contador representa conversaciones.
- Envío exitoso limpia texto; error, timeout o respuesta ambigua lo conservan y no reintentan solos.
- Doble submit no crea mensajes duplicados.
- Participante nuevo ve historial sin heredarlo como no leído.
- Lote con participante existente falla sin incorporación parcial.
- Archivado y desarchivado afectan solo al actor; un envío desarchiva solo a receptores según contrato.
- Polling ocurre al montar y cada 60 segundos visible, se pausa oculto y no se solapa.
- El resumen no contiene preview, paciente ni cuerpo.
- Logout cancela polling y limpia contenido sensible.
- Escritorio muestra dos paneles; celular conserva filtros y scroll al alternar vistas.
- Etiquetas HTML se muestran como texto y los saltos de línea permanecen legibles.

Ejecutar lint, pruebas, build y E2E que existan realmente. Usar temporizadores controlados para probar polling y MSW para respuestas, errores y carreras cuando ese stack esté instalado.

## Guardrails

- No conceder acceso por jerarquía de rol.
- No cargar una conversación antes de confirmar participación en backend.
- No editar, eliminar ni renderizar mensajes como HTML.
- No quitar participantes ni eliminar conversaciones.
- No implementar adjuntos o canales externos.
- No almacenar mensajes o borradores de forma persistente.
- No limpiar el compositor antes de confirmar un envío.
- No reintentar mensajes automáticamente.
- No alterar contadores o lectura sin confirmación cuando no exista rollback.
- No incluir contenido sensible en alertas, logs o errores.
- No usar WebSocket ni acortar el intervalo de 60 segundos sin una decisión documentada.

## Entrega esperada

Resumir:

- superficies, hooks y contratos afectados;
- reglas de participación y privacidad aplicadas;
- lectura, contador y sincronización implementados;
- comportamiento de envío y preservación de borrador;
- archivado individual y polling visible;
- estados responsive y accesibles;
- pruebas y verificaciones ejecutadas.
