# Sistema de diseño público — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0

---

## 1. Principio

Toda decisión visual reutilizable se expresa como un token. Los componentes no deben contener valores arbitrarios de color, tipografía, espaciado, radio, sombra o z-index.

La fuente principal es:

```text
client/src/styles/tokens.css
```

CSS Modules consume los tokens y define la estructura de cada componente.

---

## 2. Identidad visual

### 2.1 Intención

- profesional;
- cálida;
- calma;
- inclusiva;
- baja sobrecarga visual;
- apropiada para familias y personas neurodivergentes;
- legible en celulares.

### 2.2 Paleta confirmada

| Rol | Valor base |
|---|---|
| Primario | `#2E6F6E` |
| Primario oscuro | `#1F4E4D` |
| Acento cálido | `#C77B4B` |
| Fondo | `#F7F9F8` |
| Superficie | `#FFFFFF` |
| Texto principal | `#243333` |
| Texto secundario | `#5E6B6B` |

Los componentes usan variables semánticas como `--color-texto-principal`, no hexadecimales.

---

## 3. Tipografía

### 3.1 Familias

- títulos: Nunito;
- cuerpo e interfaz: Inter;
- fallbacks del sistema cuando no carguen fuentes web.

### 3.2 Carga

Preferencia:

1. archivos autoalojados si se dispone de licencia y archivos adecuados;
2. proveedor externo solo si se acepta su impacto de privacidad;
3. fallback de sistema.

No se incluyen archivos de fuente dentro de esta entrega.

### 3.3 Jerarquía

- Display: Hero.
- H1: título de página.
- H2: título de sección.
- H3: tarjeta o subsección.
- Subtitle: introducción de sección.
- Body: párrafo común.
- Small: notas, horarios y metadatos.

Los tamaños usan `clamp()` para responder fluidamente.

---

## 4. Arquitectura CSS

```text
styles/
├── tokens.css
├── reset.css
├── globals.css
├── utilities.css
└── index.css
```

### 4.1 `tokens.css`

Identidad y escalas.

### 4.2 `reset.css`

Normalización controlada: box sizing, imágenes, formularios y márgenes.

### 4.3 `globals.css`

`body`, headings, párrafos, enlaces, selección, foco y contenedor.

### 4.4 `utilities.css`

Solo utilidades repetidas y estables, por ejemplo `.srOnly`, `.container` y `.skipLink`.

### 4.5 CSS Modules

Un archivo por componente o página:

```text
ServiceCard.jsx
ServiceCard.module.css
```

---

## 5. Tokens obligatorios

El anexo `tokens-public.css` incluye:

- escala primaria, acento y neutros;
- colores semánticos;
- estados;
- familias y pesos;
- tamaños de display, títulos, subtítulos, párrafos y textos pequeños;
- interlineado y ancho de lectura;
- espaciado;
- contenedores;
- radios y bordes;
- sombras;
- transiciones;
- z-index;
- header, secciones, cards, botones, inputs, iconos, imágenes y skeletons.

### Regla

```css
/* Incorrecto */
.card { padding: 23px; color: #243333; }

/* Correcto */
.card {
  padding: var(--card-padding);
  color: var(--color-texto-principal);
}
```

---

## 6. Breakpoints

Los breakpoints no pueden consumirse como variables CSS dentro de media queries nativas. Se documentan y se repiten únicamente en archivos de layout.

```text
mobile: 0–640 px
tablet: 641–1024 px
desktop: 1025 px o más
```

El diseño se adapta por contenido, no por modelos de dispositivos.

---

## 7. Responsive design

### 7.1 Mobile-first

Los estilos base representan móvil. Las mejoras para tablet y escritorio se agregan con `min-width`.

### 7.2 Layout de texto e imagen

Móvil:

```text
Texto
Imagen
```

Escritorio:

```text
Texto | Imagen
Imagen | Texto
```

La alternancia es visual; el orden DOM mantiene lectura lógica cuando sea posible.

### 7.3 Cards

- Home: una columna móvil, dos tablet, hasta cuatro escritorio.
- Servicios completos: bloque vertical móvil y horizontal escritorio.
- Equipo completo: bloque vertical móvil y horizontal o grilla amplia escritorio según longitud de bio.

### 7.4 Header

- escritorio: navegación visible;
- móvil: botón de menú y panel;
- logo con dimensiones reservadas para evitar salto de layout.

---

## 8. Iconografía

### 8.1 Librería

```bash
npm install react-icons
```

### 8.2 Familias

- interfaz: `react-icons/fa6`;
- marcas: `react-icons/si`.

No se mezclan libremente otras familias.

### 8.3 Imports

```js
import { FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import { SiFacebook, SiInstagram, SiWhatsapp } from 'react-icons/si';
```

### 8.4 Reglas

- importar iconos individualmente;
- acciones críticas incluyen texto;
- decorativos usan `aria-hidden="true"`;
- iconos solos requieren `aria-label` o texto oculto;
- no usar emojis como sistema de iconos;
- color y tamaño provienen de tokens;
- logos de marcas conservan reconocimiento, sin convertir toda la UI en colores de marca.

### 8.5 Catálogo inicial

- navegación: casa, información, servicios, equipo, contacto, ingresar;
- contacto: WhatsApp, correo, teléfono, ubicación, reloj, navegación;
- necesidades: cerebro, libro, comentarios, manos;
- proceso: conversación, clipboard, equipo;
- acciones: flecha, chevron, externo, reintentar;
- feedback: círculo de alerta, check, info.

---

## 9. Componentes públicos

### 9.1 Layout

- `PublicHeader`;
- `PublicNavigation`;
- `MobileMenu`;
- `PublicFooter`;
- `WhatsappFloatingButton`;
- `PageContainer`;
- `Section`;
- `SectionHeader`;
- `TextImageSection`.

### 9.2 Contenido

- `HeroSection`;
- `NeedCard`;
- `ProcessStep`;
- `ServicePreviewCard`;
- `ServiceDetailCard`;
- `TeamMemberPreviewCard`;
- `TeamMemberCard`;
- `StatCard`;
- `CoverageList`;
- `ContactChannelCard`;
- `InstitutionalImage`;
- `Seo`.

### 9.3 Feedback

- `SkeletonCard`;
- `SectionLoading`;
- `SectionError`;
- `EmptyState`;
- `ImageFallback`;
- `NotFoundState`.

### 9.4 Controles

- `Button`;
- `LinkButton`;
- `IconButton`;
- `ExternalLink`.

No se crea una biblioteca de UI completa antes de utilizar estos componentes.

---

## 10. Botones

Variantes:

- primary: acción principal;
- secondary: acción alternativa;
- ghost: navegación o acción menor;
- external: mantiene estilo de botón pero indica apertura externa.

Estados:

- default;
- hover;
- focus-visible;
- active;
- disabled;
- loading, solo cuando exista una operación real.

Los enlaces que navegan deben seguir siendo `<a>` o `Link`; no se convierten en `<button>` por estilo.

---

## 11. Imágenes institucionales

Nombres definitivos:

```text
home-hero.webp
home-acompanamiento.webp
home-enfoque-interdisciplinario.webp
nosotros-identidad.webp
nosotros-valores.webp
nosotros-espacio.webp
```

### 11.1 Reglas

- Hero: 16:10, sugerido 1600 × 1000.
- Resto: 4:3, sugerido 1200 × 900.
- `object-fit: cover`.
- bordes suaves por token.
- dimensiones conocidas para evitar CLS.
- no hay galería, lightbox o carrusel.

### 11.2 Marco durante desarrollo

`InstitutionalImage` muestra el nombre esperado cuando el archivo falta en modo desarrollo. En producción usa un placeholder neutro.

---

## 12. Imágenes dinámicas

### 12.1 Equipo

- proporción 1:1;
- sugerido 600 × 600;
- placeholder de persona;
- alt con nombre completo cuando existe fotografía.

### 12.2 Servicios

- proporción 4:3;
- sugerido 1200 × 900;
- placeholder de servicio;
- alt descriptivo basado en el servicio, sin afirmar contenido visual no verificado.

---

## 13. Skeletons

- no deben simular contenido indefinidamente;
- mantienen dimensiones finales;
- respetan reducción de movimiento;
- no requieren lectores de pantalla por cada bloque;
- el contenedor puede anunciar `Cargando servicios` mediante texto oculto o `aria-live` moderado.

---

## 14. Accesibilidad visual

- contraste AA verificado con valores reales;
- texto de cuerpo mínimo 16 px por defecto;
- ancho de lectura alrededor de 65–70 caracteres;
- interlineado 1.6 o superior para párrafos largos;
- no justificar texto;
- no usar mayúsculas extensas;
- foco de alto contraste;
- estados no dependen solo del color;
- animaciones discretas;
- sin fondos visualmente ruidosos detrás de texto.

---

## 15. Movimiento

Permitido:

- transiciones breves de color, sombra y desplazamiento mínimo;
- apertura del menú;
- skeleton suave si no afecta accesibilidad.

No permitido en el MVP:

- autoplay;
- parallax;
- animaciones de entrada en cada scroll;
- contadores animados;
- texto rotatorio;
- fondos en video.

---

## 16. Logo y branding

Rutas esperadas:

```text
/public/images/branding/logo.svg
/public/images/branding/logo-horizontal.svg
/public/images/branding/favicon.svg
```

Si solo existe un logo, `logo.svg` es suficiente. El componente define un fallback tipográfico con el nombre del centro durante desarrollo.

---

## 17. Criterios de aceptación visuales

- Cambiar colores principales requiere editar únicamente tokens.
- Cambiar fuentes y jerarquía tipográfica requiere editar tokens y carga global, no componentes.
- No existen hexadecimales repetidos en CSS Modules.
- React Icons conserva una familia coherente.
- La página es legible a 320 px de ancho.
- El zoom al 200 % no pierde contenido ni acciones.
- La navegación funciona por teclado.
- No hay carruseles ni galerías.
- Imágenes faltantes no producen iconos rotos.
