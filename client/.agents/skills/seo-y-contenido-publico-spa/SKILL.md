---
name: seo-y-contenido-publico-spa
description: Crear, ampliar, corregir o revisar páginas institucionales y SEO básico por ruta en una SPA React/Vite. Usar cuando una tarea involucre `site.config.js`, títulos, meta descriptions, canonical, Open Graph, Twitter Card, robots meta, `robots.txt`, `sitemap.xml`, H1 y jerarquía de encabezados, URLs públicas, contenido institucional, privacidad, datos estructurados, React Helmet Async, indexación o límites SEO de una SPA sin SSR/SSG.
---

# SEO y contenido público en SPA

## Objetivo

Crear páginas institucionales coherentes, accesibles y rastreables con metadatos únicos por ruta y contenido centralizado. Implementar el SEO básico compatible con la SPA sin presentar renderizado cliente como equivalente a SSR, SSG o prerendering.

## 1. Inspeccionar contexto y realidad

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la página.
2. Consultar `client/doc/` para mapa de rutas, contenido confirmado, fallbacks y decisiones pendientes.
3. Revisar `package.json`, `index.html`, router, `site.config.js`, `seo.js`, `robots.txt` y `sitemap.xml`.
4. Confirmar dominio, nombre institucional, contacto, texto legal e imágenes reales antes de publicarlos.
5. Verificar si React Helmet Async y su provider están instalados y configurados.
6. Distinguir archivos vacíos del scaffold de una implementación funcional.

No instalar dependencias ni publicar contenido pendiente si la tarea no lo autoriza. No declarar SEO configurado solo porque existan archivos con esos nombres.

## 2. Mantener el mapa público confirmado

Las rutas institucionales del MVP son:

```text
/
/nosotros
/servicios
/equipo
/contacto
/privacidad
```

- Mantener URLs semánticas, cortas y en `kebab-case` cuando haya más de una palabra.
- Mantener `/login` fuera del sitemap y marcado como `noindex`.
- Mantener rutas privadas y páginas de error fuera del sitemap y no indexables cuando se rendericen.
- No crear páginas individuales para servicios o integrantes en el MVP.
- No añadir filtros, búsqueda o parámetros indexables a Servicios y Equipo.
- Configurar el host para devolver `index.html` al navegar directamente a una ruta válida de la SPA.
- Conservar una única versión canónica de cada ruta y una política coherente de barra final.

Un `404` servido por React necesita contenido claro y `noindex`; la configuración del host sigue siendo responsable del status y fallback disponibles en producción.

## 3. Centralizar contenido institucional

Mantener en `src/config/site.config.js`:

- nombre institucional y lema;
- introducciones, misión, visión y valores;
- teléfono, WhatsApp y correo;
- dirección y horarios;
- redes sociales;
- mapa y enlace Cómo llegar;
- obras sociales o prepagas confirmadas;
- mensajes de contacto predefinidos;
- rutas de imágenes institucionales;
- metadatos SEO por ruta.

- Consumir la configuración desde páginas y componentes; no repetir textos o datos de contacto.
- Mantener Servicios y Equipo como contenido dinámico de la API, no copiarlos a `site.config.js`.
- Tratar el cambio de contenido estático como cambio versionado que requiere despliegue.
- Ocultar correo, red, mapa, cobertura o bloque legal cuando falte el dato real y así lo indique la documentación.
- No usar contenido ficticio como relleno en producción.
- No crear un CMS, endpoint de contacto o configuración remota para resolver contenido estático del MVP.

No incluir secretos en configuración ni variables `VITE_*`; todo valor incorporado por Vite puede ser público.

## 4. Definir metadatos por ruta

Crear un contrato de SEO explícito para cada página:

```text
title
description
path
canonical
robots
openGraph
twitter
```

- Escribir un `<title>` único, descriptivo y alineado con el H1 y la intención de la página.
- Escribir una meta description única y natural; no convertirla en una lista de palabras clave.
- Construir canonical absoluta desde `VITE_SITE_URL` validada y el path público normalizado.
- Excluir query, hash y parámetros efímeros de canonical salvo decisión contraria documentada.
- Mantener `og:title`, `og:description` y `og:url` coherentes con los metadatos principales.
- Usar `og:type="website"` para las páginas institucionales del MVP.
- Usar una imagen Open Graph absoluta, pública, existente y representativa; no inventar una si el recurso no está confirmado.
- Configurar una Twitter Card básica coherente con Open Graph.
- Aplicar `index,follow` solo a rutas públicas confirmadas y `noindex,nofollow` a superficies no públicas cuando corresponda.

Centralizar composición, canonical y defaults en `utils/seo.js` o un componente `Seo`; mantener en `site.config.js` los valores editoriales por ruta.

## 5. Integrar React Helmet Async cuando esté disponible

- Confirmar `react-helmet-async` en `package.json` antes de importarlo.
- Envolver la aplicación una sola vez con `HelmetProvider`.
- Renderizar metadatos dentro de cada página o mediante un componente `Seo` declarativo.
- Evitar manipular `document.title` y nodos `<head>` desde múltiples efectos.
- Mantener un fallback institucional seguro en `index.html` para carga inicial o fallos de JavaScript.
- Actualizar title, canonical y social tags al navegar entre rutas.
- Evitar tags duplicados después de navegación cliente.
- Mantener `html lang="es"` si el contenido principal está en español.

Helmet actualiza el DOM después de ejecutar JavaScript. Esto mejora metadatos por ruta para crawlers capaces de renderizar, pero no garantiza previews sociales ni rastreo inicial completo.

## 6. Mantener un H1 y jerarquía semántica

- Renderizar exactamente un H1 visible por página.
- Alinear H1, title y propósito sin exigir que sean texto idéntico.
- Descender por niveles de encabezado sin saltos usados solo por estilo.
- Usar H2 para secciones principales y H3 para subsecciones o títulos de tarjetas cuando corresponda.
- No convertir párrafos en headings para obtener tamaño visual.
- Mantener contenido comprensible cuando iconos, imágenes o consultas API fallen.
- Evitar texto clave solo dentro de imágenes.
- Mantener enlaces con texto descriptivo y rutas internas mediante el router.

En Home, el H1 pertenece al Hero; los títulos de Servicios, enfoque, Equipo y contacto comienzan desde H2.

## 7. Redactar contenido útil y verificable

- Escribir para familias y visitantes, no para motores de búsqueda.
- Explicar identidad, servicios, equipo y contacto con lenguaje claro y sin repetición artificial.
- Mantener información local confirmada de Goya, Corrientes cuando sea relevante y verdadera.
- No inventar acreditaciones, especialidades, áreas médicas, resultados, testimonios o coberturas.
- No publicar nombres ficticios del equipo como reales.
- Mantener `funcionPublica` separada del rol técnico.
- Mostrar biografías completas en `/equipo` y descripciones completas en `/servicios`.
- Conservar una salida útil si Servicios o Equipo fallan: el contenido estático debe seguir explicando la página.
- No renderizar descripciones o biografías mediante `dangerouslySetInnerHTML`.

La página `/privacidad` contiene un texto inicial sujeto a revisión legal. No presentarlo como validado definitivamente ni completar bases legales o responsable sin confirmación.

## 8. Configurar canonical y dominio con seguridad

- Validar `VITE_SITE_URL` como origen absoluto HTTP o HTTPS sin path inesperado.
- Normalizar la barra final antes de unirla con la ruta.
- No derivar el canonical de `window.location` sin filtrar parámetros, hosts de preview o dominios locales.
- No generar canonical de producción con `localhost`, URL de staging o dominio pendiente.
- Si el dominio real no está confirmado, mantener valores locales claramente identificados y no publicar sitemap productivo engañoso.
- Usar siempre el mismo origen canónico en Helmet, sitemap, Open Graph y datos estructurados.

No añadir IDs internos, tokens, búsquedas o información de sesión a URLs indexables.

## 9. Mantener `robots.txt`

- Publicar `robots.txt` en `client/public/robots.txt`.
- Permitir el rastreo de rutas institucionales cuando el entorno sea productivo y el contenido esté listo.
- Referenciar la URL absoluta del sitemap del mismo dominio canónico.
- No usar `robots.txt` como control de acceso: cualquier ruta privada debe estar protegida por autenticación y autorización.
- No incluir secretos, rutas internas sensibles ni comentarios operativos.
- Diferenciar configuración de producción de entornos de prueba cuando exista riesgo de indexación accidental.

El bloqueo mediante `Disallow` no sustituye la meta `noindex` y puede impedir que un crawler vea esa directiva. Diseñar ambas políticas con intención.

## 10. Mantener `sitemap.xml`

- Publicar `sitemap.xml` en `client/public/sitemap.xml`.
- Incluir solo `/`, `/nosotros`, `/servicios`, `/equipo`, `/contacto` y `/privacidad` con URLs absolutas.
- Excluir `/login`, `/app`, errores, parámetros, API y archivos de upload.
- Mantener el dominio y política de slash idénticos a canonical.
- Agregar `lastmod` solo si representa una fecha real y mantenible.
- No inventar `changefreq` o prioridades que no aporten información fiable.
- Actualizar sitemap al cambiar el mapa de rutas públicas.
- Verificar XML válido y que cada URL resuelva directamente en el host desplegado.

Un sitemap facilita descubrimiento; no garantiza indexación ni corrige contenido pobre o rendering inaccesible.

## 11. Usar Open Graph y media social

- Elegir una imagen versionada con dimensiones adecuadas y acceso público estable.
- Construir `og:image` como URL absoluta del dominio o CDN confirmado.
- Añadir texto alternativo social cuando la implementación y plataforma lo permitan.
- No usar fotos del equipo sin autorización ni placeholders como identidad social definitiva.
- Mantener título y descripción social dentro del mismo contrato editorial de la ruta.
- Probar la respuesta desplegada con herramientas de depuración social cuando el dominio exista.

Los bots sociales suelen no ejecutar la SPA. Si las previews por ruta son un requisito estricto, proponer prerendering, SSR o generación estática en una etapa posterior.

## 12. Añadir datos estructurados solo confirmados

- Incorporar JSON-LD únicamente si la organización, dirección, contacto y categoría están confirmados.
- Usar `LocalBusiness` o un subtipo más específico solo si representa legalmente al centro.
- Mantener datos estructurados coherentes con contenido visible y canonical.
- No inventar acreditaciones, servicios médicos, precios, ratings, horarios o coberturas.
- Serializar datos controlados por configuración; no inyectar texto de usuarios como HTML.
- Omitir el schema antes que publicar datos incorrectos.

## 13. Reconocer límites de la SPA

- Documentar que el HTML inicial de Vite es compartido y los metadatos por ruta aparecen después de ejecutar JavaScript.
- No afirmar equivalencia con SSR/SSG ni prometer posiciones de búsqueda.
- Aceptar esta limitación para el MVP por simplicidad tecnológica y de despliegue.
- Mantener navegación directa mediante fallback del host y contenido útil tras hidratar.
- Medir indexación, previews y rendimiento reales después del despliegue.
- Evaluar prerendering o separación del sitio público si SEO competitivo, previews sociales exactas o rendering inicial se vuelven requisitos.

No introducir un framework adicional preventivamente sin evidencia de que la limitación afecta objetivos reales.

## 14. Probar SEO y contenido

- Cada ruta pública renderiza title y description únicos.
- Cada canonical es absoluta, correcta y consistente con sitemap.
- Open Graph y Twitter cambian al navegar y no quedan duplicados.
- Cada página tiene un único H1 y jerarquía de headings coherente.
- `/login`, privadas y errores no aparecen en sitemap y usan noindex cuando corresponde.
- `robots.txt` referencia el sitemap correcto y no expone información sensible.
- `sitemap.xml` es XML válido y contiene exactamente las rutas públicas confirmadas.
- `site.config.js` es la fuente única de datos institucionales repetidos.
- Contenido faltante se oculta según fallback y no se reemplaza con datos ficticios.
- La página sigue siendo comprensible con errores de API e imágenes ausentes.
- Las rutas directas funcionan en el entorno de despliegue.
- No existen analytics, píxeles ni cookies de seguimiento.

Ejecutar lint, pruebas y build disponibles. Usar pruebas de componente para headings/metadatos y Playwright para navegación real cuando la infraestructura exista.

## Guardrails

- No duplicar contenido institucional entre componentes.
- No publicar datos ficticios o legales no confirmados.
- No usar múltiples H1 por página.
- No crear canonical desde un host no validado.
- No incluir login, rutas privadas o errores en sitemap.
- No usar `robots.txt` como seguridad.
- No inyectar HTML recibido de la API.
- No agregar schema.org especulativo.
- No afirmar que Helmet elimina los límites de una SPA.
- No migrar a SSR/SSG sin una necesidad demostrada y autorización explícita.

## Entrega esperada

Resumir:

- rutas y contenido institucional afectados;
- title, description, canonical y social tags definidos;
- H1 y jerarquía de encabezados revisados;
- cambios en `site.config.js`, `robots.txt` y `sitemap.xml`;
- límites SPA o datos pendientes identificados;
- pruebas y verificaciones ejecutadas.
