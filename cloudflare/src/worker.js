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
  const encontrados = texto
    .normalize("NFKC")
    .match(/[\p{L}\p{N}]{2,}/gu)
    ?.slice(0, 12);

  if (!encontrados?.length) return null;
  const numericos = encontrados.filter((termino) => /^\d+$/.test(termino));
  const stopwords = new Set([
    "que", "como", "cual", "cuales", "para", "por", "una", "uno", "unos",
    "unas", "del", "las", "los", "con", "sin", "indica", "dice", "manual",
  ]);
  const terminos = numericos.length
    ? numericos
    : encontrados.filter((termino) => !stopwords.has(termino.toLocaleLowerCase("es")));
  if (!terminos.length) return null;
  return terminos.map((termino) => `"${termino.replaceAll('"', '""')}"`).join(" OR ");
};

const autorizadoComoAdministrador = (request, env) => {
  const esperado = String(env.ADMIN_TOKEN || "");
  const recibido = request.headers.get("Authorization") || "";
  return esperado.length >= 32 && recibido === `Bearer ${esperado}`;
};

const dividirEnLotes = (valores, tamano) => {
  const lotes = [];
  for (let indice = 0; indice < valores.length; indice += tamano) {
    lotes.push(valores.slice(indice, indice + tamano));
  }
  return lotes;
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

const obtenerFragmentosPorIds = async (env, ids) => {
  if (!ids.length) return [];
  const marcadores = ids.map(() => "?").join(",");
  const {results = []} = await env.DB.prepare(`
    SELECT c.id, c.manual_id, c.page_start, c.page_end, c.heading, c.content,
           m.slug, m.title, m.institution, m.edition
    FROM manual_chunks AS c
    JOIN manuals AS m ON m.id = c.manual_id
    WHERE c.id IN (${marcadores}) AND m.status = 'active'
  `).bind(...ids).all();
  return results;
};

const buscarFragmentos = async (url, env) => {
  const pregunta = url.searchParams.get("q")?.trim() || "";
  const query = consultaFts(pregunta);

  if (!query) {
    return respuestaJson({error: "La búsqueda necesita al menos un término válido."}, 400);
  }

  const [embedding, lexical] = await Promise.all([
    env.AI.run("@cf/baai/bge-m3", {text: pregunta, truncate_inputs: true}),
    env.DB.prepare(`
    SELECT c.id, c.manual_id, c.page_start, c.page_end, c.heading, c.content,
           m.slug, m.title, m.institution, m.edition,
           bm25(manual_chunks_fts, 4.0, 1.0, 0.0) AS score
    FROM manual_chunks_fts
    JOIN manual_chunks AS c ON c.id = manual_chunks_fts.rowid
    JOIN manuals AS m ON m.id = c.manual_id
    WHERE manual_chunks_fts MATCH ?1 AND m.status = 'active'
    ORDER BY score
    LIMIT 8
  `).bind(query).all(),
  ]);

  const vectorPregunta = embedding?.data?.[0];
  const coincidencias = Array.isArray(vectorPregunta)
    ? await env.VECTORIZE.query(vectorPregunta, {
        topK: 12,
        returnValues: false,
        returnMetadata: "all",
      })
    : {matches: []};

  const semanticos = (coincidencias.matches || []).filter((item) => item.score >= 0.3);
  const filasSemanticas = await obtenerFragmentosPorIds(
    env,
    semanticos.map((item) => Number(item.id)).filter(Number.isFinite),
  );
  const porId = new Map(filasSemanticas.map((fila) => [String(fila.id), fila]));
  const combinados = new Map();

  for (const [indice, coincidencia] of semanticos.entries()) {
    const fila = porId.get(String(coincidencia.id));
    if (!fila) continue;
    combinados.set(String(fila.id), {
      ...fila,
      score: coincidencia.score,
      metodo: "semantico",
      ranking: 1 / (60 + indice + 1),
    });
  }

  for (const [indice, fila] of (lexical.results || []).entries()) {
    const clave = String(fila.id);
    const existente = combinados.get(clave);
    combinados.set(clave, {
      ...fila,
      score: existente?.score,
      metodo: existente ? "hibrido" : "texto",
      ranking: (existente?.ranking || 0) + 1.5 / (60 + indice + 1),
    });
  }

  return {
    query: pregunta,
    results: Array.from(combinados.values())
      .sort((a, b) => b.ranking - a.ranking)
      .slice(0, 8)
      .map((fila) => {
        const resultado = {...fila};
        delete resultado.ranking;
        return resultado;
      }),
  };
};

const reiniciarIndiceManual = async (request, env, manualId) => {
  if (!autorizadoComoAdministrador(request, env)) {
    return respuestaJson({error: "No autorizado."}, 401);
  }

  const manual = await env.DB.prepare("SELECT id FROM manuals WHERE id = ?1")
    .bind(manualId)
    .first();
  if (!manual) return respuestaJson({error: "Manual no encontrado."}, 404);

  const {results = []} = await env.DB.prepare(
    "SELECT id FROM manual_chunks WHERE manual_id = ?1",
  ).bind(manualId).all();
  const ids = results.map((fila) => String(fila.id));
  for (const lote of dividirEnLotes(ids, 1000)) {
    if (lote.length) await env.VECTORIZE.deleteByIds(lote);
  }
  await env.DB.prepare("DELETE FROM manual_chunks WHERE manual_id = ?1").bind(manualId).run();
  return {manualId, eliminados: ids.length};
};

const indexarFragmentos = async (request, env) => {
  if (!autorizadoComoAdministrador(request, env)) {
    return respuestaJson({error: "No autorizado."}, 401);
  }

  const cuerpo = await request.json();
  const manualId = typeof cuerpo.manualId === "string" ? cuerpo.manualId : "";
  const fragmentos = Array.isArray(cuerpo.fragmentos) ? cuerpo.fragmentos : [];
  if (!manualId || !fragmentos.length || fragmentos.length > 50) {
    return respuestaJson({error: "Lote de indexación inválido."}, 400);
  }

  const manual = await env.DB.prepare(
    "SELECT id FROM manuals WHERE id = ?1 AND status = 'active'",
  ).bind(manualId).first();
  if (!manual) return respuestaJson({error: "Manual activo no encontrado."}, 404);

  const limpios = fragmentos.map((fragmento) => ({
    pageStart: Number(fragmento.pageStart),
    pageEnd: Number(fragmento.pageEnd),
    heading: String(fragmento.heading || "").slice(0, 300),
    content: String(fragmento.content || "").trim().slice(0, 12000),
  }));
  if (limpios.some((item) => !item.content || item.pageStart < 1 || item.pageEnd < item.pageStart)) {
    return respuestaJson({error: "Fragmentos inválidos."}, 400);
  }

  const inserciones = limpios.map((item) =>
    env.DB.prepare(`
      INSERT INTO manual_chunks (manual_id, page_start, page_end, heading, content)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `).bind(manualId, item.pageStart, item.pageEnd, item.heading, item.content),
  );
  const resultados = await env.DB.batch(inserciones);
  const ids = resultados.map((resultado) => String(resultado.meta.last_row_id));
  const embeddings = await env.AI.run("@cf/baai/bge-m3", {
    text: limpios.map((item) => item.content),
    truncate_inputs: true,
  });
  if (!Array.isArray(embeddings?.data) || embeddings.data.length !== limpios.length) {
    throw new Error("Workers AI no devolvió todos los embeddings solicitados.");
  }

  await env.VECTORIZE.upsert(limpios.map((item, indice) => ({
    id: ids[indice],
    values: embeddings.data[indice],
    metadata: {
      manual_id: manualId,
      page_start: item.pageStart,
      page_end: item.pageEnd,
    },
  })));

  return {manualId, indexados: limpios.length};
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = encabezadosCors(request, env);

    if (request.method === "OPTIONS") {
      if (!origenPermitido(request, env)) return new Response(null, {status: 403});
      return new Response(null, {status: 204, headers: cors});
    }

    try {
      const reinicio = url.pathname.match(/^\/admin\/manuales\/([^/]+)\/reiniciar$/);
      if (request.method === "POST" && reinicio) {
        return respuestaJson(
          await reiniciarIndiceManual(request, env, decodeURIComponent(reinicio[1])),
        );
      }

      if (request.method === "POST" && url.pathname === "/admin/indexar") {
        return respuestaJson(await indexarFragmentos(request, env));
      }

      if (request.method !== "GET") {
        return respuestaJson({error: "Método no permitido."}, 405, cors);
      }

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
