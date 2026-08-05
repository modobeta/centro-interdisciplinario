---
name: axios-api-y-sesion
description: Implementar o corregir consumo HTTP y sesiones en aplicaciones React/Vite con Axios. Usar cuando una tarea involucre apiClient, módulos API, login, logout, logout global, restauración o refresh de sesión, access token en memoria, cookie HttpOnly, interceptores, refresh concurrente único, reintento controlado, AbortController, cancelación de requests o normalización de errores HTTP.
---

# Axios API y Sesión

## Objetivo

Mantener una única frontera HTTP predecible y segura: Axios centralizado, access token solo en memoria, refresh opaco en cookie `HttpOnly`, renovación concurrente coordinada, un único reintento y errores normalizados antes de llegar a la UI.

## 1. Inspeccionar antes de implementar

1. Leer los `AGENTS.md` aplicables, especialmente el general de `client/` y el de autenticación.
2. Revisar `package.json` y confirmar que Axios esté instalado antes de importarlo.
3. Inspeccionar `src/services/apiClient.js`, `authSession.js`, `errorNormalizer.js`, `features/auth/api/authApi.js`, store de auth y una feature API análoga.
4. Consultar el contrato vigente en `api/docs/contrato-api.md` y los documentos de estado, autenticación e integración en `client/doc/`.
5. Confirmar URL base, forma de respuestas, códigos, cookie, CORS y comportamiento de login, refresh y logout.

Los archivos vacíos del scaffold no demuestran que el transporte o la sesión estén implementados. No inventar contratos para completarlos.

## 2. Mantener una sola frontera HTTP

- Crear una única instancia Axios en `src/services/apiClient.js`.
- Leer la URL base desde configuración validada; no repetir hosts ni `/api/v1` en features.
- Centralizar timeout, headers comunes, política de credenciales, inyección del access token e interceptores.
- Mantener la cookie de refresh bajo control del navegador; nunca leerla desde React.
- Hacer que cada `features/<feature>/api/*Api.js` consuma `apiClient` y devuelva datos útiles, no respuestas Axios crudas.
- No importar Axios directamente desde páginas, componentes o hooks.
- No crear un cliente “público” y otro “privado” si la arquitectura confirma una instancia única. Las rutas públicas no deben disparar refresh ni requerir estado de sesión.

## 3. Separar responsabilidades

| Archivo o capa | Responsabilidad | Evitar |
|---|---|---|
| `apiClient.js` | Instancia, interceptores, replay y transporte | Redux, toasts, navegación visual |
| `authSession.js` | Leer, escribir y limpiar access token en memoria | `localStorage`, cookies manuales, lógica de UI |
| `errorNormalizer.js` | Convertir fallos Axios/API a un contrato estable | Mostrar mensajes crudos del backend |
| `authApi.js` | Login, refresh, logout y logout de todas las sesiones | Estado React, redirects, formularios |
| Hooks de feature | Carga, mutación, cancelación y estados visibles | Interceptores o URLs repetidas |
| Store de auth | Identidad, permisos y estado de sesión | Refresh token o persistencia del access token |

Evitar dependencias circulares entre `apiClient`, `authApi`, store y router. Exponer callbacks o una API mínima de sesión cuando el transporte necesite notificar renovación o cierre.

## 4. Gestionar el estado de sesión

- Conservar el access token únicamente en memoria mediante una interfaz pequeña: obtener, establecer y limpiar.
- Mantener usuario, permisos y estado de inicialización separados del token cuando facilite el diseño.
- No usar Redux Persist, `localStorage` ni `sessionStorage` para tokens, DNI, permisos o perfiles completos.
- Al iniciar la aplicación, restaurar contexto mediante el endpoint de refresh antes de decidir rutas privadas.
- Actualizar token, usuario y permisos de forma coherente después de login o refresh.
- Limpiar token, identidad, permisos, caches sensibles y timers al finalizar sesión.
- Propagar logout entre pestañas con `BroadcastChannel` cuando esté disponible, sin transmitir tokens ni contenido sensible.

## 5. Implementar login, refresh y logout

### Login

- Enviar correo y DNI únicamente al endpoint documentado.
- Permitir que el navegador reciba la cookie `HttpOnly` mediante la política de credenciales configurada.
- Extraer `accessToken`, `user` y `permissions` de la envoltura contractual.
- Usar mensajes genéricos para credenciales inválidas y manejar `429` sin revelar si el usuario existe.

### Refresh

- Enviar `POST /auth/refresh` sin access token obligatorio ni refresh token en body, query o header.
- Marcar la solicitud para que un `401` del propio refresh no vuelva a iniciar refresh.
- Reemplazar en memoria el access token y el contexto devueltos.
- Tratar refresh inválido, expirado, reutilizado, usuario inactivo o sesión revocada como cierre de sesión.

### Logout

- Intentar `POST /auth/logout` para revocar la sesión y limpiar la cookie.
- Limpiar siempre el estado local en `finally`, aunque la red o el servidor fallen.
- Implementar logout de todas las sesiones únicamente mediante el endpoint específico confirmado.
- Ejecutar una sola transición local a sesión anónima y evitar redirects repetidos desde requests concurrentes.

## 6. Coordinar un refresh concurrente único

Mantener una única promesa compartida de refresh:

```text
401 A ─┐
401 B ─┼─→ refreshPromise ─→ un POST /auth/refresh
401 C ─┘                      ├─ éxito: replay individual una vez
                              └─ fallo: limpieza y logout local únicos
```

Para cada respuesta `401` elegible:

1. Excluir login, refresh, logout y requests marcadas para omitir renovación.
2. Excluir requests cuyo error represente una sesión que no debe renovarse según el contrato.
3. Marcar la configuración original con `_retry` o un flag equivalente antes de esperar.
4. Crear `refreshPromise` solo cuando no exista una activa.
5. Esperar la misma promesa desde todas las requests concurrentes.
6. En éxito, actualizar el token y reejecutar cada request original una sola vez.
7. En fallo, limpiar sesión una sola vez y rechazar todas las requests en espera.
8. Liberar `refreshPromise` en `finally` para permitir una renovación futura.

Antes del replay, comprobar que la request original no haya sido cancelada y que siga existiendo una sesión válida. Nunca crear ciclos infinitos de `401 → refresh → replay`.

## 7. Definir elegibilidad y reintentos

- Reintentar automáticamente solo la request original después de un refresh exitoso.
- No refrescar ante `403`, `404`, `409`, `422` o `429`.
- No reintentar automáticamente validaciones, permisos, conflictos o rate limits.
- No agregar retries generales de red sin una política explícita de idempotencia y experiencia de usuario.
- Para lecturas públicas, preferir reintento manual; un fallo parcial no debe bloquear contenido independiente.
- No repetir mutaciones automáticamente si existe riesgo de duplicar una operación.

## 8. Cancelar solicitudes correctamente

- Usar `AbortController` y pasar `signal` desde hooks o flujos dueños de la solicitud.
- Cancelar una búsqueda anterior cuando cambie el término o rango relevante.
- Cancelar lecturas al desmontar o reemplazar la pantalla para evitar actualizaciones tardías.
- Tratar cancelación como estado silencioso: no mostrar toast ni error genérico.
- Verificar `signal.aborted` antes de aplicar respuesta, error o replay posterior al refresh.
- No cancelar mutaciones una vez enviadas salvo que el backend soporte explícitamente esa semántica.
- No reutilizar un controller abortado ni compartir uno global entre requests independientes.

## 9. Normalizar errores

Entregar a la aplicación un contrato estable, por ejemplo:

```text
status
code
message
details
fieldErrors
retryable
canceled
```

- Extraer primero la envoltura contractual `error` del backend.
- Traducir códigos conocidos a textos seguros de UX; no depender exclusivamente de `error.message` crudo.
- Conservar `status` y `code` para decisiones de flujo sin filtrar stacks, SQL, headers o cuerpos sensibles.
- Convertir detalles `422` a errores de campo sin perder un resumen general.
- Representar `409` como conflicto de negocio y `403` como denegación sin cerrar sesión.
- Distinguir timeout, red sin respuesta y cancelación.
- Marcar `retryable` solo para fallos realmente transitorios y operaciones seguras.
- No incluir access tokens, cookies, DNI, mensajes ni contenido clínico en logs o telemetría.

## 10. Mantener datos y URLs fuera del transporte

- Usar `fileUrl.js` para resolver rutas relativas de imágenes con la URL base configurada.
- No convertir rutas de archivos dentro de interceptores genéricos.
- Mantener mappers de payload y respuesta en la feature cuando sean específicos del dominio.
- Preservar `camelCase` en el frontend y adaptar formas únicamente en fronteras explícitas.
- No permitir que filtros enviados por el cliente amplíen el alcance autorizado.

## 11. Probar los casos críticos

- Login exitoso, credenciales inválidas, rate limit y error de red.
- Restauración de sesión al arrancar.
- Inyección del header Bearer solo cuando existe token.
- Tres `401` simultáneos producen un único refresh y tres replays como máximo.
- Cada request original se reintenta una sola vez.
- El propio refresh nunca entra en el interceptor de renovación.
- Refresh exitoso actualiza token, usuario y permisos.
- Refresh fallido limpia una sola vez y rechaza la cola completa.
- `403`, `409`, `422` y `429` no disparan refresh.
- Logout limpia estado aunque falle el endpoint y se propaga entre pestañas cuando corresponda.
- Abort al desmontar, nueva búsqueda y request cancelada mientras espera refresh.
- El normalizador produce contratos estables sin datos sensibles.
- Ejecutar lint, pruebas y build existentes; informar cualquier verificación no disponible.

## Guardrails

- No almacenar tokens o credenciales en almacenamiento web.
- No leer, copiar ni exponer la cookie `HttpOnly`.
- No crear múltiples instancias Axios ni interceptores por feature.
- No navegar, mostrar toasts o importar componentes desde la capa de transporte.
- No refrescar indiscriminadamente cualquier `401`.
- No reintentar una mutación de forma automática sin garantía de idempotencia.
- No ocultar fallos de refresh ni dejar requests esperando indefinidamente.
- No cambiar endpoints, cookies, códigos o envolturas sin actualizar contrato y pruebas.
- No asumir que Axios está disponible solo porque existe `apiClient.js` vacío.

## Entrega esperada

Resumir:

- frontera HTTP y archivos afectados;
- ciclo de login, refresh y logout;
- estrategia de concurrencia, replay y cancelación;
- contrato de errores normalizados;
- pruebas y verificaciones ejecutadas;
- limitaciones o decisiones pendientes.
