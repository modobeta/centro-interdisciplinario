# Instrucciones del frontend

## Alcance

Estas instrucciones aplican a todo `client/`. Los `AGENTS.md` ubicados dentro de features agregan reglas de dominio más específicas y tienen prioridad dentro de su subárbol.

El cliente es una única SPA React + Vite que contiene sitio público, login y panel privado. El backend es la autoridad de seguridad, permisos, validación y reglas de negocio.

La especificación funcional y técnica versionada vive en `client/doc/`. Consultarla antes de implementar rutas, permisos, contratos, estados o flujos de negocio. `AGENTS.md` resume reglas operativas y no sustituye esos documentos.

## Estado del proyecto

- El repositorio se encuentra en una etapa inicial: gran parte del árbol está creado, pero muchos archivos están vacíos.
- Hoy están instalados React, Vite y ESLint. No asumir que una dependencia prevista ya está disponible; verificar `package.json` antes de importarla.
- React Router, Axios, Redux Toolkit, React Hook Form, FullCalendar, React Icons, React Helmet Async, Vitest, Testing Library, MSW y Playwright forman parte de la arquitectura objetivo y deben incorporarse solo en la etapa que los necesite.
- No presentar funcionalidades planificadas como terminadas ni inventar resultados de pruebas.

## Convenciones de implementación

- Usar JavaScript moderno con módulos ES, `const` y `let`; nunca `var`.
- Componentes, layouts y páginas: `PascalCase`.
- Hooks: prefijo `use` y nombres `camelCase`.
- Funciones, variables, actions y selectors: `camelCase`.
- Rutas y nombres públicos de URL: `kebab-case` cuando corresponda.
- Payloads y modelos del frontend: `camelCase`. No propagar `snake_case` de persistencia a la UI.
- Mantener páginas delgadas. Extraer UI reutilizable a componentes y lógica de flujo a hooks o servicios.
- Evitar archivos barril y abstracciones genéricas si no simplifican una necesidad repetida real.
- No agregar dependencias sin verificar que la plataforma actual no resuelva ya el problema.

## Organización por capas

- `app/`: providers, store y composición transversal.
- `config/`: lectura validada de entorno, rutas, permisos, menú y contenido institucional.
- `router/`: composición de rutas y guardas de navegación.
- `layouts/`: estructura compartida; no colocar reglas de negocio aquí.
- `components/`: primitivas y patrones compartidos sin conocimiento de una feature concreta.
- `features/`: API, componentes, hooks, páginas, esquemas, estado y utilidades de cada dominio.
- `services/`: transporte, sesión, errores y URLs de archivos.
- `styles/`: tokens, reset, estilos globales, públicos, privados e impresión.
- `utils/`: funciones puras transversales.
- `tests/`: setup, mocks, fixtures ficticios y E2E.
- `doc/`: arquitectura, decisiones confirmadas, contratos y planes del frontend; no importar sus ejemplos como código de producción sin adaptarlos al repositorio.

No mover lógica específica de una feature a carpetas globales solo para reutilizarla una vez.

## Rutas y layouts

- Mantener rutas públicas `/`, `/nosotros`, `/servicios`, `/equipo`, `/contacto` y `/privacidad` bajo `PublicLayout`.
- Mantener `/login` bajo `AuthLayout` y evitar mostrarlo como ruta de usuario ya autenticado.
- Usar `/app` para el panel privado y redirigirlo a `/app/resumen`.
- Separar la comprobación de sesión de la comprobación de permisos.
- Ante falta de permiso dentro del panel, dirigir a `/app/403`; usar 404 para rutas inexistentes.
- Restaurar el scroll al navegar por páginas públicas, salvo que un flujo documentado requiera conservar posición.

## Permisos y seguridad

- Derivar menú, rutas y acciones de permisos explícitos recibidos del backend; no inferir acceso solo por esconder botones.
- Las guardas del frontend son experiencia de usuario, no controles de seguridad.
- Tratar `401` como sesión ausente o expirada, `403` como acceso denegado, `409` como conflicto de negocio y `422` como validación de entrada.
- No persistir access tokens, refresh tokens, DNI, contenido clínico, permisos ni perfiles completos en `localStorage`.
- El refresh token vive solo en cookie `HttpOnly`; las solicitudes privadas deben enviar credenciales.
- No registrar secretos, tokens, DNI, informes, notas internas ni cuerpos de mensajes.
- Nunca mostrar datos ficticios como reales en producción.

## Estado y datos asíncronos

- Reservar Redux Toolkit para sesión, permisos, notificaciones y estado transversal realmente compartido.
- Mantener filtros locales, modales, formularios y datos simples de una pantalla en estado local o hooks de feature.
- No usar Redux Persist para el estado sensible.
- No usar RTK Query en el MVP; mantener el transporte en la capa API y los flujos asíncronos en hooks o estado explícito.
- Cada flujo remoto debe representar `idle`, `loading`, `success`, `empty`, `error` y, cuando aplique, `refreshing` o mutación en curso.
- Evitar que un fallo parcial bloquee contenido independiente; servicios y equipo públicos deben cargar y fallar por separado.
- Después de mutaciones, actualizar o invalidar únicamente los recursos afectados.
- Para pacientes, usuarios, informes y auditoría, respetar la paginación backend de 20 elementos.
- Aplicar búsquedas con debounce de 400 ms a partir de 2 caracteres y mantener filtros temporales fuera de `localStorage`.
- No introducir WebSocket en el MVP. El contador de conversaciones no leídas usa polling moderado y nunca transporta contenido sensible.

## API y errores

- Usar una sola instancia HTTP centralizada; las features no deben crear clientes Axios propios.
- La URL de API prevista termina en `/api/v1`; las features consumen rutas relativas.
- Mantener renovación concurrente de sesión con una sola solicitud de refresh y reintentar una única vez las peticiones elegibles.
- No reintentar automáticamente validaciones, permisos ni conflictos de negocio.
- Normalizar errores de transporte antes de entregarlos a páginas o formularios.
- Las rutas de imágenes son relativas y se resuelven mediante la URL de archivos configurada.
- Los módulos `*Api.js` ocultan HTTP y devuelven datos útiles para la feature, no respuestas crudas por toda la interfaz.

## Formularios y feedback

- Usar React Hook Form con Joi cuando las dependencias estén incorporadas y el formulario sea no trivial.
- Mantener esquemas Joi por feature alineados con la API; no duplicar validaciones inconsistentes dentro de componentes.
- Usar date-fns para cálculo y formato de fechas; centralizar formatos visibles para evitar divergencias entre módulos.
- Mostrar errores de campo y un resumen accesible para respuestas `422` cuando sea útil.
- Deshabilitar envíos duplicados y mantener feedback mientras una mutación está pendiente.
- Usar modales para altas y ediciones previstas por el MVP; controlar foco inicial, cierre con Escape, restauración de foco y bloqueo durante guardado.
- Pedir confirmación en desactivaciones, cancelaciones y cambios irreversibles.
- Usar toasts para feedback transitorio y estados inline cuando el error bloquee una superficie concreta.

## Estilos, responsive y accesibilidad

- Usar CSS Modules para estilos locales y CSS Custom Properties en `styles/tokens.css` para decisiones reutilizables.
- No repetir colores, tipografías, radios, sombras o espaciados como valores arbitrarios.
- Conservar Nunito para títulos e Inter para cuerpo e interfaz. La paleta base usa `#2E6F6E` como color principal y `#C77B4B` como acento, siempre consumidos desde tokens.
- Usar una capa central de React Icons con Font Awesome 6 como familia principal y Simple Icons solo para marcas; no mezclar otras familias sin justificar y centralizar la excepción.
- Diseñar el sitio público mobile-first y el panel privado desktop-first responsive.
- Tablas privadas deben tener alternativa de tarjetas o disposición legible en pantallas pequeñas.
- En móvil, los modales de formulario deben ocupar la pantalla completa y ninguna función del MVP puede quedar bloqueada por dispositivo.
- Usar HTML semántico, labels visibles, nombres accesibles, foco perceptible y navegación por teclado.
- No comunicar estados exclusivamente mediante color; acompañarlos con texto o iconografía accesible.
- Respetar `prefers-reduced-motion` y evitar animaciones que no aporten comprensión.

## Reglas del área pública

- Centralizar nombre institucional, lema, contacto, horarios, mapa, redes y coberturas en `site.config.js`; no duplicarlos en componentes.
- Obtener servicios y equipo desde endpoints públicos y mostrar solo campos públicos.
- Home muestra hasta cuatro servicios y cuatro integrantes ordenados por `ordenPublico`; las páginas completas muestran todos sin filtros ni paginación.
- En Equipo, ordenar coordinación, secretaría y profesionales mediante `ordenPublico`, usar el mismo componente visual y mantener `funcionPublica` separada del rol técnico. El administrador nunca se publica.
- Mostrar biografías completas directamente en `/equipo`; no crear fichas individuales.
- Servicios públicos muestran nombre, descripción e imagen y requieren registros activos con `visiblePublicamente`; mantener ambos campos como decisiones independientes en administración.
- No crear formulario ni endpoint de contacto. WhatsApp, correo y teléfono son enlaces externos.
- El mapa completo se muestra solo en Contacto.
- Usar las seis imágenes institucionales previstas junto al contenido —tres en Home y tres en Nosotros—; no crear galería ni carrusel.
- Ocultar correo, redes, coberturas, mapa o contenido legal cuando falten datos reales, siguiendo los fallbacks definidos en `doc/07-REGISTRO-DECISIONES-PUBLICO-MVP.md`.
- No agregar analytics, Meta Pixel ni cookies de seguimiento en el MVP.
- Mantener SEO básico por ruta y contenido comprensible aunque falle una consulta pública.

## Reglas del panel privado

- Usar un único `PrivateLayout` y un único dashboard para todos los roles.
- Mantener sidebar estrecho, topbar con Inicio público, alertas de mensajes y cierre de sesión, y perfil de solo lectura sin módulo propio.
- El profesional no ve módulos de Usuarios ni Servicios.
- Usuarios funciona como directorio para coordinación y secretaría; solo administración gestiona cuentas y accesos.
- Catálogos y Auditoría son exclusivos de administración; Auditoría es solo lectura.
- Pacientes incorpora el tutor; no crear un módulo separado de Familias o Tutores.
- Las desactivaciones son lógicas; no implementar borrado físico de información clínica.
- No implementar reprogramación de turnos: cancelar el original y crear uno nuevo.
- Los informes finalizados son inmutables.
- Las conversaciones solo son visibles para sus participantes.

## Pruebas y calidad

- Antes de cerrar cambios, ejecutar los scripts relevantes que existan realmente en `package.json`.
- Actualmente están disponibles `npm run lint` y `npm run build`; no afirmar que hay tests hasta configurar sus scripts.
- Cuando se incorpore el stack de pruebas, cubrir utilidades y reducers con Vitest, componentes con Testing Library, integración HTTP con MSW y flujos críticos con Playwright.
- Priorizar autenticación, permisos, pacientes, agenda, informes, mensajería y rutas públicas.
- El objetivo documental es al menos 80 % de cobertura, sin sustituir pruebas de comportamiento por métricas superficiales.
- Probar estados de carga, vacío, error, permisos y responsive, además del camino exitoso.

## Fuentes de verdad y actualización

En caso de contradicción, aplicar este orden:

1. Reglas de negocio confirmadas del MVP.
2. Ajustes backend documentados en `doc/08-AJUSTES-BACKEND-DERIVADOS-DEL-FRONTEND-MVP.md` y `doc/06-AJUSTES-BACKEND-PARA-FRONTEND-PUBLICO-MVP.md`.
3. Matriz de permisos, contrato API y modelo de datos del backend.
4. Registros vigentes `doc/09-REGISTRO-DECISIONES-FRONTEND-PRIVADO-MVP.md` y `doc/07-REGISTRO-DECISIONES-PUBLICO-MVP.md`.
5. Documentos consolidados y documentos temáticos de `client/doc/`.
6. Ejemplos, anexos, prototipos y material histórico.

No implementar decisiones marcadas `REEMPLAZADA`, `FUERA_MVP`, `PENDIENTE_PRODUCCION` o `PENDIENTE_REAL` como si estuvieran resueltas. Cuando falte información real, aplicar el comportamiento temporal documentado y no inventar datos.

Una decisión confirmada no se cambia silenciosamente en código. Registrar el cambio con un identificador `FPRI-*` o `FPUB-*`, indicar la decisión reemplazada y revisar impacto en datos, API, frontend, permisos, pruebas y documentación.

Actualizar estas instrucciones cuando cambien el stack, los scripts, la estructura, el contrato de entorno, las rutas, los permisos o una regla funcional estable. No copiar documentación extensa aquí si puede expresarse como una regla operativa breve.
