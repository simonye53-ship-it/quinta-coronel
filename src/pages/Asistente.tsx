import {FormEvent, KeyboardEvent, useRef, useState} from "react";
import {
  ArrowUp,
  BookOpen,
  Bot,
  FileText,
  Loader2,
  MessageSquarePlus,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import Layout from "@/components/Layout";

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
};

type ChatResponse = {
  respuesta?: string;
  fuentes?: Fuente[];
  interactionId?: string;
  error?: string;
};

const manuales = [
  {
    titulo: "GRE 2024",
    autor: "Guía de Respuesta en Caso de Emergencia",
    descripcion:
      "Consulta inicial para incidentes con materiales peligrosos, números ONU y guías de respuesta.",
  },
  {
    titulo: "Control de emergencias con gases combustibles",
    autor: "Academia Nacional de Bomberos de Chile",
    descripcion:
      "Material técnico sobre propiedades, riesgos y control de emergencias asociadas a gases combustibles.",
  },
];

const ejemplos = [
  "¿Qué indica la GRE para ONU 1203?",
  "¿Qué antecedentes necesito para identificar una fuga de gas?",
  "Compara la información disponible sobre BLEVE.",
];

const crearId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const Asistente = () => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entrada, setEntrada] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const nuevaConversacion = () => {
    setMensajes([]);
    setInteractionId(null);
    setEntrada("");
  };

  const enviarPregunta = async (pregunta: string) => {
    const texto = pregunta.trim();

    if (!texto || enviando) return;

    setEntrada("");
    setEnviando(true);
    setMensajes((actuales) => [
      ...actuales,
      {id: crearId(), rol: "usuario", texto},
    ]);

    window.setTimeout(() => endRef.current?.scrollIntoView({behavior: "smooth"}), 50);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({pregunta: texto, previousInteractionId: interactionId}),
      });

      const data = (await response.json()) as ChatResponse;

      if (!response.ok) {
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
        <div className="container mx-auto px-4">
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
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-foreground/70">
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
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-wide">Asistente IA</p>
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

            <div className="h-[55vh] min-h-[430px] overflow-y-auto bg-muted/40 px-4 py-6 sm:px-8">
              {mensajes.length === 0 ? (
                <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
                  <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="h-8 w-8" />
                  </span>
                  <h2 className="text-xl font-extrabold text-foreground sm:text-2xl">
                    ¿Qué necesitas consultar?
                  </h2>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
                    Pregunta por una sustancia, un número ONU o un tema contenido en los manuales disponibles.
                  </p>
                  <div className="mt-7 grid w-full gap-2 sm:grid-cols-3">
                    {ejemplos.map((ejemplo) => (
                      <button
                        key={ejemplo}
                        type="button"
                        onClick={() => void enviarPregunta(ejemplo)}
                        className="rounded-lg border border-border bg-card p-3 text-left text-xs font-medium leading-relaxed text-foreground transition-all hover:border-primary/40 hover:shadow-sm"
                      >
                        {ejemplo}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto max-w-3xl space-y-6">
                  {mensajes.map((mensaje) => (
                    <article
                      key={mensaje.id}
                      className={`flex gap-3 ${mensaje.rol === "usuario" ? "justify-end" : "justify-start"}`}
                    >
                      {mensaje.rol === "asistente" && (
                        <span className="mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </span>
                      )}
                      <div className={`max-w-[88%] ${mensaje.rol === "usuario" ? "order-first" : ""}`}>
                        <div
                          className={`whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-7 ${
                            mensaje.rol === "usuario"
                              ? "bg-navy text-navy-foreground"
                              : mensaje.error
                                ? "border border-secondary/20 bg-secondary/5 text-foreground"
                                : "border border-border bg-card text-foreground shadow-sm"
                          }`}
                        >
                          {mensaje.texto}
                        </div>
                        {!!mensaje.fuentes?.length && (
                          <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 p-3">
                            <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-primary">
                              <BookOpen className="h-3.5 w-3.5" />
                              Fuentes consultadas
                            </p>
                            <div className="space-y-2">
                              {mensaje.fuentes.map((fuente) => (
                                <div key={fuente.nombre} className="text-xs leading-relaxed text-muted-foreground">
                                  <span className="font-bold text-foreground">{fuente.nombre}</span>
                                  {fuente.paginas.length > 0 && (
                                    <span> · {fuente.paginas.length === 1 ? "página" : "páginas"} {fuente.paginas.join(", ")}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
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
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
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
              <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-xl border border-input bg-background p-2 shadow-sm transition focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  value={entrada}
                  onChange={(event) => setEntrada(event.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  maxLength={3000}
                  disabled={enviando}
                  placeholder="Escribe tu consulta…"
                  aria-label="Consulta para el asistente"
                  className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
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
                Biblioteca disponible
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Documentos actualmente indexados y disponibles para las consultas del asistente.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {manuales.map((manual) => (
                <article key={manual.titulo} className="flex gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
                  <span className="flex h-12 w-12 flex-none items-center justify-center rounded-md bg-navy text-gold">
                    <FileText className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-primary">Documento indexado</p>
                    <h3 className="font-extrabold leading-snug text-foreground">{manual.titulo}</h3>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">{manual.autor}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{manual.descripcion}</p>
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
