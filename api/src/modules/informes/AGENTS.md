# AGENTS.md — Informes

## Alcance

Aplica a borradores, edición, finalización y lectura de informes clínicos.

## Fuentes normativas

El contrato gobierna cuerpos, respuestas y conflictos; la matriz gobierna acceso
y campos; el modelo gobierna versión, estado, relaciones e índices. Este archivo
no reemplaza esas definiciones.

## Guardrails

- Crear exige paciente activo, tipo activo y vínculo activo para un profesional.
- Un profesional necesita vínculo activo incluso cuando es autor.
- Un borrador existente puede editarse y finalizarse con paciente inactivo si
  el vínculo requerido permanece activo.
- Un tipo inactivo puede conservarse en el borrador existente, pero no
  seleccionarse como reemplazo.
- Editar y finalizar exigen expectedVersion y actualización condicional de
  version.
- Un informe finalizado es inmutable.
- Los borradores bloqueados por cambio de rol no se reasignan.
- La auditoría de lectura clínica es fail-closed: si no se registra, no se
  entrega el contenido.
- No incluir contenido clínico en logs, errores ni metadata de auditoría.

## Procedimiento y verificación

1. Cargar informe y relaciones bajo el scope autorizado.
2. Validar estado, vínculo, continuidad controlada y versión esperada.
3. Ejecutar mutación y auditoría en una sola transacción.
4. Probar ediciones y finalizaciones simultáneas con la misma versión.
5. Probar paciente o tipo inactivo tanto al crear como sobre un borrador previo.
6. Forzar fallo de auditoría de lectura y confirmar que no se serializa contenido.

## Deuda no bloqueante

Correcciones posteriores a la finalización, firma digital y adjuntos quedan
fuera del MVP.
