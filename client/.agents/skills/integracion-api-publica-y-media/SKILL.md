---
name: integracion-api-publica-y-media
description: Implementar, ampliar, corregir o revisar las secciones públicas de Equipo, Servicios y sus imágenes en React/Vite. Usar cuando una tarea involucre endpoints `/public/equipo` o `/public/servicios`, hooks con loading/error/empty/retry, cancelación, fallos parciales, contratos públicos mínimos, `buildFileUrl`, rutas `/uploads`, placeholders, imágenes institucionales versionadas, media dinámica, alt, lazy loading o caché de archivos.
---

# Integración API pública y media

## Objetivo

Integrar Servicios y Equipo con datos públicos mínimos, estados independientes y recuperación local ante fallos. Distinguir recursos versionados del frontend de imágenes dinámicas administradas por backend y construir sus URLs desde una única frontera segura.

## 1. Inspeccionar contrato y estado real

1. Leer los `AGENTS.md` aplicables desde `client/` hasta la feature.
2. Consultar `client/doc/` y el contrato público de `api/` antes de definir campos, orden o visibilidad.
3. Revisar `package.json`, `env.js`, cliente HTTP, `fileUrl.js`, hooks y componentes existentes.
4. Verificar rutas y archivos reales en `client/public/images/` antes de referenciarlos.
5. Identificar si los archivos son implementación o scaffold vacío.
6. Separar requisitos de Home, `/servicios` y `/equipo`.

No inventar datos, URLs, integrantes, imágenes ni configuración institucional. Aplicar los fallbacks documentados cuando falte contenido real.

## 2. Respetar fuentes de contenido

| Contenido | Fuente | Actualización |
|---|---|---|
| Servicios publicados | API pública | Panel/backend |
| Equipo publicado | API pública | Panel/backend |
| Imágenes de servicios y equipo | Rutas dinámicas `/uploads` | Upload administrativo |
| Logo, favicon e institucionales | `client/public/images/` | Commit y despliegue |
| Contacto, textos y SEO | `site.config.js` o configuración versionada | Commit y despliegue |

- No crear endpoints públicos para contacto o configuración institucional.
- No copiar datos dinámicos como constantes de componentes.
- No usar archivos de `api/uploads` como assets versionados del cliente.
- Referenciar assets de `public/` desde la raíz pública, sin incluir `/public` en la URL.
- Mantener imágenes institucionales con nombres estables documentados.

## 3. Consumir contratos públicos mínimos

### Equipo

Consumir:

```text
GET /api/v1/public/equipo
GET /api/v1/public/equipo?limit=4
```

Aceptar solo los campos públicos necesarios:

- `id` para identidad React y operaciones internas del listado;
- `nombre` y `apellido`;
- `titulo`;
- `especialidad`;
- `funcionPublica`;
- `bio`;
- `fotoUrl`;
- `ordenPublico`.

No aceptar como parte del contrato público DNI, email de acceso, teléfono personal, rol técnico, permisos, sesión o auditoría. El administrador nunca debe aparecer. No inferir el orden desde el rol: respetar `ordenPublico` y el desempate del backend.

### Servicios

Consumir:

```text
GET /api/v1/public/servicios
GET /api/v1/public/servicios?limit=4
```

Aceptar:

- `id`;
- `nombre`;
- `descripcion`;
- `imagenUrl`;
- `ordenPublico`.

El backend debe devolver únicamente registros activos y `visiblePublicamente`. No convertir `activo` y publicación pública en una sola regla del frontend.

### Envelope

- Extraer `data` del envelope y validar que sea una lista antes de entregarla al hook.
- Usar `meta.count` solo cuando aporte información real; no crear paginación pública.
- Ocultar Axios y la respuesta cruda dentro del módulo `*Api.js`.
- Mantener modelos del frontend en `camelCase`.
- Informar incompatibilidades del contrato en vez de rellenar silenciosamente campos privados o inexistentes.

## 4. Diferenciar Home y páginas completas

- Solicitar `limit=4` para Servicios y Equipo en Home.
- No descargar todos los registros para recortarlos en el navegador.
- Solicitar sin `limit` en `/servicios` y `/equipo` para mostrar todos los publicados.
- No agregar filtros, búsqueda, paginación ni páginas individuales en el MVP.
- Mostrar biografías completas directamente en `/equipo`.
- Usar el mismo componente visual para coordinación, secretaría y profesionales.
- Mantener las consultas de Servicios y Equipo independientes incluso cuando ambas vivan en Home.

El fallo de una sección no debe bloquear la otra ni el contenido institucional estático.

## 5. Encapsular HTTP en módulos de feature

- Implementar `getPublicServices({ limit, signal })` y `getPublicTeam({ limit, signal })` en sus módulos API.
- Consumir rutas relativas `/public/servicios` y `/public/equipo` desde la base que termina en `/api/v1`.
- Incluir `limit` solo cuando tenga valor válido entre 1 y 50.
- Pasar `AbortSignal` al cliente HTTP.
- Devolver datos útiles, no el objeto de respuesta completo.
- No enviar `Authorization`, cookies ni `withCredentials` a endpoints públicos salvo que el contrato cambie explícitamente.
- No implementar refresh, sesión o Redux para estos listados.
- Normalizar errores antes de entregarlos a hooks y componentes.

No crear un segundo cliente HTTP incompatible si el cliente central puede distinguir solicitudes públicas de privadas de forma segura.

## 6. Diseñar hooks con estados explícitos

Mantener en `usePublicServices({ limit })` y `usePublicTeam({ limit })`:

```text
status: idle | loading | success | error
data
error
retry()
```

- Iniciar cada lectura al montar o cambiar un parámetro estable.
- Cancelar la request al desmontar o reemplazarla por una nueva.
- Ignorar cancelaciones como error visible.
- Evitar que respuestas antiguas sobrescriban parámetros nuevos.
- Diferenciar `success` con lista vacía de `error`.
- Exponer un `retry()` manual que repita solo la consulta afectada.
- Evitar reintentos automáticos infinitos; no incorporar uno automático sin una decisión explícita.
- Mantener el error normalizado y no exponer objetos Axios a la UI.
- No persistir los datos en `localStorage` ni moverlos a Redux.

Crear un hook genérico únicamente si reduce duplicación sin ocultar los nombres, estados o contratos de cada recurso.

## 7. Renderizar estados locales y fallos parciales

### Loading

- Mostrar skeletons con dimensiones cercanas al contenido final.
- No bloquear la página completa por una sección.
- Reservar espacio para imágenes y texto para evitar saltos de layout.
- Anunciar una vez el estado general de carga cuando sea útil; no anunciar cada skeleton.

### Empty

- Tratar una lista vacía exitosa como información en actualización, no como error.
- Mantener el encabezado y contexto de la sección.
- No completar la lista con contenido ficticio en producción.

### Error

- Mostrar un mensaje no técnico dentro de la sección afectada.
- Ofrecer `Reintentar` y un contacto general cuando aporte una salida útil.
- Mantener header, footer, navegación, contacto y secciones independientes disponibles.
- Mostrar correlation ID solo como detalle discreto de soporte.
- No mostrar stack traces, payloads ni mensajes crudos del servidor.

En Home, probar Servicios exitosos con Equipo fallido y el caso inverso.

## 8. Construir URLs dinámicas en una sola frontera

- Centralizar la lógica en `services/fileUrl.js` mediante `buildFileUrl`.
- Retornar `null` ante ruta ausente o inválida para activar el placeholder.
- Resolver rutas relativas devueltas por la API contra `VITE_FILES_BASE_URL`, no contra `VITE_API_BASE_URL`.
- Normalizar exactamente una barra entre base y ruta.
- Aceptar únicamente protocolos HTTP esperados y orígenes permitidos por configuración.
- Preferir el contrato de rutas relativas `/uploads/usuarios/...` y `/uploads/servicios/...`.
- No concatenar texto ingresado por visitantes, nombres originales de archivo o rutas locales.
- No exponer secretos en `VITE_FILES_BASE_URL`; toda variable `VITE_*` es pública.
- No duplicar construcción de URLs dentro de cards, hooks o páginas.

No añadir query strings aleatorios para romper caché. El backend cambia el nombre del archivo al reemplazarlo.

## 9. Gestionar fallback de imagen una sola vez

- Definir un placeholder canónico por categoría: profesional y servicio.
- Usar la ruta dinámica construida cuando exista y el placeholder cuando falte.
- Ante `onError`, cambiar una sola vez al placeholder correspondiente.
- Evitar bucles si el placeholder también falla; retirar el handler o registrar el estado de fallback.
- No mostrar iconos de imagen rota.
- Mantener proporción y dimensiones aunque cambie el origen.
- No implementar reintentos automáticos de imagen.
- Reutilizar un componente o hook de media solo si centraliza realmente esta conducta.

En desarrollo, una imagen institucional faltante puede mostrar el nombre esperado. En producción debe usar un placeholder neutro y no datos ficticios.

## 10. Diferenciar media versionada y dinámica

### Versionada

- Guardar branding, institucionales, placeholders y coberturas confirmadas en `client/public/images/`.
- Cambiar estas imágenes mediante commit y despliegue.
- Usar rutas públicas estables y verificar mayúsculas/minúsculas para producción.
- No almacenar archivos administrativos dinámicos dentro del repositorio.

### Dinámica

- Consumir `fotoUrl` e `imagenUrl` relativas proporcionadas por endpoints públicos confiables.
- Dejar upload, reemplazo y eliminación al panel privado y backend.
- Aprovechar caché HTTP prolongada porque el backend usa nombres nuevos al reemplazar archivos.
- No almacenar base64, blobs o copias dinámicas en Redux o almacenamiento web.

## 11. Optimizar imágenes sin perder accesibilidad

- Definir `width`, `height` o `aspect-ratio` para reducir layout shift.
- Usar WebP cuando sea el formato disponible y no convertir archivos en runtime.
- Aplicar `loading="lazy"` fuera del Hero y contenido inicial crítico.
- Usar prioridad alta solo para el Hero cuando esté justificada.
- Describir fotografías informativas del equipo con el nombre completo.
- Describir imágenes de servicio según el servicio sin afirmar detalles visuales no verificados.
- Usar `alt=""` para imágenes estrictamente decorativas.
- Mantener texto y acciones comprensibles cuando la imagen no cargue.
- Evitar fondos CSS para imágenes que transmiten información.

## 12. Preservar privacidad pública

- Validar mediante lista positiva los campos consumidos, no solo ignorar algunos campos privados.
- No renderizar biografías o descripciones mediante `dangerouslySetInnerHTML`.
- No registrar respuestas completas de la API ni contenido de contactos en consola.
- No incluir IDs internos en URLs visibles cuando no sean necesarios.
- No enviar datos a analytics ni solicitar recursos privados desde páginas públicas.
- No publicar nombres ficticios para cubrir ausencia de equipo real.

Si el payload incluye un campo prohibido, tratarlo como defecto de contrato backend y evitar propagarlo por componentes, fixtures o logs.

## 13. Probar integración y media

- Home solicita como máximo cuatro servicios y cuatro integrantes.
- Páginas completas solicitan todos sin paginación.
- Inactivos, no visibles y administrador no aparecen.
- El orden recibido permanece estable y no se recalcula por rol.
- Payloads no contienen campos privados.
- Loading, empty, network error, server error y retry manual funcionan.
- Servicios y Equipo fallan independientemente.
- Una request cancelada no muestra error ni actualiza tras desmontar.
- `buildFileUrl` cubre ruta nula, relativa, barras, protocolo y origen no permitido.
- Imagen ausente o rota cambia una sola vez al placeholder correcto.
- Placeholder roto no produce bucle.
- Alt, dimensiones, lazy loading y contenido sin imagen son correctos.
- No existe endpoint público de contacto y no se envían contactos reales en E2E.

Ejecutar lint, pruebas y build disponibles. Informar claramente qué no pudo verificarse si la API pública o el stack de pruebas aún no están implementados.

## Guardrails

- No mezclar contenido institucional versionado con datos administrados por API.
- No descargar listados completos para mostrar cuatro registros.
- No acoplar el estado de Servicios al de Equipo.
- No confundir vacío con error ni cancelación con fallo.
- No reintentar indefinidamente requests o imágenes.
- No construir URLs de archivos en cada componente.
- No usar rutas proporcionadas por usuarios finales.
- No inventar datos o imágenes faltantes.
- No exponer campos privados en componentes públicos.
- No agregar Redux, React Query o Service Worker solo para dos listados.

## Entrega esperada

Resumir:

- endpoints, campos y límites consumidos;
- módulos API y hooks afectados;
- estados, retry y fallos parciales cubiertos;
- recursos versionados y dinámicos utilizados;
- construcción de URLs, placeholder y accesibilidad de imágenes;
- pruebas y verificaciones ejecutadas.
