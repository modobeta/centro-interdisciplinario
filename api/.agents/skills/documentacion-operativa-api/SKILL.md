---
name: documentacion-operativa-api
description: Actualiza o revisa documentación normativa y AGENTS de esta API cuando cambia contrato HTTP, permisos, persistencia, arquitectura o procedimiento operativo. No usar para justificar código incompatible ni para copiar especificaciones completas dentro de AGENTS o skills.
---

# Documentación operativa API

## Objetivo

Mantener contrato, permisos, modelo, arquitectura y contexto operativo
consistentes, navegables y ejecutables.

## Fuentes obligatorias

1. Leer api/AGENTS.md y todos los AGENTS.md cuyo alcance cambie.
2. Leer los cuatro documentos de api/docs completos en la parte afectada.
3. Inspeccionar código, migraciones y pruebas cuando la documentación deba
   reflejar comportamiento existente.
4. Clasificar cada cambio por autoridad documental.

## Entradas mínimas

- decisión aprobada o conducta implementada;
- fuentes y secciones afectadas;
- compatibilidad o versionado requerido;
- evidencia del repositorio;
- alcance explícito de documentación.

## Procedimiento

1. Asignar interfaz HTTP al contrato.
2. Asignar roles, scopes, policies y campos a la matriz.
3. Asignar tablas, relaciones, índices, constraints y transacciones al modelo.
4. Asignar stack, capas y criterios técnicos a arquitectura.
5. Actualizar todas las fuentes afectadas en el mismo cambio.
6. Mantener api/AGENTS.md común y el AGENTS.md cercano como diferencial
   operativo.
7. Evitar duplicar catálogos normativos en AGENTS o skills.
8. Actualizar versión documental cuando el cambio altere la baseline.
9. Validar enlaces, headings, bloques, nombres públicos y referencias cruzadas.

## Guardrails

- Ninguna fuente prevalece fuera de su incumbencia.
- Detener una decisión transversal incompatible hasta armonizarla.
- No documentar funciones futuras como implementadas.
- No cambiar documentación para ocultar una incompatibilidad del código.
- No convertir deuda no bloqueante en requisito incidental.
- No inventar resultados, endpoints, códigos, tablas o permisos.
- No modificar código cuando la tarea sea exclusivamente documental.

## Verificación y salida esperada

- Comparar inventario de endpoints con sus definiciones.
- Verificar que códigos y permisos sean únicos y estén definidos.
- Cruzar nombres HTTP, columnas y proyecciones.
- Validar Markdown, JSON, SQL delimitado y enlaces internos.
- Confirmar que cada AGENTS respete las fuentes normativas.
- Entregar documentos cambiados, decisiones armonizadas y checks ejecutados.

## Coordinación

Usar orquestacion-de-cambios-api para impacto transversal y la skill técnica o
de dominio propietaria para validar que la redacción refleje la conducta real.
