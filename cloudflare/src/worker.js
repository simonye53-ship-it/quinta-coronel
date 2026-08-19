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
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    "tengo", "persona", "revisa", "bien", "manuales", "sobre", "informacion",
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

const detectarAlcanceManual = (pregunta) => {
  if (/\b(rescue\s*sheets?|hojas?\s+de\s+rescate)\b/i.test(pregunta)) {
    return "guia-uso-rescue-sheets";
  }
  return null;
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
  const alcanceManual = detectarAlcanceManual(pregunta);

  if (!query) {
    return respuestaJson({error: "La búsqueda necesita al menos un término válido."}, 400);
  }

  const consultaLexical = env.DB.prepare(`
    SELECT c.id, c.manual_id, c.page_start, c.page_end, c.heading, c.content,
           m.slug, m.title, m.institution, m.edition,
           bm25(manual_chunks_fts, 4.0, 1.0, 0.0) AS score
    FROM manual_chunks_fts
    JOIN manual_chunks AS c ON c.id = manual_chunks_fts.rowid
    JOIN manuals AS m ON m.id = c.manual_id
    WHERE manual_chunks_fts MATCH ?1 AND m.status = 'active'
      ${alcanceManual ? "AND c.manual_id = ?2" : ""}
    ORDER BY score
    LIMIT 8
  `).bind(...(alcanceManual ? [query, alcanceManual] : [query]));

  const [embedding, lexical] = await Promise.all([
    env.AI.run("@cf/baai/bge-m3", {text: pregunta, truncate_inputs: true}),
    consultaLexical.all(),
  ]);

  const vectorPregunta = embedding?.data?.[0];
  const coincidencias = Array.isArray(vectorPregunta)
    ? await env.VECTORIZE.query(vectorPregunta, {
        topK: 12,
        returnValues: false,
        returnMetadata: "all",
        ...(alcanceManual ? {filter: {manual_id: alcanceManual}} : {}),
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

  const contieneNumero = /\d/.test(pregunta);
  const pesoLexico = contieneNumero ? 1.5 : 0.85;
  for (const [indice, fila] of (lexical.results || []).entries()) {
    const clave = String(fila.id);
    const existente = combinados.get(clave);
    combinados.set(clave, {
      ...fila,
      score: existente?.score,
      metodo: existente ? "hibrido" : "texto",
      ranking: (existente?.ranking || 0) + pesoLexico / (60 + indice + 1),
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
  for (const lote of dividirEnLotes(ids, 100)) {
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

const registrarActivosVisuales = async (request, env) => {
  if (!autorizadoComoAdministrador(request, env)) {
    return respuestaJson({error: "No autorizado."}, 401);
  }

  const cuerpo = await request.json();
  const activos = Array.isArray(cuerpo.activos) ? cuerpo.activos : [];
  if (!activos.length || activos.length > 50) {
    return respuestaJson({error: "Lote visual inválido."}, 400);
  }

  const limpios = activos.map((activo) => ({
    id: String(activo.id || "").slice(0, 180),
    manualId: String(activo.manualId || "").slice(0, 120),
    pageNumber: Number(activo.pageNumber),
    r2Key: String(activo.r2Key || "").slice(0, 500),
    sha256: String(activo.sha256 || "").slice(0, 64),
    width: Number(activo.width),
    height: Number(activo.height),
    ocrText: String(activo.ocrText || "").slice(0, 20000),
  }));
  if (limpios.some((item) => (
    !item.id || !item.manualId || !item.r2Key || item.sha256.length !== 64 ||
    item.pageNumber < 1 || item.width < 1 || item.height < 1
  ))) {
    return respuestaJson({error: "Metadatos visuales inválidos."}, 400);
  }

  await env.DB.batch(limpios.map((item) => env.DB.prepare(`
    INSERT INTO visual_assets
      (id, manual_id, page_number, r2_key, sha256, width, height, ocr_text)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    ON CONFLICT(id) DO UPDATE SET
      r2_key = excluded.r2_key,
      sha256 = excluded.sha256,
      width = excluded.width,
      height = excluded.height,
      ocr_text = excluded.ocr_text,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    item.id, item.manualId, item.pageNumber, item.r2Key, item.sha256,
    item.width, item.height, item.ocrText,
  )));
  return {registrados: limpios.length};
};

const subirImagenVisual = async (request, env, id) => {
  if (!autorizadoComoAdministrador(request, env)) {
    return respuestaJson({error: "No autorizado."}, 401);
  }

  const url = new URL(request.url);
  const manualId = String(url.searchParams.get("manualId") || "").slice(0, 120);
  const pageNumber = Number(url.searchParams.get("pageNumber"));
  const width = Number(url.searchParams.get("width"));
  const height = Number(url.searchParams.get("height"));
  const sha256 = String(url.searchParams.get("sha256") || "").slice(0, 64);
  if (
    !id || !manualId || pageNumber < 1 || width < 1 || height < 1 ||
    !/^[a-f0-9]{64}$/i.test(sha256) || request.headers.get("Content-Type") !== "image/jpeg"
  ) {
    return respuestaJson({error: "Datos de imagen visual inválidos."}, 400);
  }

  const imagen = await request.arrayBuffer();
  if (!imagen.byteLength || imagen.byteLength > 8 * 1024 * 1024) {
    return respuestaJson({error: "La imagen debe pesar entre 1 byte y 8 MB."}, 400);
  }

  const manual = await env.DB.prepare(
    "SELECT id FROM manuals WHERE id = ?1 AND status = 'active'",
  ).bind(manualId).first();
  if (!manual) return respuestaJson({error: "Manual no encontrado."}, 404);

  const r2Key = `visuales/${manualId}/pagina-${String(pageNumber).padStart(4, "0")}.jpg`;
  await env.BIBLIOTECA.put(r2Key, imagen, {
    httpMetadata: {contentType: "image/jpeg"},
    customMetadata: {manualId, pageNumber: String(pageNumber), sha256},
  });
  await env.DB.prepare(`
    INSERT INTO visual_assets
      (id, manual_id, page_number, r2_key, sha256, width, height)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
    ON CONFLICT(id) DO UPDATE SET
      r2_key = excluded.r2_key,
      sha256 = excluded.sha256,
      width = excluded.width,
      height = excluded.height,
      updated_at = CURRENT_TIMESTAMP
  `).bind(id, manualId, pageNumber, r2Key, sha256, width, height).run();

  return {id, manualId, pageNumber, r2Key, bytes: imagen.byteLength};
};

const obtenerActivoVisual = (env, id) => env.DB.prepare(`
  SELECT v.*, m.title, m.institution, m.edition
  FROM visual_assets AS v
  JOIN manuals AS m ON m.id = v.manual_id
  WHERE v.id = ?1 AND m.status = 'active'
`).bind(id).first();

const analizarActivoVisual = async (env, activo) => {
  if (activo.analysis && activo.status !== "unprocessed") return activo;
  const objeto = await env.BIBLIOTECA.get(activo.r2_key);
  if (!objeto) throw new Error("La imagen visual no existe en R2.");
  const convertido = await env.AI.toMarkdown(
    {
      name: `${activo.id}.jpg`,
      blob: new Blob([await objeto.arrayBuffer()], {type: "image/jpeg"}),
    },
    {conversionOptions: {image: {descriptionLanguage: "es"}}},
  );
  const resultado = Array.isArray(convertido) ? convertido[0] : convertido;
  if (!resultado?.data || resultado.format === "error") {
    throw new Error(resultado?.error || "El análisis visual no produjo contenido.");
  }
  const analisis = String(resultado.data).slice(0, 20000);
  await env.DB.prepare(`
    UPDATE visual_assets
    SET analysis = ?2, analysis_model = 'workers-ai-to-markdown',
        status = 'pending', updated_at = CURRENT_TIMESTAMP
    WHERE id = ?1
  `).bind(activo.id, analisis).run();
  return {...activo, analysis: analisis, analysis_model: "workers-ai-to-markdown", status: "pending"};
};

const serializarActivoVisual = (request, activo, conteos = {}) => ({
  id: activo.id,
  manualId: activo.manual_id,
  manual: activo.title,
  institucion: activo.institution,
  edicion: activo.edition,
  pagina: activo.page_number,
  imagenUrl: `${new URL(request.url).origin}/visuales/${encodeURIComponent(activo.id)}/imagen`,
  ocr: activo.ocr_text,
  analisis: activo.analysis,
  estado: activo.status,
  validaciones: {
    correctas: Number(conteos.correctas || 0),
    parciales: Number(conteos.parciales || 0),
    incorrectas: Number(conteos.incorrectas || 0),
    desconocidas: Number(conteos.desconocidas || 0),
  },
});

const sugerirActivoVisual = async (request, env) => {
  const url = new URL(request.url);
  const pregunta = url.searchParams.get("q")?.trim() || "";
  if (!pregunta) return respuestaJson({error: "Falta la consulta."}, 400);

  const busqueda = await buscarFragmentos(url, env);
  let activo = null;
  if (!(busqueda instanceof Response)) {
    for (const fragmento of busqueda.results || []) {
      activo = await env.DB.prepare(`
        SELECT v.*, m.title, m.institution, m.edition
        FROM visual_assets AS v
        JOIN manuals AS m ON m.id = v.manual_id
        WHERE v.manual_id = ?1 AND v.page_number BETWEEN ?2 AND ?3
        ORDER BY CASE v.status WHEN 'unprocessed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END
        LIMIT 1
      `).bind(fragmento.manual_id, fragmento.page_start, fragmento.page_end).first();
      if (activo) break;
    }
  }
  if (!activo) {
    activo = await env.DB.prepare(`
      SELECT v.*, m.title, m.institution, m.edition
      FROM visual_assets AS v
      JOIN manuals AS m ON m.id = v.manual_id
      WHERE m.status = 'active'
      ORDER BY CASE v.status WHEN 'unprocessed' THEN 0 WHEN 'pending' THEN 1 ELSE 2 END,
               v.updated_at, v.manual_id, v.page_number
      LIMIT 1
    `).first();
  }
  if (!activo) return respuestaJson({visual: null});
  activo = await analizarActivoVisual(env, activo);
  const conteos = await env.DB.prepare(`
    SELECT
      SUM(verdict = 'correct') AS correctas,
      SUM(verdict = 'partial') AS parciales,
      SUM(verdict = 'incorrect') AS incorrectas,
      SUM(verdict = 'unknown') AS desconocidas
    FROM visual_validations WHERE asset_id = ?1
  `).bind(activo.id).first();
  return {visual: serializarActivoVisual(request, activo, conteos)};
};

const guardarValidacionVisual = async (request, env, id) => {
  const activo = await obtenerActivoVisual(env, id);
  if (!activo) return respuestaJson({error: "Activo visual no encontrado."}, 404);
  const cuerpo = await request.json();
  const reviewerId = String(cuerpo.reviewerId || "").trim().slice(0, 100);
  const verdict = String(cuerpo.verdict || "");
  const correction = String(cuerpo.correction || "").trim().slice(0, 3000);
  const questionContext = String(cuerpo.questionContext || "").trim().slice(0, 1000);
  if (reviewerId.length < 8 || !["correct", "partial", "incorrect", "unknown"].includes(verdict)) {
    return respuestaJson({error: "Validación inválida."}, 400);
  }
  if (["partial", "incorrect"].includes(verdict) && correction.length < 5) {
    return respuestaJson({error: "Describe brevemente la corrección."}, 400);
  }

  await env.DB.prepare(`
    INSERT INTO visual_validations
      (asset_id, reviewer_id, verdict, correction, question_context)
    VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(asset_id, reviewer_id) DO UPDATE SET
      verdict = excluded.verdict,
      correction = excluded.correction,
      question_context = excluded.question_context,
      updated_at = CURRENT_TIMESTAMP
  `).bind(id, reviewerId, verdict, correction, questionContext).run();

  const conteos = await env.DB.prepare(`
    SELECT
      SUM(verdict = 'correct') AS correctas,
      SUM(verdict = 'partial') AS parciales,
      SUM(verdict = 'incorrect') AS incorrectas,
      SUM(verdict = 'unknown') AS desconocidas
    FROM visual_validations WHERE asset_id = ?1
  `).bind(id).first();
  const correctas = Number(conteos.correctas || 0);
  const parciales = Number(conteos.parciales || 0);
  const incorrectas = Number(conteos.incorrectas || 0);
  const estado = incorrectas > 0 && (correctas > 0 || parciales > 0)
    ? "conflict"
    : incorrectas >= 2 && correctas === 0 && parciales === 0
      ? "rejected"
      : correctas >= 2 && parciales === 0 && incorrectas === 0
        ? "supported"
        : "pending";
  await env.DB.prepare(`
    UPDATE visual_assets SET status = ?2, updated_at = CURRENT_TIMESTAMP WHERE id = ?1
  `).bind(id, estado).run();
  return {estado, validaciones: conteos};
};

const guardarValidacionRespuesta = async (request, env) => {
  const cuerpo = await request.json();
  const responseId = String(cuerpo.responseId || "").trim().slice(0, 100);
  const reviewerId = String(cuerpo.reviewerId || "").trim().slice(0, 100);
  const interactionId = String(cuerpo.interactionId || "").trim().slice(0, 200) || null;
  const verdict = String(cuerpo.verdict || "");
  const question = String(cuerpo.question || "").trim().slice(0, 3000);
  const answer = String(cuerpo.answer || "").trim().slice(0, 12000);
  const correction = String(cuerpo.correction || "").trim().slice(0, 5000);
  const sources = Array.isArray(cuerpo.sources) ? cuerpo.sources.slice(0, 30) : [];

  if (
    responseId.length < 8 ||
    reviewerId.length < 8 ||
    !question ||
    !answer ||
    !["correct", "partial", "incorrect", "dangerous"].includes(verdict)
  ) {
    return respuestaJson({error: "Evaluación inválida."}, 400);
  }
  if (["partial", "incorrect", "dangerous"].includes(verdict) && correction.length < 5) {
    return respuestaJson({error: "Describe brevemente el problema o la corrección."}, 400);
  }

  const sourcesJson = JSON.stringify(sources.map((source) => ({
    nombre: String(source?.nombre || "").slice(0, 300),
    paginas: Array.isArray(source?.paginas)
      ? source.paginas.map(Number).filter(Number.isFinite).slice(0, 100)
      : [],
  })));

  await env.DB.prepare(`
    INSERT INTO response_validations
      (response_id, reviewer_id, interaction_id, verdict, question, answer, sources_json, correction)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
    ON CONFLICT(response_id, reviewer_id) DO UPDATE SET
      interaction_id = excluded.interaction_id,
      verdict = excluded.verdict,
      question = excluded.question,
      answer = excluded.answer,
      sources_json = excluded.sources_json,
      correction = excluded.correction,
      updated_at = CURRENT_TIMESTAMP
  `).bind(
    responseId,
    reviewerId,
    interactionId,
    verdict,
    question,
    answer,
    sourcesJson,
    correction,
  ).run();

  return {guardada: true};
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

      if (request.method === "POST" && url.pathname === "/admin/visuales") {
        return respuestaJson(await registrarActivosVisuales(request, env));
      }

      const cargaVisual = url.pathname.match(/^\/admin\/visuales\/([^/]+)\/imagen$/);
      if (request.method === "POST" && cargaVisual) {
        return respuestaJson(
          await subirImagenVisual(request, env, decodeURIComponent(cargaVisual[1])),
        );
      }

      const validacionVisual = url.pathname.match(/^\/visuales\/([^/]+)\/validaciones$/);
      if (request.method === "POST" && validacionVisual) {
        return respuestaJson(
          await guardarValidacionVisual(request, env, decodeURIComponent(validacionVisual[1])),
          200,
          cors,
        );
      }

      if (request.method === "POST" && url.pathname === "/validaciones/respuestas") {
        return respuestaJson(await guardarValidacionRespuesta(request, env), 200, cors);
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

      if (url.pathname === "/visuales/sugerir") {
        return respuestaJson(await sugerirActivoVisual(request, env), 200, cors);
      }

      const imagenVisual = url.pathname.match(/^\/visuales\/([^/]+)\/imagen$/);
      if (imagenVisual) {
        const activo = await obtenerActivoVisual(env, decodeURIComponent(imagenVisual[1]));
        if (!activo) return respuestaJson({error: "Activo visual no encontrado."}, 404, cors);
        const objeto = await env.BIBLIOTECA.get(activo.r2_key);
        if (!objeto) return respuestaJson({error: "Imagen no encontrada."}, 404, cors);
        const headers = new Headers(cors);
        objeto.writeHttpMetadata(headers);
        headers.set("ETag", objeto.httpEtag);
        headers.set("Cache-Control", "public, max-age=86400, immutable");
        return new Response(objeto.body, {headers});
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
