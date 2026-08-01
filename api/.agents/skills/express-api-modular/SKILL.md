---
name: express-api-modular
description: Implementa o modifica endpoints Express de esta API mediante sus capas modulares. Usar para routes, controllers, services, policies, projections y montaje de rutas. No usar para decidir reglas de dominio, permisos o cambios de esquema todavía no documentados.
---

# Express API modular

## Objetivo

Implementar endpoints coherentes con el monolito modular y con el contrato HTTP
vigente, sin mezclar transporte, autorización, negocio y persistencia.

## Fuentes obligatorias

1. Leer api/AGENTS.md y el AGENTS.md más cercano al módulo.
2. Leer en api/docs/contrato-api.md la operación y las convenciones generales.
3. Leer en api/docs/matriz-permisos.md la acción, el scope y los campos.
4. Consultar api/docs/modelo-datos.md si el caso usa persistencia o transacciones.
5. Aplicar las capas definidas en api/docs/arquitectura-backend.md.

## Entradas mínimas

- método y ruta;
- actor y alcance autorizado;
- params, query y body admitidos;
- respuesta, status y errores específicos;
- reglas transaccionales y de auditoría aplicables.

Si falta una decisión normativa, detener la parte afectada y señalar la fuente
que necesita armonización.

## Procedimiento

1. Inspeccionar los archivos reales del módulo y las rutas agregadoras.
2. Mantener el flujo route → middleware → validation → controller → service.
3. Definir la route con middlewares en el orden exigido por arquitectura.
4. Envolver handlers asíncronos con asyncHandler.
5. Limitar el controller a leer la request, invocar el service y emitir el
   envelope contractual.
6. Implementar negocio, policy de recurso, transacción y traducción de
   conflictos en el service.
7. Construir la respuesta mediante una projection o selección explícita de
   campos; nunca serializar el modelo completo por comodidad.
8. Montar la route una sola vez bajo /api/v1 y respetar precedencia de rutas
   estáticas frente a parámetros dinámicos.
9. Agregar las pruebas requeridas por el contrato y la matriz.

## Guardrails

- No colocar reglas de negocio o consultas en routes y controllers.
- No decidir permisos por presencia de controles en el frontend.
- No crear un Repository genérico ni nuevas capas sin necesidad documentada.
- No agregar endpoints, aliases, status o campos por analogía.
- Usar AppError y códigos existentes; no exponer SQL ni nombres de constraints.
- Devolver 404 para recursos privados ocultos por UUID y 403 para acciones,
  campos o filtros prohibidos sobre recursos visibles.
- No cambiar modelos o migraciones sin coordinar postgresql-y-sequelize y
  migraciones-seguras-sequelize.

## Verificación y salida esperada

- Confirmar route montada, validación aplicada y controller delgado.
- Probar éxito, validación, acceso permitido, acceso denegado y errores
  específicos.
- Confirmar que la proyección no expone campos adicionales.
- Ejecutar solo scripts presentes en package.json e informar los no disponibles.
- Entregar lista de archivos cambiados, endpoint cubierto y evidencia de pruebas.

## Coordinación

Usar validacion-y-sanitizacion-api para entradas, autenticacion-y-autorizacion
para acceso, testing-api-jest para cobertura y la skill de dominio
correspondiente para reglas funcionales.
