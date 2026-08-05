---
name: sistema-diseno-css-modules
description: Diseñar, crear, ampliar o corregir componentes visuales en React/Vite con CSS Modules y Custom Properties. Usar cuando una tarea involucre tokens, estilos globales o locales, botones, badges, tablas, tarjetas, modales, estados visuales, responsive, accesibilidad, React Icons o consistencia entre las áreas pública y privada.
---

# Sistema de diseño con CSS Modules

## Objetivo

Construir interfaces consistentes, accesibles y responsive mediante tokens centrales, CSS Modules por componente y primitivas visuales compartidas. Conservar una única identidad institucional entre el sitio público y el panel privado, ajustando jerarquía y densidad a cada contexto sin crear dos sistemas incompatibles.

## 1. Inspeccionar antes de diseñar

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Revisar `package.json`; confirmar que React Icons esté instalado antes de importarlo.
3. Inspeccionar `src/styles/`, el componente objetivo y al menos un componente análogo ya existente.
4. Consultar en `client/doc/` las decisiones visuales, responsive, de interacción y accesibilidad relacionadas.
5. Identificar estados, variantes, tamaños, contenido real y permisos que cambian la interfaz.
6. Distinguir archivos vacíos de implementaciones reales; no asumir que el scaffold ya cumple el sistema.

Preservar las convenciones existentes cuando sean coherentes. Si la implementación contradice una decisión confirmada, señalar la diferencia y realizar el cambio mínimo que restaure consistencia.

## 2. Mantener las capas CSS

| Capa | Responsabilidad | Evitar |
|---|---|---|
| `styles/tokens.css` | Identidad, escalas y decisiones reutilizables | Selectores de componentes |
| `styles/reset.css` | Normalización controlada | Opiniones visuales del producto |
| `styles/globals.css` | Tipografía base, `body`, enlaces, foco y contenedores | Estilos de una feature |
| `styles/public.css` | Composición general y densidad del área pública | Duplicar tokens |
| `styles/private.css` | Composición operativa y densidad del panel | Crear otra identidad de marca |
| `styles/utilities.css` | Utilidades pequeñas, repetidas y estables | Reemplazar CSS Modules por clases atómicas |
| `styles/print.css` | Impresión de documentos autorizados | Afectar la vista normal |
| `*.module.css` | Estructura, variantes y estados del componente | Reglas globales accidentales |
| `styles/index.css` | Importar las capas globales en orden | Contener reglas visuales extensas |

Crear un archivo `ComponentName.module.css` junto a cada componente visual. Usar nombres de clase semánticos y locales. Reservar `:global` para integraciones inevitables y documentadas con librerías externas.

## 3. Diseñar mediante tokens

- Definir en `tokens.css` colores de marca, neutros, colores semánticos, tipografía, espaciado, contenedores, bordes, radios, sombras, transiciones, z-index y medidas repetidas.
- Consumir Custom Properties con nombres semánticos, por ejemplo `--color-action-primary`, `--color-feedback-danger` y `--space-3`.
- Conservar Nunito para títulos e Inter para cuerpo e interfaz.
- Conservar `#2E6F6E` como color principal y `#C77B4B` como acento, consumidos siempre mediante tokens.
- Separar valores base de alias semánticos cuando varios componentes dependan de una misma decisión.
- Añadir un token solo si expresa una decisión reutilizable; mantener en el módulo las medidas exclusivas de una composición.
- Cambiar la identidad desde tokens, no mediante búsquedas de hexadecimales en componentes.
- No duplicar valores arbitrarios ni crear tokens distintos con el mismo significado.

Los breakpoints documentan umbrales de referencia. Adaptar el diseño cuando el contenido deja de ser usable, no solo cuando coincide con un dispositivo conocido.

## 4. Escribir CSS Modules mantenibles

- Importar el módulo como `styles` y aplicar clases explícitas desde el componente.
- Modelar variantes mediante mapas o propiedades estables; evitar concatenaciones ambiguas y selectores basados en texto.
- Preferir una clase raíz, elementos con significado y modificadores claros como `primary`, `compact` o `isLoading`.
- Mantener baja la especificidad y evitar cadenas profundas dependientes del DOM.
- No estilizar elementos de otra feature desde un módulo local.
- No usar estilos inline para decisiones del sistema; reservarlos para valores verdaderamente dinámicos, como una posición calculada.
- No usar `!important` salvo una integración externa inevitable y explicada.
- Eliminar reglas, variantes y clases que no tengan consumidor real.

Mantener el JSX semántico. El aspecto de enlace no convierte una navegación en `<button>`, ni el aspecto de botón convierte una acción en enlace.

## 5. Construir primitivas con contratos completos

### Botones y enlaces de acción

- Soportar solo variantes utilizadas: `primary`, `secondary`, `outline`, `ghost` y `danger`; usar `external` para enlaces externos cuando corresponda.
- Definir tamaños desde tokens y cubrir `default`, `hover`, `focus-visible`, `active`, `disabled` y `loading`.
- Mantener estable el ancho durante loading y conservar un nombre accesible.
- Usar `<button type="button">` por defecto fuera de submits y respetar `disabled` real.
- Mantener acciones críticas acompañadas por texto; un botón solo con icono requiere nombre accesible y tooltip si el significado no es evidente.

### Badges y estados

- Centralizar el mapeo entre estado de dominio, texto, tono e icono.
- Mostrar siempre texto; el color y el icono son refuerzos, no la única señal.
- Mantener el mismo significado cromático entre turnos, informes, entidades y conversaciones.
- Evitar badges interactivos si el elemento es solo informativo.

### Tablas y listas responsive

- Usar encabezados accesibles, ordenamiento explícito y acciones en la última columna.
- No saturar cada fila con acciones; usar un menú contextual cuando exista una necesidad real y accesible.
- Crear `ResponsiveDataList` o tarjetas etiqueta–valor para móvil en lugar de comprimir una tabla ilegible.
- Mantener visibles en móvil los datos y acciones esenciales; no ocultar funcionalidad por tamaño de pantalla.
- Diseñar loading, vacío, error, paginación y ausencia de resultados como estados de la misma superficie.

### Modales y diálogos

- Separar encabezado fijo, cuerpo desplazable y pie de acciones estable.
- Usar tamaños `sm`, `md`, `lg`, `xl` o `fullscreen` según la complejidad documentada.
- Convertir formularios relevantes a fullscreen en móvil.
- Mantener contraste del overlay, orden de capas y scroll interno mediante tokens.
- Coordinar el estilo con el comportamiento accesible: título asociado, foco atrapado, Escape, retorno de foco y bloqueo del fondo no se resuelven solo con CSS.
- No ocultar acciones principales fuera del viewport ni depender de hover.

## 6. Centralizar React Icons

- Usar `react-icons/fa6` como familia principal de interfaz y `react-icons/si` solo para marcas.
- Importar cada icono de forma explícita en `components/icons/icons.js` y exponerlo mediante `AppIcon.jsx` o una interfaz central equivalente.
- No importar iconos arbitrariamente en cada feature ni mezclar familias sin una excepción justificada y centralizada.
- Obtener tamaño, separación y color desde tokens o propiedades controladas.
- Marcar iconos decorativos con `aria-hidden="true"`.
- Proporcionar texto visible, `aria-label` o texto oculto a iconos funcionales según el contexto.
- No usar emojis como sistema de iconografía ni colorear toda la interfaz con colores de marca externos.

Si React Icons todavía no está instalado, no declarar la integración terminada. Proponer o realizar su instalación solo cuando el alcance de la tarea lo autorice.

## 7. Conservar una identidad y dos contextos

### Área pública

- Diseñar mobile-first, con lectura cómoda, jerarquía editorial y espacio suficiente.
- Priorizar texto de cuerpo de al menos 16 px, párrafos con interlineado amplio y ancho de lectura cercano a 65–70 caracteres.
- Reservar dimensiones de imágenes y logotipos para evitar saltos de layout.
- Evitar fondos ruidosos, carruseles innecesarios, parallax, autoplay y animaciones decorativas persistentes.

### Área privada

- Diseñar desktop-first responsive por su densidad operativa, sin degradar tablet o móvil.
- Mantener navegación, filtros, tablas, formularios y acciones utilizables con teclado y tacto.
- Transformar tablas en tarjetas y barras de filtros en drawers cuando el ancho sea insuficiente.
- Favorecer densidad legible, jerarquía de tareas y feedback inmediato sobre ornamentación.

Compartir tokens, tipografías, iconografía, controles y significados de estado. Diferenciar composición y densidad mediante capas de área, no mediante marcas o componentes duplicados.

## 8. Cubrir accesibilidad visual e interacción

- Verificar contraste WCAG AA con los valores finales, incluidos hover, disabled, bordes y texto sobre fondos semánticos.
- Mantener un foco `:focus-visible` claro y de alto contraste; no eliminar outlines sin reemplazo equivalente.
- Permitir navegación completa por teclado y zoom al 200 % sin perder contenido ni acciones.
- Mantener targets táctiles adecuados y separación suficiente entre acciones destructivas y neutrales.
- No justificar párrafos ni usar mayúsculas extensas.
- No comunicar error, éxito, selección o estado únicamente con color.
- Respetar `prefers-reduced-motion` y desactivar movimiento no esencial.
- Usar transiciones breves de color, sombra o desplazamiento mínimo solo cuando aporten comprensión.
- Probar nombres accesibles, orden del foco y anuncios; una apariencia correcta no garantiza accesibilidad.

## 9. Diseñar todos los estados

Para cada componente afectado, revisar:

- contenido normal y contenido largo;
- loading inicial y actualización;
- vacío y sin resultados;
- error recuperable y acción de reintento;
- disabled y solo lectura;
- hover, focus-visible y active;
- permisos sin acción disponible;
- móvil estrecho, tablet y escritorio;
- texto ampliado y movimiento reducido.

Usar skeletons con forma similar al contenido solo cuando reduzcan incertidumbre. Evitar spinners globales que borren contexto y mensajes técnicos que expongan detalles internos.

## 10. Verificar el resultado

1. Confirmar que colores, tipografía, espacios, radios, sombras, capas e iconos reutilizables provengan de tokens.
2. Buscar hexadecimales repetidos y reglas globales accidentales en CSS Modules.
3. Revisar el componente a 320 px, tablet, escritorio y zoom al 200 %.
4. Recorrerlo con teclado y comprobar foco visible, nombres accesibles y orden lógico.
5. Validar contraste y `prefers-reduced-motion` con valores reales.
6. Probar contenido largo, loading, vacío, error, disabled y permisos restringidos.
7. Ejecutar lint, pruebas y build disponibles; informar con precisión cualquier control no ejecutado.

## Guardrails

- No instalar una biblioteca visual completa para resolver un componente puntual.
- No introducir Tailwind, CSS-in-JS o estilos globales paralelos en este sistema CSS Modules.
- No codificar hexadecimales de marca repetidos dentro de módulos.
- No duplicar componentes públicos y privados cuando solo cambia densidad o composición.
- No ocultar información o acciones esenciales como estrategia responsive.
- No usar el color, hover o iconos solos para comunicar significado.
- No crear animación decorativa que compita con tareas o contenido clínico.
- No presentar React Icons como disponible sin verificar `package.json`.
- No modificar permisos ni lógica de negocio desde estilos.
- No considerar terminado un componente sin revisar sus estados y tamaños relevantes.

## Entrega esperada

Resumir:

- componentes y módulos CSS modificados;
- tokens creados, reutilizados o ajustados;
- variantes y estados cubiertos;
- comportamiento público, privado y responsive;
- decisiones de iconografía y accesibilidad;
- verificaciones ejecutadas y limitaciones pendientes.
