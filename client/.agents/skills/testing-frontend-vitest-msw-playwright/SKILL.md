---
name: testing-frontend-vitest-msw-playwright
description: Agregar, ampliar, corregir o revisar pruebas de funcionalidades React/Vite con Vitest, Testing Library, MSW y Playwright. Usar cuando una tarea necesite pruebas unitarias de utilidades, schemas, mappers, reducers o selectors; pruebas de componentes e interacción; mocks HTTP contractuales; integración de sesión, permisos y errores; cobertura; o flujos críticos E2E públicos y privados.
---

# Testing frontend con Vitest, MSW y Playwright

## Objetivo

Proteger el comportamiento observable de cada funcionalidad con la capa de prueba más pequeña que aporte confianza. Usar Vitest para lógica aislada, Testing Library para comportamiento de componentes, MSW para integración HTTP y Playwright para pocos recorridos críticos completos.

## 1. Inspeccionar antes de probar

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Revisar `package.json`, scripts, configuración y archivos de setup; no asumir que un scaffold vacío está operativo.
3. Inspeccionar la implementación, sus contratos API, permisos, estados y una prueba análoga existente.
4. Consultar `client/doc/` y `api/docs/` cuando el flujo dependa de reglas de negocio o respuestas HTTP.
5. Identificar el riesgo del cambio y seleccionar los límites que necesitan protección.
6. Confirmar qué comandos de prueba existen antes de ejecutarlos o documentarlos.

Vitest, Testing Library, MSW y Playwright forman parte de la arquitectura objetivo. Si no están instalados o configurados, informar el estado real y agregar la base únicamente cuando la tarea autorice modificar dependencias y configuración.

## 2. Elegir la capa adecuada

| Necesidad | Herramienta | Alcance |
|---|---|---|
| Función pura o transición de estado | Vitest | Entrada y salida sin DOM ni red |
| Componente y acción del usuario | Testing Library + Vitest | DOM accesible y efectos observables |
| Hook o pantalla que consume la API | Testing Library + MSW | Request real del cliente y respuesta simulada |
| Recorrido entre rutas y superficies | Playwright | Aplicación ejecutándose como usuario |

- Preferir muchas pruebas unitarias rápidas, suficientes pruebas de integración y pocos E2E de alto valor.
- No repetir el mismo detalle en las cuatro capas.
- Probar reglas complejas cerca de su unidad y conservar en E2E solo la evidencia del flujo completo.
- Agregar una prueba de regresión cuando se corrija un bug reproducible.
- Evitar snapshots extensos; usarlos solo para estructuras pequeñas y deliberadamente estables.

## 3. Preparar la infraestructura cuando falte

- Instalar versiones compatibles con React, Vite y Node del repositorio, sin asumir versiones de memoria.
- Configurar Vitest con entorno DOM, globals solo si la convención lo decide y un archivo `tests/setup.js` común.
- Incorporar matchers de DOM y limpieza automática de Testing Library.
- Iniciar MSW antes de la suite, resetear handlers después de cada prueba y cerrar el servidor al terminar.
- Tratar requests HTTP no interceptadas como error para detectar contratos incompletos.
- Separar servidor MSW de Node y worker del navegador cuando ambos sean necesarios.
- Configurar Playwright con `baseURL`, servidor de desarrollo o preview, trazas y artefactos solo en fallos o reintentos.
- Agregar scripts coherentes como `test`, `test:run`, `test:coverage` y `test:e2e` únicamente cuando funcionen.
- Mantener unitarias e integración en el pipeline rápido; ejecutar Playwright en un job separado cuando su costo lo justifique.

No copiar configuraciones genéricas que contradigan ESM, aliases o rutas del proyecto.

## 4. Organizar pruebas y datos

- Colocar pruebas unitarias y de componentes junto a la feature o en su carpeta `tests/`, siguiendo la convención dominante.
- Mantener configuración, setup, mocks compartidos, fixtures y E2E en `client/tests/` cuando sean transversales.
- Nombrar archivos `*.test.js(x)` para Vitest y `*.spec.js` para Playwright, salvo convención ya configurada.
- Crear fixtures pequeñas, explícitas y ficticias; nunca copiar pacientes, DNI, mensajes o contenido clínico real.
- Usar builders solo cuando reduzcan duplicación real y mantengan visibles los campos importantes de cada caso.
- Mantener handlers por recurso y escenarios específicos por prueba.
- Evitar estado mutable compartido entre tests; recrearlo o restablecerlo de forma determinista.
- Fijar fecha, zona horaria o reloj cuando el comportamiento dependa del tiempo.

Los payloads frontend permanecen en `camelCase`; los handlers deben reflejar el contrato HTTP real y las transformaciones de frontera confirmadas.

## 5. Escribir unitarias con Vitest

Priorizar:

- formatters, fechas y enlaces de contacto;
- mappers de entidad, formulario y evento de agenda;
- schemas y reglas condicionales;
- reducers, actions y selectors;
- matriz de permisos y configuración derivada;
- normalización de errores;
- utilidades de sesión y coordinación que puedan aislarse.

Reglas:

- Expresar casos con nombres de comportamiento y resultado esperado.
- Cubrir límites, entradas vacías, valores nulos y errores relevantes, no solo el camino feliz.
- Evitar mocks para funciones puras.
- Usar spies solo en fronteras observables y restaurarlos después de cada prueba.
- Usar fake timers únicamente en debounce, polling, expiración o inactividad; avanzar el reloj de forma explícita y volver a timers reales.
- No probar implementaciones privadas, orden interno de llamadas o constantes sin efecto observable.
- No forzar cobertura sobre archivos declarativos sin lógica.

## 6. Probar componentes con Testing Library

- Renderizar con los providers mínimos reales: router, store y contexto solo cuando el componente los necesite.
- Consultar primero por rol y nombre accesible; usar label, texto o placeholder solo cuando represente cómo encuentra el elemento una persona.
- Usar `user-event` para escribir, navegar, seleccionar y hacer clic.
- Esperar cambios asíncronos mediante consultas `findBy*` o `waitFor` sobre un resultado concreto.
- Probar contenido y comportamiento, no clases CSS ni estructura interna salvo que comuniquen estado accesible.
- Verificar loading, success, empty, error, retry, disabled y permisos cuando apliquen.
- Comprobar formularios: labels, errores asociados, submit único, preservación de valores y errores 409/422.
- Comprobar modales: título, foco inicial, tabulación, Escape, bloqueo durante guardado y retorno de foco.
- Comprobar tablas y tarjetas móviles como representaciones del mismo dato cuando el comportamiento responsive cambie.
- Comprobar sidebar, drawer, ruta activa y menú según permisos.
- Evitar `data-testid`; reservarlo para elementos sin semántica ni texto estable.

No afirmar que un componente es accesible solo porque la prueba lo encuentra por rol; verificar también interacción, foco y estados.

## 7. Simular HTTP con MSW

- Interceptar requests emitidas por el cliente API real; no mockear Axios o cada módulo API si el objetivo es probar integración.
- Mantener handlers base para escenarios comunes y sobrescribirlos dentro de la prueba para variantes puntuales.
- Representar el contrato real de éxito, paginación, filtros, permisos y proyecciones por rol.
- Cubrir al menos un error de negocio por feature, además del éxito.
- Incluir según el flujo: `401`, `403`, `409`, `422`, `429`, `500`, timeout, red caída y respuesta demorada.
- Verificar que los errores normalizados produzcan el estado visual correcto sin exponer mensajes internos.
- Probar cancelación de lecturas obsoletas y ausencia de actualizaciones tras desmontar.
- Probar polling con reloj controlado, pausa en pestaña oculta y limpieza al desmontar.
- Mantener un solo refresh concurrente ante varios `401`, reintentar una vez y cerrar sesión si falla.
- No interceptar silenciosamente endpoints no declarados.

Los mocks deben respetar minimización de datos: no devolver DNI, correo, notas internas, participantes o contenido clínico a roles que no deban recibirlos.

## 8. Diseñar E2E con Playwright

- Reservar E2E para rutas públicas principales, autenticación, permisos y recorridos de negocio que atraviesen varias capas.
- Partir de un estado conocido y aislar los datos de cada prueba.
- Usar locators por rol, label, nombre o texto estable; evitar selectores CSS frágiles y esperas temporales fijas.
- Esperar estados visibles, navegación o respuestas relevantes, no usar `waitForTimeout` como sincronización.
- Autenticar mediante la interfaz cuando se prueba login; reutilizar estado autenticado solo en flujos cuyo objetivo empiece después del login.
- Verificar tanto acceso permitido como denegado por URL y por acción visible.
- Mantener trazas, screenshots y video principalmente para diagnosticar fallos.
- No depender del orden de ejecución ni de datos creados por otra prueba.
- No enviar mensajes, correos, WhatsApp ni acciones externas reales desde tests.

Priorizar estos recorridos:

- público: Home, Servicios, Equipo, Nosotros, Contacto, Privacidad, Login, menú móvil y 404;
- sesión: login válido/inválido, refresh, logout, expiración e inactividad;
- administrador: usuarios, servicios, catálogos, turno y auditoría;
- profesional: paciente+tutor, turno, estados permitidos e informe finalizado;
- secretaría: pacientes, turno para prestador, cancelación con motivo y lectura autorizada;
- mensajería: conversación, respuesta, participantes, no leído y archivado;
- permisos: 403, acciones ocultas y rechazo final del backend.

## 9. Probar dominio y seguridad

- Tratar el backend como autoridad: una acción oculta debe probar también el rechazo HTTP cuando el escenario lo permita.
- Probar tutor único y formulario conjunto de paciente+tutor.
- Probar conflictos de agenda y estados válidos sin inventar reprogramación o drag-and-drop.
- Probar que un informe finalizado sea de solo lectura y conserve autoría.
- Probar que solo participantes autorizados accedan a conversaciones.
- Probar que tokens y datos sensibles no se persistan en almacenamiento web.
- Probar que errores, logs y fixtures no expongan información confidencial.
- Mantener tests de autorización separados de tests puramente visuales.

## 10. Mantener pruebas deterministas

- Controlar tiempo, locale, zona horaria, aleatoriedad y respuestas HTTP.
- Liberar mocks, timers, listeners, stores y DOM después de cada prueba.
- Evitar carreras esperando el resultado observable correcto.
- No compartir puertos, cuentas o registros mutables entre workers E2E sin aislamiento.
- Reintentar E2E solo como ayuda diagnóstica; no usar retries para ocultar flakiness.
- Investigar una prueba intermitente antes de aumentar timeouts.
- Mantener mensajes de fallo legibles y una sola responsabilidad principal por test.

## 11. Medir cobertura con criterio

- Usar el 80 % general documentado como objetivo cuando la cobertura esté configurada, no como sustituto de escenarios críticos.
- Priorizar auth/session, permisos, formularios, conflictos de turnos, finalización de informes, participación en mensajes e inactividad.
- Revisar ramas y casos no cubiertos, no solo el porcentaje total.
- Excluir únicamente archivos generados, declarativos o de bootstrap sin lógica, con configuración explícita y justificada.
- No escribir assertions vacías ni pruebas redundantes para alcanzar una cifra.

## 12. Verificar antes de entregar

1. Ejecutar primero la prueba modificada o el conjunto más pequeño relacionado.
2. Ejecutar luego la suite unitaria/de integración disponible.
3. Ejecutar lint y build para detectar incompatibilidades.
4. Ejecutar E2E afectado cuando la aplicación y su entorno estén disponibles.
5. Confirmar que no quedan requests MSW sin handler, warnings de `act`, handles abiertos ni errores de consola inesperados.
6. Informar comandos, resultados, pruebas omitidas y motivo exacto.

Si las herramientas o scripts no existen, no inventar resultados. Diferenciar entre pruebas creadas, pruebas ejecutadas y comportamiento no verificable en el entorno actual.

## Guardrails

- No instalar herramientas sin que el alcance autorice dependencias y configuración.
- No mockear la unidad bajo prueba hasta convertir el test en una tautología.
- No probar detalles internos cuando existe un resultado observable.
- No usar snapshots grandes como cobertura principal.
- No usar datos personales o clínicos reales en fixtures, trazas o screenshots.
- No usar esperas fijas ni selectores frágiles en Playwright.
- No permitir requests externas reales en pruebas automatizadas.
- No cubrir únicamente caminos exitosos.
- No cambiar reglas de negocio para facilitar una prueba.
- No declarar una feature terminada si sus escenarios críticos quedaron sin ejecutar.

## Entrega esperada

Resumir:

- capas y escenarios agregados o modificados;
- fixtures, handlers y contratos simulados;
- casos de éxito, error, permisos y regresión cubiertos;
- comandos ejecutados y resultados;
- cobertura relevante, limitaciones y E2E pendientes.
