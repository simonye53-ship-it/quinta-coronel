# Arquitectura del editor de noticias

## Objetivo

Ofrecer una experiencia similar a WordPress para redactar noticias sin mostrar controles editoriales dentro de la sección pública y sin exponer credenciales de escritura en el navegador.

## Acceso público y acceso interno

- La ruta pública `/noticias` solo muestra contenido publicado.
- El pie de página contiene un enlace discreto denominado `Acceso interno`.
- Mientras se construye el panel propio, ese enlace abre el editor de noticias alojado en Sanity.
- La dirección del editor no constituye una medida de seguridad. La protección siempre depende de una cuenta autorizada.

## Estructura objetivo

### 1. Entrada editorial

- Ruta no incluida en el menú principal: `/editor`.
- Formulario de inicio de sesión con correo y contraseña.
- Sesión almacenada en una cookie `HttpOnly`, `Secure` y `SameSite=Lax`.
- La aplicación nunca guarda contraseñas ni tokens de Sanity en el navegador.

### 2. Roles

- **Administrador:** crea, desactiva y cambia el rol de cuentas; publica, edita y elimina noticias.
- **Editor:** crea borradores, edita noticias y las envía a publicación.
- Como primera versión, solo el Administrador publica. Esto reduce cambios accidentales.

### 3. Panel tipo WordPress

- Escritorio con noticias recientes y estado de cada entrada.
- Listado de noticias con búsqueda y filtros por borrador/publicada.
- Botón `Nueva noticia`.
- Editor con título, portada, contenido enriquecido, categoría, fecha y vista previa.
- Biblioteca de imágenes para reutilizar fotografías existentes.
- Gestión de usuarios visible únicamente para Administradores.

### 4. Servicios

- **Frontend:** página `/editor` dentro del sitio React desplegado en Vercel.
- **Autenticación y sesiones:** Cloudflare Worker.
- **Usuarios y sesiones:** Cloudflare D1.
- **Imágenes originales:** Cloudflare R2.
- **Noticias publicadas:** Sanity, para conservar las consultas y páginas actuales.
- **Llave de escritura de Sanity:** secreto cifrado del Worker, nunca variable pública de Vite.

### 5. Flujo de publicación

1. El usuario inicia sesión en `/editor`.
2. El Worker valida la sesión y el rol.
3. El editor guarda un borrador.
4. Un Administrador revisa y publica.
5. El Worker escribe el documento en Sanity.
6. La página pública recibe la noticia mediante las consultas actuales.

## Seguridad mínima obligatoria

- Contraseñas almacenadas únicamente como hashes resistentes.
- Limitación de intentos de inicio de sesión.
- Expiración y revocación de sesiones.
- Validación de tipo y tamaño para imágenes.
- Registro de creación, edición, publicación y eliminación.
- Protección CSRF en operaciones editoriales.
- Copias de seguridad de D1 y conservación de versiones en Sanity.

## Implementación por etapas

1. Interfaz pública corregida y acceso interno discreto.
2. Tablas de usuarios, sesiones y auditoría en D1.
3. Inicio de sesión y creación del primer Administrador.
4. Listado y formulario de noticias.
5. Carga de imágenes en R2 y publicación segura en Sanity.
6. Gestión de cuentas y revisión editorial.
