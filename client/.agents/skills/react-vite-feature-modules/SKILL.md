---
name: react-vite-feature-modules
description: Crear o ampliar pantallas y funcionalidades en aplicaciones React con Vite organizadas por feature. Usar cuando una tarea requiera agregar páginas, componentes, hooks, módulos API, esquemas, estado o pruebas; conectar una feature al router; o refactorizar una pantalla para separar presentación, orquestación y lógica sin romper las convenciones del repositorio.
---

# React Vite Feature Modules

## Objetivo

Implementar una funcionalidad React/Vite dentro del módulo dueño del dominio, con páginas delgadas, componentes presentacionales, lógica en hooks, transporte encapsulado y pruebas proporcionales al comportamiento.

## 1. Inspeccionar antes de diseñar

1. Leer el `AGENTS.md` más cercano y todos los `AGENTS.md` aplicables desde la raíz del cliente hasta la feature.
2. Revisar `package.json`, router, configuración de rutas y permisos, servicios compartidos y una feature análoga ya implementada.
3. Consultar en `client/doc/` únicamente los documentos relacionados con el flujo, permisos, contrato y decisiones afectadas.
4. Verificar qué archivos existen y cuáles están vacíos. No asumir que el árbol scaffold representa funcionalidad terminada.
5. Confirmar en el contrato de la API endpoints, payloads, errores, paginación y policies antes de definir la UI.

Si documentación y código difieren, no improvisar una tercera variante. Aplicar la precedencia definida por el repositorio, señalar la diferencia y mantener el cambio dentro del alcance autorizado.

## 2. Clasificar el cambio

- **Ampliación de feature existente:** trabajar dentro de `src/features/<feature>/` y respetar sus nombres y capas actuales.
- **Feature nueva:** crear solo las capas necesarias; no generar carpetas vacías por simetría.
- **Página transversal o pública:** ubicar la página bajo `src/pages/` únicamente cuando no pertenezca a un dominio; mantener datos y componentes específicos dentro de su feature.
- **Componente compartido:** mover a `src/components/` solo si es neutral al dominio y tiene reutilización real o inmediata en más de una feature.
- **Estado transversal:** usar `src/store/` o `src/app/` solo para sesión, permisos, notificaciones o UI global genuina.

## 3. Distribuir responsabilidades

| Capa | Responsabilidad | Evitar |
|---|---|---|
| `pages/` | Orquestar la pantalla, leer parámetros, componer hooks y secciones | HTTP directo, mapeos extensos, JSX monolítico |
| `components/` | Renderizar datos y emitir eventos mediante props | Fetch, conocimiento del transporte, reglas de autorización duplicadas |
| `hooks/` | Coordinar estado, consultas, mutaciones y efectos del caso de uso | JSX, detalles visuales, clientes HTTP propios |
| `api/` | Encapsular endpoints, parámetros y payloads | Estado React, toasts, navegación, respuestas crudas dispersas |
| `schemas/` | Definir validación reutilizable y alineada con la API | Reglas de negocio que requieren base de datos |
| `store/` | Mantener estado global justificado y selectors estables | Formularios, filtros o resultados locales persistidos sin necesidad |
| `utils/` | Mapear y formatear mediante funciones puras | Efectos, acceso al store o llamadas HTTP |
| `tests/` | Probar comportamiento observable y contratos críticos | Acoplarse a detalles internos sin valor para el usuario |

## 4. Diseñar la interfaz del módulo

1. Definir la página y sus estados visibles: carga, éxito, vacío, error, reintento y mutación pendiente.
2. Diseñar componentes presentacionales con props explícitas, callbacks semánticos y nombres de dominio claros.
3. Mantener acceso a datos en hooks de feature que consuman el módulo `api/` compartido o específico.
4. Normalizar respuestas y errores antes de entregarlos a componentes.
5. Colocar transformaciones formulario/API en mappers puros cuando las formas difieran.
6. Derivar acciones visibles de permisos explícitos, sin tratar la UI como barrera de seguridad.
7. Mantener el backend como autoridad para validación, conflictos y policies por recurso.

Un componente presentacional puede gestionar estado visual efímero, como expansión o foco, pero no debe conocer Axios, Redux, rutas de endpoint ni credenciales.

## 5. Implementar formularios y mutaciones

- Usar la estrategia de formularios ya instalada. Incorporar React Hook Form y Joi solo si existen o si la tarea autoriza agregar esas dependencias.
- Asociar labels, ayudas y errores con sus campos; ofrecer resumen accesible para errores `422` cuando sea necesario.
- Bloquear envíos duplicados y conservar los datos ingresados si la API falla.
- Tratar `401`, `403`, `409` y `422` según el normalizador global.
- Pedir confirmación para cancelaciones, desactivaciones o transiciones irreversibles.
- Actualizar únicamente los recursos y métricas afectados después de una mutación.
- No aplicar optimismo cuando un conflicto de negocio o concurrencia no tenga reversión segura.

## 6. Integrar navegación y permisos

- Registrar rutas en la configuración central; no declarar rutas aisladas dentro de una feature.
- Usar el layout correspondiente y separar sesión de permiso de módulo.
- Mantener rutas privadas bajo `/app` y rutas públicas según el mapa documentado.
- Agregar entradas de menú solo para módulos navegables y permisos confirmados.
- No conceder acceso amplio para resolver un selector. Consumir proyecciones o endpoints mínimos cuando estén definidos.
- Conservar una única fuente para paths, labels de navegación y claves de permiso.

## 7. Aplicar UI y responsive

- Reutilizar componentes existentes antes de crear variantes nuevas.
- Usar CSS Modules para estilos locales y tokens globales para color, tipografía, espaciado, radios y sombras.
- Mantener el sitio público mobile-first y el panel privado desktop-first responsive.
- Proporcionar alternativa móvil a tablas y hacer fullscreen los modales de formulario cuando lo indiquen las reglas del cliente.
- Usar HTML semántico, foco visible, navegación por teclado y nombres accesibles.
- No comunicar estados solo con color ni introducir valores visuales arbitrarios fuera de tokens.

## 8. Probar y verificar

1. Añadir pruebas unitarias para mappers, schemas, reducers y utilidades con ramificaciones relevantes.
2. Probar componentes desde lo que una persona puede ver y hacer.
3. Usar MSW para éxito, vacío, error, permisos y conflictos cuando el stack de pruebas esté disponible.
4. Agregar o actualizar E2E solo para un flujo crítico completo.
5. Ejecutar únicamente scripts existentes en `package.json`: lint, pruebas, typecheck o build según corresponda.
6. Revisar imports, rutas, permisos, estados asíncronos, responsive y ausencia de código no utilizado.
7. Informar con precisión cualquier verificación no disponible; no inventar resultados.

## Guardrails

- No instalar dependencias por costumbre; justificar cada incorporación contra el stack actual.
- No mover reglas de negocio al frontend para simplificar una pantalla.
- No persistir tokens, DNI, permisos, perfiles completos ni contenido clínico en almacenamiento web.
- No duplicar transporte HTTP, normalización de errores, rutas, permisos o tokens visuales.
- No crear páginas gigantes, componentes conectados a todo el sistema ni hooks que mezclen dominios.
- No ampliar endpoints, roles, transiciones o alcance funcional sin respaldo documental.
- No declarar completada una feature solo porque existe su estructura de archivos.

## Entrega esperada

Resumir:

- funcionalidad creada o ampliada;
- capas y archivos relevantes;
- contrato, permisos y decisiones respetadas;
- pruebas y verificaciones ejecutadas;
- limitaciones o pendientes reales.
