# AGENTS.md — Auth

## Alcance

Aplica al módulo auth y a cambios de autenticación, sesiones, access tokens y
refresh cookies.

## Fuentes normativas

Usar api/docs/contrato-api.md para el transporte, matriz-permisos.md para la
identidad expuesta, modelo-datos.md para sesiones y arquitectura-backend.md para
seguridad. Este archivo no redefine esas reglas.

## Guardrails

- El refresh es opaco, combina identificador de sesión y secreto aleatorio de
  256 bits, y nunca se persiste en texto plano.
- Persistir digest SHA-256 vigente y anterior; rotar bajo bloqueo de la sesión.
- La reutilización inmediata revoca la sesión afectada.
- Toda request privada consulta sesión y usuario en PostgreSQL.
- La cookie es HttpOnly, tiene alcance exclusivo de auth, no declara Domain y
  respeta los atributos definidos por el contrato.
- Validar Origin mediante allowlist en operaciones basadas en cookie.
- No agregar un token CSRF al MVP ni colocar datos sensibles en JWT, logs o
  respuestas.
- La lista de permisos sirve para UX; las policies del backend siguen siendo
  obligatorias.
- Login, refresh y revocación deben preservar mensajes genéricos y rate limit.

## Procedimiento y verificación

1. Trazar el ciclo completo de sesión antes de modificar una etapa.
2. Mantener rotación, revocación y auditoría en la misma unidad transaccional
   cuando corresponda.
3. Probar token inválido, expirado, rotado, reutilizado y sesión o usuario
   revocados.
4. Probar dos renovaciones simultáneas del mismo refresh.
5. Verificar atributos de cookie y Origin en desarrollo y producción.
6. Confirmar que los permisos devueltos coinciden con el catálogo normativo.

## Deuda no bloqueante

La sustitución futura del DNI como credencial requiere una iniciativa de
producto y migración propia; no altera el contrato aprobado del MVP.
