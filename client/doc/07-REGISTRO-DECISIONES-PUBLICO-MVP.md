# Registro de decisiones del frontend público — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0

---

## 1. Estados

- `CONFIRMADA`: vigente.
- `REEMPLAZADA`: decisión anterior sustituida.
- `FUERA_MVP`: no se implementa ahora.
- `PENDIENTE_REAL`: depende de información verdadera.

---

## 2. Decisiones confirmadas

| ID | Decisión | Estado |
|---|---|---|
| FPUB-001 | Una única aplicación React + Vite contiene sitio público y privado. | CONFIRMADA |
| FPUB-002 | JavaScript ES6+ para el frontend MVP. | CONFIRMADA |
| FPUB-003 | El área pública es un sitio multipágina con Home resumida. | CONFIRMADA |
| FPUB-004 | Rutas: `/`, `/nosotros`, `/servicios`, `/equipo`, `/contacto`, `/privacidad`, `/login`. | CONFIRMADA |
| FPUB-005 | Sitio público mobile-first. | CONFIRMADA |
| FPUB-006 | Home muestra cuatro servicios y cuatro integrantes. | CONFIRMADA |
| FPUB-007 | La selección de destacados depende solo de `orden_publico`. | CONFIRMADA |
| FPUB-008 | Servicios completos sin filtros, búsqueda, paginación o detalle individual. | CONFIRMADA |
| FPUB-009 | Equipo completo sin filtros, búsqueda, paginación o detalle individual. | CONFIRMADA |
| FPUB-010 | Biografías completas visibles directamente en `/equipo`. | CONFIRMADA |
| FPUB-011 | Coordinadora, secretaria y profesionales tienen el mismo diseño. | CONFIRMADA |
| FPUB-012 | Orden de equipo: coordinadora, secretaria, profesionales mediante `orden_publico`. | CONFIRMADA |
| FPUB-013 | `funcion_publica` es independiente del rol técnico. | CONFIRMADA |
| FPUB-014 | Administrador nunca aparece públicamente. | CONFIRMADA |
| FPUB-015 | Servicios poseen imagen, nombre y descripción. | CONFIRMADA |
| FPUB-016 | `visible_publicamente` separa publicación de operación interna en servicios. | CONFIRMADA |
| FPUB-017 | Contenido institucional permanece en `site.config.js`. | CONFIRMADA |
| FPUB-018 | Servicios y equipo se administran desde backend/panel. | CONFIRMADA |
| FPUB-019 | No se implementa CMS. | CONFIRMADA |
| FPUB-020 | Contacto por WhatsApp y correo mediante enlaces externos. | CONFIRMADA |
| FPUB-021 | No existe formulario público. | CONFIRMADA |
| FPUB-022 | El mapa embebido aparece solo en Contacto. | CONFIRMADA |
| FPUB-023 | Obras sociales/prepagas son estáticas e informativas. | CONFIRMADA |
| FPUB-024 | No existe consulta exclusiva por coberturas. | CONFIRMADA |
| FPUB-025 | Sin analítica, Meta Pixel o cookies de seguimiento. | CONFIRMADA |
| FPUB-026 | SEO básico con Helmet, sitemap, robots y metadatos. | CONFIRMADA |
| FPUB-027 | React Icons es la librería de iconos. | CONFIRMADA |
| FPUB-028 | Familia principal Font Awesome 6; marcas Simple Icons. | CONFIRMADA |
| FPUB-029 | CSS Modules + CSS Custom Properties. | CONFIRMADA |
| FPUB-030 | Paleta, tipografía, títulos, párrafos, espaciados y componentes se expresan como variables. | CONFIRMADA |
| FPUB-031 | Nunito para títulos e Inter para cuerpo/interfaz. | CONFIRMADA |
| FPUB-032 | Paleta principal `#2E6F6E`, acento `#C77B4B`. | CONFIRMADA |
| FPUB-033 | Seis imágenes institucionales estáticas: tres Home y tres Nosotros. | CONFIRMADA |
| FPUB-034 | No hay galería ni carrusel. | CONFIRMADA |
| FPUB-035 | Los marcos usan nombres de archivo predeterminados. | CONFIRMADA |
| FPUB-036 | Imágenes dinámicas se guardan localmente en backend. | CONFIRMADA |
| FPUB-037 | PostgreSQL guarda rutas, no binarios. | CONFIRMADA |
| FPUB-038 | GitHub recibe estructura, no uploads reales ni secretos. | CONFIRMADA |
| FPUB-039 | Producción se decide después; si se mantiene local necesita volumen persistente. | CONFIRMADA |
| FPUB-040 | Fallos de servicios y equipo se manejan de forma independiente. | CONFIRMADA |
| FPUB-041 | La Home no se bloquea por fallo parcial. | CONFIRMADA |
| FPUB-042 | “¿A quiénes acompañamos?” se organiza por necesidades. | CONFIRMADA |
| FPUB-043 | “Cómo trabajamos” tiene tres pasos confirmados. | CONFIRMADA |
| FPUB-044 | Nosotros no inventa historia cronológica ni fechas. | CONFIRMADA |
| FPUB-045 | Política de privacidad inicial requiere revisión antes de producción real. | CONFIRMADA |

---

## 3. Decisiones reemplazadas

| Decisión anterior | Reemplazo vigente |
|---|---|
| Landing page pura de una sola página. | Sitio público multipágina con Home de estilo landing. |
| Cloudinary como almacenamiento recomendado. | Almacenamiento local del backend para MVP. |
| Lucide React como iconografía. | React Icons. |
| Galería de instalaciones. | Seis imágenes contextuales junto a texto. |
| Contacto exclusivo para consultar cobertura. | Coberturas informativas sin flujo exclusivo. |
| `activo` controla también publicación del servicio. | `activo` y `visible_publicamente` separados. |
| Tarjetas destacadas para coordinadora/secretaria. | Mismo componente para todo el equipo. |
| Mapa también posible en Home. | Mapa embebido solo en Contacto. |
| Campos separados objetivo/destinatarios/modalidad de servicio. | Nombre, descripción e imagen; información dentro de descripción. |

---

## 4. Fuera del MVP

- páginas individuales de servicio;
- páginas individuales de equipo;
- CMS;
- blog;
- filtros y buscadores;
- formulario de contacto;
- reserva pública de turnos;
- galería o carrusel;
- analítica;
- modo oscuro;
- SSR/SSG;
- PWA avanzada;
- carga pública de archivos;
- almacenamiento binario en PostgreSQL;
- consulta dinámica de obras sociales.

---

## 5. Pendientes reales

| ID | Dato | Comportamiento mientras falta |
|---|---|---|
| REAL-001 | Nombres reales del equipo. | No publicar datos ficticios en producción. |
| REAL-002 | Fotos reales del equipo. | Placeholder. |
| REAL-003 | Logo y favicon. | Marco/fallback tipográfico. |
| REAL-004 | Seis fotos institucionales. | Marco de desarrollo/placeholder. |
| REAL-005 | Correo institucional real. | Ocultar enlace email. |
| REAL-006 | Instagram/Facebook reales. | Ocultar redes no configuradas. |
| REAL-007 | Obras sociales reales y logos autorizados. | Ocultar sección. |
| REAL-008 | URL exacta de mapa y Cómo llegar. | Mostrar dirección sin iframe si hace falta. |
| REAL-009 | Dominio público. | Variables locales. |
| REAL-010 | Responsable y texto legal final. | Borrador visible solo en entorno de prueba. |
| REAL-011 | Hosting con persistencia. | Desarrollo local y GitHub. |

---

## 6. Reglas de cambio

Cada cambio futuro debe indicar:

- ID nuevo;
- decisión reemplazada;
- motivo;
- impacto en DB, API, frontend, pruebas y documentación;
- fecha y responsable.
