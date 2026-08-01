---
name: gestion-de-informes
description: Implementa o modifica creación, lectura, edición y finalización de informes clínicos en esta API. Usar para autoría, borradores, versionado, vínculos o trazabilidad. No usar para editar informes finalizados, reasignar borradores, firmar digitalmente o generar PDF.
---

# Gestión de informes

## Objetivo

Preservar autoría, confidencialidad, concurrencia optimista e inmutabilidad de
los informes clínicos.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/modules/informes/AGENTS.md.
2. Leer Informes en api/docs/contrato-api.md.
3. Leer acciones, scopes y campos de informes en la matriz.
4. Leer tipos_informe, informes y transacciones en el modelo de datos.
5. Leer concurrencia, autorización y auditoría en arquitectura.

## Entradas mínimas

- acción y actor;
- informe o paciente y tipo para una creación;
- estado y autor actuales;
- vínculo activo cuando el actor es profesional;
- expectedVersion para editar o finalizar.

## Procedimiento

1. Resolver scope de lectura antes de cargar contenido clínico.
2. Para crear, exigir paciente activo, tipo activo y vínculo activo al
   profesional.
3. Asignar autor y estado borrador en backend.
4. Para editar o finalizar, exigir autor activo, borrador y vínculo activo para
   un profesional incluso si es autor.
5. Permitir continuidad de un borrador con paciente inactivo mientras se
   mantengan las demás condiciones.
6. Permitir conservar el tipo actual inactivo, pero no elegir otro tipo inactivo.
7. Actualizar por id y expectedVersion e incrementar version.
8. Finalizar, completar fecha de emisión y volver inmutable el recurso.
9. Auditar lectura clínica antes de serializar título, resumen o contenido.

## Guardrails

- No permitir cambiar paciente, autor o estado mediante edición.
- No editar ni eliminar un informe finalizado.
- No reasignar borradores bloqueados por cambio de rol o inactividad.
- No entregar contenido si falla INFORME_VISUALIZADO.
- No registrar título, resumen, contenido o diagnóstico en logs o auditoría.
- No aceptar last-write-wins ni omitir expectedVersion.
- No agregar PDF, firma digital, adjuntos o correcciones posfinalización.

## Verificación y salida esperada

- Probar creación por coordinación y profesional vinculado o no vinculado.
- Probar lectura global, vinculada y ajena.
- Probar paciente y tipo activos e inactivos al crear y continuar borrador.
- Ejecutar dos ediciones o finalizaciones con la misma versión.
- Probar inmutabilidad final y auditoría de lectura fail-closed.
- Entregar estados, versiones, policies y pruebas ejecutadas.

## Coordinación

Usar pacientes-tutores-y-vinculos para acceso,
autenticacion-y-autorizacion para policies, postgresql-y-sequelize para versión,
auditoria-de-operaciones y testing-api-jest.
