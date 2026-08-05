# Arquitectura del frontend público — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0  
**Estado:** aprobado para implementación

---

## 1. Objetivo

El frontend público presenta institucionalmente al centro, informa sus servicios, muestra el equipo, facilita el contacto y conduce al acceso privado. Debe ser:

- comprensible para familias;
- rápido en celulares;
- accesible;
- tolerante a fallos parciales;
- sencillo de implementar y mantener;
- coherente con la API y las reglas de privacidad;
- preparado para evolucionar sin introducir un CMS en el MVP.

No implementa reglas clínicas ni administrativas. Solo presenta contenido público y abre canales externos de contacto.

---

## 2. Alcance

### 2.1 Incluido

- layout público compartido;
- navegación responsive;
- Home;
- Nosotros;
- Servicios;
- Nuestro equipo;
- Contacto;
- Privacidad;
- enlace a Login;
- servicios y equipo desde la API;
- textos y datos institucionales desde configuración;
- SEO básico por ruta;
- imágenes estáticas y dinámicas;
- skeletons, estados vacíos, error y reintento;
- contacto por WhatsApp, teléfono y correo;
- mapa embebido únicamente en Contacto;
- obras sociales/prepagas estáticas e informativas;
- pruebas unitarias, de componentes e integración pública.

### 2.2 Fuera del MVP

- CMS;
- blog o noticias;
- reservas públicas de turnos;
- formulario de contacto;
- chatbot;
- autenticación de familias;
- páginas individuales de servicios;
- páginas individuales de integrantes;
- buscadores y filtros públicos;
- paginación pública;
- carruseles automáticos;
- galería de instalaciones;
- analítica y marketing pixels;
- cookies publicitarias;
- modo oscuro;
- internacionalización;
- aplicación móvil o PWA avanzada;
- SSR, SSG o framework adicional.

---

## 3. Stack

| Tecnología | Uso | Fundamento para el MVP |
|---|---|---|
| React | Componentes y composición de UI. | Conocido por el equipo y compartido con el panel privado. |
| Vite | Desarrollo y build. | Configuración simple y rápida. |
| JavaScript ES6+ | Lenguaje. | Reduce curva de aprendizaje y coincide con el backend CommonJS. |
| React Router | Rutas públicas, login y futuras rutas privadas. | Una única SPA con layouts diferenciados. |
| Axios | Consumo HTTP. | Interfaz conocida y reutilizable con el panel privado. |
| React Helmet Async | Metadatos por ruta. | SEO básico sin migrar a SSR. |
| React Icons | Iconografía. | Amplia cobertura y uso como componentes React. |
| CSS Modules | Estilos encapsulados. | Evita colisiones sin introducir CSS-in-JS. |
| CSS Custom Properties | Design tokens. | Fuente visual central, fácil de cambiar. |
| Vitest | Pruebas unitarias. | Integración natural con Vite. |
| React Testing Library | Pruebas de comportamiento. | Favorece pruebas centradas en el usuario. |
| Playwright | E2E público y luego privado. | Automatiza navegación real entre rutas. |

### 3.1 Dependencias mínimas

```bash
npm install react-router-dom axios react-helmet-async react-icons
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom playwright
```

No se agregan librerías de componentes, animaciones o fetching mientras no exista una necesidad concreta.

---

## 4. Arquitectura general

```text
Navegador
  ↓
React Router
  ↓
PublicLayout
  ↓
Página pública
  ├── componentes estáticos
  ├── site.config.js
  └── hooks de datos públicos
        ↓
      publicApi.js
        ↓
      Axios
        ↓
API Express /api/v1/public
        ↓
PostgreSQL + archivos /uploads
```

La aplicación completa será una SPA, pero el área pública se organiza como un sitio multipágina mediante rutas semánticas.

---

## 5. Rutas y layouts

```text
/
/nosotros
/servicios
/equipo
/contacto
/privacidad
/login
/app/*
```

### 5.1 Layouts

- `PublicLayout`: header, contenido, footer y botón flotante de WhatsApp.
- `AuthLayout`: login y futuros estados de acceso.
- `PrivateLayout`: panel interno; se documentará después.

```jsx
<Route element={<PublicLayout />}>
  <Route index element={<HomePage />} />
  <Route path="nosotros" element={<AboutPage />} />
  <Route path="servicios" element={<ServicesPage />} />
  <Route path="equipo" element={<TeamPage />} />
  <Route path="contacto" element={<ContactPage />} />
  <Route path="privacidad" element={<PrivacyPage />} />
</Route>

<Route element={<AuthLayout />}>
  <Route path="login" element={<LoginPage />} />
</Route>
```

El `PublicLayout` ejecuta `ScrollToTop` en cambios de ruta, preserva foco accesible y no contiene lógica de negocio.

---

## 6. Estructura de carpetas

```text
client/
├── public/
│   ├── images/
│   │   ├── branding/
│   │   ├── institucionales/
│   │   ├── placeholders/
│   │   └── coberturas/
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── providers.jsx
│   │   └── router.jsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── feedback/
│   │   ├── icons/
│   │   ├── layout/
│   │   └── public/
│   │
│   ├── config/
│   │   ├── env.js
│   │   ├── routes.js
│   │   └── site.config.js
│   │
│   ├── features/
│   │   ├── public-services/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   └── public-team/
│   │       ├── api/
│   │       ├── components/
│   │       └── hooks/
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx
│   │   ├── AuthLayout.jsx
│   │   └── PrivateLayout.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage/
│   │   │   ├── AboutPage/
│   │   │   ├── ServicesPage/
│   │   │   ├── TeamPage/
│   │   │   ├── ContactPage/
│   │   │   └── PrivacyPage/
│   │   └── errors/
│   │
│   ├── services/
│   │   ├── apiClient.js
│   │   └── fileUrl.js
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── reset.css
│   │   ├── globals.css
│   │   ├── utilities.css
│   │   └── index.css
│   │
│   ├── utils/
│   │   ├── contactLinks.js
│   │   ├── text.js
│   │   └── seo.js
│   │
│   └── main.jsx
│
├── .env.example
├── eslint.config.js
├── package.json
└── vite.config.js
```

### 6.1 Regla de sencillez

No se crea una carpeta o abstracción para un único archivo sin proyección de reutilización. La estructura puede comenzar más plana y evolucionar hacia este árbol a medida que se implementan páginas.

---

## 7. Contenido estático y dinámico

### 7.1 Estático en `site.config.js`

- nombre institucional;
- lema;
- introducciones;
- misión, visión y valores;
- teléfono y WhatsApp;
- correo;
- dirección;
- horarios;
- redes sociales;
- mapa;
- obras sociales/prepagas;
- mensajes predefinidos;
- metadatos SEO;
- rutas de imágenes institucionales.

### 7.2 Dinámico desde la API

- servicios publicados;
- imagen de cada servicio;
- nombre y descripción;
- orden público;
- integrantes publicados;
- fotografía;
- nombre, título, especialidad y función pública;
- biografía;
- orden público.

### 7.3 Sin CMS

Modificar textos institucionales requiere cambiar `site.config.js` y realizar un nuevo despliegue. Es una decisión deliberada para el MVP.

---

## 8. Estado

### 8.1 Estado local

Los listados públicos utilizan hooks con:

```text
status: idle | loading | success | error
data
error
retry()
```

La Home mantiene independientes el estado de servicios y el estado de equipo. Si falla uno, el otro continúa visible.

### 8.2 Redux

No se usa Redux para los datos públicos porque:

- son pocos;
- pertenecen a una o dos páginas;
- no requieren mutaciones públicas;
- no necesitan sincronización compleja.

Redux Toolkit quedará reservado para sesión, permisos, notificaciones y datos privados cuando se diseñe el panel.

---

## 9. Integración HTTP

La instancia Axios pública utiliza:

```js
const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
});
```

No envía tokens ni credenciales a endpoints públicos. La misma base podrá extenderse luego para el cliente privado.

Variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_FILES_BASE_URL=http://localhost:3000
VITE_SITE_URL=http://localhost:5173
```

Nunca se incluyen secretos en variables `VITE_*`, porque quedan visibles en el bundle.

---

## 10. Imágenes y archivos

### 10.1 Recursos versionados

```text
client/public/images/
```

Incluye logo, favicon, seis imágenes institucionales, placeholders y logotipos reales de coberturas.

### 10.2 Recursos dinámicos

```text
api/uploads/usuarios/
api/uploads/servicios/
```

La API guarda rutas relativas como:

```text
/uploads/usuarios/uuid.webp
/uploads/servicios/uuid.webp
```

El frontend construye la URL completa con `VITE_FILES_BASE_URL`.

### 10.3 Fallback

Si falta la ruta o la imagen produce error, el componente cambia una sola vez al placeholder correspondiente. No reintenta indefinidamente.

---

## 11. SEO básico

Cada página define:

- `<title>` único;
- descripción;
- canonical;
- Open Graph;
- Twitter Card básica;
- `robots`;
- schema.org apropiado cuando esté confirmado;
- encabezado H1 único;
- URLs semánticas.

### 11.1 Limitación aceptada

Una SPA no ofrece el mismo SEO inicial que SSR/SSG. Para el MVP se acepta porque reduce tecnologías y despliegues. Si el sitio necesita posicionamiento competitivo, se evaluará prerendering o separación del sitio público en una etapa posterior.

### 11.2 Datos estructurados

Puede utilizarse `LocalBusiness` o una categoría más específica solo después de confirmar que representa legalmente al centro. No se inventan acreditaciones, áreas médicas ni coberturas.

---

## 12. Seguridad y privacidad

- No se muestran DNI, correo de acceso, teléfono personal, rol técnico ni permisos.
- No se guardan formularios públicos.
- No se usan cookies de seguimiento.
- No se insertan contenidos HTML provenientes de la API mediante `dangerouslySetInnerHTML`.
- Los enlaces externos usan `rel="noopener noreferrer"` cuando abren una pestaña.
- Las URLs de archivos se construyen desde una base confiable y una ruta retornada por la API.
- No se registran datos sensibles en consola.
- Los errores visibles no incluyen stack traces ni mensajes internos.
- La política de privacidad diferencia claramente el área pública del área privada.

---

## 13. Accesibilidad

Objetivo de referencia: WCAG 2.1 AA.

- landmarks semánticos;
- skip link;
- navegación completa por teclado;
- foco visible;
- un H1 por página;
- jerarquía de encabezados;
- `alt` descriptivo para imágenes informativas;
- `alt=""` para imágenes decorativas;
- iconos importantes acompañados de texto;
- contraste suficiente;
- botones con área táctil mínima aproximada de 44 × 44 px;
- mensajes de carga y error comprensibles;
- respeto por `prefers-reduced-motion`;
- el menú móvil gestiona foco, Escape y cierre al navegar;
- iframe de mapa con `title`.

---

## 14. Rendimiento

- imágenes WebP y dimensiones explícitas;
- `loading="lazy"` fuera del Hero;
- Hero con `fetchpriority="high"` solo si corresponde;
- lazy loading por ruta para páginas no iniciales;
- importación individual de iconos;
- sin carruseles ni librerías visuales pesadas;
- skeletons con tamaño estable para evitar saltos;
- consultas independientes y limitadas en Home;
- no descargar listados completos para recortar cuatro en cliente si la API soporta `limit=4`.

---

## 15. Manejo de errores

### 15.1 Fallo parcial de Home

La página continúa renderizando. La sección afectada muestra:

- título;
- mensaje amable;
- botón Reintentar;
- acceso general a WhatsApp o correo cuando sea útil.

### 15.2 Página completa

`/servicios` y `/equipo` muestran error local y reintento. El header, footer y contacto continúan disponibles.

### 15.3 404

La ruta desconocida presenta:

- mensaje simple;
- enlace a Inicio;
- enlace a Contacto;
- sin detalles técnicos.

---

## 16. Build y despliegue

El primer objetivo es versionar todo en GitHub. No se elige proveedor de producción todavía.

La configuración debe ser portable:

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run test:e2e
```

El host final debe redirigir rutas desconocidas a `index.html` para que React Router resuelva la SPA.

---

## 17. Criterios de aceptación arquitectónicos

- Todas las rutas públicas funcionan al navegar directamente por URL.
- El sitio funciona sin JavaScript de seguimiento.
- El fallo de la API no rompe contenido estático.
- El sitio público no depende del estado privado.
- Los componentes no contienen datos institucionales hardcodeados que correspondan a configuración.
- Los valores visuales reutilizables provienen de tokens.
- Las imágenes dinámicas usan una función única para construir URLs.
- El bundle no contiene secretos.
- El código es entendible para el equipo y no incorpora capas sin necesidad.
