import {GoogleGenAI} from "@google/genai";
import {createHash} from "node:crypto";

const BIBLIOTECA_API_URL =
  process.env.BIBLIOTECA_API_URL ||
  "https://veronica-biblioteca.veronica-firerescue-simon.workers.dev";

const INSTRUCCIONES = `Eres Veronica FireRescue, un asistente técnico de emergencias para Bomberos y primeros respondedores.
Responde en español usando exclusivamente la evidencia documental incluida en la consulta actual.
No uses conocimiento general, memoria del modelo, información pública, inferencias externas ni datos de conversaciones anteriores como respaldo factual.
Cada afirmación factual debe estar sustentada por al menos una fuente documental recuperada. No inventes procedimientos, distancias, teléfonos, números ONU, guías, concentraciones, valores técnicos ni recomendaciones operativas.
Si la evidencia permite responder solo una parte de la consulta, responde esa parte y señala brevemente qué aspecto no está suficientemente documentado. Usa la frase "No encontré esta información en los manuales disponibles de la biblioteca técnica." solamente cuando ninguna evidencia recuperada sea pertinente. No agregues la respuesta que conozcas por otras fuentes ni expliques cuál podría ser.
Si la pregunta es ambigua, solicita los antecedentes necesarios antes de responder de forma específica.
Mantén el contexto de la conversación. Distingue las diferencias entre fuentes cuando existan.
Organiza la respuesta en Markdown claro y práctico: usa títulos breves para separar secciones, párrafos cortos y listas con viñetas cuando enumeres pasos, riesgos o antecedentes. Usa negrita solo para destacar conceptos importantes. No incluyas una sección de fuentes ni menciones procesos internos de recuperación documental, porque las fuentes se presentan por separado en la interfaz.
En consultas de rescate vehicular, nunca recomiendes ni infieras dónde cortar. Solo puedes identificar zonas donde debe evitarse el corte cuando estén respaldadas por la Rescue Sheet oficial exacta y validada del vehículo. Una ausencia de color o pictograma no constituye una zona segura.
No sustituyes el mando, los procedimientos locales ni la evaluación del personal competente en la escena.`;

const RESPUESTA_SIN_RESPALDO =
  "No encontré esta información en los manuales disponibles de la biblioteca técnica.";
const RESPUESTA_VISUAL_NO_VALIDADA =
  "No encontré una página visual disponible para revisar esta consulta. No entregaré una indicación operativa basándome solo en una inferencia sin evidencia visual.";
const SOLICITUD_VALIDACION_VISUAL = `## Ayúdame a validar esta página

Encontré una página relacionada con tu consulta. Debajo verás:

- La **página original completa** del manual.
- Una **lectura automática provisional** de sus colores, símbolos o diagramas.
- Los botones **Correcto**, **Parcial**, **Incorrecto** y **No sé**.

Compara la lectura automática con la página original y marca el resultado. Si eliges **Parcial** o **Incorrecto**, escribe la corrección técnica. La interpretación todavía no se usará como indicación operativa hasta reunir validaciones concordantes.`;
const RESPUESTA_CORTE_SIN_HOJA_EXACTA = `## No existe una Rescue Sheet exacta disponible

La guía general de pictogramas no contiene la ubicación de riesgos de este vehículo específico. Por eso no la usaré para inferir dónde intervenir.

Cuando exista una Rescue Sheet oficial que coincida con **modelo, generación, año, carrocería y motorización**, Veronica mostrará exclusivamente las zonas donde debe **evitarse el corte**: airbags, pretensores, refuerzos, alta tensión, depósitos y otros riesgos representados.

Veronica no recomendará un punto de corte. La selección del punto y la técnica corresponde al personal de rescate competente.`;

const requiereValidacionVisual = (pregunta) =>
  /\b(color(?:es)?|s[ií]mbolo(?:s)?|imagen(?:es)?|flecha(?:s)?|zona(?:s)?\s+de\s+corte|d[oó]nde\s+cortar)\b/i
    .test(pregunta);

const preguntaDondeCortarVehiculo = (pregunta) =>
  /\bd[oó]nde\s+(?:puedo\s+)?cort(?:o|ar)\s+(?:un|el|la)\s+[\p{L}\d-]{2,}/iu.test(pregunta) ||
  /\ben\s+qu[eé]\s+(?:zona|parte)\s+(?:puedo\s+)?cortar\b/iu.test(pregunta);

const limpiarMarcadoresEvidencia = (texto) => texto
  .replace(/\s*\[(?:EVIDENCIA|FUENTE)\s+\d+(?:\s*,\s*(?:EVIDENCIA|FUENTE)?\s*\d+)*\]/gi, "")
  .trim();

const normalizarConsultaDocumental = (pregunta) => pregunta
  .replace(/boca\s+abajo/gi, "decúbito prono")
  .replace(/boca\s+arriba/gi, "decúbito supino")
  .replace(/cardiorespiratori[oa]/gi, "cardiorrespiratorio")
  .replace(/revisa\s+bien\s+los\s+manuales/gi, "")
  .replace(/\s{2,}/g, " ")
  .trim();

const construirConsultasDocumentales = (pregunta) => {
  const normalizada = normalizarConsultaDocumental(pregunta);
  const consultas = [normalizada];

  if (/decúbito prono/i.test(normalizada)) {
    consultas.push("víctima decúbito prono girar decúbito lateral decúbito supino");
  }
  if (/hemorragia exanguinante/i.test(normalizada)) {
    consultas.push("hemorragia exanguinante control presión directa vendaje compresivo torniquete");
  }
  if (/paro cardiorrespiratorio|\bPCR\b|\bRCP\b/i.test(normalizada)) {
    consultas.push("paro cardiorrespiratorio RCP compresiones torácicas");
  }

  return Array.from(new Set(consultas)).slice(0, 4);
};

const combinarFragmentos = (grupos, limite = 12) => {
  const unicos = new Map();
  const mayorGrupo = Math.max(0, ...grupos.map((grupo) => grupo.length));
  for (let posicion = 0; posicion < mayorGrupo && unicos.size < limite; posicion += 1) {
    for (const grupo of grupos) {
      const fragmento = grupo[posicion];
      if (fragmento && !unicos.has(fragmento.id)) unicos.set(fragmento.id, fragmento);
      if (unicos.size >= limite) break;
    }
  }
  return Array.from(unicos.values());
};

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

  if (preguntaDondeCortarVehiculo(pregunta)) {
    return response.status(200).json({
      respuesta: RESPUESTA_CORTE_SIN_HOJA_EXACTA,
      fuentes: [],
      requiereRescueSheetExacta: true,
    });
  }

  if (requiereValidacionVisual(pregunta)) {
    try {
      const visualResponse = await fetch(
        `${BIBLIOTECA_API_URL}/visuales/sugerir?q=${encodeURIComponent(pregunta)}`,
        {headers: {Accept: "application/json"}},
      );
      if (!visualResponse.ok) throw new Error(`La biblioteca respondió ${visualResponse.status}.`);
      const {visual = null} = await visualResponse.json();
      return response.status(200).json({
        respuesta: visual
          ? SOLICITUD_VALIDACION_VISUAL
          : RESPUESTA_VISUAL_NO_VALIDADA,
        fuentes: visual ? [{nombre: visual.manual, paginas: [visual.pagina]}] : [],
        requiereValidacionVisual: true,
        validacionVisual: visual,
      });
    } catch (error) {
      console.error("Error preparando validación visual:", error);
      return response.status(200).json({
        respuesta: RESPUESTA_VISUAL_NO_VALIDADA,
        fuentes: [],
        requiereValidacionVisual: true,
        validacionVisual: null,
      });
    }
  }

  try {
    const consultasDocumentales = construirConsultasDocumentales(pregunta);
    const respuestasBiblioteca = await Promise.all(consultasDocumentales.map(async (consulta) => {
      const bibliotecaResponse = await fetch(
        `${BIBLIOTECA_API_URL}/buscar?q=${encodeURIComponent(consulta)}`,
        {headers: {Accept: "application/json"}},
      );
      if (!bibliotecaResponse.ok) {
        throw new Error(`La biblioteca respondió ${bibliotecaResponse.status}.`);
      }
      const biblioteca = await bibliotecaResponse.json();
      return Array.isArray(biblioteca.results) ? biblioteca.results : [];
    }));
    const fragmentos = combinarFragmentos(respuestasBiblioteca);
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
      ? limpiarMarcadoresEvidencia(interaction.output_text || RESPUESTA_SIN_RESPALDO)
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
