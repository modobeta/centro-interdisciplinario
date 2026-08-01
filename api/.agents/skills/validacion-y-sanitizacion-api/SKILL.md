---
name: validacion-y-sanitizacion-api
description: Define o modifica validación Joi y sanitización de params, query y body en esta API. Usar al recibir filtros, paginación, identificadores, texto o archivos. No usar para autorización, reglas dependientes de datos ni constraints de PostgreSQL.
---

# Validación y sanitización API

## Objetivo

Rechazar entradas ambiguas o inválidas en el límite HTTP sin transformar
silenciosamente información clínica legítima.

## Fuentes obligatorias

1. Leer api/AGENTS.md y el AGENTS.md del módulo.
2. Obtener campos, tipos, límites y nulabilidad desde api/docs/contrato-api.md.
3. Obtener campos escribibles por rol desde api/docs/matriz-permisos.md.
4. Aplicar la separación Joi, service y PostgreSQL de arquitectura.
5. Inspeccionar validate.js, pagination.js y sanitize.js antes de reutilizarlos.

## Entradas mínimas

- ubicación de cada dato: params, query, body o multipart;
- campos admitidos, requeridos, opcionales y nullable;
- defaults, enums, límites y combinaciones válidas;
- filtros y órdenes permitidos para ese endpoint.

## Procedimiento

1. Crear schemas separados por ubicación de entrada.
2. Rechazar propiedades no documentadas y formatos coercionados de forma
   insegura.
3. Validar UUID, fechas civiles, instantes, booleanos, enums y longitudes según
   el contrato.
4. Aplicar paginación común y listas blancas de search, sort, order y filtros.
5. Validar juntos los parámetros que deban aparecer en pareja, como cursores
   compuestos o rangos.
6. Normalizar únicamente lo aprobado: recorte de extremos, email o identificador
   cuando la fuente normativa lo indique.
7. Dejar en el service existencia, estado, vínculo, autoría, transiciones y
   conflictos concurrentes.
8. Convertir errores Joi al formato contractual sin devolver valores sensibles.

## Guardrails

- No eliminar acentos, puntuación, saltos o contenido clínico legítimo.
- No usar sanitización como reemplazo de escaping contextual o parametrización.
- No ignorar filtros prohibidos ni campos desconocidos.
- No aceptar booleanos textuales, null o strings vacíos si el contrato no los
  admite.
- No ampliar el scope mediante defaults o filtros enviados por el cliente.
- No repetir reglas estructurales que ya garantiza PostgreSQL.
- No incluir el body completo ni el valor rechazado en logs o errores.

## Verificación y salida esperada

- Probar entrada válida y cada límite inferior y superior.
- Probar campos adicionales, tipos incorrectos, combinaciones incompletas,
  filtros prohibidos y contenido clínico con caracteres legítimos.
- Confirmar que la entrada normalizada llega al controller una sola vez.
- Entregar schemas afectados, casos rechazados y pruebas ejecutadas.

## Coordinación

Usar express-api-modular para el montaje, autenticacion-y-autorizacion para
scope, manejo-de-errores-y-observabilidad para la respuesta y
seguridad-de-datos-sensibles para revisar exposición.
