---
name: autenticacion-y-autorizacion
description: Implementa o endurece login, sesiones, rutas privadas, permisos y policies de esta API. Usar cuando cambien authenticate, authorize, JWT, refresh cookies, roles o acceso a recursos. No usar para inventar roles, permisos o flujos de cuenta fuera del MVP.
---

# Autenticación y autorización

## Objetivo

Autenticar sesiones revocables y autorizar cada acción, fila, recurso y campo en
el backend.

## Fuentes obligatorias

1. Leer api/AGENTS.md y api/src/modules/auth/AGENTS.md.
2. Leer autenticación y errores en api/docs/contrato-api.md.
3. Leer roles, scopes, policies y catálogo permissions en
   api/docs/matriz-permisos.md.
4. Leer sesiones en api/docs/modelo-datos.md.
5. Leer autenticación, autorización y privacidad en arquitectura.

## Entradas mínimas

- flujo de sesión o endpoint protegido afectado;
- acción general requerida;
- scope de filas y policy del recurso;
- proyección de campos;
- comportamiento esperado para revocación y errores.

## Procedimiento

1. Inspeccionar authenticate.js, authorize.js, constantes y módulo auth reales.
2. Mantener access JWT corto y refresh opaco en cookie HttpOnly.
3. En cada request privada, validar JWT y consultar sesión y usuario en
   PostgreSQL.
4. Usar authorize para la facultad general y una policy testeable para scope,
   estado, propiedad, vínculo, autoría o participación.
5. Aplicar la projection después de autorizar el recurso.
6. Rotar refresh bajo bloqueo de sesión, conservar digest vigente y anterior y
   revocar ante reutilización inmediata.
7. Validar Origin y atributos de cookie conforme al contrato.
8. Revocar sesiones dentro de la unidad transaccional del cambio de acceso.

## Guardrails

- No almacenar refresh, DNI o credenciales en texto plano.
- No incluir datos sensibles en JWT, logs, errores o auditoría.
- No confiar en la lista permissions que recibe el frontend.
- No conceder acceso por jerarquía implícita de roles.
- No revelar por UUID recursos que el actor no puede conocer.
- No agregar registro, recuperación de contraseña, token CSRF u otros flujos
  excluidos.
- No emitir mensajes de login que permitan enumerar usuarios.

## Verificación y salida esperada

- Probar acceso permitido y denegado para cada rol afectado.
- Probar recurso propio, ajeno, vinculado, no vinculado e inexistente.
- Probar access inválido o expirado, sesión revocada y usuario inactivo.
- Probar dos refresh simultáneos y reutilización del digest anterior.
- Confirmar proyecciones y lista permissions exactas.
- Entregar riesgos revisados y evidencia de pruebas de seguridad.

## Coordinación

Usar postgresql-y-sequelize para sesiones, auditoria-de-operaciones para eventos,
testing-api-jest para matrices de acceso y seguridad-de-datos-sensibles como
revisión transversal.
