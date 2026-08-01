---
name: auditoria-de-operaciones
description: Implementa o revisa auditoría funcional de operaciones sensibles en esta API. Usar cuando una acción modifica datos relevantes o consulta contenido clínico auditado. No usar para registrar cada request, copiar contenido sensible ni reemplazar logs técnicos.
---

# Auditoría de operaciones

## Objetivo

Conservar trazabilidad funcional suficiente y sanitizada, con atomicidad acorde
al resultado del caso de uso.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/modules/auditoria/AGENTS.md.
2. Leer eventos, acceso y metadata en api/docs/matriz-permisos.md.
3. Leer auditoria_eventos y transacciones en api/docs/modelo-datos.md.
4. Leer logging y auditoría en api/docs/arquitectura-backend.md.
5. Leer el endpoint de consulta y errores transversales en el contrato.

## Entradas mínimas

- actor o actor nulo;
- acción canónica aprobada;
- recurso y recursoId;
- resultado exitoso o fallido;
- metadata mínima permitida;
- transacción y requisito fail-closed aplicables.

## Procedimiento

1. Determinar desde el módulo dueño si la acción exige evento.
2. Construir metadata mediante allowlist antes de persistir.
3. Insertar eventos exitosos obligatorios con la misma transaction del caso de
   uso.
4. Revertir el éxito funcional si su auditoría obligatoria falla.
5. Después de un rollback, intentar registrar el fallo en una transacción
   separada de mejor esfuerzo sin cambiar el error original.
6. Para lectura clínica de informes, persistir INFORME_VISUALIZADO antes de
   serializar contenido y fallar cerrado si no puede registrarse.
7. Restringir la consulta administrativa mediante policy y filtros acotados.

## Guardrails

- No registrar DNI, credenciales, tokens, cookies, contenido o resumen de
  informes, mensajes, diagnósticos, notas internas, bodies, SQL o stacks.
- No emitir nombres de eventos que no estén aprobados.
- No insertar eventos exitosos antes de conocer el resultado.
- No permitir edición o borrado de eventos desde la aplicación.
- No generar auditoría por cada polling o lectura pública.
- No duplicar el evento completo en logs técnicos.

## Verificación y salida esperada

- Probar commit conjunto y rollback conjunto con la operación.
- Probar fallo de auditoría obligatoria.
- Probar registro de intento fallido y fallo de ese mejor esfuerzo.
- Probar lectura clínica fail-closed y ausencia de contenido en la respuesta.
- Inspeccionar metadata y consulta administrativa por datos prohibidos.
- Entregar eventos cubiertos, límites transaccionales y pruebas ejecutadas.

## Coordinación

Usar la skill de dominio para decidir el momento del evento,
manejo-de-errores-y-observabilidad para logs y
seguridad-de-datos-sensibles para validar metadata.
