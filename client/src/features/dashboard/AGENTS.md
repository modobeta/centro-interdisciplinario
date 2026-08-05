# Instrucciones del resumen operativo

## Alcance

Estas reglas aplican a `src/features/dashboard/` y complementan `client/AGENTS.md`.

## Modelo del dashboard

- Existe un único dashboard para todos los roles en `/app/resumen`.
- No crear dashboards separados por administrador, coordinación, secretaría o profesional.
- Adaptar métricas, detalle y acciones a los datos y permisos devueltos por el backend.
- El frontend no debe reconstruir métricas consultando múltiples listados si existe el endpoint de resumen.
- Consumir `GET /api/v1/resumen` mediante `dashboardApi.js` y mantener el contrato HTTP fuera de los componentes.

## Interacción

- `MetricsGrid` presenta las métricas disponibles sin asumir que todas existen para todos los roles.
- Cada `MetricCard` debe tener nombre accesible, valor, estado de carga y comportamiento de selección explícito.
- Una tarjeta seleccionable actualiza `SummaryDetail`; no duplicar en el dashboard la lógica de gestión completa del módulo de destino.
- Si una métrica conduce a otra pantalla, respetar permisos y usar la ruta canónica de esa feature.
- Mantener la selección en estado local o de UI; no persistirla como dato de negocio.

## Estados asíncronos

- Mostrar skeletons con la forma de las tarjetas durante la carga inicial.
- Diferenciar resumen vacío de error de consulta.
- Permitir reintento ante fallos recuperables sin desmontar el layout privado.
- Tras mutaciones relevantes en otras features, actualizar o invalidar el resumen sin recargar toda la aplicación.
- No mostrar cifras anteriores como actuales si una actualización crítica falla; indicar claramente el estado desactualizado cuando se conserve información previa.

## Responsive y accesibilidad

- La grilla debe adaptarse desde varias columnas en escritorio hasta una columna legible en móvil.
- No comunicar categorías o estados únicamente mediante color.
- Mantener orden de lectura lógico entre tarjetas y detalle.
- La selección de tarjetas debe funcionar con teclado y exponer su estado mediante semántica apropiada.

## Pruebas críticas

- Un mismo componente con respuestas distintas por rol.
- Métricas ausentes o parciales sin errores de renderizado.
- Selección de tarjeta y actualización del detalle.
- Estados loading, empty, error, retry y refresh.
- Navegación desde una tarjeta permitida y ausencia de acciones sin permiso.
- Diseño usable en escritorio y móvil.
