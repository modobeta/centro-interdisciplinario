---
name: orquestacion-de-cambios-api
description: Analiza y coordina cambios de código o comportamiento en esta API antes de implementarlos. Usar para localizar módulos, evaluar impacto transversal y seleccionar skills técnicas y de dominio. No usar para una explicación de solo lectura ni para reemplazar las skills especializadas.
---

# Orquestación de cambios API

## Objetivo

Convertir una solicitud de backend en un cambio delimitado, coherente con todas
las fuentes normativas y verificado de punta a punta.

## Fuentes obligatorias

1. Leer api/AGENTS.md.
2. Localizar y leer todos los AGENTS.md aplicables a las rutas afectadas.
3. Clasificar cada decisión según contrato, permisos, modelo o arquitectura.
4. Inspeccionar implementación, migraciones, tests y package.json reales.
5. Revisar git status antes de tocar archivos y preservar cambios ajenos.

## Entradas mínimas

- resultado solicitado y criterio de aceptación;
- módulos o recursos alcanzados;
- conducta vigente conocida;
- restricciones de alcance, compatibilidad y mutación;
- autorización para acciones externas si existieran.

## Procedimiento

1. Determinar si la tarea pide diagnóstico, documentación o implementación.
2. Trazar el flujo actual desde route hasta PostgreSQL sin asumir que el scaffold
   vacío ya implementa comportamiento.
3. Identificar endpoints, roles, campos, entidades, transacciones, auditoría y
   pruebas afectados.
4. Detectar incompatibilidades normativas antes de escribir.
5. Elegir la skill de dominio y las skills técnicas mínimas.
6. Definir una única unidad transaccional y responsables por capa.
7. Implementar el cambio mínimo sin ampliar el MVP.
8. Ejecutar validaciones proporcionales al riesgo.
9. Actualizar documentación solo si cambió su incumbencia.
10. Revisar diff, archivos no relacionados y resultados antes de entregar.

## Guardrails

- No elegir una fuente normativa fuera de su incumbencia.
- No resolver contradicciones transversales por conveniencia técnica.
- No reestructurar módulos, agregar dependencias o abstracciones incidentalmente.
- No completar endpoints, tablas o funciones por analogía.
- No tocar client ni otras áreas salvo que la solicitud las incluya.
- No afirmar tests, lint o arranque que no pudieron ejecutarse.
- No hacer commit, push, PR, deploy o migración externa sin autorización.

## Verificación y salida esperada

- Confirmar conexión entre capas y fuentes afectadas.
- Ejecutar validación, autorización, errores, casos límite y concurrencia
  relevantes.
- Confirmar ausencia de exposición sensible y escrituras parciales.
- Verificar que el diff permanezca en alcance.
- Entregar resultado, archivos, pruebas, riesgos y pendientes reales.

## Coordinación

Seleccionar la skill de dominio correspondiente y combinar solo las técnicas
necesarias. Usar documentacion-operativa-api al cambiar especificaciones y
git-y-pull-requests únicamente ante una solicitud explícita posterior.
