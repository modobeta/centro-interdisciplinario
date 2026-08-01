# Centro Educativo Interdisciplinario Terapéutico
## Documentación consolidada del backend y la base de datos — MVP

**Versión documental:** 3.0  
**Fecha:** 29 de julio de 2026  
**Estado:** decisiones funcionales y técnicas consolidadas para iniciar la implementación  
**Stack cubierto:** Node.js, Express, JavaScript CommonJS, PostgreSQL, Sequelize, Joi, JWT, bcrypt y Pino

---

## 1. Propósito de este conjunto documental

Este directorio reemplaza como fuente de verdad de implementación a las versiones anteriores de:

- `ARQUITECTURA-BACKEND-BD.md`;
- `CONTRATO-API.md`;
- diagramas y documentos preliminares que todavía contenían decisiones anteriores o contradictorias.

La documentación fue reorganizada en varios archivos para evitar un único documento excesivamente grande y para que cada integrante del equipo pueda consultar la parte que necesita sin perder el contexto general.

Las decisiones aquí registradas consolidan:

1. la arquitectura técnica del backend;
2. el modelo físico y lógico de PostgreSQL;
3. las reglas de negocio acordadas para el Producto Mínimo Viable;
4. el contrato HTTP de la API REST;
5. la matriz de autorización por rol y por recurso;
6. la estrategia de auditoría, pruebas, migraciones e implementación.

Cuando una decisión futura modifique este diseño, debe actualizarse primero el documento correspondiente y registrarse el cambio en el historial de decisiones.

---

## 2. Orden recomendado de lectura

### 1. `01-ARQUITECTURA-BACKEND-BD-MVP.md`

Documento principal de arquitectura. Explica:

- alcance del MVP;
- estilo arquitectónico;
- estructura de carpetas;
- responsabilidades de rutas, validaciones, controladores, servicios y modelos;
- configuración y seguridad;
- autenticación, sesiones y autorización;
- transacciones;
- manejo de errores, logs y auditoría;
- pruebas, Docker, CI/CD y operación.

### 2. `02-MODELO-DATOS-Y-REGLAS-MVP.md`

Fuente de verdad funcional y de persistencia. Incluye:

- las 17 tablas del MVP;
- campos, tipos, nulabilidad y valores por defecto;
- relaciones y claves foráneas;
- políticas de eliminación;
- índices y restricciones;
- antisolapamiento de turnos;
- reglas de usuarios, pacientes, tutor, vínculos, turnos, informes y mensajería;
- orden de migraciones;
- diagrama entidad-relación en Mermaid.

### 3. `03-CONTRATO-API-MVP.md`

Contrato REST de la versión `/api/v1`. Incluye:

- formato estándar de respuestas y errores;
- autenticación y cookies;
- filtros, paginación y ordenamiento;
- endpoints por módulo;
- permisos y policies a nivel de recurso;
- datos de entrada y salida;
- transiciones de estado;
- códigos de error funcionales;
- ejemplos de requests y responses.

### 4. `04-MATRIZ-PERMISOS-AUDITORIA-MVP.md`

Documento normativo para RBAC y autorización por dato. Incluye:

- roles fijos;
- permisos por módulo;
- visibilidad por campo;
- restricciones especiales;
- acciones auditadas;
- datos que nunca deben registrarse.

### 5. `05-PLAN-IMPLEMENTACION-BACKEND-MVP.md`

Guía de ejecución del proyecto. Incluye:

- secuencia de desarrollo;
- migraciones y seeders;
- pruebas mínimas por etapa;
- Definition of Done;
- estrategia de ramas y commits;
- preparación de entornos;
- despliegue y verificación operativa.

---

## 3. Reglas de precedencia documental

Ante una contradicción se utiliza el siguiente orden:

1. **Reglas explícitas del documento de modelo de datos y negocio.**
2. **Matriz de permisos y auditoría.**
3. **Contrato de API.**
4. **Documento de arquitectura.**
5. Documentos históricos o preliminares.

El contrato de API no puede ampliar permisos definidos en la matriz. Los modelos Sequelize no pueden alterar restricciones definidas por las migraciones. El frontend no puede reemplazar validaciones del backend ni de PostgreSQL.

---

## 4. Decisiones que corrigen documentos anteriores

Las siguientes decisiones quedan formalmente consolidadas:

| Tema | Decisión definitiva del MVP |
|---|---|
| Lenguaje | JavaScript con módulos CommonJS. No TypeScript. |
| Arquitectura | Monolito modular con patrón `routes → validation → controller → service → model`. |
| Tutor | Un único tutor obligatorio por paciente. Relación 1:1 mediante `tutores.paciente_id UNIQUE`. |
| Credencial | Login con correo electrónico y DNI. El DNI se compara contra un hash bcrypt almacenado en `password_hash`. |
| Autogestión de perfil | Ningún usuario edita su propio perfil. Solo el administrador administra usuarios. |
| Usuarios | Los cuatro roles viven en una única tabla `usuarios`. |
| Coordinación | Puede actuar como prestador: recibir servicios, vincularse a pacientes, tener turnos y crear informes. |
| Servicios asignados | Cualquier usuario autenticado puede asignar o quitar servicios; solo `profesional` y `coordinacion` pueden recibirlos. |
| Paciente | Se crea activo y junto con su tutor, dentro de una transacción. |
| Vínculo | El vínculo prestador-paciente es persistente hasta una desvinculación autorizada. |
| Turnos | No se reprograman. Se cancela el original y se crea un turno nuevo. |
| Estado inicial | Todo turno se crea como `pendiente`. |
| Antisolapamiento | Se protege en el service y mediante restricciones `EXCLUDE USING gist` en PostgreSQL. |
| Informes | Los crean `profesional` y `coordinacion`; solo el autor modifica/finaliza su borrador. |
| Secretaría | Puede leer informes completos, pero no crearlos, editarlos ni finalizarlos. |
| Mensajería | Solo los participantes acceden a una conversación, sin privilegio global para administración o coordinación. |
| Contacto público | No existe formulario de contacto persistido ni endpoint de contacto en el MVP. |
| Auditoría | Solo el administrador consulta auditoría. Nunca se registra contenido clínico, DNI, contraseñas, tokens o mensajes. |
| Instancias | Una instalación y una base de datos independiente por centro; no multi-tenancy compartido. |

---

## 5. Conceptos normativos usados

- **Debe / no debe:** requisito obligatorio.
- **Puede:** comportamiento permitido.
- **Recomendado:** pauta adoptada que puede ajustarse sin cambiar una regla funcional.
- **Fuera del MVP:** no debe implementarse en esta primera versión salvo decisión formal posterior.
- **Policy de recurso:** autorización que depende del dato concreto, no únicamente del rol.
- **Prestador:** usuario activo con rol `profesional` o `coordinacion` habilitado para recibir servicios y atender pacientes.
- **Turno activo:** turno en estado `pendiente` o `confirmado`.
- **Estado terminal:** `completado`, `ausente` o `cancelado`.

---

## 6. Criterio para comenzar a programar

La implementación puede comenzar cuando el equipo acepta estos documentos como baseline y configura:

- repositorio con `api/` y `client/` independientes;
- PostgreSQL local de desarrollo y de pruebas;
- variables de entorno validadas;
- migración inicial con extensiones, roles y usuario administrador;
- pipeline mínimo de lint y pruebas;
- estrategia de revisión de migraciones y pull requests.

No es necesario resolver módulos futuros como facturación, notificaciones externas, adjuntos o multi-tenancy antes de iniciar el MVP.

