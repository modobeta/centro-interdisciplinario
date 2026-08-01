# AGENTS.md — Usuarios

## Alcance

Aplica al módulo usuarios, incluida la administración de cuentas, roles,
proyección pública y asignaciones habituales de servicios.

## Fuentes normativas

El contrato gobierna entradas y proyecciones; la matriz gobierna campos y
acciones; el modelo gobierna integridad y ciclos de vida. Este archivo solo
define guardrails de implementación.

## Guardrails

- Ningún actor modifica su propio usuario mediante operaciones administrativas.
- Impedir desactivar o degradar al último administrador mediante una operación
  serializada común.
- Cambiar un prestador a un rol no prestador cierra sus vínculos activos,
  elimina asignaciones habituales vigentes y bloquea sus borradores sin
  reasignarlos.
- Desactivar un prestador se bloquea cuando existen turnos futuros activos.
- Mantener independencia entre estado operativo y visibilidad pública.
- Usar únicamente los nombres públicos y proyecciones definidos en el contrato.
- No exponer DNI, hashes, datos de sesión ni campos administrativos en selectores
  o directorios.
- Las asignaciones habituales no limitan los servicios activos permitidos en un
  turno.

## Procedimiento y verificación

1. Evaluar rol actual, rol destino, estado y relaciones afectadas.
2. Bloquear la protección del último administrador antes de mutar.
3. Ejecutar el cambio de rol y sus cierres derivados en una sola transacción.
4. Verificar proyecciones administrativas, selectoras y públicas por separado.
5. Probar cambios concurrentes sobre administradores y prestadores.
6. Confirmar revocación efectiva de acceso mediante la consulta de sesión.

## Deuda no bloqueante

El proveedor definitivo de imágenes puede cambiar detrás de la abstracción de
storage; no modificar por ello las proyecciones ni reglas del módulo.
