# AGENTS.md — Servicios

## Alcance

Aplica al catálogo de servicios, su imagen y las consultas internas necesarias
para validar turnos.

## Fuentes normativas

El contrato gobierna administración y proyecciones, la matriz gobierna acciones
y campos, y el modelo gobierna estado, orden, relaciones e integridad. Este
archivo no amplía el catálogo.

## Guardrails

- Estado operativo y visibilidad pública son atributos independientes.
- El orden público es no negativo.
- Cualquier servicio activo puede utilizarse en un turno; las asignaciones
  habituales del prestador solo ayudan a la UX.
- Desactivar se bloquea cuando el servicio participa en turnos futuros activos.
- Las relaciones habituales con prestadores se administran desde Usuarios.
- Carga, reemplazo y eliminación de imagen usan operaciones separadas y la
  compensación de filesystem definida por arquitectura.
- No exponer rutas físicas ni confiar en nombres o MIME enviados por el cliente.
- No crear subcatálogos, duraciones por servicio ni reglas de facturación.

## Procedimiento y verificación

1. Aplicar policy y validación antes de cambiar catálogo o imagen.
2. Bloquear el servicio y los recursos relacionados antes de desactivarlo.
3. Mantener cambio de datos y auditoría en la misma transacción.
4. Probar independencia entre activo y visible públicamente.
5. Probar orden no negativo y conflictos de nombre normalizado.
6. Probar compensación de archivos ante fallos de PostgreSQL y de limpieza.

## Deuda no bloqueante

El storage productivo y la caché pública pueden evolucionar detrás de las
abstracciones aprobadas sin cambiar este dominio.
