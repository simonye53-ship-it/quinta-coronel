import {useEffect, useState} from "react";
import Layout from "@/components/Layout";
import {ArrowRight} from "lucide-react";

import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

interface Especialidad {
  _key?: string;
  titulo?: string;
  texto1?: string;
  texto2?: string;
}

interface ImagenGaleria {
  _key?: string;
  imagen?: any;
  alt?: string;
}

interface EspecialidadesContent {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroImagen?: any;
  heroAlt?: string;

  videoTitulo?: string;
  videoSubtitulo?: string;
  videoArchivoUrl?: string;

  seccionTitulo?: string;
  listaEspecialidades?: Especialidad[];

  galeriaTitulo?: string;
  galeria?: ImagenGaleria[];

  ctaTitulo?: string;
  ctaBoton?: string;
  ctaLink?: string;
}

// =====================================================
// CONTENIDO LOCAL DE RESPALDO
// =====================================================

const defaultEspecialidades: Especialidad[] = [
  {
    titulo: "Rescate Vehicular",
    texto1:
      "Nuestra compañía cuenta con un equipo altamente capacitado en técnicas de rescate vehicular, utilizando herramientas hidráulicas Holmatro de última generación. Realizamos entrenamientos constantes para mantener nuestras habilidades al más alto nivel.",
    texto2:
      "Atendemos accidentes vehiculares de distinta complejidad, desde colisiones simples hasta volcamientos y atrapamientos múltiples, siempre con el objetivo de preservar la vida humana.",
  },

  {
    titulo: "Rescate en Cuerdas",
    texto1:
      "Contamos con personal certificado en técnicas de rescate en altura y espacios confinados. Nuestro equipo puede operar en situaciones complejas que requieren el uso de sistemas de cuerdas y equipamiento especializado.",
    texto2:
      "La formación continua en estas disciplinas nos permite responder con eficacia ante emergencias que demandan habilidades técnicas avanzadas.",
  },
];

const Especialidades = () => {
  const [contenido, setContenido] =
    useState<EspecialidadesContent | null>(null);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<EspecialidadesContent>(`
        *[_type == "especialidades"][0]{
          heroTitulo,
          heroSubtitulo,
          heroImagen,
          heroAlt,

          videoTitulo,
          videoSubtitulo,
          "videoArchivoUrl": videoArchivo.asset->url,

          seccionTitulo,
          listaEspecialidades,

          galeriaTitulo,
          galeria,

          ctaTitulo,
          ctaBoton,
          ctaLink
        }
      `)
      .then((data) => {
        console.log("Especialidades desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Especialidades desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // HERO
  // =====================================================

  const heroImage = contenido?.heroImagen
    ? urlFor(contenido.heroImagen).width(1920).url()
    : fotoRescate;

  const heroTitle =
    contenido?.heroTitulo || "Especialidades";

  const heroSubtitle =
    contenido?.heroSubtitulo ||
    "Formación especializada para salvar vidas";

  const heroAlt =
    contenido?.heroAlt || "Rescate Vehicular";

  // =====================================================
  // ESPECIALIDADES
  // =====================================================

  const especialidades =
    contenido?.listaEspecialidades &&
    contenido.listaEspecialidades.length > 0
      ? contenido.listaEspecialidades
      : defaultEspecialidades;

  // =====================================================
  // GALERÍA
  // =====================================================

  const defaultGaleria = [
    {
      src: fotoRescate,
      alt: "Trabajo de rescate vehicular",
    },
    {
      src: fotoEquipo,
      alt: "Equipo de rescate",
    },
    {
      src: fotoComunidad,
      alt: "Trabajo con la comunidad",
    },
  ];

  const galeria =
    contenido?.galeria && contenido.galeria.length > 0
      ? contenido.galeria
          .filter((item) => item.imagen)
          .map((item, index) => ({
            src: urlFor(item.imagen)
              .width(1000)
              .height(750)
              .url(),

            alt:
              item.alt ||
              `Trabajo de la Quinta Compañía ${index + 1}`,
          }))
      : defaultGaleria;

  return (
    <Layout>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">

        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />

        <div className="hero-overlay absolute inset-0" />

        <div className="container mx-auto px-4 pb-16 relative z-10">

          <div className="w-16 h-1 bg-gold mb-6" />

          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">
            {heroTitle}
          </h1>

          <p className="text-primary-foreground/70 text-lg mt-3">
            {heroSubtitle}
          </p>

        </div>

      </section>

      {/* =====================================================
          VIDEO
      ===================================================== */}

      <section className="bg-navy py-16">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">

            {contenido?.videoArchivoUrl ? (

              <video
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video rounded-lg bg-black object-contain"
              >
                <source
                  src={contenido.videoArchivoUrl}
                />

                Tu navegador no puede reproducir este video.
              </video>

            ) : (

              <div className="aspect-video bg-foreground/10 rounded-lg flex items-center justify-center">

                <div className="text-center text-navy-foreground/50">

                  <div className="w-20 h-20 rounded-full border-2 border-navy-foreground/30 flex items-center justify-center mx-auto mb-4">

                    <div
                      className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-navy-foreground/50 ml-1"
                      style={{
                        borderLeftWidth: "14px",
                      }}
                    />

                  </div>

                  <p className="font-bold uppercase text-sm tracking-wider">
                    {contenido?.videoTitulo ||
                      "Video de Rescate Vehicular"}
                  </p>

                  <p className="text-xs mt-1">
                    {contenido?.videoSubtitulo ||
                      "Próximamente"}
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          ESPECIALIDADES
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="text-center mb-14">

            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />

            <h2 className="section-title text-foreground">
              {contenido?.seccionTitulo ||
                "Nuestras Especialidades"}
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">

            {especialidades.map(
              (especialidad, index) => (

                <div
                  key={`${especialidad.titulo}-${index}`}
                >

                  <h3 className="text-xl font-extrabold uppercase text-foreground mb-4">
                    {especialidad.titulo ||
                      "Especialidad"}
                  </h3>

                  {especialidad.texto1 && (

                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {especialidad.texto1}
                    </p>

                  )}

                  {especialidad.texto2 && (

                    <p className="text-muted-foreground leading-relaxed">
                      {especialidad.texto2}
                    </p>

                  )}

                </div>

              )
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          GALERÍA
      ===================================================== */}

      <section className="py-16 bg-muted">

        <div className="container mx-auto px-4">

          <h2 className="section-title text-foreground text-center mb-10">
            {contenido?.galeriaTitulo ||
              "Nuestro Trabajo"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {galeria.map((imagen, index) => (

              <div
                key={`${imagen.alt}-${index}`}
                className="aspect-[4/3] rounded-lg overflow-hidden"
              >

                <img
                  src={imagen.src}
                  alt={imagen.alt}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-primary py-14">

        <div className="container mx-auto px-4 text-center">

          <h2 className="text-2xl font-black uppercase text-primary-foreground mb-4">

            {contenido?.ctaTitulo ||
              "Conoce nuestro trabajo en redes sociales"}

          </h2>

          <a
            href={contenido?.ctaLink || "#"}
            target={
              contenido?.ctaLink
                ? "_blank"
                : undefined
            }
            rel={
              contenido?.ctaLink
                ? "noopener noreferrer"
                : undefined
            }
            className="inline-flex items-center gap-2 bg-gold text-gold-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >

            {contenido?.ctaBoton || "Síguenos"}

            <ArrowRight className="h-4 w-4" />

          </a>

        </div>

      </section>

    </Layout>
  );
};

export default Especialidades;