# Instrucciones de autenticación

## Alcance

Estas reglas aplican a `src/features/auth/` y complementan `client/AGENTS.md`. Este módulo administra identidad y ciclo de sesión; no decide permisos de negocio de otras features.

## Contrato de acceso

- El login utiliza correo electrónico y DNI como credencial del MVP.
- No agregar registro público, recuperación automática de contraseña ni edición del perfil propio.
- No normalizar el DNI de manera que contradiga el contrato del backend; la API es responsable de autenticar la credencial.
- Después de autenticar, conservar en memoria solo la identidad y los permisos necesarios para la interfaz.
- No guardar access token, refresh token, DNI, permisos ni perfil completo en `localStorage` o `sessionStorage`.

## Ciclo de sesión

- El access token es de corta duración y se mantiene en memoria.
- El refresh token debe permanecer exclusivamente en una cookie `HttpOnly` emitida por el backend.
- Recuperar la sesión al iniciar la aplicación antes de decidir si una ruta privada está disponible.
- Enviar `withCredentials` en las operaciones de sesión que dependan de la cookie.
- Coordinar expiraciones simultáneas mediante una sola solicitud de refresh; encolar las peticiones pendientes y reintentarlas una única vez después de una renovación exitosa.
- Si el refresh falla, limpiar el estado en memoria, cancelar reintentos pendientes y llevar al usuario a `/login`.
- El logout debe intentar invalidar la sesión en el backend y limpiar siempre el estado local, incluso si la red falla.

## Inactividad

- Considerar actividad útil la interacción real del usuario; no reiniciar el contador por polling, refresh de token o respuestas automáticas.
- Mostrar advertencia después de 30 minutos sin actividad útil.
- Conceder 5 minutos adicionales antes del cierre automático.
- Permitir continuar la sesión mediante una acción explícita que valide o renueve la sesión.
- Evitar temporizadores duplicados y limpiarlos al cerrar sesión o desmontar el provider.
- Coordinar la expiración entre pestañas sin compartir tokens ni datos sensibles.

## Rutas y permisos

- `GuestRoute` evita mostrar `/login` a una sesión autenticada.
- `ProtectedRoute` comprueba sesión válida, no permisos de módulo.
- `PermissionRoute` y `PermissionGate` consumen permisos emitidos por el backend.
- Durante la restauración inicial de sesión mostrar un estado de carga estable; no producir un parpadeo entre login y panel.
- Un `401` inicia como máximo el flujo de renovación previsto. Un `403` no debe forzar logout: representa falta de permiso.

## Estado y UI

- `authSlice` debe representar al menos inicialización, sesión autenticada y sesión anónima, además del error cuando sea útil.
- `useAuth` expone una API pequeña y estable; los componentes no deben conocer detalles de cookies o interceptores.
- `LoginForm` muestra errores de campos y un mensaje general sin revelar si un correo existe.
- Deshabilitar el envío mientras el login esté pendiente y evitar solicitudes duplicadas.
- `SessionWarningModal` debe ser accesible, bloquear el foco y ofrecer acciones claras para continuar o cerrar sesión.

## Pruebas críticas

- Login exitoso, credenciales inválidas y error de red.
- Restauración de sesión al cargar la aplicación.
- Refresh exitoso con varias solicitudes concurrentes y refresh fallido.
- Diferencia entre `401` y `403`.
- Advertencia a los 30 minutos y cierre 5 minutos después.
- Limpieza de estado y temporizadores al cerrar sesión.
- Ausencia de tokens y datos sensibles en almacenamiento web.
