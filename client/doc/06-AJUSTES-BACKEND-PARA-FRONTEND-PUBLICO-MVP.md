# Ajustes del backend requeridos por el frontend público — MVP

**Proyecto:** C.E.I.T. “Mentes Luminosas”  
**Versión:** 1.0.0  
**Estado:** cambios obligatorios antes de integrar el frontend público real

---

## 1. Motivo

La documentación backend consolidada antecede varias decisiones posteriores del frontend público. Este documento identifica las diferencias para evitar que el equipo implemente contratos incompatibles.

No reemplaza la documentación backend completa. Define una lista de cambios que debe incorporarse mediante nuevas versiones o migraciones.

---

## 2. Inconsistencias detectadas

### 2.1 Servicios

La versión anterior posee `nombre`, `descripcion`, `activo` y `orden_publico`, pero no separa publicación pública ni incluye imagen.

Decisión nueva:

- `imagen_url`;
- `visible_publicamente`;
- descripción obligatoria para la presentación pública.

### 2.2 Equipo

La versión anterior posee `titulo`, `especialidad`, `bio`, `foto_url`, `visible_publicamente` y `orden_publico`, pero no posee `funcion_publica`.

Decisión nueva:

- `funcion_publica` como texto independiente del rol técnico.

### 2.3 Imágenes

La arquitectura anterior indicaba que la carga desde el panel estaba fuera del MVP o que `foto_url` se administraba manualmente.

Decisión nueva:

- carga local desde panel privado;
- Multer en rutas específicas;
- rutas almacenadas en PostgreSQL;
- archivos físicos en `api/uploads`;
- solo administrador gestiona imágenes.

### 2.4 Endpoint público

El contrato ya contiene `/public/equipo` y `/public/servicios`, pero debe precisar:

- `limit`;
- `visible_publicamente` para servicios;
- `funcionPublica`;
- `imagenUrl`;
- orden estable;
- envelope de salida.

---

## 3. Migración de servicios

### 3.1 Campos

```sql
ALTER TABLE servicios
  ADD COLUMN imagen_url TEXT NULL,
  ADD COLUMN visible_publicamente BOOLEAN NOT NULL DEFAULT false;
```

Se recomienda `DEFAULT false` para evitar publicar accidentalmente registros existentes.

### 3.2 Descripción

El objetivo final es:

```text
descripcion TEXT NOT NULL
```

Si existen registros nulos:

1. agregar o completar descripciones;
2. validar que no quedan nulos;
3. aplicar `NOT NULL`.

### 3.3 Orden

```sql
CREATE INDEX servicios_publicos_idx
ON servicios (orden_publico, nombre)
WHERE activo = true AND visible_publicamente = true;
```

### 3.4 Regla pública

```text
activo = true
AND visible_publicamente = true
```

`activo` controla operación interna. `visible_publicamente` controla web.

---

## 4. Migración de usuarios

```sql
ALTER TABLE usuarios
  ADD COLUMN funcion_publica VARCHAR(160) NULL;
```

`foto_url` continúa como `TEXT NULL`, pero su significado cambia de URL manual a ruta de archivo gestionada por backend.

### 4.1 Regla

Un usuario aparece en público si:

- activo;
- visible públicamente;
- rol coordinación, secretaría o profesional;
- no administrador.

### 4.2 Orden

El administrador asigna `orden_publico` para conseguir:

1. coordinadora;
2. secretaria;
3. profesionales.

El frontend no infiere orden por rol.

---

## 5. Modelos Sequelize

### Servicio

```js
imagenUrl: {
  type: DataTypes.TEXT,
  allowNull: true,
  field: 'imagen_url',
},
visiblePublicamente: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
  field: 'visible_publicamente',
},
```

### Usuario

```js
funcionPublica: {
  type: DataTypes.STRING(160),
  allowNull: true,
  field: 'funcion_publica',
},
```

---

## 6. API pública actualizada

### 6.1 Equipo

```http
GET /api/v1/public/equipo?limit=4
```

Query:

```text
limit: opcional, entero 1–50
```

Salida:

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "...",
      "apellido": "...",
      "titulo": "...",
      "especialidad": "...",
      "funcionPublica": "...",
      "bio": "...",
      "fotoUrl": "/uploads/usuarios/uuid.webp",
      "ordenPublico": 1
    }
  ],
  "meta": {
    "count": 1
  }
}
```

### 6.2 Servicios

```http
GET /api/v1/public/servicios?limit=4
```

Salida:

```json
{
  "data": [
    {
      "id": "uuid",
      "nombre": "...",
      "descripcion": "...",
      "imagenUrl": "/uploads/servicios/uuid.webp",
      "ordenPublico": 1
    }
  ],
  "meta": {
    "count": 1
  }
}
```

### 6.3 Proyección explícita

No utilizar `attributes: { exclude: [...] }` como única protección. Definir lista positiva de campos públicos.

---

## 7. Endpoints administrativos de imágenes

Recomendados:

```http
PUT    /api/v1/usuarios/:id/foto
DELETE /api/v1/usuarios/:id/foto
PUT    /api/v1/servicios/:id/imagen
DELETE /api/v1/servicios/:id/imagen
```

Permiso: solo administrador.

### 7.1 `PUT`

- content type `multipart/form-data`;
- campo `imagen`;
- máximo una;
- reemplaza la existente;
- retorna nueva ruta.

### 7.2 `DELETE`

- elimina archivo si existe;
- coloca ruta en `NULL`;
- operación idempotente razonable: si ya no existe, puede responder éxito con ruta nula.

---

## 8. Estructura de almacenamiento

```text
api/
├── uploads/
│   ├── usuarios/
│   │   └── .gitkeep
│   └── servicios/
│       └── .gitkeep
└── src/
```

### 8.1 `.gitignore`

```gitignore
uploads/*
!uploads/usuarios/
!uploads/servicios/
!uploads/usuarios/.gitkeep
!uploads/servicios/.gitkeep
```

### 8.2 Publicación

```js
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), 'uploads'), {
    fallthrough: false,
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0,
  }),
);
```

La configuración final de cache debe probarse con reemplazo por nombres únicos.

---

## 9. Servicio de almacenamiento

Aunque la implementación sea local, la lógica debe estar centralizada:

```text
src/shared/files/
├── file-storage.service.js
├── local-storage.service.js
├── image-upload.middleware.js
└── image-validation.js
```

Interfaz conceptual:

```js
saveImage({ buffer, category, extension })
replaceImage({ previousPath, buffer, category, extension })
deleteImage(path)
```

No se necesita una jerarquía compleja de clases. Un módulo con funciones es suficiente.

---

## 10. Multer y validación

- Multer solo en cuatro rutas de imagen;
- almacenamiento en memoria o directorio temporal;
- tamaño máximo 5 MB;
- JPEG, PNG y WebP;
- validar MIME y firma real cuando sea posible;
- generar UUID;
- normalizar extensión;
- impedir path traversal;
- borrar archivo nuevo si falla la actualización DB;
- borrar archivo anterior solo después de confirmar nueva ruta;
- registrar auditoría sin incluir binario ni ruta absoluta.

---

## 11. Transacciones y consistencia

El filesystem no participa en transacciones PostgreSQL. Se aplica compensación:

### Reemplazo

1. validar;
2. guardar archivo nuevo;
3. actualizar DB;
4. si DB falla, borrar nuevo;
5. si DB confirma, intentar borrar anterior;
6. si el borrado anterior falla, registrar warning para limpieza posterior.

### Eliminación

1. obtener ruta actual;
2. actualizar DB a nulo;
3. eliminar archivo;
4. si el archivo no existe, no revertir DB;
5. registrar warning si falla una eliminación no crítica.

---

## 12. Auditoría

Eventos recomendados:

```text
USUARIO_FOTO_ACTUALIZADA
USUARIO_FOTO_ELIMINADA
SERVICIO_IMAGEN_ACTUALIZADA
SERVICIO_IMAGEN_ELIMINADA
SERVICIO_PUBLICACION_ACTUALIZADA
USUARIO_PUBLICACION_ACTUALIZADA
```

Metadata segura:

- recurso;
- id;
- tenía imagen antes/sí-no;
- visible anterior/nuevo;
- nunca nombre de archivo original, ruta absoluta ni binario.

---

## 13. Seguridad pública

- no listar directorio `uploads`;
- servir solo archivos;
- no aceptar uploads anónimos;
- no reutilizar nombres enviados por cliente;
- no guardar archivos ejecutables;
- cabecera `X-Content-Type-Options: nosniff`;
- CORS solo para API; las imágenes pueden servirse normalmente desde origen controlado;
- no exponer ruta física del servidor.

---

## 14. Pruebas backend requeridas

### Base de datos

- default de visibilidad false;
- índice público;
- función pública nullable;
- descripción requerida después de backfill.

### API pública

- filtros de activo/visible;
- exclusión del administrador;
- límite válido e inválido;
- orden;
- payload seguro;
- rutas de imagen.

### Upload

- administrador válido;
- rol no autorizado 403;
- archivo demasiado grande 413 o 422 según convención;
- tipo inválido 422;
- reemplazo;
- eliminación;
- compensación ante fallo DB;
- no path traversal;
- archivo accesible desde `/uploads`.

---

## 15. Documentos backend a actualizar

- Arquitectura: retirar “carga de imágenes fuera del MVP”.
- Modelo de datos: agregar campos e índices.
- Contrato API: documentar `limit`, payloads y endpoints de imagen.
- Matriz de permisos: solo administrador gestiona imágenes/publicación.
- Plan de implementación: agregar migración, almacenamiento y tests.

Debe publicarse una nueva versión backend o un addendum explícito antes de codificar integración final.

---

## 16. Producción pendiente

GitHub es el primer destino del código. El proveedor final no está decidido.

Antes de producción debe verificarse:

- almacenamiento persistente;
- permisos de escritura;
- límites de disco;
- backup de DB y uploads;
- restauración conjunta;
- URLs públicas;
- HTTPS;
- migración futura a storage externo si el proveedor no ofrece persistencia.
