import {GoogleGenAI} from "@google/genai";
import {createHash} from "node:crypto";

const STORE_PREDETERMINADO =
  "fileSearchStores/asistente-de-emergencias-bi-zkzggfh9zv74";

const NOMBRES_FUENTES = {
  "88yvau79o3fm": "Control de emergencias con gases combustibles - ANB Chile",
  "GRE 2024": "GRE 2024",
};

const INSTRUCCIONES = `Eres un Asistente Técnico de Emergencias para Bomberos y primeros respondedores.
Responde en español usando prioritariamente la biblioteca documental conectada.
No inventes procedimientos, distancias, números ONU, guías, concentraciones, valores técnicos ni recomendaciones operativas.
Si las fuentes no contienen información suficiente, dilo claramente.
Si la pregunta es ambigua, solicita los antecedentes necesarios antes de responder de forma específica.
Mantén el contexto de la conversación. Distingue las diferencias entre fuentes cuando existan.
Organiza la respuesta de forma clara y práctica. No menciones procesos internos de recuperación documental.
No sustituyes el mando, los procedimientos locales ni la evaluación del personal competente en la escena.`;

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

const extraerFuentes = (interaction) => {
  const agrupadas = new Map();

  for (const step of interaction?.steps || []) {
    if (step.type !== "model_output" || !Array.isArray(step.content)) continue;

    for (const bloque of step.content) {
      for (const annotation of bloque.annotations || []) {
        if (annotation.type !== "file_citation") continue;

        const original = annotation.file_name || annotation.fileName || "Documento";
        const nombre = NOMBRES_FUENTES[original] || original;
        const pagina = Number(annotation.page_number || annotation.pageNumber);

        if (!agrupadas.has(nombre)) agrupadas.set(nombre, new Set());
        if (Number.isFinite(pagina) && pagina > 0) agrupadas.get(nombre).add(pagina);
      }
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
  const storeName = process.env.GEMINI_FILE_SEARCH_STORE || STORE_PREDETERMINADO;

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
    const ai = new GoogleGenAI({apiKey});
    const solicitud = {
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      input: pregunta,
      system_instruction: INSTRUCCIONES,
      tools: [
        {
          type: "file_search",
          file_search_store_names: [storeName],
        },
      ],
    };

    if (
      typeof request.body?.previousInteractionId === "string" &&
      request.body.previousInteractionId.length < 200
    ) {
      solicitud.previous_interaction_id = request.body.previousInteractionId;
    }

    const interaction = await ai.interactions.create(solicitud);

    return response.status(200).json({
      respuesta: interaction.output_text || "No se recibió una respuesta.",
      fuentes: extraerFuentes(interaction),
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
