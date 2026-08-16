import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import Layout from "@/components/Layout";

import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

interface Noticia {
  _id: string;
  titulo?: string;
  slug?: string;
  fecha?: string;
  categoria?: string;
  extracto?: string;
  imagenPrincipal?: any;
}

const fallbackPosts = [
  {
    _id: "1",
    titulo: "Entrenamiento de Rescate Vehicular 2025",
    extracto:
      "Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro de última generación.",
    imagen: fotoRescate,
    fecha: "2025-03-15",
    categoria: "Entrenamiento",
    slug: "1",
  },
  {
    _id: "2",
    titulo: "Jornada Comunitaria en Lagunillas",
    extracto:
      "La compañía participó en una actividad comunitaria con los vecinos del sector, acercando la labor bomberil a los más pequeños.",
    imagen: fotoComunidad,
    fecha: "2025-02-28",
    categoria: "Comunidad",
    slug: "2",
  },
  {
    _id: "3",
    titulo: "Nuevo Equipamiento para la Compañía",
    extracto:
      "Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.",
    imagen: fotoEquipo,
    fecha: "2025-02-10",
    categoria: "Equipamiento",
    slug: "3",
  },
  {
    _id: "4",
    titulo: "Ceremonia de Aniversario 74°",
    extracto:
      "La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.",
    imagen: fotoFormacion,
    fecha: "2025-02-20",
    categoria: "Institucional",
    slug: "4",
  },
];

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "";

  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
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
        ] | order(fecha desc) {
          _id,
          titulo,
          "slug": slug.current,
          fecha,
          categoria,
          extracto,
          imagenPrincipal
        }
      `)
      .then((data) => {
        console.log("Noticias desde Sanity:", data);

        setNoticias(data || []);
        setCargando(false);
      })
      .catch((error) => {
        console.error(
          "Error cargando Noticias desde Sanity:",
          error
        );

        setCargando(false);
      });
  }, []);

  const posts =
    noticias.length > 0
      ? noticias.map((noticia) => ({
          _id: noticia._id,
          titulo: noticia.titulo || "Noticia",
          extracto: noticia.extracto || "",
          fecha: noticia.fecha || "",
          categoria: noticia.categoria || "Noticias",
          slug: noticia.slug || "",
          imagen: noticia.imagenPrincipal
            ? urlFor(noticia.imagenPrincipal)
                .width(1000)
                .height(625)
                .url()
            : fotoEquipo,
        }))
      : fallbackPosts;

  return (
    <Layout>

      {/* HERO */}

      <section className="relative h-[40vh] min-h-[300px] flex items-end bg-navy overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />

        <div className="container mx-auto px-4 pb-16 relative z-10">

          <div className="w-16 h-1 bg-gold mb-6" />

          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">
            Noticias
          </h1>

          <p className="text-primary-foreground/70 text-lg mt-3">
            Novedades de la Quinta Compañía
          </p>

        </div>

      </section>

      {/* NOTICIAS */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          {cargando ? (

            <div className="text-center py-20 text-muted-foreground">
              Cargando noticias...
            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

              {posts.map((post) => (

                <Link
                  key={post._id}
                  to={`/noticias/${post.slug}`}
                  className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border"
                >

                  <div className="aspect-[16/10] overflow-hidden">

                    <img
                      src={post.imagen}
                      alt={post.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  </div>

                  <div className="p-6">

                    <div className="flex items-center gap-3 mb-3">

                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {post.categoria}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {formatearFecha(post.fecha)}
                      </span>

                    </div>

                    <h3 className="font-extrabold text-foreground text-lg leading-snug group-hover:text-primary transition-colors mb-2">
                      {post.titulo}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {post.extracto}
                    </p>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

    </Layout>
  );
};

export default Noticias;