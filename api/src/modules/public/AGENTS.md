# AGENTS.md — API pública

## Alcance

Aplica a las lecturas públicas de profesionales y servicios.

## Fuentes normativas

El contrato es la autoridad sobre las rutas y proyecciones públicas; la matriz
define campos visibles y el modelo define elegibilidad y orden. Este archivo no
autoriza nuevas rutas.

## Guardrails

- Las lecturas públicas funcionan sin autenticación y solo exponen proyecciones
  allowlist.
- Usar nombres públicos en español y camelCase.
- La elegibilidad combina estado activo y visibilidad pública sin confundir
  ambos atributos.
- Aplicar orden estable, límites y rate limit definidos normativamente.
- No exponer datos de contacto privados, identificadores internos innecesarios,
  estados administrativos ni relaciones clínicas.
- No registrar auditoría funcional por cada lectura pública.
- No persistir formularios de contacto ni ofrecer reservas públicas.
- Reutilizar servicios de consulta acotados; no depender de controllers privados.

## Procedimiento y verificación

1. Construir la consulta desde la proyección permitida, no desde un modelo
   serializado completo.
2. Probar registros activos, inactivos, visibles y no visibles por separado.
3. Verificar respuesta sin credenciales y rechazo de campos o filtros no
   documentados.
4. Confirmar que imágenes y valores nulos se serializan como indica el contrato.
5. Inspeccionar logs para asegurar ausencia de datos privados.

## Deuda no bloqueante

La caché pública puede incorporarse cuando existan métricas que la justifiquen;
debe preservar exactamente filtros, orden y proyección.
