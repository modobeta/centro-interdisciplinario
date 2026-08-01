---
name: migraciones-seguras-sequelize
description: Crea o revisa migraciones incrementales y reversibles para PostgreSQL y Sequelize en esta API. Usar al cambiar tablas, columnas, constraints, claves foráneas, índices o datos existentes. No usar para consultas sin cambio de esquema ni para editar migraciones aplicadas.
---

# Migraciones seguras Sequelize

## Objetivo

Evolucionar el esquema sin perder datos, romper despliegues ni separar modelos,
constraints y documentación.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/shared/database/AGENTS.md.
2. Leer entidad, integridad y orden de migraciones en api/docs/modelo-datos.md.
3. Leer persistencia y concurrencia en api/docs/arquitectura-backend.md.
4. Inspeccionar migraciones y modelos reales antes de elegir el siguiente número.
5. Confirmar si la migración candidata pudo haberse aplicado en algún entorno.

## Entradas mínimas

- estado actual verificable del esquema;
- estado objetivo aprobado;
- volumen y nulabilidad de datos existentes;
- dependencias entre tablas;
- estrategia de rollback y compatibilidad durante el despliegue.

## Procedimiento

1. Crear una migración nueva con nombre secuencial y propósito único.
2. Diseñar up y down explícitos; documentar cualquier reversión con pérdida
   inevitable y detenerse si no fue autorizada.
3. Separar cambios riesgosos en fases: agregar nullable, backfill validado,
   constraint o NOT NULL y limpieza posterior.
4. Normalizar datos antes de crear unicidad o referencias más estrictas.
5. Nombrar constraints e índices de forma estable.
6. Crear primero la tabla referenciada y después sus FK.
7. Evaluar bloqueo, duración y transacción de cada DDL sobre datos existentes.
8. Alinear modelos y associations.js dentro del mismo cambio.
9. Actualizar modelo-datos.md cuando cambie la especificación normativa.

## Guardrails

- Nunca modificar una migración aplicada en un entorno persistente.
- Nunca usar sequelize.sync como mecanismo de despliegue.
- No eliminar columnas, tablas o datos sin autorización y estrategia de
  recuperación.
- No agregar NOT NULL, UNIQUE o FK antes de validar y corregir datos existentes.
- No crear índices equivalentes a los provistos por PK, UNIQUE o constraints.
- No usar cascadas destructivas por comodidad.
- No asumir que down es seguro si el up transformó o descartó información.

## Verificación y salida esperada

- Ejecutar up sobre una base desechable desde cero.
- Ejecutar down y volver a ejecutar up.
- Verificar constraints, FK, índices y asociaciones resultantes.
- Probar datos límite, duplicados, huérfanos y concurrencia relevante.
- Ejecutar validaciones previas y posteriores al backfill.
- Entregar riesgo de bloqueo, reversibilidad y comprobaciones ejecutadas.

## Coordinación

Usar postgresql-y-sequelize para modelos y consultas, testing-api-jest para
integridad y documentacion-operativa-api cuando cambie el modelo normativo.
