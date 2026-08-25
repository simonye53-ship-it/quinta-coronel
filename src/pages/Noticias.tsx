import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Layout from "@/components/Layout";
import {ExternalLink, PenLine} from "lucide-react";

import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

const EDITOR_NOTICIAS_URL =
  "https://www.sanity.io/@oonRCqKDY/studio/soego3yvgxk444ae7p5rgv8z/default/structure/noticias";

interface PortableTextSpan {
  _type?: string;
  text?: string;
}

interface PortableTextBlock {
  _type?: string;
  children?: PortableTextSpan[];
}

interface Noticia {
  _id: string;
  titulo?: string;
  slug?: string;
  fecha?: string;
  categoria?: string;
  imagenPrincipal?: any;
  contenido?: PortableTextBlock[];
}

const noticiasFallback = [
  {
    _id: "fallback-1",
    titulo: "Entrenamiento de rescate vehicular",
    slug: "",
    fecha: "",
    categoria: "Entrenamiento",
    imagen: fotoRescate,
    extracto:
      "Nuestros voluntarios continúan perfeccionando sus capacidades para responder ante emergencias.",
  },
  {
    _id: "fallback-2",
    titulo: "Comprometidos con nuestra comunidad",
    slug: "",
    fecha: "",
    categoria: "Comunidad",
    imagen: fotoComunidad,
    extracto:
      "Seguimos trabajando junto a nuestros vecinos y organizaciones de Coronel.",
  },
  {
    _id: "fallback-3",
    titulo: "Formación permanente",
    slug: "",
    fecha: "",
    categoria: "Capacitación",
    imagen: fotoFormacion,
    extracto:
      "La preparación constante es una parte fundamental del trabajo bomberil.",
  },
  {
    _id: "fallback-4",
    titulo: "Vocación y servicio",
    slug: "",
    fecha: "",
    categoria: "Institucional",
    imagen: fotoEquipo,
    extracto:
      "Conoce parte del trabajo y compromiso de los integrantes de nuestra compañía.",
  },
];

const obtenerExtracto = (
  contenido?: PortableTextBlock[],
  limite = 160
) => {
  if (!contenido) return "";

  const texto = contenido
    .filter((block) => block._type === "block")
    .map(
      (block) =>
        block.children
          ?.map((child) => child.text || "")
          .join("") || ""
    )
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (texto.length <= limite) {
    return texto;
  }

  return `${texto.slice(0, limite).trim()}...`;
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T00:00:00Z`));
};

const Noticias = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    sanityClient
      .fetch<Noticia[]>(`
        *[
          _type == "noticia" &&
          defined(slug.current)
        ]
        | order(fecha desc) {
          _id,
          titulo,
          "slug": slug.current,
          fecha,
          categoria,
          imagenPrincipal,
          contenido
        }
      `)
      .then((data) => {
        setNoticias(data || []);
        setCargando(false);
      })
      .catch((error) => {
        console.error(
          "Error cargando noticias desde Sanity:",
          error
        );

        setCargando(false);
      });
  }, []);

  const mostrarFallback =
    !cargando && noticias.length === 0;

  return (
    <Layout>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[330px] flex items-end bg-navy overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />

        <div className="container mx-auto px-4 pb-16 pt-32 relative z-10">

          <div className="max-w-4xl">

            <div className="w-16 h-1 bg-gold mb-6" />

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-primary-foreground mb-4">
              Noticias
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/70 max-w-2xl leading-relaxed mb-7">
              Actualidad, actividades y novedades de la Quinta Compañía del Cuerpo de Bomberos de Coronel.
            </p>

            <a
              href={EDITOR_NOTICIAS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-md bg-gold px-5 py-3 text-sm font-extrabold uppercase tracking-wider text-gold-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105"
              aria-label="Abrir el editor de noticias para colaboradores autorizados"
            >
              <PenLine className="h-5 w-5" aria-hidden="true" />
              Escribir noticia
              <ExternalLink className="h-4 w-4 opacity-70" aria-hidden="true" />
            </a>

            <p className="mt-3 text-xs text-primary-foreground/55">
              Acceso con Google para editores autorizados. No requiere iniciar el CMS en el computador.
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          LISTADO
      ===================================================== */}

      <section className="bg-muted/40 py-16 md:py-20">

        <div className="container mx-auto px-4">

          {cargando && (
            <p className="text-center text-sm md:text-base text-muted-foreground">
              Cargando noticias...
            </p>
          )}

          {!cargando && (

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

              {mostrarFallback
                ? noticiasFallback.map((noticia) => (

                    <article
                      key={noticia._id}
                      className="bg-card rounded-lg overflow-hidden border border-border shadow-sm"
                    >

                      <div className="aspect-[16/10] overflow-hidden bg-muted">

                        <img
                          src={noticia.imagen}
                          alt={noticia.titulo}
                          className="w-full h-full object-cover"
                        />

                      </div>

                      <div className="p-6">

                        <p className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-primary mb-3">
                          {noticia.categoria}
                        </p>

                        <h2 className="text-lg md:text-xl font-black uppercase text-foreground mb-3 leading-snug">
                          {noticia.titulo}
                        </h2>

                        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                          {noticia.extracto}
                        </p>

                      </div>

                    </article>

                  ))

                : noticias.map((noticia) => {

                    const imagen =
                      noticia.imagenPrincipal
                        ? urlFor(
                            noticia.imagenPrincipal
                          )
                            .width(900)
                            .height(560)
                            .url()
                        : fotoEquipo;

                    const extracto =
                      obtenerExtracto(
                        noticia.contenido
                      ) ||
                      "Conoce más sobre esta noticia de nuestra compañía.";

                    return (

                      <article
                        key={noticia._id}
                        className="bg-card rounded-lg overflow-hidden border border-border shadow-sm flex flex-col"
                      >

                        <Link
                          to={`/noticias/${noticia.slug}`}
                          className="block aspect-[16/10] overflow-hidden bg-muted"
                        >

                          <img
                            src={imagen}
                            alt={
                              noticia.titulo ||
                              "Noticia"
                            }
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />

                        </Link>

                        <div className="p-6 flex flex-col flex-1">

                          <div className="flex flex-wrap items-center gap-2 mb-3">

                            {noticia.categoria && (

                              <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-primary">
                                {noticia.categoria}
                              </span>

                            )}

                            {noticia.fecha && (

                              <span className="text-[11px] md:text-xs text-muted-foreground">
                                {formatearFecha(
                                  noticia.fecha
                                )}
                              </span>

                            )}

                          </div>

                          <h2 className="text-lg md:text-xl font-black uppercase text-foreground mb-3 leading-snug">

                            <Link
                              to={`/noticias/${noticia.slug}`}
                              className="hover:text-primary transition-colors"
                            >
                              {noticia.titulo ||
                                "Noticia"}
                            </Link>

                          </h2>

                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                            {extracto}
                          </p>

                          <Link
                            to={`/noticias/${noticia.slug}`}
                            className="mt-auto text-xs md:text-sm font-bold uppercase tracking-wider text-primary hover:text-secondary transition-colors"
                          >
                            Leer noticia
                          </Link>

                        </div>

                      </article>

                    );
                  })}

            </div>

          )}

        </div>

      </section>

    </Layout>
  );
};

export default Noticias;
