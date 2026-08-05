# Informe de validación cruzada — Frontend privado MVP

**Versión:** 1.0  
**Fecha:** 2026-07-30  
**Resultado general:** APTO CON AJUSTES BACKEND DOCUMENTADOS

---

## 1. Alcance de la validación

Se contrastaron:

- arquitectura backend v3;
- modelo de datos backend v3;
- contrato API backend v3;
- matriz de permisos y auditoría;
- plan backend;
- documentación del frontend público;
- decisiones confirmadas durante el diseño del frontend privado;
- documentos privados 01 a 09.

La validación revisó:

- roles y permisos;
- alcance de datos;
- servicios y turnos;
- pacientes y tutor;
- informes;
- mensajería;
- autenticación;
- rutas;
- estados;
- uploads;
- paginación;
- consistencia documental.

---

## 2. Contradicciones detectadas y resolución

### VAL-001 — Servicio asignado al prestador

**Contradicción:** backend v3 exigía servicio previamente asignado; decisión privada permite cualquier servicio activo.

**Resolución:** prevalece servicio activo. `usuarios_servicios` queda informativa. Documentado en `08`.

**Estado:** RESUELTA.

### VAL-002 — Permiso para gestionar servicios habituales

**Contradicción:** backend v3 permitía a cualquier autenticado; frontend confirma admin/coordinación/secretaría.

**Resolución:** se restringe la gestión. Profesional no ve módulo.

**Estado:** RESUELTA.

### VAL-003 — Endpoint de reprogramación listado accidentalmente

**Contradicción:** algunas secciones del contrato v3 listaban `PATCH /turnos/:id/reprogramar`, aunque la regla funcional lo prohibía.

**Resolución:** no existe endpoint. Cancelar + crear nuevo.

**Estado:** RESUELTA POR PRECEDENCIA; requiere limpiar backend v4.

### VAL-004 — Dashboard por rol

**Contradicción:** propuesta previa de dashboards diferentes.

**Resolución:** un único Resumen con tarjetas por rol.

**Estado:** RESUELTA.

### VAL-005 — Familias/Tutores como módulo

**Contradicción:** referencia visual externa separaba familias/niños.

**Resolución:** solo Pacientes; tutor dentro de ficha y formulario.

**Estado:** RESUELTA.

### VAL-006 — Visibilidad de profesionales y servicios

**Contradicción:** profesional no ve módulos, pero necesita destinatarios y servicio para turno.

**Resolución:** selectores mínimos específicos. No se concede acceso al módulo.

**Estado:** RESUELTA.

### VAL-007 — Administrador e informes

**Riesgo:** interpretar rol superior como escritura total.

**Resolución:** admin y secretaría solo lectura; coordinación/profesional crean según scope.

**Estado:** CONSISTENTE.

### VAL-008 — Conversaciones y roles elevados

**Riesgo:** admin/coordinación vean conversaciones ajenas.

**Resolución:** solo participantes, sin bypass.

**Estado:** CONSISTENTE.

### VAL-009 — Notas internas

**Riesgo:** agenda general exponga notas a admin/secretaría.

**Resolución:** proyección por campo; notas internas no se entregan.

**Estado:** RESUELTA.

### VAL-010 — Uploads locales

**Riesgo:** GitHub o despliegue efímero pierda archivos.

**Resolución:** Git ignora archivos dinámicos; producción requiere almacenamiento persistente y backup. Pendiente de proveedor.

**Estado:** RESUELTA PARA DESARROLLO / PENDIENTE PRODUCCIÓN.

---

## 3. Matriz de trazabilidad

| Dominio | Regla backend | Representación frontend | Estado |
|---|---|---|---|
| Auth | email + DNI | Login sin registro/recuperación | OK |
| Sesión | access + refresh cookie | token memoria + refresh Axios | OK |
| Usuarios | admin gestiona | módulo completo solo admin | OK |
| Directorio | activos con proyección | coordinación/secretaría + selector mensajes | OK |
| Paciente | tutor 1:1 | formulario y ficha conjunta | OK |
| Vínculos | permanentes hasta baja | gestión en resumen de paciente | OK |
| Turnos | estados cerrados | acciones contextuales | OK |
| Reprogramación | prohibida | sin drag/editar; cancelar+nuevo | OK |
| Servicio turno | activo | selector de todos activos | AJUSTE BACKEND |
| Informes | autoría/inmutabilidad | modal borrador + vista final | OK |
| Mensajes | participantes | dos paneles y policy | OK |
| Catálogos | admin | pestañas admin | OK |
| Auditoría | admin lectura | tabla + modal | OK |
| Público | visibilidad independiente | administración desde usuario/servicio | OK |

---

## 4. Validación de permisos por módulo

| Caso | Resultado |
|---|---|
| Profesional no ve Usuarios | PASS |
| Profesional no ve Servicios | PASS |
| Profesional selecciona servicio activo en turno | PASS con ajuste backend |
| Secretaría no administra cuentas | PASS |
| Coordinación puede ser prestador | PASS |
| Admin es único en Catálogos/Auditoría | PASS |
| Admin no crea informes | PASS |
| Secretaría lee informe completo | PASS |
| Mensajes solo participantes | PASS |
| Profesional solo pacientes vinculados | PASS |

---

## 5. Validación de rutas

- todas las rutas privadas usan `/app`;
- `/app` redirige a `/app/resumen`;
- rutas administrativas tienen guard;
- detalles dependen de policy backend;
- formularios de alta no requieren rutas propias;
- login está fuera de PrivateLayout;
- Home pública se conserva accesible desde topbar.

**Resultado:** PASS.

---

## 6. Validación de estados

### Turnos

```text
pendiente → confirmado | cancelado
confirmado → completado | ausente | cancelado
```

No existen transiciones inversas ni edición estructural.

### Informes

```text
borrador → finalizado
```

Finalizado inmutable.

### Entidades

Activación/desactivación lógica, sin borrado histórico.

**Resultado:** PASS.

---

## 7. Validación de seguridad del cliente

- refresh token no accesible a React;
- access token no persistido;
- datos clínicos no persistidos;
- sin HTML de usuario;
- cierre por inactividad;
- filtros de UI no equivalen a autorización;
- selectores usan proyecciones mínimas;
- polling sin contenido sensible;
- mensajes de error no exponen backend.

**Resultado:** PASS.

---

## 8. Validación de experiencia responsive

- sidebar drawer;
- agenda Día;
- tablas como tarjetas;
- modales fullscreen;
- mensajería una vista por vez;
- informes editables, aunque se recomienda escritorio;
- sin funciones bloqueadas por dispositivo.

**Resultado:** PASS.

---

## 9. Validación de pruebas

Cobertura planificada:

- unitarias;
- componentes;
- integración MSW;
- E2E Playwright;
- objetivo 80 %;
- flujos críticos por rol.

**Resultado:** PASS DOCUMENTAL. La validación ejecutable corresponde a la implementación.

---

## 10. Pendientes no bloqueantes

- proveedor de producción y volumen de uploads;
- versiones exactas de dependencias al inicializar;
- datos reales del centro;
- URL final API/files;
- prueba de rendimiento con cantidad real;
- revisión legal.

---

## 11. Comprobaciones automatizadas del paquete

El paquete se valida mediante script para verificar:

- archivos requeridos;
- enlaces relativos internos;
- bloques de código balanceados;
- presencia de decisiones críticas;
- ausencia de reglas prohibidas en docs privadas;
- hashes SHA-256.

El resultado exacto de la ejecución se incorpora al final de este documento al empaquetar.

---

## 12. Conclusión

La documentación privada es coherente internamente y con el producto confirmado. Las discrepancias heredadas del backend están identificadas y tienen una única resolución explícita en `08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md`.

El frontend privado puede comenzar a implementarse cuando el contrato backend adopte esos ajustes o los mocks MSW los representen temporalmente.

---

## 13. Resultado automatizado de empaquetado

```text
Comprobaciones ejecutadas: 39
Aprobadas: 39
Fallidas: 0

- archivos requeridos: PASS
- bloques de código balanceados: PASS
- enlaces relativos internos: PASS
- decisiones críticas presentes: PASS
- regla obsoleta de servicio asignado ausente en docs núcleo: PASS
```

El detalle estructurado se incluye en `validation-results.json`.
