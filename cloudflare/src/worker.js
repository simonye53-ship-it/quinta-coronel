const JSON_HEADERS = {"Content-Type": "application/json; charset=utf-8"};

const respuestaJson = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {...JSON_HEADERS, ...headers},
  });

const origenPermitido = (request, env) => {
  const origin = request.headers.get("Origin");
  if (!origin) return null;

  const permitidos = String(env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((valor) => valor.trim())
    .filter(Boolean);

  return permitidos.includes(origin) ? origin : null;
};

const encabezadosCors = (request, env) => {
  const origin = origenPermitido(request, env);
  return origin
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : {};
};

const consultaFts = (texto) => {
  const terminos = texto
    .normalize("NFKC")
    .match(/[\p{L}\p{N}]{2,}/gu)
    ?.slice(0, 12);

  if (!terminos?.length) return null;
  return terminos.map((termino) => `"${termino.replaceAll('"', '""')}"`).join(" OR ");
};

const listarManuales = async (request, env) => {
  const {results = []} = await env.DB.prepare(`
    SELECT id, slug, cms_key, title, institution, edition, description, bytes, pages,
           sha256, published_at, updated_at, cover_r2_key
    FROM manuals
    WHERE status = 'active'
    ORDER BY title COLLATE NOCASE
  `).all();

  const base = new URL(request.url).origin;
  return results.map(({cover_r2_key: coverKey, ...manual}) => ({
    ...manual,
    file_url: `${base}/manuales/${encodeURIComponent(manual.slug)}/archivo`,
    cover_url: coverKey
      ? `${base}/manuales/${encodeURIComponent(manual.slug)}/portada`
      : null,
  }));
};

const obtenerManual = (env, slug) =>
  env.DB.prepare(`
    SELECT id, slug, title, institution, edition, description, r2_key,
           cover_r2_key, sha256, bytes, pages, published_at, updated_at
    FROM manuals
    WHERE slug = ?1 AND status = 'active'
  `).bind(slug).first();

const servirObjeto = async (request, env, slug, tipo) => {
  const manual = await obtenerManual(env, slug);
  if (!manual) return respuestaJson({error: "Manual no encontrado."}, 404);

  const key = tipo === "portada" ? manual.cover_r2_key : manual.r2_key;
  if (!key) return respuestaJson({error: "Recurso no disponible."}, 404);

  const objeto = await env.BIBLIOTECA.get(key, {range: request.headers});
  if (!objeto) return respuestaJson({error: "Archivo no encontrado en R2."}, 404);

  const headers = new Headers();
  objeto.writeHttpMetadata(headers);
  headers.set("ETag", objeto.httpEtag);
  headers.set("Cache-Control", "public, max-age=3600, must-revalidate");
  headers.set("Accept-Ranges", "bytes");

  if (objeto.range) {
    const offset = objeto.range.offset ?? 0;
    const length = objeto.range.length ?? objeto.size;
    headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${objeto.size}`);
    headers.set("Content-Length", String(length));
  }

  return new Response(objeto.body, {
    status: objeto.range ? 206 : 200,
    headers,
  });
};

const buscarFragmentos = async (url, env) => {
  const pregunta = url.searchParams.get("q")?.trim() || "";
  const query = consultaFts(pregunta);

  if (!query) {
    return respuestaJson({error: "La búsqueda necesita al menos un término válido."}, 400);
  }

  const {results = []} = await env.DB.prepare(`
    SELECT c.id, c.manual_id, c.page_start, c.page_end, c.heading, c.content,
           m.slug, m.title, m.institution, m.edition,
           bm25(manual_chunks_fts, 4.0, 1.0, 0.0) AS score
    FROM manual_chunks_fts
    JOIN manual_chunks AS c ON c.id = manual_chunks_fts.rowid
    JOIN manuals AS m ON m.id = c.manual_id
    WHERE manual_chunks_fts MATCH ?1 AND m.status = 'active'
    ORDER BY score
    LIMIT 8
  `).bind(query).all();

  return {query: pregunta, results};
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = encabezadosCors(request, env);

    if (request.method === "OPTIONS") {
      if (!origenPermitido(request, env)) return new Response(null, {status: 403});
      return new Response(null, {status: 204, headers: cors});
    }

    if (request.method !== "GET") {
      return respuestaJson({error: "Método no permitido."}, 405, cors);
    }

    try {
      if (url.pathname === "/salud") {
        return respuestaJson({status: "ok", service: "veronica-biblioteca"}, 200, cors);
      }

      if (url.pathname === "/manuales") {
        return respuestaJson({manuales: await listarManuales(request, env)}, 200, cors);
      }

      if (url.pathname === "/buscar") {
        return respuestaJson(await buscarFragmentos(url, env), 200, cors);
      }

      const recurso = url.pathname.match(/^\/manuales\/([^/]+)\/(archivo|portada)$/);
      if (recurso) {
        const response = await servirObjeto(request, env, decodeURIComponent(recurso[1]), recurso[2]);
        for (const [key, value] of Object.entries(cors)) response.headers.set(key, value);
        return response;
      }

      return respuestaJson({error: "Ruta no encontrada."}, 404, cors);
    } catch (error) {
      console.error("Error en biblioteca:", error);
      return respuestaJson({error: "No fue posible consultar la biblioteca."}, 500, cors);
    }
  },
};
