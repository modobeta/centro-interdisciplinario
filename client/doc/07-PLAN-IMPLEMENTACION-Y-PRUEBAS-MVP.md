# Plan de implementación y pruebas — Frontend privado MVP

---

## 1. Estrategia

El panel se implementará por cortes verticales. Cada etapa debe incluir:

```text
ruta
→ pantalla
→ componentes
→ API
→ permisos
→ loading/empty/error
→ responsive
→ accesibilidad
→ pruebas
```

No se considera terminada una pantalla solo porque renderiza datos exitosos.

---

## 2. Etapa 0 — Bootstrap

### Tareas

- crear Vite React JavaScript;
- configurar alias `@`;
- ESLint y Prettier;
- Vitest y Testing Library;
- MSW;
- Playwright;
- variables de entorno;
- estructura de carpetas;
- scripts de npm;
- CI inicial.

### Scripts

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

### DoD

- build exitoso;
- lint sin errores;
- test smoke;
- `.env.example` documentado;
- PR template disponible.

---

## 3. Etapa 1 — Sistema visual y componentes base

### Tareas

- integrar tokens públicos;
- agregar tokens privados;
- reset/global/private/print CSS;
- Button, Input, Select, Textarea;
- BaseModal, FormModal, ConfirmDialog;
- Toast;
- Skeleton, EmptyState, ErrorState;
- DataTable, Pagination, StatusBadge;
- React Icons centralizados.

### Pruebas

- keyboard/focus;
- variantes;
- dialog accesible;
- toast aria-live;
- responsive básico.

---

## 4. Etapa 2 — Router y layout privado

### Tareas

- `PrivateLayout`;
- sidebar expandido/contraído/drawer;
- topbar;
- rutas lazy;
- 403/404;
- configuración de menú por permisos;
- perfil de solo lectura.

### DoD

- cada rol simulado muestra menú correcto;
- URL manual restringida termina en 403;
- foco y navegación móvil funcionan.

---

## 5. Etapa 3 — Autenticación y sesión

### Tareas

- login correo+DNI;
- authSlice;
- Axios;
- refresh único;
- ProtectedRoute;
- logout;
- BroadcastChannel;
- inactividad 30+5;
- mensajes 401/429.

### Pruebas críticas

- login exitoso/fallido;
- cuenta inactiva;
- refresh concurrente;
- refresh fallido;
- logout en otra pestaña;
- cierre por inactividad;
- no persistencia de token.

---

## 6. Etapa 4 — Resumen

### Tareas

- endpoint `/resumen`;
- tarjetas por rol;
- selección sin cambiar ruta;
- preview Pacientes inicial;
- previews restantes;
- fallos parciales.

### DoD

- máximo seis tarjetas;
- datos autorizados;
- cada preview enlaza al módulo.

---

## 7. Etapa 5 — Pacientes

### Tareas

- listado paginado;
- búsqueda/filtros;
- tabla/tarjetas;
- modal paciente+tutor;
- duplicado no bloqueante;
- edición;
- detalle con cuatro pestañas;
- vínculos;
- activar/desactivar.

### Pruebas

- profesional ve vinculados;
- alta profesional crea vínculo;
- DNI duplicado;
- warning similitud;
- CUD condicionado;
- bloqueo por turnos futuros;
- conversaciones solo participadas.

---

## 8. Etapa 6 — Usuarios, servicios y catálogos

### Usuarios

- directorio limitado para coordinación/secretaría;
- gestión admin;
- foto local;
- cambio DNI y sesiones;
- publicación pública.

### Servicios

- catálogo admin;
- imagen local;
- visibilidad pública;
- servicios habituales;
- profesional sin módulo.

### Catálogos

- consultorios;
- tipos informe;
- categorías conversación.

### Pruebas

- proyecciones por rol;
- admin único gestor;
- asociación habitual no limita turno;
- catálogos inactivos no seleccionables.

---

## 9. Etapa 7 — Agenda

### Tareas

- FullCalendar;
- toolbar propia;
- Día/Semana;
- rango 08–21;
- lunes-sábado;
- filtro prestador;
- clic día/hora;
- modal turno;
- eventos;
- detalle;
- estados;
- cancelación con motivo.

### Pruebas

- rango y timezone;
- fecha/hora precargada;
- servicio activo no habitual;
- conflictos de prestador/paciente/consultorio;
- transiciones;
- notas por rol;
- sin drag/drop.

---

## 10. Etapa 8 — Informes

### Tareas

- listado y filtros;
- modal amplio;
- borrador;
- finalización;
- lectura;
- impresión;
- auditoría de vista.

### Pruebas

- admin/secretaría solo lectura;
- coordinación/profesional crean;
- autoría;
- inmutabilidad;
- CSS print.

---

## 11. Etapa 9 — Mensajería

### Tareas

- lista/detalle;
- nueva conversación;
- respuesta;
- agregar participante;
- no leídos;
- archivado;
- polling 60s;
- alertas topbar.

### Pruebas

- participant policy;
- historial;
- puntero leído;
- participante nuevo;
- archivado individual;
- celular lista/detalle.

---

## 12. Etapa 10 — Auditoría

### Tareas

- filtros;
- paginación;
- tabla;
- detalle modal;
- campos sensibles excluidos.

### Pruebas

- solo admin;
- orden descendente;
- metadatos permitidos;
- sin edición/exportación.

---

## 13. Etapa 11 — Estabilización

- auditoría de accesibilidad;
- responsive real;
- pruebas de rendimiento;
- errores de red;
- sesión lenta;
- doble submit;
- navegación con teclado;
- cobertura;
- revisión de seguridad;
- limpieza de consola;
- build producción.

---

## 14. Estrategia de pruebas

### 14.1 Unitarias

- formatters;
- mappers;
- schemas;
- reducers/selectors;
- permissions;
- error normalizer;
- fechas.

### 14.2 Componentes

- modales;
- formularios;
- tablas;
- filtros;
- estados;
- sidebar;
- agenda wrappers;
- mensajería.

### 14.3 Integración con MSW

- requests reales del cliente;
- respuestas por rol;
- 409/422/403;
- refresh;
- cancelación;
- polling.

### 14.4 E2E Playwright

#### Administrador

```text
login
→ crear usuario
→ crear servicio
→ gestionar catálogo
→ crear turno
→ auditoría
```

#### Profesional

```text
login
→ crear paciente+tutor
→ crear turno con servicio activo
→ confirmar/completar
→ crear/finalizar informe
```

#### Secretaría

```text
login
→ ver pacientes
→ crear turno para prestador
→ cancelar con motivo
→ leer informe
```

#### Mensajería

```text
crear conversación
→ responder con otro usuario
→ agregar participante
→ comprobar no leído
→ archivar
```

---

## 15. Cobertura

Objetivo general mínimo:

```text
80 %
```

Prioridad:

- auth/session;
- permission routing;
- forms;
- appointment state/conflicts;
- report finalization;
- messaging participation;
- idle timeout.

No se fuerza cobertura en archivos declarativos sin lógica.

---

## 16. Git y GitHub

### Ramas

```text
main
feature/auth
feature/patients
feature/agenda
...
```

### Commits

```text
feat: add patient creation modal
fix: prevent duplicate refresh requests
test: cover appointment conflict flow
docs: update private frontend decisions
```

### Pull Request

Debe incluir:

- objetivo;
- capturas desktop/mobile;
- roles probados;
- endpoints;
- pruebas;
- accesibilidad;
- decisiones documentales afectadas.

---

## 17. CI

Pipeline mínimo:

```text
install
→ lint
→ unit/integration tests
→ coverage
→ build
```

Playwright puede ejecutarse en pipeline separado o antes de releases por costo/tiempo.

---

## 18. Definition of Done por feature

Una feature está terminada cuando:

- cumple permisos;
- tiene loading/empty/error;
- funciona desktop/celular;
- es operable por teclado;
- mapea errores backend;
- no filtra datos sensibles;
- tiene pruebas unitarias/integración;
- E2E crítico actualizado;
- documentación actualizada;
- no agrega warnings de consola.

---

## 19. Orden de trabajo recomendado

```text
0 Bootstrap
1 Sistema visual
2 Layout/router
3 Auth/session
4 Resumen
5 Pacientes
6 Usuarios/Servicios/Catálogos
7 Agenda
8 Informes
9 Mensajería
10 Auditoría
11 Estabilización
```

---

## 20. Criterio de cierre del frontend privado MVP

- todos los roles pueden completar sus flujos;
- ningún rol accede visualmente a acciones no autorizadas;
- backend rechaza accesos forzados;
- agenda funciona sin reprogramación;
- pacientes integran tutor;
- informes finalizados son imprimibles e inmutables;
- conversaciones respetan participantes;
- sesión expira correctamente;
- cobertura >= 80 %;
- build y CI aprobados;
- documentación sin contradicciones pendientes críticas.
