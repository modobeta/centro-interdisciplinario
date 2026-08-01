---
name: postgresql-y-sequelize
description: Diseña o modifica modelos, asociaciones, consultas y transacciones Sequelize de esta API. Usar para includes, atributos, filtros, paginación, concurrencia o rendimiento PostgreSQL. No usar para cambiar el esquema sin una migración aprobada.
---

# PostgreSQL y Sequelize

## Objetivo

Persistir y consultar datos con integridad, alcance autorizado y consultas
predecibles, evitando N+1 y exposición accidental.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/shared/database/AGENTS.md.
2. Leer la entidad, relaciones, índices y transacciones en
   api/docs/modelo-datos.md.
3. Leer persistencia y rendimiento en api/docs/arquitectura-backend.md.
4. Leer filtros y proyecciones en contrato y matriz.
5. Inspeccionar modelos, associations.js y sequelize.js reales.

## Entradas mínimas

- caso de uso y scope de filas;
- entidades, relaciones y campos necesarios;
- filtros, orden, paginación o cursor;
- transacción, bloqueos y volumen esperado;
- proyección autorizada.

## Procedimiento

1. Partir de una consulta concreta documentada, no de un modelo completo.
2. Seleccionar attributes explícitos para la entidad y cada include.
3. Aplicar scope y filtros antes de paginar o contar.
4. Usar include solo para relaciones necesarias y evitar consultas por elemento.
5. Mantener orden estable con un desempate por id cuando corresponda.
6. Pasar la misma transaction a todas las operaciones del caso de uso.
7. Aplicar locks y orden de adquisición definidos por el modelo.
8. Capturar violaciones conocidas y permitir que el service las traduzca.
9. Revisar si los filtros documentados tienen índice útil sin duplicar PK,
   UNIQUE o índices existentes.

## Guardrails

- No usar sequelize.sync ni alterar esquema desde modelos.
- No distribuir modelos Sequelize dentro de módulos.
- No usar attributes por defecto en recursos con campos sensibles.
- No interpolar SQL ni aceptar nombres de columnas desde la request.
- No agregar include, índice, cache o raw SQL sin una consulta justificable.
- No abrir transacciones internas cuando el llamador ya proporciona una.
- No usar cascadas destructivas para información histórica.
- No devolver instancias Sequelize directamente por HTTP.

## Verificación y salida esperada

- Probar scope, filtros, orden, paginación y proyección.
- Contar consultas en listados representativos y detectar N+1.
- Probar rollback y solicitudes concurrentes cuando haya locks o constraints.
- Revisar el plan de consulta con volumen representativo antes de agregar índices.
- Entregar consulta afectada, integridad cubierta y evidencia de rendimiento.

## Coordinación

Usar migraciones-seguras-sequelize si cambia el esquema, express-api-modular
para el transporte, testing-api-jest para integración y la skill de dominio
para reglas funcionales.
