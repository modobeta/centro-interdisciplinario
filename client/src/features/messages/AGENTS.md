# Instrucciones de mensajería

## Alcance

Estas reglas aplican a `src/features/messages/` y complementan `client/AGENTS.md`. La mensajería es interna y privada; no debe confundirse con contacto público ni notificaciones externas.

## Reglas de acceso

- Solo los participantes pueden listar, abrir y leer una conversación.
- Administración y coordinación no obtienen visibilidad global por su rol.
- El frontend no debe solicitar ni conservar conversaciones ajenas para luego ocultarlas visualmente.
- La creación de conversaciones debe limitar participantes y contexto según el contrato y los permisos del backend.
- No agregar adjuntos, mensajes externos, email, WhatsApp, push ni conversaciones grupales fuera del alcance confirmado.
- Archivar una conversación no elimina sus mensajes ni la hace accesible a terceros.

## Diseño responsive

- En escritorio usar dos paneles: lista de conversaciones y detalle seleccionado.
- En móvil mostrar una vista por vez y proporcionar una acción clara para volver a la lista.
- `ConversationList` mantiene búsqueda, estados de carga y selección sin asumir que siempre existe una conversación activa.
- `ConversationItem` muestra participante, resumen seguro, fecha y estado no leído sin exponer más contenido del necesario.
- `ConversationDetail` conserva encabezado y contexto mientras `MessageList` maneja la secuencia de mensajes.
- El orden visual y de tabulación debe seguir el orden cronológico y permitir uso completo con teclado.

## Lectura, envío y no leídos

- Cargar mensajes únicamente después de seleccionar una conversación autorizada.
- Marcar como leído según el contrato confirmado; no reducir el contador antes de conocer el resultado si no existe reversión.
- `useUnreadConversations` consume el resumen de no leídas sin descargar todas las conversaciones.
- Después de leer o enviar, sincronizar lista, detalle, contador de topbar y resumen operativo afectados.
- `MessageComposer` evita mensajes vacíos, envíos duplicados y pérdida silenciosa del borrador ante errores.
- No usar HTML sin sanitización para representar mensajes. Preferir texto plano preservando saltos de línea seguros.
- Mantener paginación o carga incremental cuando el contrato la ofrezca; no renderizar historiales ilimitados de una vez.

## Estado y privacidad

- Diferenciar lista vacía, conversación sin mensajes, carga, error de lista, error de detalle y error de envío.
- Cancelar consultas obsoletas al cambiar rápidamente de conversación.
- No almacenar cuerpos de mensajes en almacenamiento persistente del navegador.
- No incluir cuerpos completos en notificaciones, logs, URLs, analytics ni mensajes de error.
- Limpiar conversación seleccionada y borradores al cambiar de usuario o cerrar sesión.
- Las alertas de mensajes deben revelar solo la información mínima necesaria.

## Pruebas críticas

- Listado limitado a conversaciones del participante.
- Apertura y lectura de una conversación autorizada.
- Rechazo `403` sin filtrar contenido previo.
- Creación de conversación con participantes permitidos.
- Envío exitoso, mensaje vacío, doble envío y error de red.
- Actualización coherente de no leídos.
- Archivado sin borrado de historial.
- Escritorio con dos paneles y móvil con navegación lista/detalle.
- Limpieza de contenido al cerrar sesión.
