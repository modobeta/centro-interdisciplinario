---
name: mensajeria-privada
description: Implementa o modifica conversaciones, participantes, mensajes, lectura y archivo en esta API. Usar para privacidad, cursores, no leídos o concurrencia de mensajería. No usar para tiempo real, adjuntos, quitar participantes, editar o eliminar mensajes.
---

# Mensajería privada

## Objetivo

Garantizar que solo participantes autorizados accedan al historial y que
actividad, lectura y archivo permanezcan consistentes bajo concurrencia.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/modules/mensajeria/AGENTS.md.
2. Leer Mensajería interna en api/docs/contrato-api.md.
3. Leer participación, acciones y campos en la matriz de permisos.
4. Leer conversaciones, participantes, mensajes y transacciones en el modelo.
5. Leer privacidad, concurrencia y rendimiento en arquitectura.

## Entradas mínimas

- acción y actor participante;
- conversación, participantes o mensaje involucrado;
- cursor o puntero de lectura;
- estado individual de archivo;
- límites de contenido y proyección.

## Procedimiento

1. Resolver participación antes de leer o mutar y ocultar conversaciones ajenas.
2. Para crear, validar asunto, paciente opcional y usuarios activos y confirmar
   conversación, participantes, mensaje inicial y auditoría juntos.
3. Para agregar participantes, bloquear la conversación y rechazar completo un
   lote que incluya un participante existente.
4. Para enviar, bloquear la conversación, insertar el mensaje, actualizar
   updated_at y desarchivar solo a receptores.
5. Contar el nuevo mensaje como no leído para receptores.
6. Paginar mensajes en orden descendente por createdAt e id con cursor compuesto.
7. Para avanzar lectura, bloquear la participación, comprobar pertenencia y
   comparar el orden compuesto de forma monótona.
8. Mantener archivo y desarchivo como estado individual sin actividad global.

## Guardrails

- No autorizar por rol elevado; exigir participación.
- No exponer conversación o mensaje ajeno mediante diferencias entre 403 y 404.
- No admitir más de 4.000 caracteres ni previews mayores a 120.
- No actualizar actividad al leer, archivar o agregar participantes.
- No permitir que el puntero señale otra conversación.
- No registrar contenido ni previews.
- No quitar participantes ni editar o eliminar mensajes.
- No agregar WebSocket, SSE, adjuntos o búsqueda avanzada al MVP.

## Verificación y salida esperada

- Probar participante, no participante y conversación inexistente.
- Probar lotes válidos, mixtos y altas simultáneas.
- Probar envíos simultáneos, actividad y desarchivo de receptores.
- Probar cursor con timestamps iguales.
- Probar lectura monotónica y FK compuesta.
- Probar archivo individual y resumen sin contenido sensible.
- Entregar invariantes, locks y pruebas ejecutadas.

## Coordinación

Usar autenticacion-y-autorizacion, postgresql-y-sequelize,
auditoria-de-operaciones, seguridad-de-datos-sensibles y testing-api-jest.
