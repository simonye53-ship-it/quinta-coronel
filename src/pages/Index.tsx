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

  noticia1Titulo?: string;
  noticia1Fecha?: string;
  noticia1Texto?: string;
  noticia1Imagen?: any;

  noticia2Titulo?: string;
  noticia2Fecha?: string;
  noticia2Texto?: string;
  noticia2Imagen?: any;

  noticia3Titulo?: string;
  noticia3Fecha?: string;
  noticia3Texto?: string;
  noticia3Imagen?: any;

  noticia4Titulo?: string;
  noticia4Fecha?: string;
  noticia4Texto?: string;
  noticia4Imagen?: any;

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

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contenido, setContenido] = useState<InicioContent | null>(null);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<InicioContent>(`*[_type == "inicio"][0]`)
      .then((data) => {
        console.log("Contenido desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error("Error cargando Sanity:", error);
      });
  }, []);

  // =====================================================
  // SLIDER
  // =====================================================

  const slides = [
    {
      image: contenido?.slider1Imagen
        ? urlFor(contenido.slider1Imagen).width(1920).url()
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
        ? urlFor(contenido.slider2Imagen).width(1920).url()
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
        ? urlFor(contenido.slider3Imagen).width(1920).url()
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

  // Cambio automático del slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  const nextSlide = () => {
    setCurrentSlide(
      (prev) => (prev + 1) % slides.length
    );
  };

  // =====================================================
  // ACCESOS RÁPIDOS
  // =====================================================

  const quickLinks = [
    {
      label: "Nuestra Historia",
      path: contenido?.accesoHistoria || "/historia",
    },
    {
      label: "Oficialidad",
      path: contenido?.accesoOficialidad || "/oficialidad",
    },
    {
      label: "Material Mayor",
      path: contenido?.accesoMaterial || "/material-mayor",
    },
    {
      label: "Contacto",
      path: contenido?.accesoContacto || "/contacto",
    },
  ];

  // =====================================================
  // NOVEDADES
  // =====================================================

  const newsItems = [
    {
      id: 1,

      title:
        contenido?.noticia1Titulo ||
        "Entrenamiento de Rescate Vehicular 2025",

      excerpt:
        contenido?.noticia1Texto ||
        "Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro.",

      image: contenido?.noticia1Imagen
        ? urlFor(contenido.noticia1Imagen).width(900).url()
        : fotoRescate,

      date:
        contenido?.noticia1Fecha ||
        "15 Mar 2025",
    },

    {
      id: 2,

      title:
        contenido?.noticia2Titulo ||
        "Jornada Comunitaria en Lagunillas",

      excerpt:
        contenido?.noticia2Texto ||
        "La compañía participó en una actividad comunitaria con los vecinos del sector, acercando la labor bomberil a los más pequeños.",

      image: contenido?.noticia2Imagen
        ? urlFor(contenido.noticia2Imagen).width(900).url()
        : fotoComunidad,

      date:
        contenido?.noticia2Fecha ||
        "28 Feb 2025",
    },

    {
      id: 3,

      title:
        contenido?.noticia3Titulo ||
        "Nuevo Equipamiento para la Compañía",

      excerpt:
        contenido?.noticia3Texto ||
        "Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.",

      image: contenido?.noticia3Imagen
        ? urlFor(contenido.noticia3Imagen).width(900).url()
        : fotoEquipo,

      date:
        contenido?.noticia3Fecha ||
        "10 Feb 2025",
    },

    {
      id: 4,

      title:
        contenido?.noticia4Titulo ||
        "Ceremonia de Aniversario 74°",

      excerpt:
        contenido?.noticia4Texto ||
        "La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.",

      image: contenido?.noticia4Imagen
        ? urlFor(contenido.noticia4Imagen).width(900).url()
        : fotoFormacion,

      date:
        contenido?.noticia4Fecha ||
        "20 Feb 2025",
    },
  ];

  // =====================================================
  // REDES SOCIALES
  // =====================================================

  const socialLinks = [
    {
      icon: Facebook,
      label: "Facebook",
      href: contenido?.facebookUrl || "#",
    },
    {
      icon: Instagram,
      label: "Instagram",
      href: contenido?.instagramUrl || "#",
    },
    {
      icon: Youtube,
      label: "YouTube",
      href: contenido?.youtubeUrl || "#",
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
            initial={{opacity: 0, scale: 1.1}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0}}
            transition={{duration: 1.2}}
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

        {/* CONTENIDO DEL SLIDE */}

        <div className="absolute inset-0 flex items-end pb-32 md:pb-40">

          <div className="container mx-auto px-4">

            <AnimatePresence mode="wait">

              <motion.div
                key={currentSlide}
                initial={{opacity: 0, y: 40}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -20}}
                transition={{duration: 0.8, delay: 0.3}}
                className="max-w-2xl"
              >

                <div className="w-16 h-1 bg-gold mb-6" />

                <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground leading-tight mb-4">
                  {slides[currentSlide].title}
                </h1>

                <p className="text-lg md:text-xl font-semibold text-gold uppercase tracking-wider mb-3">
                  {slides[currentSlide].subtitle}
                </p>

                <p className="text-primary-foreground/80 text-base md:text-lg max-w-lg">
                  {slides[currentSlide].description}
                </p>

              </motion.div>

            </AnimatePresence>

          </div>

        </div>

        {/* CONTROLES DEL SLIDER */}

        <div className="absolute bottom-10 left-0 right-0">

          <div className="container mx-auto px-4 flex items-center justify-between">

            <div className="flex gap-2">

              {slides.map((_, i) => (

                <button
                  key={i}
                  onClick={() => goToSlide(i)}
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
                onClick={prevSlide}
                className="p-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                onClick={nextSlide}
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

            {quickLinks.map((item) => (

              <Link
                key={item.label}
                to={item.path}
                className="py-5 px-4 text-center text-primary-foreground font-bold text-xs md:text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors flex items-center justify-center gap-2"
              >

                {item.label}

                <ArrowRight className="h-3 w-3" />

              </Link>

            ))}

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

            <h2 className="section-title text-foreground">
              {contenido?.novedadesTitulo || "Novedades"}
            </h2>

            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              {contenido?.novedadesDescripcion ||
                "Últimas noticias y actividades de la Quinta Compañía"}
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {newsItems.map((item) => (

              <Link
                key={item.id}
                to={`/noticias/${item.id}`}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border"
              >

                <div className="aspect-[4/3] overflow-hidden">

                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                </div>

                <div className="p-5">

                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {item.date}
                  </span>

                  <h3 className="font-bold text-foreground mt-2 mb-2 text-sm leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>

                </div>

              </Link>

            ))}

          </div>

          <div className="text-center mt-10">

            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >

              {contenido?.novedadesBoton || "Ver Todas las Noticias"}

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

              <h2 className="text-3xl md:text-4xl font-black uppercase text-navy-foreground leading-tight mb-4">
                {contenido?.redesTitulo ||
                  "Síguenos en Redes Sociales"}
              </h2>

              <p className="text-navy-foreground/70 mb-8 max-w-md">
                {contenido?.redesTexto ||
                  "Mantente informado sobre nuestras actividades, entrenamientos y servicios a la comunidad de Coronel."}
              </p>

              <div className="flex flex-wrap gap-4">

                {socialLinks.map((social) => (

                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-navy-foreground/10 text-navy-foreground hover:bg-gold hover:text-gold-foreground px-5 py-3 rounded-md font-bold text-sm uppercase tracking-wider transition-colors"
                  >

                    <social.icon className="h-5 w-5" />

                    {social.label}

                  </a>

                ))}

              </div>

            </div>

            {/* FOTOGRAFÍAS CONTROLADAS POR SANITY */}

            <div className="grid grid-cols-2 gap-3">

              <img
                src={
                  contenido?.redesImagen1
                    ? urlFor(contenido.redesImagen1)
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
                    ? urlFor(contenido.redesImagen2)
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
                    ? urlFor(contenido.redesImagen3)
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
                    ? urlFor(contenido.redesImagen4)
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

          <h2 className="text-2xl md:text-3xl font-black uppercase text-secondary-foreground mb-3">
            {contenido?.socioTitulo ||
              "¿Quieres apoyar a tu Quinta Compañía?"}
          </h2>

          <p className="text-secondary-foreground/80 mb-6 max-w-lg mx-auto">
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
            className="inline-block bg-navy text-navy-foreground font-bold uppercase text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity"
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