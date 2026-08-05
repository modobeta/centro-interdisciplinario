---
name: seguridad-y-privacidad-frontend
description: Implementar, modificar o revisar seguridad y privacidad en interfaces React/Vite que manejan pacientes, DNI, tutores, turnos, informes, mensajes, notas internas, usuarios o archivos. Usar cuando una tarea involucre minimización de datos, sesión y tokens, logout, almacenamiento web, caché, logs, payloads, errores, permisos, campos restringidos, HTML de usuario, uploads, previews, descargas, impresión o limpieza de estado sensible.
---

# Seguridad y privacidad frontend

## Objetivo

Reducir la exposición de datos sensibles en el navegador y mantener límites de autorización coherentes con el backend. Tratar las protecciones visuales como UX preventiva, nunca como una barrera de seguridad definitiva.

## 1. Inspeccionar el flujo de datos completo

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Consultar `client/doc/` y el contrato de `api/` para permisos, proyecciones y reglas del recurso.
3. Trazar cada dato desde la respuesta HTTP hasta estado, DOM, formularios, logs, archivos, impresión y limpieza.
4. Identificar roles, permisos por acción, campos restringidos y autoridad final del backend.
5. Revisar cliente HTTP, sesión, store, hooks, modales, mappers, errores y pruebas relacionados.
6. Distinguir archivos vacíos de implementaciones reales; no asumir seguridad por estructura nominal.

Documentar qué datos necesita realmente la pantalla, durante cuánto tiempo y quién puede verlos. Si una respuesta contiene más campos de los necesarios, corregir o registrar el contrato backend además de limitar la presentación.

## 2. Minimizar datos en cada frontera

- Solicitar la proyección y página mínimas necesarias para la acción actual.
- Mantener pacientes, informes, mensajes y directorios dentro de la feature o pantalla que los usa.
- Cargar detalle al seleccionarlo en lugar de precargar historiales completos.
- Usar listados paginados y previews con límites explícitos.
- Mantener `currentUser` con la proyección mínima para navegación y presentación.
- Mantener alertas globales como contadores y actividad segura, no como cuerpos de mensajes.
- Excluir del DOM los campos no autorizados; no basta con ocultarlos mediante CSS o dejarlos deshabilitados.
- Evitar propagar objetos completos cuando un componente solo necesita identificador, nombre y estado.
- Descartar datos obsoletos al cambiar paciente, conversación, informe, rol o filtro de alcance.

No solicitar una proyección administrativa desde el cliente si el usuario no tiene derecho a recibirla. El backend debe decidir y filtrar los campos permitidos.

## 3. Mantener sesión y tokens seguros

- Guardar el access token únicamente en memoria.
- Mantener el refresh token exclusivamente en cookie `HttpOnly` gestionada por el backend.
- Enviar credenciales en las requests privadas mediante el cliente HTTP central.
- No guardar tokens, permisos ni perfiles completos en `localStorage`, `sessionStorage`, IndexedDB, Cache Storage, URL o cookies accesibles desde JavaScript.
- No usar Redux Persist para estado de autenticación o datos sensibles.
- No incluir secretos en variables `VITE_*`; todo valor Vite queda expuesto al bundle del navegador.
- Coordinar un solo refresh ante varios `401` y reintentar cada request elegible una sola vez.
- No enviar tokens en query strings ni construir enlaces que los contengan.
- Tratar el cierre por inactividad como el logout normal, sin confiar en una razón enviada por el cliente.

Persistir únicamente preferencias explícitamente no sensibles, como el sidebar contraído, y mantenerlas separadas de sesión, permisos y datos de dominio.

## 4. Limpiar al cerrar sesión

Ejecutar la limpieza local aunque el endpoint de logout falle:

- eliminar access token, usuario, permisos y razón de sesión;
- vaciar datos de pacientes, informes, mensajes, usuarios y agenda mantenidos en memoria;
- cerrar modales, drawers, menús y formularios sensibles;
- descartar valores y errores de formularios, incluidos borradores;
- abortar lecturas pendientes y evitar que respuestas tardías repueblen el estado;
- detener polling, timers, listeners y suscripciones;
- revocar Object URLs de previews de archivos;
- limpiar caches de aplicación y colas de mutación que contengan payloads;
- redirigir a `/login` con un mensaje no técnico.

Propagar una señal mínima de logout con `BroadcastChannel` cuando esté disponible. No compartir usuario, permisos ni datos clínicos entre pestañas. Cada pestaña que reciba la señal debe ejecutar la misma limpieza local.

## 5. Evitar persistencia y exposición accidental

- No persistir DNI, pacientes, tutores, turnos, informes, mensajes, notas internas ni formularios incompletos.
- No guardar borradores clínicos para recuperación automática.
- No incorporar datos sensibles en parámetros de URL, hash, títulos de página o historial de navegación.
- No insertar payloads en atributos `data-*`, metadatos, analytics ni telemetría.
- No usar notificaciones del sistema operativo para mostrar fragmentos sensibles.
- No copiar datos al portapapeles automáticamente.
- Mantener datos solo mientras la pantalla o sesión los requiera y liberar referencias al cerrar.
- Coordinar con backend cabeceras de caché seguras para respuestas sensibles; no prometer control de caché desde React.

El navegador y sus DevTools pueden observar respuestas ya recibidas. La defensa correcta es solicitar menos datos y hacer cumplir proyecciones en el servidor.

## 6. Controlar logs, errores y diagnósticos

- No registrar tokens, cookies, cabeceras de autorización, DNI, payloads, informes, notas internas ni cuerpos de mensajes.
- No imprimir objetos Axios completos ni respuestas crudas en consola.
- Eliminar `console.log`, logs temporales y debugging antes de entregar.
- Normalizar errores en una estructura segura y traducir códigos técnicos a mensajes de UX.
- No mostrar stack traces, SQL, rutas internas, mensajes crudos del servidor ni contenido enviado por el usuario.
- Mostrar correlation ID solo en fallos inesperados y sin acompañarlo de datos sensibles.
- Mantener errores de validación asociados a campos sin repetir el payload completo.
- Auditar acciones mediante identificadores y metadatos permitidos, nunca mediante contenido clínico o mensajes.

Si un logger central aplica redacción, conservar igualmente la regla de no enviar datos innecesarios: la redacción es una defensa adicional, no una autorización para registrar todo.

## 7. Renderizar contenido de usuario como texto

- Conservar informes y mensajes como texto plano.
- Renderizar texto mediante interpolación normal de React, que escapa caracteres por defecto.
- Preservar saltos de línea con CSS, por ejemplo `white-space`, sin convertir texto a HTML.
- No usar `dangerouslySetInnerHTML` para informes, mensajes, notas, nombres o descripciones provenientes de usuarios.
- No construir HTML mediante concatenación, `innerHTML`, `insertAdjacentHTML` o APIs equivalentes.
- No convertir Markdown o rich text sin una decisión de producto, sanitización robusta y contrato explícito.
- Validar y normalizar enlaces antes de mostrarlos; no transformar texto arbitrario en enlaces ejecutables.
- Restringir protocolos a los esperados y bloquear esquemas como `javascript:`.

Si un caso excepcional requiere HTML, usar una sanitización mantenida y una política de etiquetas mínima, revisada como una superficie de seguridad independiente. No presentar esa excepción como necesaria para el MVP actual.

## 8. Tratar permisos visuales como UX

- Derivar menú, rutas, campos y acciones de permisos explícitos recibidos del backend.
- Separar autenticación, autorización de ruta y autorización de acción.
- Omitir del DOM campos sensibles sin permiso, como notas internas.
- Ocultar o deshabilitar acciones solo para evitar intentos inválidos y explicar el estado cuando sea útil.
- Enviar igualmente cada acción al endpoint autorizado; el backend vuelve a validar identidad, alcance, estado y propiedad.
- Ante `403`, conservar la sesión, retirar datos no autorizados ya cargados y mostrar una denegación segura.
- Ante cambio de permisos o usuario, invalidar navegación, caches y detalles que ya no correspondan.
- No inferir autoridad por jerarquía de rol; usar permisos y reglas específicas.
- No conceder bypass a administración o coordinación sobre informes o conversaciones si el contrato no lo permite.

No considerar protegido un recurso porque el botón, enlace o ruta no aparezca. Probar también acceso directo y rechazo del backend.

## 9. Aplicar reglas por dominio

### Pacientes y turnos

- Mostrar DNI solo a roles y pantallas autorizadas.
- Mantener tutor y paciente dentro del alcance necesario del flujo.
- Separar observación administrativa de notas internas y respetar permisos distintos.
- No realizar borrado físico de información clínica desde el frontend; usar desactivación lógica confirmada.

### Informes

- No persistir borradores localmente ni incluir contenido en logs, toasts o errores.
- Limpiar el modal al cerrar o terminar sesión y advertir antes de descartar cambios.
- Mantener informes finalizados inmutables y de solo lectura.
- Imprimir mediante el diálogo del navegador y CSS de impresión; no crear un PDF persistente si el contrato no lo contempla.

### Mensajería

- Mostrar conversaciones solo a participantes confirmados por backend.
- No asumir acceso global para administración o coordinación.
- Evitar fragmentos sensibles en topbar, notificaciones y contadores globales.
- No renderizar HTML ni permitir edición o borrado de mensajes si el MVP los define inmutables.
- Auditar la acción, nunca el contenido del mensaje.

## 10. Manejar archivos y previews

- Usar rutas relativas devueltas por la API y resolverlas mediante el servicio central de archivos.
- No confiar en nombre, extensión o MIME suministrados por el navegador.
- Validar tipo y tamaño en UI solo como feedback temprano; el backend valida de forma definitiva.
- Enviar uploads mediante endpoints `multipart/form-data` específicos.
- Crear previews con `URL.createObjectURL` y revocarlos al reemplazar archivo, cerrar modal, desmontar o hacer logout.
- No guardar archivos o base64 en Redux, almacenamiento web, logs o fixtures versionadas.
- No interpolar nombres de archivo en HTML ni rutas sin normalización.
- Evitar abrir contenido activo no confiable dentro del origen de la aplicación.
- Para enlaces externos con nueva pestaña, aplicar `noopener` y `noreferrer` según corresponda.

No afirmar que una validación cliente protege el servidor. Revisar también autorización, almacenamiento, MIME, tamaño y respuesta del endpoint backend.

## 11. Evitar carreras que reexpongan datos

- Cancelar consultas al cambiar filtros, recurso o pantalla cuando dejen de ser relevantes.
- Marcar la sesión cerrada antes de esperar la respuesta de logout.
- Ignorar respuestas iniciadas bajo una sesión o selección anterior.
- Evitar que refresh, polling o reintentos continúen después de logout.
- No reintentar automáticamente permisos, validaciones ni conflictos de negocio.
- Mantener una guarda para que una respuesta tardía no reabra modales ni restaure datos limpiados.
- No cancelar mutaciones ya enviadas salvo que el backend soporte semántica segura de cancelación.

## 12. Probar privacidad y autorización

- Verificar que no existan datos sensibles en `localStorage`, `sessionStorage` o Redux persistido.
- Probar limpieza completa en logout exitoso, logout con fallo de red, expiración e inactividad.
- Probar propagación de logout entre pestañas sin compartir datos.
- Probar que varios `401` produzcan un refresh único y que el fallo no repueble estado.
- Probar proyecciones mínimas por rol y ausencia de campos restringidos en DOM.
- Probar acceso directo a rutas y acciones sin permiso, incluyendo respuesta `403`.
- Probar que informes y mensajes con etiquetas se rendericen como texto, no HTML ejecutable.
- Probar que logs, toasts y errores no contengan payloads sensibles.
- Probar creación y revocación de Object URLs.
- Usar fixtures completamente ficticias y evitar screenshots E2E con información real.

Ejecutar lint, pruebas y build disponibles. Informar controles no ejecutados y riesgos que dependan de cambios en backend o cabeceras HTTP.

## Guardrails

- No usar `localStorage` o persistencia equivalente para datos sensibles.
- No exponer payloads, tokens o contenido clínico en consola.
- No renderizar HTML de usuarios ni usar `dangerouslySetInnerHTML` en informes o mensajes.
- No confiar en menú, guards o botones como autorización final.
- No conservar datos sensibles después de logout aunque falle la red.
- No solicitar objetos completos si una proyección mínima resuelve la pantalla.
- No esconder campos restringidos solo con CSS.
- No colocar secretos en `VITE_*`.
- No introducir analytics, píxeles o cookies de seguimiento en el MVP.
- No inventar garantías que solo el backend, el navegador o la infraestructura pueden cumplir.

## Entrega esperada

Resumir:

- datos sensibles y fronteras revisadas;
- minimización y permisos aplicados;
- almacenamiento, logs y renderizado controlados;
- limpieza de sesión y carreras cubiertas;
- archivos, previews e impresión afectados;
- pruebas ejecutadas y responsabilidades pendientes del backend.
