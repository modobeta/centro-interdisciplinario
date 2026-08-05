# Estado, autenticación e integración API — Frontend privado MVP

---

## 1. Objetivo

Definir cómo se administra la sesión, qué información vive en Redux, cómo se consumen los endpoints y cómo se manejan renovación, errores, inactividad y concurrencia.

---

## 2. Estado global

### 2.1 Store

```text
auth
messages
ui
```

No se crean slices por cada entidad si la información solo se usa en una pantalla.

### 2.2 `authSlice`

```js
{
  status: 'idle' | 'checking' | 'authenticated' | 'unauthenticated',
  currentUser: null,
  accessToken: null,
  permissions: [],
  sessionReason: null
}
```

`currentUser` contiene únicamente la proyección necesaria para navegación y presentación.

### 2.3 `messagesSlice`

```js
{
  unreadCount: 0,
  recentActivity: [],
  lastUpdatedAt: null
}
```

No almacena el historial completo de conversaciones.

### 2.4 `uiSlice`

```js
{
  sidebarCollapsed: false,
  toasts: [],
  globalBusyReason: null
}
```

El estado del sidebar puede persistirse como preferencia no sensible. Ningún dato clínico se persiste.

---

## 3. Estado de páginas

Cada feature puede usar un hook local con:

```js
{
  data,
  isLoading,
  error,
  pagination,
  filters
}
```

No se crea un store global de pacientes o informes. Después de una mutación:

- se actualiza el registro local cuando es seguro;
- o se vuelve a consultar el listado;
- o se invalida el preview del resumen.

---

## 4. Inicio de sesión

### 4.1 Request

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "usuario@centro.test",
  "dni": "12345678"
}
```

### 4.2 Respuesta esperada

```json
{
  "data": {
    "accessToken": "...",
    "user": {
      "id": "uuid",
      "nombre": "Valentina",
      "apellido": "Ríos",
      "rol": "profesional",
      "titulo": "Licenciada en Psicopedagogía",
      "funcion": "Psicopedagoga clínica",
      "fotoUrl": "/uploads/usuarios/archivo.webp"
    },
    "permissions": [
      "patients.readLinked",
      "appointments.manageOwn",
      "reports.createLinked"
    ]
  }
}
```

El refresh token no aparece en el body; queda en cookie HttpOnly.

---

## 5. Recuperación de sesión

Al montar la aplicación:

```text
status = checking
→ POST /auth/refresh
→ si funciona: authenticated
→ si no hay sesión: unauthenticated
```

No se muestra brevemente el panel antes de saber el estado.

---

## 6. Axios

### 6.1 Instancia

```js
const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 15000,
});
```

### 6.2 Request interceptor

Agrega access token si existe.

### 6.3 Response interceptor

- normaliza errores;
- intenta refresh ante `401` elegible;
- no refresca login/refresh/logout;
- reintenta la solicitud original una vez;
- cierra sesión si refresh falla.

---

## 7. Cola de refresh

Debe existir una única promesa compartida:

```text
401 A ─┐
401 B ─┼→ un solo POST /auth/refresh
401 C ─┘
       ├→ éxito: reintentar A, B y C
       └→ fallo: logout local único
```

Cada request se marca con `_retry` para evitar loops.

---

## 8. Logout

### 8.1 Manual

```http
POST /api/v1/auth/logout
```

Después, aunque la red falle:

- se limpia access token;
- se limpia usuario;
- se limpian datos locales sensibles;
- se cierran modales;
- se redirige a `/login`.

Si la API no respondió, se muestra un aviso no técnico, pero la sesión del navegador se considera cerrada.

### 8.2 Por inactividad

Mismo endpoint, con razón local `idle_timeout` para el mensaje de UX. El backend no necesita confiar en esa razón.

### 8.3 Todas las sesiones

Solo se usa en operaciones administrativas específicas del backend, como restablecimiento o desactivación. No es una acción del usuario común.

---

## 9. Inactividad

### 9.1 Temporización

```text
30 minutos sin actividad útil
→ advertencia
5 minutos adicionales
→ logout
```

### 9.2 Actividad válida

- clic;
- teclado;
- navegación;
- submit;
- interacción táctil.

No se cuenta el movimiento continuo del mouse.

### 9.3 Advertencia

El diálogo muestra cuenta regresiva aproximada y acciones:

- Continuar sesión;
- Cerrar sesión.

Continuar puede solicitar refresh si el access token está próximo a vencer.

### 9.4 Varias pestañas

Para el MVP, la señal de logout se comparte mediante `BroadcastChannel` cuando esté disponible. Si una pestaña cierra sesión, las otras limpian su estado.

No se comparten datos clínicos entre pestañas.

---

## 10. Alertas de mensajes

No se implementan WebSockets.

Estrategia MVP:

- consultar contador al entrar al panel;
- consultar cada 60 segundos mientras la pestaña está visible;
- pausar polling cuando `document.hidden=true`;
- refrescar después de enviar, leer o archivar;
- no mostrar contenido sensible en notificaciones del sistema operativo.

Endpoint recomendado:

```http
GET /api/v1/conversaciones/no-leidas/resumen?limit=5
```

---

## 11. Resumen operativo

Endpoint agregado recomendado:

```http
GET /api/v1/resumen
```

La respuesta es role-aware y contiene solo contadores autorizados:

```json
{
  "data": {
    "cards": [
      { "key": "patients", "label": "Pacientes activos", "count": 18 },
      { "key": "appointmentsToday", "label": "Turnos de hoy", "count": 7 }
    ]
  }
}
```

Los previews usan endpoints existentes con `limit=5`. Esto evita un payload enorme y permite cargar el detalle al seleccionar tarjeta.

---

## 12. Listados y query params

### 12.1 Convención

```text
page=1
limit=20
search=texto
sort=apellido
order=asc
```

Los filtros se agregan según recurso.

### 12.2 Pacientes

```http
GET /pacientes?page=1&limit=20&search=juan&activo=true&prestadorId=...
```

### 12.3 Informes

```http
GET /informes?page=1&limit=20&estado=borrador&pacienteId=...
```

### 12.4 Auditoría

```http
GET /auditoria?page=1&limit=20&desde=...&hasta=...&accion=...
```

---

## 13. Agenda por intervalo

```http
GET /turnos?desde=2026-08-03T00:00:00-03:00&hasta=2026-08-10T00:00:00-03:00&prestadorId=...
```

Reglas:

- `hasta` exclusivo;
- solo rango visible;
- profesional no puede forzar otro prestador;
- backend ignora o rechaza filtros no autorizados;
- eventos devuelven `inicioAt`, `finAt`, estado y proyección necesaria.

---

## 14. Errores normalizados

Objeto interno:

```js
{
  status,
  code,
  message,
  fields,
  correlationId,
  retryable
}
```

### 14.1 Mensajes

El normalizador traduce códigos técnicos a textos de UX. No usa el mensaje crudo como única fuente.

### 14.2 Correlation ID

Puede mostrarse en errores inesperados:

```text
Código de referencia: abc-123
```

No se muestra en validaciones comunes.

---

## 15. Cancelación de requests

Los listados con búsqueda pueden usar `AbortController`:

- nueva búsqueda cancela anterior;
- desmontar página cancela consulta;
- una cancelación no genera toast de error.

Las mutaciones no se cancelan una vez enviadas salvo soporte explícito del backend.

---

## 16. Archivos

### 16.1 URL

La API devuelve ruta relativa. El frontend construye URL con `VITE_FILES_URL`.

### 16.2 Carga

Fotografías e imágenes se envían por `multipart/form-data` a endpoints específicos.

### 16.3 Seguridad

- validar extensión y tamaño en UI;
- backend valida realmente;
- preview usa URL local temporal revocada después;
- no guardar base64 en Redux.

---

## 17. Caché y revalidación

Sin RTK Query, la estrategia es explícita:

- catálogos activos pueden mantenerse en memoria de feature durante la sesión;
- directorios de selectores se vuelven a cargar al abrir un modal si están obsoletos;
- después de crear/editar se actualiza o recarga;
- no se cachean informes completos ni mensajes en almacenamiento persistente;
- navegar hacia atrás puede conservar el listado mientras la página siga montada.

---

## 18. Seguridad de campos

El frontend no solicita deliberadamente campos que el rol no utiliza.

Ejemplos:

- directorio para coordinación/secretaría sin DNI;
- selector de destinatarios sin correo de acceso;
- evento de agenda sin notas internas para admin/secretaría;
- conversación sin participantes ajenos;
- auditoría sin contenido clínico.

---

## 19. MSW

Los mocks representan el contrato real:

- éxito;
- validación;
- conflicto;
- permiso;
- expiración;
- rate limit;
- servidor caído.

No se usan respuestas ideales únicamente. Cada feature debe probar al menos un error de negocio.

---

## 20. Criterios de aceptación

- Nunca hay más de un refresh concurrente.
- Los tokens no persisten.
- El polling se pausa en pestaña oculta.
- Logout se propaga entre pestañas cuando sea posible.
- Los listados usan paginación backend.
- La agenda consulta intervalos.
- Los errores tienen correlation ID cuando corresponde.
- Los datos del rol se obtienen desde backend, no se infieren solo por menú.
