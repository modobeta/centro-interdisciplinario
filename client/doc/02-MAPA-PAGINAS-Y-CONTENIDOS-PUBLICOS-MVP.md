# Mapa de páginas y contenidos públicos — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0

---

## 1. Mapa del sitio

```text
/
├── /nosotros
├── /servicios
├── /equipo
├── /contacto
├── /privacidad
└── /login
```

La Home resume la propuesta institucional. Las páginas internas desarrollan los temas principales.

---

## 2. Navegación pública

### 2.1 Header

Orden:

1. Logo, enlaza a `/`.
2. Inicio.
3. Nosotros.
4. Servicios.
5. Nuestro equipo.
6. Contacto.
7. Ingresar.

`Ingresar` se distingue visualmente, pero no compite con el contacto institucional.

### 2.2 Menú móvil

- botón con etiqueta accesible;
- panel desplegable o drawer simple;
- se cierra con Escape;
- se cierra al seleccionar una ruta;
- bloquea el scroll de fondo mientras está abierto;
- devuelve el foco al botón al cerrarse.

### 2.3 Footer

Incluye:

- nombre y logo;
- texto institucional breve;
- enlaces públicos;
- contacto;
- horario;
- redes configuradas;
- privacidad;
- acceso al sistema;
- copyright dinámico.

### 2.4 WhatsApp flotante

Aparece en todas las páginas públicas, excepto cuando interfiera con un diálogo. Tiene texto accesible y mensaje general predefinido.

---

# 3. Home `/`

## 3.1 Objetivo

Presentar el centro, explicar a quién acompaña, resumir servicios y equipo y facilitar el contacto.

## 3.2 Orden definitivo

1. Header.
2. Hero.
3. ¿A quiénes acompañamos?
4. Servicios destacados.
5. Cómo trabajamos.
6. Nuestro equipo.
7. El centro en números.
8. Obras sociales y prepagas.
9. Contacto resumido.
10. CTA final.
11. Footer.
12. WhatsApp flotante.

---

## 3.3 Hero

### Contenido

**Título visible:**

> Centro Educativo Interdisciplinar Terapéutico “Mentes Luminosas”

**Lema:**

> Donde el aprendizaje abraza la diversidad para encender el potencial de cada historia.

**Introducción:**

> En C.E.I.T. “Mentes Luminosas” acompañamos a niños, niñas y adolescentes en su desarrollo, y sostenemos a sus familias con un equipo interdisciplinario comprometido, cálido y profesional. Ubicados en Goya, Corrientes, ofrecemos un espacio de contención, diagnóstico y tratamiento integral para potenciar las capacidades de cada persona que nos elige.

### Acciones

- `Solicitar un turno`: abre WhatsApp general.
- `Conocer nuestros servicios`: navega a `/servicios`.

### Imagen

```text
/images/institucionales/home-hero.webp
```

Proporción recomendada: 16:10. En desarrollo se reserva el marco aunque el archivo todavía no exista.

---

## 3.4 ¿A quiénes acompañamos?

Se presenta por necesidades, no por grupos etarios.

### Bloques

#### Desarrollo neurocognitivo

> Acompañamos procesos vinculados al desarrollo de habilidades cognitivas, emocionales y adaptativas.

#### Dificultades de aprendizaje

> Brindamos apoyo ante desafíos relacionados con la lectura, la escritura, el cálculo y las trayectorias escolares.

#### Comunicación

> Trabajamos sobre el lenguaje, el habla y otras formas de expresión y comunicación.

#### Acompañamiento familiar

> Orientamos y sostenemos a las familias durante cada etapa del proceso educativo y terapéutico.

### Imagen contextual

```text
/images/institucionales/home-acompanamiento.webp
```

Proporción recomendada: 4:3. Se ubica junto al texto general de la sección; no forma una galería.

---

## 3.5 Servicios destacados

### Datos

```http
GET /api/v1/public/servicios?limit=4
```

### Orden

`orden_publico ASC`, luego `nombre ASC`.

### Tarjeta resumida

- imagen;
- nombre;
- fragmento de descripción;
- enlace para consultar por WhatsApp;
- toda la tarjeta o un enlace conduce a `/servicios` cuando corresponda.

No existe campo `destacado`. Los primeros cuatro son los destacados.

### Estado vacío

Si la API responde correctamente sin registros:

> Estamos actualizando la información de nuestros servicios.

### Error

> No pudimos cargar los servicios en este momento.

Acciones: Reintentar y Contacto general.

---

## 3.6 Cómo trabajamos

### Paso 1 — Primera escucha y orientación

> Se presenta el motivo de consulta, se conocen las necesidades iniciales y se orienta a la familia sobre los pasos a seguir.

### Paso 2 — Evaluación y planificación personalizada

> El equipo analiza cada situación y organiza un acompañamiento acorde con las características, necesidades y objetivos de cada niño, niña o adolescente.

### Paso 3 — Acompañamiento interdisciplinario

> Los profesionales trabajan de manera articulada, revisan los avances y sostienen la comunicación con la familia durante el proceso.

### Imagen contextual

```text
/images/institucionales/home-enfoque-interdisciplinario.webp
```

Proporción recomendada: 4:3.

---

## 3.7 Nuestro equipo

### Datos

```http
GET /api/v1/public/equipo?limit=4
```

### Orden esperado

1. coordinadora;
2. secretaria;
3. primer profesional;
4. segundo profesional.

El orden real se controla con `orden_publico`; no se codifica por rol en el frontend.

### Tarjeta resumida

- fotografía;
- nombre y apellido;
- título;
- función pública o especialidad;
- fragmento de biografía.

Todos usan el mismo componente visual.

CTA: `Conocer a todo el equipo` → `/equipo`.

---

## 3.8 El centro en números

Contenido inicial de fantasía:

- 1 coordinadora;
- 1 secretaria;
- 8 profesionales;
- 6 disciplinas.

### Regla

Los números deben centralizarse en configuración o derivarse de la API cuando sean confiables. No se repiten en varios componentes.

La sección no promete resultados clínicos ni métricas de atención.

---

## 3.9 Obras sociales y prepagas

Carácter exclusivamente informativo.

- contenido estático;
- sin consulta exclusiva;
- sin mensaje de WhatsApp dedicado;
- sin tabla ni endpoint;
- se muestra solo cuando existe un listado real;
- puede incluir nombres y logotipos autorizados.

Si no hay datos confirmados, la sección no se renderiza.

---

## 3.10 Contacto resumido

Muestra:

- Calle España 930, Goya, Corrientes;
- lunes a viernes, 8:00 a 21:00;
- teléfono/WhatsApp;
- correo si está confirmado;
- enlace `Cómo llegar`.

No incluye mapa embebido.

---

## 3.11 CTA final

Texto base:

> Cada proceso comienza con una conversación. Nuestro equipo está disponible para orientarte y ayudarte a encontrar el acompañamiento adecuado.

Acciones:

- Escribir por WhatsApp.
- Enviar un correo, si está configurado.

---

# 4. Nosotros `/nosotros`

## 4.1 Objetivo

Desarrollar identidad, misión, visión, valores y enfoque sin inventar historia cronológica.

## 4.2 Orden

1. encabezado de página;
2. quiénes somos y razón de ser;
3. misión;
4. visión;
5. valores;
6. enfoque interdisciplinario;
7. a quiénes acompañamos;
8. CTA final.

## 4.3 Quiénes somos

> C.E.I.T. “Mentes Luminosas” es un Centro Educativo Interdisciplinar Terapéutico ubicado en la ciudad de Goya, Corrientes, dedicado al abordaje integral del desarrollo infantojuvenil. Nacimos con la convicción de que cada niño, niña y adolescente tiene una historia única, y que el verdadero aprendizaje ocurre cuando ese potencial individual es reconocido, respetado y estimulado desde la diversidad.

> Nuestro nombre resume nuestra misión: ser un espacio donde la educación y la terapia se entrelazan para iluminar el camino de cada familia que nos confía su proceso.

Imagen:

```text
/images/institucionales/nosotros-identidad.webp
```

## 4.4 Misión

> Brindar un acompañamiento terapéutico y educativo integral a niños, niñas y adolescentes con desafíos en su desarrollo neurocognitivo, trastornos del aprendizaje, dificultades en la comunicación o condiciones del espectro autista, mediante un equipo interdisciplinario que trabaja de manera coordinada, humana y basada en evidencia, sosteniendo también a las familias en cada etapa del proceso.

## 4.5 Visión

> Ser un centro de referencia en Goya y la región en el abordaje interdisciplinario del neurodesarrollo infantojuvenil, reconocido por la calidad profesional de su equipo, la calidez de su atención y su compromiso genuino con la inclusión y el bienestar de cada familia.

## 4.6 Valores

- Diversidad.
- Compromiso.
- Trabajo interdisciplinario.
- Contención familiar.
- Calidez humana.

Imagen junto al bloque de misión, visión y valores:

```text
/images/institucionales/nosotros-valores.webp
```

## 4.7 Enfoque interdisciplinario

> En C.E.I.T. trabajamos bajo un modelo donde las distintas disciplinas dialogan entre sí. Cada niño o niña cuenta con un equipo de profesionales que se comunican y ajustan estrategias en conjunto, evitando abordajes aislados y logrando una mirada integral sobre cada proceso. Las familias son parte activa de este recorrido, recibiendo orientación y acompañamiento constante.

Imagen:

```text
/images/institucionales/nosotros-espacio.webp
```

## 4.8 Sin galería

Las tres imágenes se ubican junto a su contenido. No se agrupan, amplían en modal ni se presentan como carrusel.

---

# 5. Servicios `/servicios`

## 5.1 Objetivo

Mostrar todos los servicios públicos con información completa y acciones generales de contacto.

## 5.2 Orden

1. encabezado;
2. introducción;
3. lista completa;
4. obras sociales/prepagas si están configuradas;
5. CTA final.

## 5.3 Datos

```http
GET /api/v1/public/servicios
```

Solo servicios activos y visibles públicamente.

## 5.4 Componente

`ServiceDetailCard` contiene:

- imagen 4:3;
- icono decorativo;
- nombre;
- descripción completa;
- WhatsApp con mensaje por servicio;
- correo con asunto por servicio, si existe email.

En escritorio alterna imagen/texto. En móvil siempre imagen seguida de contenido.

## 5.5 Sin funcionalidades innecesarias

No hay:

- búsqueda;
- filtro;
- paginación;
- página individual;
- campo destinatarios;
- campo objetivo;
- campo modalidad;
- destacado independiente.

Esos contenidos pueden formar parte de `descripcion`.

## 5.6 Mensajes

WhatsApp:

> Hola, quisiera recibir información sobre el servicio de {nombreServicio} de C.E.I.T. Mentes Luminosas.

Correo:

- Asunto: `Consulta sobre {nombreServicio}`.
- Cuerpo: `Hola, quisiera recibir información sobre el servicio de {nombreServicio}.`

---

# 6. Nuestro equipo `/equipo`

## 6.1 Objetivo

Presentar coordinadora, secretaria y profesionales con igual jerarquía visual.

## 6.2 Datos

```http
GET /api/v1/public/equipo
```

## 6.3 Campos

- fotografía;
- nombre;
- apellido;
- título;
- función pública;
- especialidad;
- biografía completa.

## 6.4 Orden

Se respeta `orden_publico`. La carga administrativa debe asignar primero coordinadora, después secretaria y luego profesionales.

## 6.5 Diseño

Todos usan `TeamMemberCard` con el mismo tamaño, tipografía y estructura. No hay tarjetas destacadas para coordinación o secretaría.

La biografía completa aparece directamente. No hay `Ver más`, filtros, búsqueda, paginación ni páginas individuales.

---

# 7. Contacto `/contacto`

## 7.1 Objetivo

Presentar canales y ubicación sin almacenar consultas.

## 7.2 Orden

1. encabezado;
2. WhatsApp y correo;
3. teléfono, dirección y horarios;
4. mapa;
5. redes configuradas;
6. información institucional breve.

## 7.3 Canales

### WhatsApp

Mensaje:

> Hola, me gustaría recibir información sobre C.E.I.T. Mentes Luminosas.

### Correo

- Asunto: `Consulta desde el sitio web`.
- Cuerpo: `Hola, quisiera recibir información sobre C.E.I.T. Mentes Luminosas.`

### Teléfono

Enlace `tel:` independiente, aunque el número coincida con WhatsApp.

## 7.4 Mapa

- iframe configurable;
- `title` descriptivo;
- lazy loading;
- enlace externo `Cómo llegar`;
- no usa Google Maps JavaScript API;
- no necesita lógica propia de geolocalización.

## 7.5 Datos opcionales

Si correo o red social no están configurados, el bloque no aparece.

---

# 8. Privacidad `/privacidad`

## 8.1 Alcance

Página informativa inicial, revisable por asesoramiento legal antes de producción.

## 8.2 Contenido mínimo

- identificación del responsable institucional;
- diferencia entre área pública y privada;
- ausencia de formulario público;
- ausencia de analítica y cookies de seguimiento;
- apertura de WhatsApp y correo en servicios externos;
- uso de mapa y redes externas;
- finalidad de los datos tratados en el área privada;
- canal de contacto para derechos de acceso, rectificación o actualización;
- fecha de última actualización.

## 8.3 No afirmar sin confirmar

- base legal específica;
- registros oficiales;
- certificaciones;
- plazos de conservación;
- transferencias internacionales;
- dominio legal del responsable.

Esos puntos deben completarse con información real.

---

# 9. Estados comunes

## 9.1 Loading

Skeletons con dimensiones cercanas al contenido final. No se muestra spinner de página completa para solicitudes de secciones.

## 9.2 Empty

El vacío correcto se diferencia del error.

## 9.3 Error

Mensaje no técnico y botón Reintentar.

## 9.4 Imagen faltante

- desarrollo: marco con nombre esperado;
- producción: placeholder neutro.

## 9.5 Offline

Mensaje general:

> Parece que no hay conexión. Revisá tu acceso a internet e intentá nuevamente.

---

# 10. Matriz de rutas

| Ruta | Datos dinámicos | Imagen estática | CTA principal | SEO indexable |
|---|---|---|---|---:|
| `/` | 4 servicios, 4 integrantes | 3 imágenes | WhatsApp | Sí |
| `/nosotros` | No | 3 imágenes | Contacto | Sí |
| `/servicios` | Todos los servicios | No | Contacto | Sí |
| `/equipo` | Todo el equipo | No | Contacto | Sí |
| `/contacto` | No | No | WhatsApp/email | Sí |
| `/privacidad` | No | No | Contacto institucional | Sí |
| `/login` | Autenticación privada | Branding | Ingresar | No recomendado |

---

# 11. Criterios de aceptación de contenido

- La Home contiene exactamente tres fotografías institucionales contextuales.
- Nosotros contiene exactamente tres fotografías institucionales contextuales.
- No existe galería ni carrusel.
- Servicios y equipo se muestran según orden público.
- Obras sociales no generan un flujo exclusivo de consulta.
- Contacto no tiene formulario.
- El correo se oculta si no está confirmado.
- Los nombres ficticios no se publican en producción.
- Cada página tiene un H1 único y contenido comprensible sin depender de iconos.
