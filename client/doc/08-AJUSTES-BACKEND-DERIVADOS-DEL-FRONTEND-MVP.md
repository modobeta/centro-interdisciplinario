# Ajustes del backend derivados del frontend privado — MVP

**Estado:** obligatorio para reconciliar backend v3 con decisiones posteriores  
**Precedencia:** este documento reemplaza únicamente las reglas específicas indicadas

---

## 1. Propósito

Durante la definición del frontend privado se confirmaron comportamientos que modifican o amplían documentos anteriores del backend. Este archivo evita que el equipo implemente el cliente contra contratos desactualizados.

No reescribe toda la arquitectura del backend. Define el delta obligatorio hasta una futura consolidación backend v4.

---

## 2. Contradicción principal: servicio del turno

### 2.1 Regla anterior

Documentos backend v3 indicaban que el servicio seleccionado en un turno debía estar previamente asignado al prestador mediante `usuarios_servicios`.

### 2.2 Regla definitiva

```text
Para crear un turno, el servicio debe estar activo en el catálogo.
No necesita estar asociado previamente al prestador.
```

### 2.3 Significado de `usuarios_servicios`

La relación se conserva para:

- indicar servicios habituales;
- organizar el equipo;
- ordenar primero opciones en formularios;
- mostrar información institucional interna;
- facilitar reportes futuros.

No se utiliza para:

- autorizar la creación de turnos;
- rechazar un servicio activo;
- limitar el selector del profesional.

### 2.4 Validación nueva

Eliminar del service de turnos:

```text
SERVICIO_NO_ASIGNADO
```

Mantener:

```text
SERVICIO_INACTIVO
SERVICIO_NO_ENCONTRADO
```

### 2.5 API

`POST /api/v1/turnos` valida:

1. paciente;
2. prestador;
3. servicio activo;
4. consultorio activo;
5. vínculo/policy;
6. horario;
7. solapamientos.

---

## 3. Permisos de servicios habituales

### 3.1 Regla definitiva

Pueden gestionar `usuarios_servicios`:

- administrador;
- coordinación;
- secretaría.

El profesional:

- no administra asociaciones;
- no tiene módulo Servicios;
- puede seleccionar cualquier servicio activo en su turno.

### 3.2 Contrato

Endpoints existentes pueden mantenerse:

```http
GET    /api/v1/usuarios/:id/servicios
POST   /api/v1/usuarios/:id/servicios
DELETE /api/v1/usuarios/:id/servicios/:servicioId
```

Pero los permisos y errores deben actualizarse. Ya no se bloquea quitar un servicio habitual por turnos futuros, porque la asociación no constituye requisito de agenda. Si se desea conservar esa protección organizativa, debe marcarse explícitamente como política administrativa, no como integridad del turno. Para el MVP se elimina el bloqueo.

---

## 4. Endpoint de Resumen

### 4.1 Nuevo endpoint

```http
GET /api/v1/resumen
```

### 4.2 Respuesta por rol

El backend calcula únicamente tarjetas autorizadas.

```json
{
  "data": {
    "cards": [
      {
        "key": "patients",
        "label": "Pacientes activos",
        "count": 18
      }
    ]
  }
}
```

### 4.3 Reglas

- profesional cuenta pacientes vinculados activos;
- profesional cuenta turnos propios del día;
- profesional cuenta borradores propios;
- roles globales cuentan según acceso;
- admin cuenta auditoría reciente;
- no devolver contenido clínico;
- no permitir que el cliente solicite arbitrariamente otra proyección de rol.

### 4.4 Previews

Se reutilizan endpoints de recursos con `limit=5`. No se sobrecarga `/resumen` con listados completos.

---

## 5. Agenda por intervalo

### 5.1 Query requerida

```http
GET /api/v1/turnos?desde=<ISO>&hasta=<ISO>&prestadorId=<uuid>
```

### 5.2 Semántica

- `desde` inclusivo;
- `hasta` exclusivo;
- rango máximo razonable para el MVP;
- profesional siempre queda limitado a sí mismo;
- admin/coordinación/secretaría pueden consultar todos o uno;
- backend devuelve eventos ordenados por inicio.

### 5.3 Proyección de evento

```json
{
  "id": "uuid",
  "inicioAt": "2026-08-05T10:00:00-03:00",
  "finAt": "2026-08-05T11:00:00-03:00",
  "estado": "pendiente",
  "paciente": {
    "id": "uuid",
    "nombreCompleto": "Juan Pérez"
  },
  "prestador": {
    "id": "uuid",
    "nombreCompleto": "Valentina Ríos"
  },
  "servicio": {
    "id": "uuid",
    "nombre": "Psicopedagogía Clínica"
  },
  "consultorio": {
    "id": "uuid",
    "nombre": "Consultorio 2"
  }
}
```

No incluir notas internas en el listado general.

---

## 6. Acciones explícitas de turnos

Mantener endpoints de acción:

```http
PATCH /api/v1/turnos/:id/confirmar
PATCH /api/v1/turnos/:id/completar
PATCH /api/v1/turnos/:id/ausente
PATCH /api/v1/turnos/:id/cancelar
```

No crear:

```http
PATCH /api/v1/turnos/:id/reprogramar
PUT   /api/v1/turnos/:id
```

La cancelación requiere motivo.

---

## 7. Notas de turnos por campo

La proyección debe respetar:

| Campo | Admin | Coordinación | Secretaría | Prestador responsable |
|---|:---:|:---:|:---:|:---:|
| `observacionAdministrativa` | Sí | Sí | Sí | Sí |
| `notasInternas` | No | Sí | No | Sí |

Un profesional ajeno no recibe el turno completo por policy.

---

## 8. No leídos de mensajería

### 8.1 Endpoint agregado recomendado

```http
GET /api/v1/conversaciones/no-leidas/resumen?limit=5
```

Respuesta:

```json
{
  "data": {
    "count": 3,
    "items": [
      {
        "id": "uuid",
        "titulo": "Seguimiento de Juan",
        "updatedAt": "2026-07-30T18:15:00-03:00",
        "participants": ["Valentina Ríos", "Carla Domínguez"]
      }
    ]
  }
}
```

Evitar incluir fragmentos clínicos en la topbar.

### 8.2 Participante nuevo

Al agregar un participante, su puntero de lectura inicial debe ubicarse en el último mensaje existente o equivalente, para que el historial anterior no aparezca completamente como no leído.

---

## 9. Directorio interno para selectores

El profesional no tiene ruta/módulo Usuarios, pero necesita seleccionar destinatarios.

El backend debe permitir un endpoint/proyección mínima para todos los autenticados:

```http
GET /api/v1/usuarios?projection=selector&activo=true
```

o aplicar automáticamente una proyección equivalente.

Campos:

- id;
- nombre;
- apellido;
- título;
- función;
- foto.

Nunca:

- DNI;
- correo de acceso;
- teléfono personal;
- estado de sesiones.

---

## 10. Paginación y búsqueda

Asegurar soporte uniforme:

```text
page
limit
search
sort
order
```

Recursos con 20 por página:

- pacientes;
- usuarios;
- informes;
- auditoría.

La búsqueda de pacientes debe admitir nombre, apellido y DNI según permisos. Una proyección no administrativa no debe exponer DNI en respuesta aunque se use para encontrar.

---

## 11. Sesión e inactividad

El cierre por inactividad utiliza el logout normal:

```http
POST /api/v1/auth/logout
```

No hace falta un endpoint especial. El backend revoca la sesión asociada al refresh token.

El refresh debe:

- rotar o validar según diseño existente;
- devolver access token, usuario y permisos actuales;
- rechazar usuario inactivo;
- rechazar sesión revocada.

---

## 12. Uploads locales

Se mantienen ajustes del frontend público:

- `api/uploads/usuarios`;
- `api/uploads/servicios`;
- rutas almacenadas en PostgreSQL;
- endpoints multipart separados;
- almacenamiento persistente requerido en producción;
- archivos reales ignorados en Git.

El formulario administrativo puede presentar datos+foto juntos, pero el cliente coordina dos operaciones controladas.

---

## 13. Permisos de informes

Reafirmar:

- administrador: lectura total, no creación;
- secretaría: lectura total, no creación;
- coordinación: crea cualquier paciente, edita/finaliza propios;
- profesional: crea pacientes vinculados, edita/finaliza propios;
- finalizados inmutables;
- lectura auditada.

El backend no debe inferir que el administrador puede escribir por ser rol superior.

---

## 14. Conversaciones

Reafirmar:

- solo participantes;
- sin bypass admin/coordinación;
- paciente opcional;
- paciente inactivo: no nueva conversación asociada;
- conversación existente puede continuar;
- cualquier participante agrega usuarios;
- no se quitan participantes;
- mensajes inmutables.

---

## 15. Imágenes y publicación

Mantener del ajuste público:

### Usuarios

- `foto_url`;
- `funcion_publica`;
- `visible_publicamente`;
- `orden_publico`.

### Servicios

- `imagen_url`;
- `visible_publicamente`;
- `orden_publico`.

`activo` y `visible_publicamente` son independientes.

---

## 16. Auditoría adicional

Registrar, sin contenido sensible:

- consulta de informe;
- cambio de estado de turno;
- cancelación;
- alta automática de vínculo;
- cambios de servicios habituales;
- carga/reemplazo/eliminación de imagen;
- participante agregado;
- restablecimiento de acceso.

No es necesario auditar cada polling del contador de no leídos.

---

## 17. Documentos backend v3 a corregir en futura v4

### `README.md`

Reemplazar permiso de servicios asignados para “cualquier autenticado” por admin/coordinación/secretaría y aclarar que no restringe turnos.

### `02-MODELO-DATOS-Y-REGLAS-MVP.md`

- cambiar propósito de `usuarios_servicios`;
- retirar regla “servicio activo y asignado” en turnos;
- añadir campos públicos de servicios si aún faltan.

### `03-CONTRATO-API-MVP.md`

- retirar `SERVICIO_NO_ASIGNADO` de turnos;
- retirar cualquier endpoint de reprogramación listado accidentalmente;
- añadir `/resumen`;
- añadir agenda por intervalo;
- añadir no leídos resumidos;
- actualizar permisos de asignaciones.

### `04-MATRIZ-PERMISOS-AUDITORIA-MVP.md`

Actualizar servicios habituales y módulo frontend.

### `05-PLAN-IMPLEMENTACION-BACKEND-MVP.md`

Actualizar pruebas de servicio no asignado y dependencia de turnos.

---

## 18. Pruebas backend obligatorias

- profesional crea turno con servicio activo no habitual;
- servicio inactivo falla;
- profesional no modifica servicios habituales;
- coordinación/secretaría sí modifican;
- `/resumen` cambia por rol;
- profesional no fuerza `prestadorId` ajeno;
- agenda respeta rango;
- no leídos solo del participante;
- notas internas no llegan a admin/secretaría;
- no existe reprogramación;
- directorio selector no expone datos sensibles.

---

## 19. Estado de resolución

Con este documento, las contradicciones quedan resueltas por precedencia documental. No deben implementarse simultáneamente la regla vieja y la nueva.
