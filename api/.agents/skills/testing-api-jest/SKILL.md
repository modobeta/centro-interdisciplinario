---
name: testing-api-jest
description: Diseña o implementa pruebas Jest unitarias y de integración para cambios del backend de esta API. Usar al crear o modificar funcionalidad, validación, acceso, persistencia o errores. No usar para afirmar cobertura ni comandos que el package.json real no proporcione.
---

# Testing API con Jest

## Objetivo

Proteger comportamiento contractual, negocio, autorización e integridad con la
menor suite capaz de detectar regresiones reales.

## Fuentes obligatorias

1. Leer api/AGENTS.md y el AGENTS.md del módulo probado.
2. Leer la matriz mínima de pruebas en contrato, permisos y modelo de datos.
3. Leer la estrategia de pruebas en arquitectura.
4. Inspeccionar package.json, jest.config.js, tests y helpers reales.
5. Derivar expectativas de las fuentes normativas, no de la implementación.

## Entradas mínimas

- comportamiento nuevo o modificado;
- roles, scopes y estados relevantes;
- entradas válidas e inválidas;
- errores y efectos persistentes esperados;
- riesgos transaccionales o concurrentes.

## Procedimiento

1. Elegir unidad para lógica pura, policy, projection o transformación.
2. Elegir integración para middleware, route, Sequelize, transacción, constraint
   y envelope HTTP.
3. Preparar fixtures ficticios mínimos y deterministas.
4. Cubrir camino exitoso, validación, autorización, recurso ausente, conflicto y
   caso límite.
5. Probar side effects y ausencia de escrituras parciales.
6. Agregar pruebas concurrentes cuando la garantía dependa de locks, versión o
   constraints.
7. Aislar tiempo, zona horaria y datos aleatorios.
8. Ejecutar los scripts existentes y registrar el comando exacto y su resultado.

## Guardrails

- No escribir tests que reproduzcan la implementación sin verificar conducta.
- No depender del orden entre casos ni compartir estado mutable.
- No usar datos personales o clínicos reales en fixtures o snapshots.
- No mockear PostgreSQL en una prueba destinada a validar constraints.
- No sustituir integración con snapshots extensos.
- No suavizar expectativas para hacer pasar una implementación incompatible.
- No declarar cobertura o éxito si el tooling está vacío o no pudo ejecutarse.

## Verificación y salida esperada

- Confirmar que una mutación deliberada del comportamiento haría fallar la prueba.
- Ejecutar unitarias e integración disponibles.
- Comprobar limpieza de base y recursos entre casos.
- Informar pruebas agregadas, riesgos cubiertos, comandos y cualquier limitación.

## Coordinación

Usar la skill técnica y de dominio propietarias del cambio. Incorporar
autenticacion-y-autorizacion para matrices de acceso y
seguridad-de-datos-sensibles para fixtures y errores.
