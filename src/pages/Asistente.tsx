import {FormEvent, KeyboardEvent, useEffect, useRef, useState} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUp,
  BookOpen,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import Layout from "@/components/Layout";
import veronicaAvatar from "@/assets/veronica-firerescue.jpg";
import {sanityClient, urlFor} from "@/lib/sanity";

type Fuente = {
  nombre: string;
  paginas: number[];
};

type Mensaje = {
  id: string;
  rol: "usuario" | "asistente";
  texto: string;
  fuentes?: Fuente[];
  error?: boolean;
  preguntaOriginal?: string;
  retryAt?: number;
};

type ChatResponse = {
  respuesta?: string;
  fuentes?: Fuente[];
  interactionId?: string;
  error?: string;
  retryAfter?: number;
};

type IdentificadorManual =
  | "gre2024"
  | "gasesCombustibles"
  | "controlFuegoVehiculos";

type Manual = {
  identificador: string;
  titulo: string;
  autor: string;
  descripcion: string;
  url: string;
  portadaUrl?: string;
};

type BibliotecaResponse = {
  manuales?: Array<{
    id: string;
    slug: string;
    cms_key?: IdentificadorManual | null;
    title: string;
    institution: string;
    edition?: string;
    description: string;
    file_url: string;
    cover_url?: string | null;
  }>;
};

type ContenidoAsistente = {
  bibliotecaTitulo?: string;
  bibliotecaDescripcion?: string;
  manuales?: Array<{
    _key: string;
    identificador?: IdentificadorManual;
    titulo?: string;
    portada?: {
      asset?: {_ref?: string};
      alt?: string;
      hotspot?: {x?: number; y?: number; height?: number; width?: number};
      crop?: {top?: number; bottom?: number; left?: number; right?: number};
    };
  }>;
};

const manualesPredeterminados: Manual[] = [
  {
    identificador: "gre2024",
    titulo: "GRE 2024",
    autor: "Guía de Respuesta en Caso de Emergencia",
    descripcion:
      "Consulta inicial para incidentes con materiales peligrosos, números ONU y guías de respuesta.",
    url: "/manuales/gre-2024.pdf",
  },
  {
    identificador: "gasesCombustibles",
    titulo: "Control de emergencias con gases combustibles",
    autor: "Academia Nacional de Bomberos de Chile",
    descripcion:
      "Material técnico sobre propiedades, riesgos y control de emergencias asociadas a gases combustibles.",
    url: "/manuales/control-emergencias-gases-combustibles-anb-chile.pdf",
  },
];

const ASISTENTE_QUERY = /* groq */ `
  *[_type == "asistente" && _id == "asistente"][0]{
    bibliotecaTitulo,
    bibliotecaDescripcion,
    manuales[]{
      _key,
      identificador,
      titulo,
      portada{asset, alt, hotspot, crop}
    }
  }
`;

const BIBLIOTECA_API_URL =
  import.meta.env.VITE_BIBLIOTECA_API_URL?.replace(/\/$/, "") ||
  "https://veronica-biblioteca.veronica-firerescue-simon.workers.dev";

const ejemplos = [
  "¿Qué indica la GRE para ONU 1203?",
  "¿Qué antecedentes necesito para identificar una fuga de gas?",
  "Compara la información disponible sobre BLEVE.",
];

const crearId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const RespuestaMarkdown = ({contenido}: {contenido: string}) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    skipHtml
    components={{
      h1: ({children}) => <h2 className="mb-3 mt-1 text-xl font-extrabold leading-tight text-foreground">{children}</h2>,
      h2: ({children}) => <h3 className="mb-2 mt-6 border-b border-border pb-2 text-lg font-extrabold leading-snug text-foreground first:mt-0">{children}</h3>,
      h3: ({children}) => <h4 className="mb-2 mt-5 text-base font-bold leading-snug text-foreground first:mt-0">{children}</h4>,
      p: ({children}) => <p className="my-3 leading-7 first:mt-0 last:mb-0">{children}</p>,
      ul: ({children}) => <ul className="my-3 list-disc space-y-2 pl-6 marker:text-primary">{children}</ul>,
      ol: ({children}) => <ol className="my-3 list-decimal space-y-2 pl-6 marker:font-bold marker:text-primary">{children}</ol>,
      li: ({children}) => <li className="pl-1 leading-7">{children}</li>,
      strong: ({children}) => <strong className="font-extrabold text-foreground">{children}</strong>,
      blockquote: ({children}) => (
        <blockquote className="my-4 border-l-4 border-primary/40 bg-primary/5 px-4 py-2 text-muted-foreground">
          {children}
        </blockquote>
      ),
      a: ({children, href}) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
        >
          {children}
        </a>
      ),
      hr: () => <hr className="my-5 border-border" />,
    }}
  >
    {contenido}
  </ReactMarkdown>
);

const Asistente = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [ahora, setAhora] = useState(Date.now());
  const [contenido, setContenido] = useState<ContenidoAsistente | null>(null);
  const [manualesCatalogo, setManualesCatalogo] = useState<Manual[] | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sanityClient
      .fetch<ContenidoAsistente | null>(ASISTENTE_QUERY)
      .then(setContenido)
      .catch((error) => {
        console.error("Error cargando el contenido del asistente desde Sanity:", error);
      });
  }, []);

  useEffect(() => {
    fetch(`${BIBLIOTECA_API_URL}/manuales`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`La biblioteca respondió ${response.status}.`);
        return (await response.json()) as BibliotecaResponse;
      })
      .then((data) => {
        const catalogo = (data.manuales || []).map((manual) => ({
          identificador: manual.cms_key || manual.slug,
          titulo: manual.title,
          autor: manual.edition
            ? `${manual.institution} · ${manual.edition}`
            : manual.institution,
          descripcion: manual.description,
          url: manual.file_url,
          portadaUrl: manual.cover_url || undefined,
        }));

        setManualesCatalogo(catalogo);
      })
      .catch((error) => {
        console.error("Error cargando el catálogo documental:", error);
      });
  }, []);

  const manualesSanity = new Map(
    contenido?.manuales
      ?.filter((manual) => manual.identificador)
      .map((manual) => [manual.identificador as IdentificadorManual, manual]) ?? [],
  );

  const manualesBase = manualesCatalogo?.length
    ? manualesCatalogo
    : manualesPredeterminados;

  const manuales = manualesBase.map((manual) => {
    const contenidoManual = manualesSanity.get(manual.identificador as IdentificadorManual);

    return {
      ...manual,
      titulo: contenidoManual?.titulo || manual.titulo,
      portada: contenidoManual?.portada,
    };
  });

  const hayCuentaRegresiva = mensajes.some(
    (mensaje) => mensaje.retryAt && mensaje.retryAt > ahora,
  );

  useEffect(() => {
    if (!hayCuentaRegresiva) return;

    const timer = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [hayCuentaRegresiva]);

  const nuevaConversacion = () => {
    setMensajes([]);
    setInteractionId(null);
    setEntrada("");
  };

  const enviarPregunta = async (pregunta: string, agregarMensajeUsuario = true) => {
    const texto = pregunta.trim();

    if (!texto || enviando) return;

    setEntrada("");
    setEnviando(true);
    if (agregarMensajeUsuario) {
      setMensajes((actuales) => [
        ...actuales,
        {id: crearId(), rol: "usuario", texto},
      ]);
    }

    window.setTimeout(() => endRef.current?.scrollIntoView({behavior: "smooth"}), 50);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({pregunta: texto, previousInteractionId: interactionId}),
      });

      let data: ChatResponse = {};

      try {
        data = (await response.json()) as ChatResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 429) {
          const retryHeader = Number(response.headers.get("Retry-After"));
          const retryAfter = Number.isFinite(data.retryAfter)
            ? Number(data.retryAfter)
            : Number.isFinite(retryHeader) && retryHeader > 0
              ? retryHeader
              : 60;

          setAhora(Date.now());
          setMensajes((actuales) => [
            ...actuales,
            {
              id: crearId(),
              rol: "asistente",
              texto:
                data.error ||
                "Alcanzaste temporalmente el límite de consultas. Podrás reintentar cuando termine la cuenta regresiva.",
              error: true,
              preguntaOriginal: texto,
              retryAt: Date.now() + retryAfter * 1000,
            },
          ]);
          return;
        }

        throw new Error(data.error || "No fue posible consultar el asistente.");
      }

      setMensajes((actuales) => [
        ...actuales,
        {
          id: crearId(),
          rol: "asistente",
          texto: data.respuesta || "No se recibió una respuesta.",
          fuentes: data.fuentes || [],
        },
      ]);
      setInteractionId(data.interactionId || null);
    } catch (error) {
      setMensajes((actuales) => [
        ...actuales,
        {
          id: crearId(),
          rol: "asistente",
          texto:
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado. Intenta nuevamente.",
          error: true,
        },
      ]);
    } finally {
      setEnviando(false);
      window.setTimeout(() => endRef.current?.scrollIntoView({behavior: "smooth"}), 50);
    }
  };

  const reintentarPregunta = (mensaje: Mensaje) => {
    if (!mensaje.preguntaOriginal || enviando) return;

    setMensajes((actuales) => actuales.filter((actual) => actual.id !== mensaje.id));
    void enviarPregunta(mensaje.preguntaOriginal, false);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void enviarPregunta(entrada);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void enviarPregunta(entrada);
    }
  };

  return (
    <Layout>
      <section className="min-h-[calc(100vh-5rem)] bg-[linear-gradient(180deg,hsl(var(--navy))_0%,hsl(220_30%_16%)_42%,hsl(var(--muted))_42%)] pt-24 pb-16 md:pt-28">
        <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 text-navy-foreground md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-gold">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-extrabold uppercase tracking-[0.2em]">
                  Herramienta documental
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight sm:text-3xl md:text-4xl">
                Asistente de emergencias
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-navy-foreground/75">
                Consulta la biblioteca técnica de la Quinta Compañía y recibe respuestas con sus fuentes documentales.
              </p>
            </div>

            <button
              type="button"
              onClick={nuevaConversacion}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-navy-foreground/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-foreground transition-colors hover:border-gold/60 hover:text-gold"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Nueva conversación
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-background shadow-2xl shadow-navy/30">
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="h-10 w-10 flex-none overflow-hidden rounded-full border-2 border-primary/20 bg-muted shadow-sm">
                  <img
                    src={veronicaAvatar}
                    alt="Veronica FireRescue"
                    className="h-full w-full object-cover object-[50%_38%]"
                  />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide">Veronica FireRescue</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Biblioteca conectada
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Respuestas basadas en documentos
              </div>
            </div>

            <div className="h-[58vh] min-h-[460px] overflow-y-auto bg-muted/40 px-3 py-6 sm:px-6 lg:px-10">
              {mensajes.length === 0 ? (
                <div className="mx-auto flex h-full max-w-3xl flex-col items-center justify-center text-center">
                  <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-8 w-8" />
                  </span>
                  <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                    ¿Qué necesitas consultar?
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
                    Pregunta por una sustancia, un número ONU o un tema contenido en los manuales disponibles.
                  </p>
                  <div className="mt-7 grid w-full gap-2 sm:grid-cols-3">
                    {ejemplos.map((ejemplo) => (
                      <button
                        key={ejemplo}
                        type="button"
                        onClick={() => void enviarPregunta(ejemplo)}
                        className="rounded-lg border border-border bg-card p-4 text-left text-sm font-medium leading-relaxed text-foreground transition-all hover:border-primary/40 hover:shadow-sm"
                      >
                        {ejemplo}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-5xl space-y-7">
                  {mensajes.map((mensaje) => (
                    <article
                      key={mensaje.id}
                      className={`flex gap-3 ${mensaje.rol === "usuario" ? "justify-end" : "justify-start"}`}
                    >
                      {mensaje.rol === "asistente" && (
                        <span className="mt-1 h-9 w-9 flex-none overflow-hidden rounded-full border-2 border-primary/15 bg-muted shadow-sm">
                          <img
                            src={veronicaAvatar}
                            alt=""
                            className="h-full w-full object-cover object-[50%_38%]"
                          />
                        </span>
                      )}
                      <div className={`max-w-[92%] sm:max-w-[86%] ${mensaje.rol === "usuario" ? "order-first" : ""}`}>
                        <div
                          className={`rounded-xl px-4 py-4 text-[15px] leading-7 sm:px-5 sm:text-base ${
                            mensaje.rol === "usuario"
                              ? "bg-navy text-navy-foreground"
                              : mensaje.error
                                ? "border border-secondary/20 bg-secondary/5 text-foreground"
                                : "border border-border bg-card text-foreground shadow-sm"
                          }`}
                        >
                          {mensaje.rol === "asistente" && !mensaje.error ? (
                            <RespuestaMarkdown contenido={mensaje.texto} />
                          ) : (
                            <p className="whitespace-pre-wrap">{mensaje.texto}</p>
                          )}
                        </div>
                        {mensaje.error && mensaje.preguntaOriginal && mensaje.retryAt && (
                          <button
                            type="button"
                            onClick={() => reintentarPregunta(mensaje)}
                            disabled={mensaje.retryAt > ahora || enviando}
                            className="mt-2 inline-flex items-center gap-2 rounded-md border border-secondary/25 bg-card px-3 py-2 text-xs font-bold text-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-55"
                          >
                            {mensaje.retryAt > ahora ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5" />
                                Reintentar en {Math.max(1, Math.ceil((mensaje.retryAt - ahora) / 1000))} s
                              </>
                            ) : (
                              <>
                                <ArrowUp className="h-3.5 w-3.5" />
                                Reintentar consulta
                              </>
                            )}
                          </button>
                        )}
                        {!!mensaje.fuentes?.length && (
                          <aside className="mt-3 rounded-lg border border-border/80 bg-muted/60 px-4 py-3" aria-label="Fuentes documentales">
                            <p className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                              <BookOpen className="h-3.5 w-3.5" />
                              Fuentes documentales
                            </p>
                            <div className="space-y-2">
                              {mensaje.fuentes.map((fuente) => (
                                <div key={fuente.nombre} className="text-xs leading-relaxed text-muted-foreground">
                                  <span className="font-semibold text-foreground/80">{fuente.nombre}</span>
                                  {fuente.paginas.length > 0 && (
                                    <span> · {fuente.paginas.length === 1 ? "página" : "páginas"} {fuente.paginas.join(", ")}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </aside>
                        )}
                      </div>
                      {mensaje.rol === "usuario" && (
                        <span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gold text-gold-foreground">
                          <User className="h-4 w-4" />
                        </span>
                      )}
                    </article>
                  ))}

                  {enviando && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-9 w-9 flex-none overflow-hidden rounded-full border-2 border-primary/15 bg-muted shadow-sm">
                        <img
                          src={veronicaAvatar}
                          alt=""
                          className="h-full w-full object-cover object-[50%_38%]"
                        />
                      </span>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      Consultando la biblioteca…
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} className="border-t border-border bg-card p-3 sm:p-5">
              <div className="mx-auto flex max-w-5xl items-end gap-2 rounded-xl border border-input bg-background p-2 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  value={entrada}
                  onChange={(event) => setEntrada(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={3000}
                  disabled={enviando}
                  placeholder="Escribe tu consulta…"
                  aria-label="Consulta para el asistente"
                  className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-base leading-6 outline-none placeholder:text-muted-foreground disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!entrada.trim() || enviando}
                  aria-label="Enviar consulta"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {enviando ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] leading-relaxed text-muted-foreground sm:text-xs">
                Herramienta de apoyo documental. No sustituye el mando, los procedimientos locales ni la evaluación en terreno.
              </p>
            </form>
          </div>

          <section className="mt-16" aria-labelledby="biblioteca-title">
            <div className="mb-7">
              <div className="mb-3 h-1 w-14 bg-secondary" />
              <h2 id="biblioteca-title" className="section-title text-2xl md:text-3xl">
                {contenido?.bibliotecaTitulo || "Biblioteca disponible"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {contenido?.bibliotecaDescripcion ||
                  "Documentos actualmente indexados y disponibles para las consultas del asistente."}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {manuales.map((manual) => (
                <article key={manual.identificador} className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
                  {manual.portadaUrl || manual.portada?.asset ? (
                    <img
                      src={
                        manual.portadaUrl ||
                        urlFor(manual.portada).width(320).height(400).fit("crop").auto("format").url()
                      }
                      alt={manual.portada.alt || `Portada de ${manual.titulo}`}
                      loading="lazy"
                      className="h-28 w-20 flex-none rounded-md border border-border bg-muted object-cover shadow-sm sm:h-32 sm:w-24"
                    />
                  ) : (
                    <span className="flex h-28 w-20 flex-none items-center justify-center rounded-md bg-navy text-gold sm:h-32 sm:w-24">
                      <FileText className="h-8 w-8" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Documento indexado</p>
                    <h3 className="font-extrabold leading-snug text-foreground">{manual.titulo}</h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">{manual.autor}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{manual.descripcion}</p>
                    <a
                      href={manual.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label={`Abrir manual ${manual.titulo} en una nueva pestaña`}
                    >
                      Abrir manual
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
};

export default Asistente;
