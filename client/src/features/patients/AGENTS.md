# Instrucciones de pacientes

## Alcance

Estas reglas aplican a `src/features/patients/` y complementan `client/AGENTS.md`.

## Reglas de dominio

- Un paciente tiene un único tutor obligatorio en el MVP.
- El alta de paciente y tutor constituye un único flujo funcional; no crear un módulo separado de Familias o Tutores.
- Enviar paciente y tutor según el contrato transaccional de la API. No simular dos altas independientes desde la interfaz.
- Tratar los posibles duplicados como conflicto de negocio y mostrar una explicación útil sin ignorar la respuesta del backend.
- Las bajas son desactivaciones lógicas. No ofrecer borrado físico de pacientes, tutor ni historia relacionada.
- Respetar permisos de lectura, creación, edición, desactivación y acceso a información clínica por recurso.
- Un profesional solo debe ver o actuar sobre pacientes permitidos por el backend; no asumir acceso global por conocer un identificador.

## Listado y detalle

- `PatientsPage` mantiene búsqueda, filtros y paginación coherentes con la API.
- En escritorio usar tabla; en pantallas pequeñas ofrecer `PatientCard` o lista equivalente, sin forzar scroll horizontal como única solución.
- `PatientDetailPage` presenta resumen, tutor y pestañas de turnos, informes y conversaciones según permisos y disponibilidad.
- Las pestañas no deben disparar todas las consultas al mismo tiempo si su contenido todavía no fue solicitado.
- Mantener enlaces canónicos hacia agenda, informes y mensajes; no duplicar sus flujos dentro de pacientes.
- Representar claramente pacientes activos e inactivos sin depender solo del color.

## Formularios y mapeo

- `PatientForm` agrupa datos del paciente y del tutor con encabezados claros.
- Mantener campos obligatorios y opcionales alineados con `patientSchema.js` y el contrato vigente de la API.
- `patientMappers.js` es la frontera para transformar datos de formulario y respuesta; evitar transformaciones ad hoc en páginas.
- No enviar campos vacíos con significados ambiguos. Normalizar solo según reglas documentadas.
- Ante `422`, asociar errores a sus campos; ante `409`, mostrar el conflicto a nivel del formulario.
- Conservar el modal abierto si guardar falla y evitar perder datos ingresados.

## Privacidad

- No incluir DNI, datos del tutor, notas clínicas ni contenido de informes en logs, analytics o mensajes genéricos.
- Evitar conservar información de un paciente al cambiar de sesión o navegar hacia otro identificador.
- No mostrar acciones de edición o desactivación sin permiso, aunque el backend igualmente valide cada solicitud.

## Pruebas críticas

- Alta conjunta de paciente y tutor.
- Errores de campo y posible duplicado.
- Edición sin pérdida de relaciones.
- Desactivación confirmada y ausencia de borrado físico.
- Listado paginado, búsqueda y alternativa móvil.
- Detalle con pestañas permitidas y denegadas.
- Restricción por vínculo o policy de recurso para profesionales.
