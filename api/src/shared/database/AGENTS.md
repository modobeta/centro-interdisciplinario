# AGENTS.md — Persistencia compartida

## Alcance

Aplica a src/shared/database/, modelos, asociaciones, migraciones y seeders.

## Fuentes normativas

- api/docs/modelo-datos.md gobierna esquema, índices, constraints y
  transacciones.
- api/docs/arquitectura-backend.md gobierna Sequelize y la organización de la
  infraestructura.
- El contrato y la matriz determinan el comportamiento que la persistencia debe
  sostener, no su estructura interna.

Este archivo especializa api/AGENTS.md y no puede alterar esas fuentes.

## Guardrails

- Las migraciones son la fuente de verdad; no usar sequelize.sync().
- Mantener modelos centralizados, tablas y columnas en snake_case, UUID,
  TIMESTAMPTZ para instantes y DATE para fechas civiles.
- Declarar asociaciones en un único lugar y evitar modelos paralelos en módulos.
- Respaldar en PostgreSQL unicidad, referencias, estados, antisolapamientos y
  punteros que deban ser atómicos.
- Mantener nombres de constraints estables para traducir conflictos sin
  exponerlos por HTTP.
- Compartir la transacción recibida; no abrir una transacción interna cuando el
  service llamador es el dueño.
- Aplicar bloqueos y orden de adquisición exactamente como los define el modelo
  de datos.
- No agregar cascadas destructivas a información histórica.

## Procedimiento y verificación

1. Comparar el cambio con la definición completa de la entidad.
2. Crear una migración reversible y alinear modelo, asociaciones e índices.
3. Verificar datos existentes antes de endurecer un constraint.
4. Probar up y down sobre una base desechable.
5. Probar integridad y concurrencia desde el caso de uso consumidor.
6. Confirmar que listados y filtros documentados poseen índices útiles sin
   duplicar los provistos por constraints.

## Deuda no bloqueante

Retención, particionado y protección física append-only de auditoría pueden
evolucionar por una iniciativa propia. No agregar triggers, jobs ni particiones
como efecto lateral de otro cambio.
