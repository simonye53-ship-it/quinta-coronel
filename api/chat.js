import {GoogleGenAI} from "@google/genai";
import {createHash} from "node:crypto";

const BIBLIOTECA_API_URL =
  process.env.BIBLIOTECA_API_URL ||
  "https://veronica-biblioteca.veronica-firerescue-simon.workers.dev";

const INSTRUCCIONES = `Eres Veronica FireRescue, un asistente técnico de emergencias para Bomberos y primeros respondedores.
Responde en español usando exclusivamente la evidencia documental incluida en la consulta actual.
No uses conocimiento general, memoria del modelo, información pública, inferencias externas ni datos de conversaciones anteriores como respaldo factual.
Cada afirmación factual debe estar sustentada por al menos una fuente documental recuperada. No inventes procedimientos, distancias, teléfonos, números ONU, guías, concentraciones, valores técnicos ni recomendaciones operativas.
Si la biblioteca no contiene información suficiente para contestar, responde solamente: "No encontré esta información en los manuales disponibles de la biblioteca técnica." No agregues la respuesta que conozcas por otras fuentes ni expliques cuál podría ser.
Si la pregunta es ambigua, solicita los antecedentes necesarios antes de responder de forma específica.
Mantén el contexto de la conversación. Distingue las diferencias entre fuentes cuando existan.
Organiza la respuesta en Markdown claro y práctico: usa títulos breves para separar secciones, párrafos cortos y listas con viñetas cuando enumeres pasos, riesgos o antecedentes. Usa negrita solo para destacar conceptos importantes. No incluyas una sección de fuentes ni menciones procesos internos de recuperación documental, porque las fuentes se presentan por separado en la interfaz.
No sustituyes el mando, los procedimientos locales ni la evaluación del personal competente en la escena.`;

const RESPUESTA_SIN_RESPALDO =
  "No encontré esta información en los manuales disponibles de la biblioteca técnica.";

const VENTANA_LIMITE_MS = 10 * 60 * 1000;
const MAX_CONSULTAS_POR_VENTANA = 5;
const registroConsultas = globalThis.__quintaRegistroConsultas || new Map();

if (!globalThis.__quintaRegistroConsultas) {
  globalThis.__quintaRegistroConsultas = registroConsultas;
}

const revisarLimiteVisitante = (request) => {
  const forwardedFor = request.headers["x-forwarded-for"];
  const identificador = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim() || request.socket?.remoteAddress || "desconocido";
  const claveVisitante = createHash("sha256").update(identificador).digest("hex");
  const ahora = Date.now();

  if (registroConsultas.size > 5000) {
    for (const [clave, registro] of registroConsultas) {
      if (ahora >= registro.reiniciaEn) registroConsultas.delete(clave);
    }
  }

  const anterior = registroConsultas.get(claveVisitante);

  if (!anterior || ahora >= anterior.reiniciaEn) {
    const nuevo = {consultas: 1, reiniciaEn: ahora + VENTANA_LIMITE_MS};
    registroConsultas.set(claveVisitante, nuevo);
    return {permitida: true, restantes: MAX_CONSULTAS_POR_VENTANA - 1};
  }

  if (anterior.consultas >= MAX_CONSULTAS_POR_VENTANA) {
    return {
      permitida: false,
      restantes: 0,
      retryAfter: Math.max(1, Math.ceil((anterior.reiniciaEn - ahora) / 1000)),
    };
  }

  anterior.consultas += 1;
  return {
    permitida: true,
    restantes: MAX_CONSULTAS_POR_VENTANA - anterior.consultas,
  };
};

const construirFuentes = (fragmentos) => {
  const agrupadas = new Map();
  for (const fragmento of fragmentos) {
    if (!agrupadas.has(fragmento.title)) agrupadas.set(fragmento.title, new Set());
    for (let pagina = fragmento.page_start; pagina <= fragmento.page_end; pagina += 1) {
      agrupadas.get(fragmento.title).add(pagina);
    }
  }
  return Array.from(agrupadas, ([nombre, paginas]) => ({
    nombre,
    paginas: Array.from(paginas).sort((a, b) => a - b),
  }));
};

const obtenerRetryAfter = (mensaje) => {
  const coincidencia = mensaje.match(/retry(?:\s+in)?\s+([\d.]+)s/i);
  return coincidencia ? Math.ceil(Number(coincidencia[1])) : 60;
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({error: "Método no permitido."});
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(503).json({
      error: "El asistente todavía no está configurado en el servidor.",
    });
  }

  const pregunta = typeof request.body?.pregunta === "string"
    ? request.body.pregunta.trim()
    : "";

  if (!pregunta || pregunta.length > 3000) {
    return response.status(400).json({
      error: "Escribe una consulta de entre 1 y 3000 caracteres.",
    });
  }

  const limiteVisitante = revisarLimiteVisitante(request);

  response.setHeader("X-RateLimit-Limit", String(MAX_CONSULTAS_POR_VENTANA));
  response.setHeader("X-RateLimit-Remaining", String(limiteVisitante.restantes));

  if (!limiteVisitante.permitida) {
    response.setHeader("Retry-After", String(limiteVisitante.retryAfter));
    return response.status(429).json({
      tipo: "limite_visitante",
      retryAfter: limiteVisitante.retryAfter,
      error: `Alcanzaste el límite de ${MAX_CONSULTAS_POR_VENTANA} consultas por cada 10 minutos. Podrás volver a consultar cuando termine la cuenta regresiva.`,
    });
  }

  try {
    const bibliotecaResponse = await fetch(
      `${BIBLIOTECA_API_URL}/buscar?q=${encodeURIComponent(pregunta)}`,
      {headers: {Accept: "application/json"}},
    );
    if (!bibliotecaResponse.ok) {
      throw new Error(`La biblioteca respondió ${bibliotecaResponse.status}.`);
    }
    const biblioteca = await bibliotecaResponse.json();
    const fragmentos = Array.isArray(biblioteca.results) ? biblioteca.results : [];
    if (!fragmentos.length) {
      return response.status(200).json({respuesta: RESPUESTA_SIN_RESPALDO, fuentes: []});
    }

    const evidencia = fragmentos.map((fragmento, indice) => [
      `[EVIDENCIA ${indice + 1}]`,
      `Manual: ${fragmento.title}`,
      `Institución: ${fragmento.institution}`,
      `Páginas: ${fragmento.page_start}-${fragmento.page_end}`,
      fragmento.heading ? `Sección: ${fragmento.heading}` : null,
      `Contenido:\n${fragmento.content}`,
    ].filter(Boolean).join("\n")).join("\n\n---\n\n");

    const ai = new GoogleGenAI({apiKey});
    const solicitud = {
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      input: `PREGUNTA DEL USUARIO:\n${pregunta}\n\nEVIDENCIA DOCUMENTAL AUTORIZADA:\n${evidencia}`,
      system_instruction: INSTRUCCIONES,
    };

    if (
      typeof request.body?.previousInteractionId === "string" &&
      request.body.previousInteractionId.length < 200
    ) {
      solicitud.previous_interaction_id = request.body.previousInteractionId;
    }

    const interaction = await ai.interactions.create(solicitud);
    const fuentes = construirFuentes(fragmentos);

    // El prompt guía al modelo, pero esta validación impide que una respuesta sin
    // evidencia documental llegue al usuario aunque el modelo use conocimiento general.
    const respuestaConRespaldo = fragmentos.length > 0
      ? interaction.output_text || RESPUESTA_SIN_RESPALDO
      : RESPUESTA_SIN_RESPALDO;

    return response.status(200).json({
      respuesta: respuestaConRespaldo,
      fuentes,
      interactionId: interaction.id,
    });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    const esLimite = mensaje.includes("429") || /quota|rate limit/i.test(mensaje);

    if (esLimite) {
      const retryAfter = obtenerRetryAfter(mensaje);
      response.setHeader("Retry-After", String(retryAfter));
      return response.status(429).json({
        tipo: "limite_gemini",
        retryAfter,
        error: `El asistente alcanzó temporalmente su límite de consultas. Intenta nuevamente en aproximadamente ${retryAfter} segundos.`,
      });
    }

    console.error("Error consultando Gemini:", mensaje);
    return response.status(500).json({
      error: "No fue posible consultar el asistente en este momento. Intenta nuevamente.",
    });
  }
}
