---
name: responsive-y-accesibilidad-web
description: Construir, ampliar, revisar o corregir interfaces React/Vite responsive y accesibles. Usar cuando una tarea involucre mobile-first, breakpoints, sidebar como drawer, tablas convertidas en tarjetas, filtros móviles, modales fullscreen, navegación por teclado, foco visible o administrado, diálogos accesibles, landmarks, labels, aria-live, contraste WCAG AA, zoom, targets táctiles o prefers-reduced-motion.
---

# Responsive y accesibilidad web

## Objetivo

Construir interfaces utilizables en móvil, tablet y escritorio, operables por teclado y comprensibles con tecnologías de asistencia. Resolver responsive, semántica, foco, anuncios y movimiento como parte del comportamiento del componente, no como una corrección visual posterior.

## 1. Inspeccionar el contexto real

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Revisar el componente, sus estilos, el layout contenedor y una implementación análoga.
3. Consultar en `client/doc/` las decisiones responsive, de interacción y accesibilidad del flujo.
4. Identificar las anchuras donde el contenido deja de ser usable; no elegir breakpoints por modelos de dispositivo.
5. Enumerar semántica, orden DOM, recorrido de teclado, gestión de foco, anuncios y estados dinámicos.
6. Confirmar las librerías instaladas antes de usar soluciones externas.

No asumir que un archivo existente implementa el patrón si está vacío. No corregir accesibilidad únicamente con atributos ARIA cuando el elemento HTML nativo ya resuelve la semántica.

## 2. Elegir la estrategia responsive correcta

- Aplicar mobile-first al sitio público: estilos base para móvil y mejoras progresivas con `min-width`.
- Respetar el panel privado desktop-first responsive documentado por su densidad operativa, resolviendo en el mismo cambio su representación móvil completa.
- Mantener el orden DOM lógico aunque la composición visual cambie entre texto, imagen, paneles o columnas.
- Usar Grid y Flexbox según la relación del contenido; evitar posicionamiento absoluto para el layout principal.
- Preferir tamaños fluidos, `min()`, `max()`, `clamp()` y límites de contenedor antes que anchos fijos.
- Usar los breakpoints del sistema como referencia y ajustar cuando el contenido lo exija.
- Evitar detectar dispositivos desde JavaScript para decisiones que CSS puede resolver.
- Usar `useMediaQuery` solo cuando el comportamiento React realmente cambie, no para duplicar estilos.
- Tratar scroll horizontal como último recurso y nunca como solución general para páginas o formularios.

Revisar al menos móvil estrecho de 320 px, tablet, escritorio y zoom del 200 %. Ninguna función, dato crítico o acción principal puede desaparecer por tamaño de pantalla.

## 3. Adaptar navegación y sidebar

### Sitio público

- Mostrar navegación completa en escritorio y botón de menú con panel en móvil.
- Usar un botón real con nombre accesible, `aria-expanded` y `aria-controls`.
- Mover el foco al panel o primer elemento útil al abrir cuando corresponda.
- Cerrar con Escape, acción explícita, navegación y clic exterior solo si este último no interfiere con el teclado.
- Restaurar el foco al disparador al cerrar.
- Mantener el contenido fuera del menú no interactivo mientras el panel modal esté abierto.

### Panel privado

- Mantener sidebar fijo, expandido o contraído en escritorio y transformarlo en drawer en móvil.
- Conservar la ruta activa de forma visual y semántica mediante `aria-current="page"`.
- Mantener tooltips accesibles cuando el sidebar contraído muestre solo iconos.
- Cerrar el drawer automáticamente después de navegar.
- Bloquear el scroll del fondo y evitar que el foco salga del drawer modal.
- No esconder opciones por responsive; mostrar solo las permitidas por autorización.

Incluir un enlace de salto al contenido visible al recibir foco y landmarks `header`, `nav` y `main` correctamente identificados.

## 4. Convertir layouts densos sin perder información

### Tablas

- Mantener `<table>`, `<thead>`, `<th scope="col">` y caption o nombre accesible en escritorio.
- Comunicar ordenamiento con texto y `aria-sort`; no depender solo de la dirección de un icono.
- Convertir cada registro en una tarjeta etiqueta–valor mediante `ResponsiveDataList` cuando la tabla deja de ser legible.
- Conservar identidad, estado y acciones principales en la tarjeta móvil.
- No duplicar reglas de negocio: tabla y tarjetas consumen el mismo modelo de vista y callbacks.
- No ocultar columnas críticas ni compactar texto hasta volverlo ilegible.
- Permitir scroll horizontal solo para datos que realmente deban compararse como matriz.

### Filtros y formularios

- Mantener filtros visibles en escritorio y moverlos a drawer o acordeón en móvil.
- Indicar filtros activos y ofrecer `Limpiar filtros` dentro y fuera del panel cuando sea necesario.
- Organizar formularios en una columna en móvil y mantener labels, ayudas y errores junto a sus controles.
- Usar controles táctiles de al menos 44 px de alto y separación suficiente entre acciones.
- Evitar truncar contenido clínico, nombres, estados o información necesaria para decidir.

### Vistas de dos paneles

- Mostrar lista y detalle simultáneamente solo cuando exista ancho suficiente.
- En móvil, mostrar una vista por vez y ofrecer una acción Atrás identificable y accesible.
- Preservar selección, posición y contexto al alternar entre lista y detalle.

## 5. Implementar modales y diálogos accesibles

- Usar el elemento `<dialog>` cuando encaje con el soporte y arquitectura existentes, o un contenedor con `role="dialog"` y `aria-modal="true"` correctamente implementado.
- Asociar el diálogo con su título mediante `aria-labelledby`; usar `aria-describedby` solo para una descripción breve relevante.
- Mover el foco al título o primer control útil al abrir.
- Atrapar el foco dentro del diálogo mientras esté activo.
- Cerrar con Escape salvo durante un guardado no interrumpible o una decisión anidada.
- Restaurar el foco al elemento disparador al cerrar.
- Inhabilitar la interacción y bloquear el scroll del fondo.
- Separar encabezado fijo, cuerpo desplazable y pie de acciones fijo.
- Convertir formularios a fullscreen en celular sin perder título, cierre ni acción principal.
- Confirmar antes de cerrar si existen cambios sin guardar.
- No usar un diálogo genérico para una acción sensible que requiera contexto o datos adicionales.

Gestionar foco, Escape y scroll con comportamiento React; CSS por sí solo no convierte un contenedor en diálogo accesible.

## 6. Diseñar navegación por teclado y foco

- Usar controles nativos: enlaces para navegar, botones para ejecutar acciones e inputs correctamente etiquetados.
- Conservar el orden natural del DOM; evitar `tabIndex` positivos.
- Usar `tabIndex="-1"` únicamente para destinos de foco programático.
- Mostrar `:focus-visible` con contraste suficiente y sin depender de un cambio sutil de color.
- No eliminar `outline` sin un reemplazo igual o más perceptible.
- Permitir activar controles con las teclas nativas esperadas; no reimplementar botones con `div`.
- Mantener accesibles menús, tabs, selects, acordeones y controles compuestos según su patrón ARIA correspondiente.
- Al navegar entre rutas, desplazar al inicio y enfocar el título o `main` sin interrumpir navegación histórica ni lectores de pantalla.
- Al fallar un formulario, enfocar el primer campo inválido visible o un resumen de errores útil.
- No mover el foco a toasts, skeletons ni mensajes transitorios.

Probar el flujo completo usando solo teclado: entrada, navegación, apertura, interacción, cierre y recuperación del foco.

## 7. Comunicar estados dinámicos

- Usar texto visible como fuente principal de significado; icono y color son complementarios.
- Aplicar `role="status"` o una región `aria-live="polite"` para éxitos, información y cambios no urgentes.
- Aplicar `role="alert"` o `aria-live="assertive"` solo a errores urgentes que requieren anuncio inmediato.
- Mantener las regiones live montadas antes de actualizar su contenido cuando el framework lo requiera.
- Evitar anunciar cada skeleton o elemento de una lista; anunciar una sola vez el estado general de carga.
- No repetir el mismo mensaje mediante varias regiones live.
- Asociar errores de campo mediante `aria-describedby` y marcar el control con `aria-invalid`.
- Mantener mensajes persistentes para información que requiera lectura o acción; no depender de un toast temporizado.
- Usar `aria-busy` en la región que se actualiza cuando aporta contexto real.

No incluir datos sensibles innecesarios en anuncios globales que puedan exponerse fuera del contexto de la pantalla.

## 8. Verificar contraste, texto y zoom

- Verificar WCAG AA con los colores finales de texto, iconos informativos, foco, bordes esenciales y estados interactivos.
- Comprobar contraste en default, hover, active, disabled, error y sobre fondos semánticos.
- Mantener texto de cuerpo público de al menos 16 px por defecto, interlineado amplio y líneas cercanas a 65–70 caracteres.
- No justificar párrafos ni usar mayúsculas extensas.
- Permitir zoom al 200 % sin superposición, pérdida de contenido o controles inaccesibles.
- No bloquear escalado del viewport.
- Permitir que nombres, traducciones y mensajes largos aumenten altura sin romper el layout.
- Añadir texto o iconografía accesible a estados que actualmente dependan solo del color.

No declarar conformidad por inspección visual aproximada; medir contraste con los valores realmente renderizados.

## 9. Respetar preferencias de movimiento

- Usar transiciones breves solo para comunicar cambio de estado, apertura o continuidad espacial.
- Implementar `@media (prefers-reduced-motion: reduce)` para eliminar o reducir movimiento no esencial.
- Evitar autoplay, parallax, fondos en video, texto rotatorio, contadores animados y animaciones en cada scroll.
- Mantener skeletons discretos y detener su animación bajo movimiento reducido.
- No eliminar feedback de estado al reducir movimiento; reemplazarlo por cambios inmediatos y perceptibles.
- Evitar animaciones que bloqueen interacción o retrasen el foco.

## 10. Probar estados y combinaciones

Revisar cada superficie con:

- contenido corto y largo;
- loading, vacío, error y reintento;
- permisos limitados y acciones deshabilitadas;
- 320 px, tablet, escritorio y zoom al 200 %;
- teclado completo y foco visible;
- lector de pantalla en el flujo crítico cuando esté disponible;
- contraste real y modo de movimiento reducido;
- modal, drawer o menú abierto y cerrado;
- mensajes dinámicos consecutivos;
- orientación vertical y horizontal cuando afecte la composición.

Ejecutar lint, pruebas y build existentes. Añadir pruebas de interacción para foco, Escape, retorno de foco, estado expandido y anuncios cuando el repositorio tenga infraestructura compatible.

## Guardrails

- No resolver accesibilidad agregando ARIA indiscriminadamente.
- No usar `div` o `span` interactivos si existe un elemento nativo.
- No usar `tabIndex` positivo ni ocultar el foco.
- No comunicar estados solo con color, posición o iconos.
- No esconder datos o acciones esenciales para hacer caber una interfaz.
- No mantener una tabla comprimida cuando una tarjeta comunica mejor el registro.
- No dejar el fondo enfocable detrás de un modal o drawer.
- No anunciar contenido decorativo o cada actualización irrelevante.
- No usar hover como único mecanismo para descubrir o ejecutar acciones.
- No asumir que desktop responsive equivale a reducir anchos.
- No declarar accesible una interfaz sin probar teclado, foco, tamaño y estados dinámicos.

## Entrega esperada

Resumir:

- superficies y breakpoints revisados;
- transformación entre escritorio y móvil;
- semántica, teclado y gestión de foco;
- diálogos, drawers y regiones live afectados;
- contraste, zoom y movimiento reducido comprobados;
- pruebas ejecutadas y limitaciones pendientes.
