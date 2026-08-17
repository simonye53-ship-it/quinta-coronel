import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {motion, AnimatePresence} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

import Layout from "@/components/Layout";

import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

interface InicioContent {
  slider1Titulo?: string;
  slider1Subtitulo?: string;
  slider1Descripcion?: string;
  slider1Imagen?: any;

  slider2Titulo?: string;
  slider2Subtitulo?: string;
  slider2Descripcion?: string;
  slider2Imagen?: any;

  slider3Titulo?: string;
  slider3Subtitulo?: string;
  slider3Descripcion?: string;
  slider3Imagen?: any;

  accesoHistoria?: string;
  accesoOficialidad?: string;
  accesoMaterial?: string;
  accesoContacto?: string;

  novedadesTitulo?: string;
  novedadesDescripcion?: string;
  novedadesBoton?: string;

  redesTitulo?: string;
  redesTexto?: string;

  redesImagen1?: any;
  redesImagen2?: any;
  redesImagen3?: any;
  redesImagen4?: any;

  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;

  socioTitulo?: string;
  socioTexto?: string;
  socioBoton?: string;
  socioLink?: string;
}

interface NoticiaInicio {
  _id: string;
  titulo?: string;
  slug?: string;
  fecha?: string;
  categoria?: string;
  imagenPrincipal?: any;

  contenido?: {
    _key?: string;
    _type?: string;
    style?: string;

    children?: {
      _key?: string;
      _type?: string;
      text?: string;
    }[];
  }[];
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [contenido, setContenido] =
    useState<InicioContent | null>(null);

  const [noticiasInicio, setNoticiasInicio] =
    useState<NoticiaInicio[]>([]);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<InicioContent>(
        `*[_type == "inicio" && _id == "inicio"][0]`
      )
      .then((data) => {
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando contenido de Inicio:",
          error
        );
      });

    sanityClient
      .fetch<NoticiaInicio[]>(`
        *[
          _type == "noticia" &&
          defined(slug.current)
        ]
        | order(fecha desc)[0...4] {
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
        setNoticiasInicio(data || []);
      })
      .catch((error) => {
        console.error(
          "Error cargando noticias del inicio:",
          error
        );
      });
  }, []);

  // =====================================================
  // SLIDES
  // =====================================================

  const slides = [
    {
      image: contenido?.slider1Imagen
        ? urlFor(contenido.slider1Imagen)
            .width(1920)
            .url()
        : hero1,

      title:
        contenido?.slider1Titulo ||
        "Honor y Sacrificio",

      subtitle:
        contenido?.slider1Subtitulo ||
        "Quinta Compañía del Cuerpo de Bomberos de Coronel",

      description:
        contenido?.slider1Descripcion ||
        "Desde 1951 al servicio de nuestra comunidad",
    },

    {
      image: contenido?.slider2Imagen
        ? urlFor(contenido.slider2Imagen)
            .width(1920)
            .url()
        : hero2,

      title:
        contenido?.slider2Titulo ||
        "Rescate Vehicular",

      subtitle:
        contenido?.slider2Subtitulo ||
        "Especialistas en salvar vidas",

      description:
        contenido?.slider2Descripcion ||
        "Formación continua en técnicas de rescate de última generación",
    },

    {
      image: contenido?.slider3Imagen
        ? urlFor(contenido.slider3Imagen)
            .width(1920)
            .url()
        : hero3,

      title:
        contenido?.slider3Titulo ||
        "Nuestro Cuartel",

      subtitle:
        contenido?.slider3Subtitulo ||
        "Bomba Reino de Bélgica",

      description:
        contenido?.slider3Descripcion ||
        "Equipamiento y tecnología al servicio de Coronel",
    },
  ];

  // =====================================================
  // CAMBIO AUTOMÁTICO DEL SLIDER
  // =====================================================

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCurrentSlide((prev) => {
        return (prev + 1) % 3;
      });
    }, 6000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentSlide]);

  // =====================================================
  // CONTROLES DEL SLIDER
  // =====================================================

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  // =====================================================
  // ACCESOS RÁPIDOS
  // =====================================================

  const quickLinks = [
    {
      label: "Nuestra Historia",
      path:
        contenido?.accesoHistoria ||
        "/historia",
    },

    {
      label: "Oficialidad",
      path:
        contenido?.accesoOficialidad ||
        "/oficialidad",
    },

    {
      label: "Material Mayor",
      path:
        contenido?.accesoMaterial ||
        "/material-mayor",
    },

    {
      label: "Contacto",
      path:
        contenido?.accesoContacto ||
        "/contacto",
    },
  ];

  // =====================================================
  // NOVEDADES
  // =====================================================

  const obtenerExtracto = (
    contenidoNoticia?: NoticiaInicio["contenido"],
    limite = 110
  ) => {
    if (!contenidoNoticia) return "";

    const texto = contenidoNoticia
      .filter(
        (block) =>
          block._type === "block"
      )
      .map(
        (block) =>
          block.children
            ?.map(
              (child) =>
                child.text || ""
            )
            .join("") || ""
      )
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (texto.length <= limite) {
      return texto;
    }

    return `${texto
      .slice(0, limite)
      .trim()}...`;
  };

  const formatearFecha = (
    fecha?: string
  ) => {
    if (!fecha) return "";

    return new Intl.DateTimeFormat(
      "es-CL",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }
    ).format(
      new Date(
        `${fecha}T00:00:00Z`
      )
    );
  };

  // =====================================================
  // REDES SOCIALES
  // =====================================================

  const socialLinks = [
    {
      icon: Facebook,
      label: "Facebook",
      href:
        contenido?.facebookUrl || "#",
    },

    {
      icon: Instagram,
      label: "Instagram",
      href:
        contenido?.instagramUrl || "#",
    },

    {
      icon: Youtube,
      label: "YouTube",
      href:
        contenido?.youtubeUrl || "#",
    },
  ];

  return (
    <Layout>

      {/* =====================================================
          HERO SLIDER
      ===================================================== */}

      <section className="relative h-screen w-full overflow-hidden">

        <AnimatePresence mode="wait">

          <motion.div
            key={currentSlide}
            initial={{
              opacity: 0,
              scale: 1.05,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.8,
            }}
            className="absolute inset-0"
          >

            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />

            <div className="hero-overlay absolute inset-0" />

          </motion.div>

        </AnimatePresence>

        {/* =====================================================
            CONTENIDO DEL SLIDE
        ===================================================== */}

        <div className="absolute inset-0 flex items-end pb-32 md:pb-40">

          <div className="container mx-auto px-4">

            <AnimatePresence mode="wait">

              <motion.div
                key={`texto-${currentSlide}`}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -15,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.15,
                }}
                className="max-w-2xl"
              >

                <div className="w-16 h-1 bg-gold mb-6" />

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-primary-foreground leading-tight mb-4">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-sm sm:text-base md:text-lg font-semibold text-gold uppercase tracking-wider mb-3">
                  {slides[currentSlide].subtitle}
                </p>

                <p className="text-primary-foreground/80 text-sm md:text-base max-w-lg leading-relaxed">
                  {slides[currentSlide].description}
                </p>

              </motion.div>

            </AnimatePresence>

          </div>

        </div>

        {/* =====================================================
            CONTROLES DEL SLIDER
        ===================================================== */}

        <div className="absolute bottom-10 left-0 right-0">

          <div className="container mx-auto px-4 flex items-center justify-between">

            <div className="flex gap-2">

              {slides.map((_, i) => (

                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    goToSlide(i)
                  }
                  aria-label={`Ir al slide ${i + 1}`}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? "w-12 bg-gold"
                      : "w-6 bg-primary-foreground/30"
                  }`}
                />

              ))}

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={prevSlide}
                aria-label="Slide anterior"
                className="p-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={nextSlide}
                aria-label="Slide siguiente"
                className="p-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          ACCESOS RÁPIDOS
      ===================================================== */}

      <section className="bg-primary">

        <div className="container mx-auto px-4">

          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/10">

            {quickLinks.map(
              (item) => (

                <Link
                  key={item.label}
                  to={item.path}
                  className="py-5 px-4 text-center text-primary-foreground font-bold text-[11px] sm:text-xs md:text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors flex items-center justify-center gap-2"
                >

                  {item.label}

                  <ArrowRight className="h-3 w-3 flex-shrink-0" />

                </Link>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          NOVEDADES
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="text-center mb-14">

            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />

            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-foreground">
              {contenido?.novedadesTitulo ||
                "Novedades"}
            </h2>

            <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-lg mx-auto leading-relaxed">
              {contenido?.novedadesDescripcion ||
                "Últimas noticias y actividades de la Quinta Compañía"}
            </p>

          </div>

          {noticiasInicio.length > 0 ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {noticiasInicio.map(
                (item) => {

                  const imagen =
                    item.imagenPrincipal
                      ? urlFor(
                          item.imagenPrincipal
                        )
                          .width(900)
                          .height(675)
                          .url()
                      : fotoEquipo;

                  const extracto =
                    obtenerExtracto(
                      item.contenido
                    );

                  return (

                    <Link
                      key={item._id}
                      to={`/noticias/${item.slug}`}
                      className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border"
                    >

                      <div className="aspect-[4/3] overflow-hidden">

                        <img
                          src={imagen}
                          alt={
                            item.titulo ||
                            "Noticia"
                          }
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                      </div>

                      <div className="p-5">

                        <div className="flex flex-wrap items-center gap-2">

                          {item.categoria && (

                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                              {item.categoria}
                            </span>

                          )}

                          {item.fecha && (

                            <span className="text-xs text-muted-foreground">
                              {formatearFecha(
                                item.fecha
                              )}
                            </span>

                          )}

                        </div>

                        <h3 className="font-bold text-foreground mt-2 mb-2 text-sm leading-snug group-hover:text-primary transition-colors">
                          {item.titulo ||
                            "Noticia"}
                        </h3>

                        {extracto && (

                          <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                            {extracto}
                          </p>

                        )}

                      </div>

                    </Link>

                  );
                }
              )}

            </div>

          ) : (

            <div className="text-center py-8">

              <p className="text-muted-foreground">
                Próximamente publicaremos nuevas noticias y actividades.
              </p>

            </div>

          )}

          <div className="text-center mt-10">

            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold uppercase text-xs md:text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >

              {contenido?.novedadesBoton ||
                "Ver todas las noticias"}

              <ArrowRight className="h-4 w-4" />

            </Link>

          </div>

        </div>

      </section>

      {/* =====================================================
          REDES SOCIALES
      ===================================================== */}

      <section className="bg-navy py-20">

        <div className="container mx-auto px-4">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            <div>

              <div className="w-16 h-1 bg-gold mb-6" />

              <h2 className="text-2xl md:text-3xl font-black uppercase text-navy-foreground leading-tight mb-4">
                {contenido?.redesTitulo ||
                  "Síguenos en Redes Sociales"}
              </h2>

              <p className="text-navy-foreground/70 text-sm md:text-base mb-8 max-w-md leading-relaxed">
                {contenido?.redesTexto ||
                  "Mantente informado sobre nuestras actividades, entrenamientos y servicios a la comunidad de Coronel."}
              </p>

              <div className="flex flex-wrap gap-4">

                {socialLinks.map(
                  (social) => (

                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-navy-foreground/10 text-navy-foreground hover:bg-gold hover:text-gold-foreground px-5 py-3 rounded-md font-bold text-xs md:text-sm uppercase tracking-wider transition-colors"
                    >

                      <social.icon className="h-5 w-5" />

                      {social.label}

                    </a>

                  )
                )}

              </div>

            </div>

            {/* =================================================
                FOTOGRAFÍAS
            ================================================= */}

            <div className="grid grid-cols-2 gap-3">

              <img
                src={
                  contenido?.redesImagen1
                    ? urlFor(
                        contenido.redesImagen1
                      )
                        .width(800)
                        .height(800)
                        .url()
                    : fotoEquipo
                }
                alt="Equipo de rescate"
                loading="lazy"
                className="rounded-lg object-cover w-full aspect-square"
              />

              <img
                src={
                  contenido?.redesImagen2
                    ? urlFor(
                        contenido.redesImagen2
                      )
                        .width(800)
                        .height(800)
                        .url()
                    : fotoComunidad
                }
                alt="Comunidad"
                loading="lazy"
                className="rounded-lg object-cover w-full aspect-square mt-6"
              />

              <img
                src={
                  contenido?.redesImagen3
                    ? urlFor(
                        contenido.redesImagen3
                      )
                        .width(800)
                        .height(800)
                        .url()
                    : fotoFormacion
                }
                alt="Formación"
                loading="lazy"
                className="rounded-lg object-cover w-full aspect-square -mt-6"
              />

              <img
                src={
                  contenido?.redesImagen4
                    ? urlFor(
                        contenido.redesImagen4
                      )
                        .width(800)
                        .height(800)
                        .url()
                    : fotoRescate
                }
                alt="Rescate"
                loading="lazy"
                className="rounded-lg object-cover w-full aspect-square"
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          HAZTE SOCIO
      ===================================================== */}

      <section className="bg-secondary py-14">

        <div className="container mx-auto px-4 text-center">

          <h2 className="text-xl md:text-2xl font-black uppercase text-secondary-foreground mb-3">
            {contenido?.socioTitulo ||
              "¿Quieres apoyar a tu Quinta Compañía?"}
          </h2>

          <p className="text-sm md:text-base text-secondary-foreground/80 mb-6 max-w-lg mx-auto leading-relaxed">
            {contenido?.socioTexto ||
              "Hazte socio colaborador con un aporte mensual y ayúdanos a seguir sirviendo a Coronel."}
          </p>

          <a
            href={
              contenido?.socioLink ||
              "https://app.reveniu.com/quintacoronel"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-navy text-navy-foreground font-bold uppercase text-xs md:text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity"
          >

            {contenido?.socioBoton ||
              "Hazte Socio Ahora"}

          </a>

        </div>

      </section>

    </Layout>
  );
};

export default Index;