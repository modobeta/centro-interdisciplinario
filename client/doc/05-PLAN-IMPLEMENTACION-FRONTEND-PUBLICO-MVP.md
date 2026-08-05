# Plan de implementación del frontend público — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0

---

## 1. Estrategia

Se implementa por etapas verticales pequeñas. Cada etapa deja una porción navegable, probada y documentada.

Orden general:

```text
bootstrap
→ diseño base
→ layout y rutas
→ Home estática
→ Nosotros
→ API pública
→ Servicios
→ Equipo
→ Contacto
→ Privacidad y SEO
→ accesibilidad
→ pruebas E2E
→ estabilización
```

No se comienza el panel privado hasta cerrar los criterios del área pública o dejar claramente aisladas las tareas pendientes.

---

## 2. Etapa 0 — Preparación del repositorio

### Tareas

- crear o validar monorepo con `api/` y `client/`;
- inicializar React con Vite;
- configurar ESLint y Prettier;
- agregar scripts;
- crear `.env.example`;
- instalar dependencias mínimas;
- configurar aliases simples si no confunden al equipo;
- preparar GitHub;
- proteger `.env`, `node_modules` y uploads.

### Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

### Definition of Done

- `npm run dev` funciona;
- `npm run build` termina sin errores;
- Git no rastrea secretos;
- existe `.env.example`;
- README explica arranque local.

---

## 3. Etapa 1 — Sistema visual

### Tareas

- copiar y revisar `tokens-public.css`;
- crear reset y globals;
- cargar Nunito e Inter o configurar fallbacks;
- crear Container, Section, Button y AppIcon;
- crear placeholders;
- verificar contraste;
- documentar breakpoints.

### Pruebas

- snapshots visuales no obligatorios;
- pruebas de clases/variantes de Button;
- axe o revisión manual de contraste y foco.

### DoD

- ninguna demo utiliza colores hardcodeados;
- todos los textos base responden a tokens;
- foco visible;
- 320 px y 200 % de zoom son utilizables.

---

## 4. Etapa 2 — Router y layout público

### Tareas

- `PublicLayout`;
- header;
- navegación desktop;
- menú móvil;
- footer;
- WhatsApp flotante;
- rutas públicas;
- 404;
- ScrollToTop y gestión de foco.

### Pruebas

- navegación por teclado;
- apertura/cierre del menú;
- ruta activa;
- cierre del menú al navegar;
- acceso directo a rutas.

### DoD

- todas las rutas muestran layout;
- no hay scroll bloqueado después de cerrar menú;
- navegación accesible;
- logo tiene fallback.

---

## 5. Etapa 3 — Configuración institucional

### Tareas

- crear `site.config.js` basado en anexo;
- centralizar nombre, lema, contacto, horario, mapa, redes y coberturas;
- crear helpers de WhatsApp, correo y teléfono;
- ocultar datos opcionales vacíos;
- diferenciar datos de fantasía y producción.

### DoD

- no hay teléfonos o emails repetidos en componentes;
- cambiar el contacto requiere editar un único archivo;
- coberturas vacías ocultan la sección.

---

## 6. Etapa 4 — Home estática

### Tareas

- Hero;
- necesidades;
- cómo trabajamos;
- números;
- coberturas;
- contacto resumido;
- CTA final;
- tres marcos institucionales.

En esta etapa servicios y equipo pueden usar datos mock locales aislados o estados de carga, sin copiar el contenido definitivo en componentes.

### DoD

- orden de secciones confirmado;
- tres imágenes con nombres definitivos;
- Home completa en móvil y escritorio;
- CTAs abren destinos correctos.

---

## 7. Etapa 5 — Nosotros

### Tareas

- encabezado;
- quiénes somos;
- misión;
- visión;
- valores;
- enfoque;
- destinatarios;
- CTA;
- tres marcos institucionales.

### DoD

- no existe galería;
- no se inventan fechas;
- textos provienen de configuración o archivo de contenido;
- jerarquía de headings correcta.

---

## 8. Etapa 6 — Capa API pública

### Dependencia

Aplicar primero los ajustes backend documentados en `06-AJUSTES-BACKEND...`.

### Tareas

- `env.js` validando variables públicas;
- Axios;
- `publicApi.js`;
- `buildFileUrl`;
- hooks de servicios y equipo;
- cancelación;
- normalización de errores;
- componentes loading/error/empty.

### DoD

- API real o mock de contrato funciona;
- una sección fallida no rompe Home;
- no hay logs de respuestas completas;
- imágenes relativas se muestran.

---

## 9. Etapa 7 — Servicios

### Tareas

- preview de cuatro en Home;
- página completa;
- ServicePreviewCard;
- ServiceDetailCard;
- mensajes personalizados de contacto;
- iconos;
- placeholders;
- skeletons;
- error y retry.

### DoD

- los primeros cuatro dependen de `ordenPublico`;
- `/servicios` muestra todos;
- no hay filtros ni paginación;
- descripción completa;
- servicio oculto no aparece.

---

## 10. Etapa 8 — Equipo

### Tareas

- preview de cuatro en Home;
- página completa;
- mismas tarjetas para todos;
- biografías completas;
- fotografías y fallback;
- error y retry.

### DoD

- coordinadora y secretaria no tienen estilos especiales;
- orden depende de backend;
- administrador nunca aparece;
- no se expone rol técnico;
- no existe Ver más.

---

## 11. Etapa 9 — Contacto

### Tareas

- tarjetas WhatsApp/email;
- teléfono;
- dirección y horario;
- iframe de mapa;
- redes configuradas;
- link Cómo llegar;
- ocultamiento de campos vacíos.

### DoD

- no existe formulario;
- WhatsApp y mailto incluyen texto codificado;
- iframe tiene title;
- mapa solo aparece aquí;
- enlaces externos seguros.

---

## 12. Etapa 10 — Privacidad y SEO

### Tareas

- contenido de privacidad inicial;
- Helmet por página;
- canonical;
- OG;
- robots;
- sitemap;
- noindex de login;
- favicon;
- datos estructurados solo confirmados.

### DoD

- title y description únicos;
- un H1 por página;
- no hay analítica ni banner;
- política no afirma datos legales inventados;
- sitemap contiene rutas públicas.

---

## 13. Etapa 11 — Accesibilidad y rendimiento

### Checklist

- skip link;
- landmarks;
- menú por teclado;
- foco visible;
- alt correctos;
- contraste;
- zoom 200 %;
- reducción de movimiento;
- tamaños táctiles;
- imágenes dimensionadas;
- lazy loading;
- lazy routes;
- Lighthouse como señal, no como única prueba.

---

## 14. Etapa 12 — Pruebas

### 14.1 Unitarias

- helpers de contacto;
- buildFileUrl;
- truncado de bio en Home;
- normalización de errores;
- configuración de datos opcionales.

### 14.2 Componentes

- header y menú;
- ServiceCard;
- TeamMemberCard;
- error, vacío y skeleton;
- InstitutionalImage fallback;
- ContactChannelCard.

### 14.3 Integración

- Home con servicios exitosos/equipo fallido;
- Home con equipo exitoso/servicios fallidos;
- servicios completos;
- equipo completo;
- datos opcionales ocultos;
- rutas directas.

### 14.4 E2E

1. visitar Home;
2. navegar a Servicios;
3. abrir contacto WhatsApp verificando URL;
4. navegar a Equipo;
5. navegar a Nosotros;
6. abrir Contacto y mapa;
7. abrir Privacidad;
8. navegar a Login;
9. probar menú móvil;
10. probar 404.

No se envían mensajes reales en tests.

---

## 15. Git y GitHub

### 15.1 Estrategia simple

- rama principal protegida cuando el equipo esté listo;
- ramas cortas por feature;
- Pull Request con checklist;
- commits pequeños y descriptivos;
- no incluir imágenes cargadas, secretos ni `.env`.

### 15.2 Contenido versionado

Sí:

- código;
- documentación;
- migraciones;
- placeholders;
- logo e imágenes institucionales autorizadas;
- `.gitkeep`;
- `.env.example`.

No:

- uploads reales;
- base de datos;
- credenciales;
- backups;
- nombres reales sin autorización.

---

## 16. CI inicial

GitHub Actions puede ejecutar:

```text
npm ci
npm run lint
npm run test:run
npm run build
```

Playwright puede incorporarse cuando el flujo sea estable.

---

## 17. Checklist de revisión por PR

- respeta documento de página;
- usa componentes existentes;
- usa tokens;
- mobile-first;
- accesible por teclado;
- maneja loading/error/empty;
- no expone datos privados;
- tiene pruebas razonables;
- no agrega dependencias sin fundamento;
- actualiza documentación si cambia una decisión.

---

## 18. Definition of Done del área pública

El área pública se considera terminada cuando:

- todas las rutas están implementadas;
- Home y Nosotros usan seis imágenes con nombres definidos;
- servicios y equipo consumen API;
- errores parciales no bloquean páginas;
- contactos funcionan sin backend;
- no existen datos privados en payload público;
- design tokens gobiernan la UI;
- responsive y accesibilidad están verificados;
- SEO básico está configurado;
- tests pasan;
- build pasa;
- documentación coincide con el código;
- datos ficticios están identificados;
- el repositorio puede publicarse en GitHub sin secretos.

---

## 19. Trabajo posterior

Después de cerrar esta etapa se inicia la documentación del panel privado:

1. login y sesión;
2. navegación por roles;
3. dashboard;
4. usuarios;
5. pacientes;
6. agenda;
7. informes;
8. conversaciones;
9. catálogos y auditoría.
