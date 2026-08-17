import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import Layout from "@/components/Layout";
import {
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";

import {sanityClient, urlFor} from "../lib/sanity";

interface PortableTextSpan {
  _key?: string;
  _type?: string;
  text?: string;
  marks?: string[];
}

interface PortableTextBlock {
  _key?: string;
  _type?: string;
  style?: string;
  listItem?: string;
  children?: PortableTextSpan[];
  asset?: any;
  pie?: string;
}

interface Noticia {
  _id: string;
  titulo?: string;
  fecha?: string;
  categoria?: string;
  imagenPrincipal?: any;
  contenido?: PortableTextBlock[];
}

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${fecha}T00:00:00Z`));
};

const NoticiaDetalle = () => {
  const {slug} = useParams<{slug: string}>();

  const [post, setPost] = useState<Noticia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [copiado, setCopiado] = useState(false);

  // =====================================================
  // CARGAR NOTICIA DESDE SANITY
  // =====================================================

  useEffect(() => {
    if (!slug) {
      setCargando(false);
      return;
    }

    sanityClient
      .fetch<Noticia | null>(
        `
        *[
          _type == "noticia" &&
          slug.current == $slug
        ][0]{
          _id,
          titulo,
          fecha,
          categoria,
          imagenPrincipal,
          contenido
        }
        `,
        {slug}
      )
      .then((data) => {
        setPost(data);
        setCargando(false);
      })
      .catch((error) => {
        console.error(
          "Error cargando noticia desde Sanity:",
          error
        );

        setCargando(false);
      });
  }, [slug]);

  // =====================================================
  // COMPARTIR
  // =====================================================

  const compartirFacebook = () => {
    const url = encodeURIComponent(window.location.href);

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const compartirWhatsApp = () => {
    const url = encodeURIComponent(window.location.href);

    const titulo = encodeURIComponent(
      post?.titulo || "Noticia"
    );

    window.open(
      `https://wa.me/?text=${titulo}%20${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const compartirX = () => {
    const url = encodeURIComponent(window.location.href);

    const titulo = encodeURIComponent(
      post?.titulo || "Noticia"
    );

    window.open(
      `https://twitter.com/intent/tweet?text=${titulo}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopiado(true);

      setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error(
        "No se pudo copiar el enlace:",
        error
      );
    }
  };

  // =====================================================
  // CARGANDO
  // =====================================================

  if (cargando) {
    return (
      <Layout>
        <section className="py-32 bg-background">

          <div className="container mx-auto px-4 text-center">

            <p className="text-muted-foreground">
              Cargando noticia...
            </p>

          </div>

        </section>
      </Layout>
    );
  }

  // =====================================================
  // NOTICIA NO ENCONTRADA
  // =====================================================

  if (!post) {
    return (
      <Layout>

        <section className="py-32 bg-background">

          <div className="container mx-auto px-4 text-center">

            <h1 className="text-3xl font-black uppercase text-foreground mb-4">
              Noticia no encontrada
            </h1>

            <Link
              to="/noticias"
              className="text-primary font-bold hover:underline"
            >
              Volver a Noticias
            </Link>

          </div>

        </section>

      </Layout>
    );
  }

  const imagenPrincipal =
    post.imagenPrincipal
      ? urlFor(post.imagenPrincipal)
          .width(1600)
          .url()
      : null;

  return (
    <Layout>

      {/* =====================================================
          CABECERA SOBRIA
      ===================================================== */}

      <section className="relative bg-navy pt-28 pb-10 overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />

        <div className="container mx-auto px-4 relative z-10">

          <div className="max-w-4xl mx-auto">

            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 text-primary-foreground/75 hover:text-primary-foreground text-sm font-semibold uppercase tracking-wider transition-colors"
            >

              <ArrowLeft className="h-4 w-4" />

              Volver a Noticias

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          ARTÍCULO
      ===================================================== */}

      <main className="bg-background py-12 md:py-16">

        <article className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">

            {/* =====================================================
                CATEGORÍA Y FECHA
            ===================================================== */}

            <div className="flex flex-wrap items-center gap-3 mb-6">

              {post.categoria && (

                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {post.categoria}
                </span>

              )}

              {post.fecha && (

                <span className="text-sm text-muted-foreground">
                  {formatearFecha(post.fecha)}
                </span>

              )}

            </div>

            {/* =====================================================
                IMAGEN PRINCIPAL
            ===================================================== */}

            {imagenPrincipal && (

              <figure className="mb-8">

                <div className="w-full rounded-lg overflow-hidden bg-muted">

                  <img
                    src={imagenPrincipal}
                    alt={post.titulo || "Noticia"}
                    className="w-full max-h-[520px] object-contain"
                  />

                </div>

              </figure>

            )}

            {/* =====================================================
                TÍTULO
            ===================================================== */}

            <header className="max-w-3xl mb-10">

              <div className="w-14 h-1 bg-gold mb-5" />

              <h1 className="text-3xl md:text-5xl font-black uppercase text-foreground leading-[1.1]">
                {post.titulo || "Noticia"}
              </h1>

            </header>

            {/* =====================================================
                CONTENIDO
            ===================================================== */}

            <div className="max-w-3xl">

              {post.contenido?.map(
                (block, index) => {

                  // =================================================
                  // IMAGEN INTERIOR
                  // =================================================

                  if (
                    block._type === "image" &&
                    block.asset
                  ) {
                    return (
                      <figure
                        key={block._key || index}
                        className="my-10"
                      >

                        <div className="rounded-lg overflow-hidden bg-muted">

                          <img
                            src={urlFor(block)
                              .width(1400)
                              .url()}
                            alt={block.pie || ""}
                            className="w-full max-h-[650px] object-contain"
                          />

                        </div>

                        {block.pie && (

                          <figcaption className="text-sm text-muted-foreground mt-3">
                            {block.pie}
                          </figcaption>

                        )}

                      </figure>
                    );
                  }

                  if (block._type !== "block") {
                    return null;
                  }

                  const texto =
                    block.children
                      ?.map(
                        (child) =>
                          child.text || ""
                      )
                      .join("") || "";

                  if (!texto) {
                    return null;
                  }

                  // =================================================
                  // TÍTULO H2
                  // =================================================

                  if (block.style === "h2") {
                    return (
                      <h2
                        key={block._key || index}
                        className="text-2xl md:text-3xl font-extrabold text-foreground mt-12 mb-5"
                      >
                        {texto}
                      </h2>
                    );
                  }

                  // =================================================
                  // SUBTÍTULO H3
                  // =================================================

                  if (block.style === "h3") {
                    return (
                      <h3
                        key={block._key || index}
                        className="text-xl md:text-2xl font-bold text-foreground/90 mt-10 mb-4"
                      >
                        {texto}
                      </h3>
                    );
                  }

                  // =================================================
                  // CITA
                  // =================================================

                  if (
                    block.style ===
                    "blockquote"
                  ) {
                    return (
                      <blockquote
                        key={block._key || index}
                        className="border-l-4 border-gold pl-6 py-2 my-10 text-xl md:text-2xl italic text-muted-foreground"
                      >
                        {texto}
                      </blockquote>
                    );
                  }

                  // =================================================
                  // PÁRRAFO
                  // =================================================

                  return (
                    <p
                      key={block._key || index}
                      className="text-muted-foreground leading-[1.8] mb-7 text-lg"
                    >
                      {texto}
                    </p>
                  );
                }
              )}

            </div>

            {/* =====================================================
                COMPARTIR
            ===================================================== */}

            <div className="max-w-3xl mt-14 pt-8 border-t border-border">

              <p className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                Compartir esta noticia
              </p>

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={compartirFacebook}
                  className="px-5 py-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Facebook
                </button>

                <button
                  type="button"
                  onClick={compartirWhatsApp}
                  className="px-5 py-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={compartirX}
                  className="px-5 py-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  X
                </button>

                <button
                  type="button"
                  onClick={copiarEnlace}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-border bg-background text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >

                  {copiado ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copiar enlace
                    </>
                  )}

                </button>

              </div>

            </div>

          </div>

        </article>

      </main>

    </Layout>
  );
};

export default NoticiaDetalle;