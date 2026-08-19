# Biblioteca Cloudflare

Este servicio mantiene separados el almacenamiento documental y el modelo de IA:

- R2 conserva los PDF y portadas originales.
- D1 conserva el catálogo y los fragmentos de texto por página.
- FTS5 permite búsquedas textuales sin depender de Gemini File Search.
- Vectorize y Workers AI aportan búsqueda semántica multilingüe sin almacenar los PDF en Gemini.
- El frontend consume solamente las rutas públicas de lectura.

No existe una ruta pública de carga. Los documentos se incorporarán mediante una herramienta administrativa autenticada para evitar modificaciones anónimas de la biblioteca.

## Preparación inicial

Desde la raíz del proyecto:

```powershell
npx wrangler login
npx wrangler r2 bucket create veronica-biblioteca
npx wrangler d1 create veronica-biblioteca
```

El último comando entrega un `database_id`. Debe reemplazarse el valor temporal de `database_id` en `cloudflare/wrangler.toml`.

Después se crea la estructura remota:

```powershell
npm run cf:migrate:remote
```

El servicio se publica con:

```powershell
npm run cf:deploy
```

El Worker no contiene dependencias importadas, por lo que el despliegue omite el empaquetado interno de Wrangler.

El índice semántico usa el binding `VECTORIZE` sobre `veronica-manuales` y el binding `AI`
con `@cf/baai/bge-m3`. Las rutas administrativas de indexación requieren el secreto
`ADMIN_TOKEN`; nunca debe almacenarse en Git ni exponerse al frontend.

En `ALLOWED_ORIGINS` deben incluirse el localhost de desarrollo y el dominio definitivo de Vercel, separados por comas.

## Desarrollo local

```powershell
npm run cf:migrate:local
npm run cf:dev
```

El frontend utiliza `VITE_BIBLIOTECA_API_URL`. Si la variable no existe o el servicio no está disponible, mantiene temporalmente la lista local de manuales actual.

## Rutas públicas

- `GET /salud`: comprueba el estado del servicio.
- `GET /manuales`: devuelve manuales activos del catálogo.
- `GET /manuales/:slug/archivo`: entrega el PDF desde R2 y admite solicitudes por rango.
- `GET /manuales/:slug/portada`: entrega la portada cuando existe.
- `GET /buscar?q=...`: recupera hasta ocho fragmentos textuales con documento y páginas.

La búsqueda combina similitud semántica de Vectorize con coincidencias textuales FTS5 de D1.
Gemini no consulta ni almacena los PDF: el backend de Vercel le entrega únicamente los
fragmentos recuperados para redactar una respuesta.

## Seguridad y publicación

- El bucket no necesita ser público; los archivos se entregan a través del Worker.
- No deben almacenarse tokens de Cloudflare en el repositorio.
- Una versión nueva de un manual debe usar una clave R2 distinta; no se sobrescriben ediciones históricas.
- Solo los registros con estado `active` aparecen públicamente y participan en búsquedas.
