---
name: pacientes-tutores-y-vinculos
description: Implementa o modifica pacientes, tutor único y vínculos con prestadores en esta API. Usar para fichas, scopes clínicos, asignación, creación automática o desvinculación. No usar para múltiples tutores, cuentas familiares ni acceso clínico fuera de las policies aprobadas.
---

# Pacientes, tutores y vínculos

## Objetivo

Proteger la ficha clínica y sus relaciones, conservando continuidad histórica y
limitando el acceso profesional al vínculo vigente.

## Fuentes obligatorias

1. Leer api/AGENTS.md.
2. Leer api/src/modules/pacientes/AGENTS.md y
   api/src/modules/vinculos/AGENTS.md.
3. Leer Pacientes y Vínculos en api/docs/contrato-api.md.
4. Leer scopes, acciones y campos correspondientes en la matriz.
5. Leer pacientes, tutores, usuarios_pacientes y transacciones en el modelo.

## Entradas mínimas

- acción, actor y scope;
- ficha y tutor afectados;
- prestador y vínculo actual cuando corresponda;
- estado del paciente y relaciones históricas;
- turnos futuros que condicionen una desvinculación.

## Procedimiento

1. Resolver primero alcance global o vinculado y ocultar recursos ajenos por UUID.
2. Tratar paciente y tutor como una única ficha transaccional.
3. Normalizar y validar DNI, fechas y reglas de CUD sin registrar valores.
4. Crear el vínculo automático solo desde casos de uso aprobados y con la
   transacción del módulo dueño.
5. Para cerrar un vínculo, bloquear filas relevantes, comprobar turnos futuros,
   registrar fecha y motivo y conservar historia.
6. Al desactivar un paciente, conservar vínculos e historia y bloquear nuevas
   operaciones.
7. Al reactivar, no crear ni reabrir relaciones.
8. Aplicar proyección y campos de escritura después de resolver la policy.

## Guardrails

- No crear CRUD independiente de tutores.
- No admitir múltiples tutores, cuentas familiares o adjuntos.
- No permitir a un profesional consultar pacientes sin vínculo activo.
- No eliminar relaciones históricas ni reabrirlas automáticamente.
- No cerrar un vínculo con turnos futuros activos de la misma pareja.
- No duplicar lógica de vigencia en otros módulos; reutilizar helpers acotados.
- No registrar diagnóstico, observaciones ni datos completos del tutor.

## Verificación y salida esperada

- Probar ficha con y sin DNI, tutor requerido y reglas de fecha o CUD.
- Probar scope global, vinculado, ajeno e identificador inexistente.
- Probar creación manual, automática, duplicada y cierres concurrentes.
- Probar desactivación, continuidad histórica y reactivación sin reaperturas.
- Confirmar que filtros y orden nunca amplían el scope.
- Entregar relaciones afectadas, policies aplicadas y evidencia de pruebas.

## Coordinación

Usar autenticacion-y-autorizacion, postgresql-y-sequelize,
auditoria-de-operaciones y testing-api-jest. Coordinar gestion-de-turnos y
gestion-de-informes cuando el vínculo condicione esos recursos.
