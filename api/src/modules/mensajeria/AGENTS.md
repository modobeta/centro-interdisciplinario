# AGENTS.md — Mensajería

## Alcance

Aplica a conversaciones, participantes, mensajes, lectura y archivado.

## Fuentes normativas

El contrato define cursores, límites y respuestas; la matriz define la policy de
participación; el modelo define integridad, actividad y punteros. Este archivo
solo aporta guardrails operativos.

## Guardrails

- Solo participantes acceden a una conversación; ocultar por UUID los recursos
  ajenos.
- Un lote que contiene participantes existentes falla completo, sin altas
  parciales.
- Un mensaje admite hasta 4.000 caracteres y su preview hasta 120.
- Los mensajes se ordenan de forma descendente por fecha de creación e
  identificador; el cursor conserva ese orden.
- Crear un mensaje actualiza la actividad global y desarchiva la conversación
  para sus receptores; también entra en sus no leídas.
- Avanzar lectura y archivar no actualizan la actividad global.
- El puntero de lectura avanza de forma monótona y debe pertenecer a la misma
  conversación mediante integridad compuesta.
- Incorporar participantes y enviar mensajes bloquean la conversación.
- Mensajes y conversaciones no se eliminan ni editan en el MVP.
- No registrar contenido ni previews en logs o auditoría.

## Procedimiento y verificación

1. Resolver participación antes de leer o mutar.
2. Bloquear conversación o participación según la operación.
3. Mantener cada lote o envío en una única transacción.
4. Probar lotes mixtos, altas concurrentes y envíos concurrentes.
5. Probar cursor estable cuando dos mensajes comparten timestamp.
6. Probar lectura monótona, archivado y desarchivado de receptores.

## Deuda no bloqueante

Tiempo real, adjuntos, edición, borrado y búsqueda avanzada quedan fuera del MVP;
el polling documentado es suficiente para la primera versión.
