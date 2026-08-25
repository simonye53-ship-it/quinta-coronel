import {useEffect, useState} from "react";
import Layout from "@/components/Layout";
import {
  Flame,
  GraduationCap,
  HandHeart,
  HardHat,
  UsersRound,
  Wrench,
} from "lucide-react";
import escudos from "@/assets/escudos-traslapados.png";
import {sanityClient, urlFor} from "../lib/sanity";

interface Beneficio {
  _key?: string;
  tipo?: "equipamiento" | "capacitacion" | "comunidad";
  titulo?: string;
  descripcion?: string;
}

interface HazteSocioContent {
  heroTitulo?: string;
  heroSubtitulo?: string;

  seccionTitulo?: string;
  texto1?: string;
  texto2?: string;

  botonTexto?: string;
  botonLink?: string;

  imagen?: any;
  imagenAlt?: string;

  beneficios?: Beneficio[];
}

const beneficiosFallback = [
  {
    tipo: "equipamiento",
    titulo: "Equipamiento",
    descripcion:
      "Tu aporte financia equipos de protección personal y herramientas de rescate de última generación.",
  },
  {
    tipo: "capacitacion",
    titulo: "Capacitación",
    descripcion:
      "Apoyamos la formación continua de nuestros voluntarios en técnicas avanzadas de rescate.",
  },
  {
    tipo: "comunidad",
    titulo: "Comunidad",
    descripcion:
      "Cada peso invertido vuelve a la comunidad en forma de mejor servicio y respuesta más rápida.",
  },
];

const HazteSocio = () => {
  const [contenido, setContenido] =
    useState<HazteSocioContent | null>(null);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<HazteSocioContent>(
        `*[_type == "hazteSocio"][0]{
          heroTitulo,
          heroSubtitulo,
          seccionTitulo,
          texto1,
          texto2,
          botonTexto,
          botonLink,
          imagen,
          imagenAlt,
          beneficios
        }`
      )
      .then((data) => {
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Hazte Socio desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // FALLBACKS
  // =====================================================

  const beneficios =
    contenido?.beneficios &&
    contenido.beneficios.length > 0
      ? contenido.beneficios
      : beneficiosFallback;

  const imagenPrincipal = contenido?.imagen
    ? urlFor(contenido.imagen)
        .width(900)
        .url()
    : escudos;

  const getIcon = (tipo?: string) => {
    if (tipo === "capacitacion") {
      return {
        Icon: GraduationCap,
        Detail: Flame,
        gradient: "from-secondary/20 via-secondary/10 to-gold/20",
        accent: "bg-secondary text-secondary-foreground",
      };
    }

    if (tipo === "comunidad") {
      return {
        Icon: HandHeart,
        Detail: UsersRound,
        gradient: "from-primary/20 via-primary/10 to-gold/20",
        accent: "bg-primary text-primary-foreground",
      };
    }

    return {
      Icon: HardHat,
      Detail: Wrench,
      gradient: "from-gold/30 via-gold/10 to-secondary/15",
      accent: "bg-gold text-gold-foreground",
    };
  };

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

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase text-primary-foreground">
              {contenido?.heroTitulo ||
                "Hazte Socio"}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-primary-foreground/70 mt-3 max-w-2xl leading-relaxed">
              {contenido?.heroSubtitulo ||
                "Apoya a tu Quinta Compañía"}
            </p>

          </div>

        </div>

      </section>

      {/* =====================================================
          CONTENIDO PRINCIPAL
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">

              {/* =================================================
                  TEXTO
              ================================================= */}

              <div>

                <div className="w-16 h-1 bg-secondary mb-6" />

                <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-foreground mb-4 leading-tight">
                  {contenido?.seccionTitulo ||
                    "Tu aporte hace la diferencia"}
                </h2>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
                  {contenido?.texto1 ||
                    "La Quinta Compañía del Cuerpo de Bomberos de Coronel es una institución sin fines de lucro que depende del apoyo de la comunidad para mantener su operación y equipamiento."}
                </p>

                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                  {contenido?.texto2 ||
                    "Al hacerte socio colaborador, contribuyes directamente a la adquisición de equipos, mantenimiento de vehículos, capacitación de voluntarios y mejoras en nuestro cuartel."}
                </p>

                {/* BOTÓN CENTRADO EN MÓVIL */}

                <div className="flex justify-center md:justify-start">

                  <a
                    href={
                      contenido?.botonLink ||
                      "https://app.reveniu.com/quintacoronel"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-secondary text-secondary-foreground font-bold uppercase text-xs md:text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity text-center"
                  >
                    {contenido?.botonTexto ||
                      "Hazte Socio ahora"}
                  </a>

                </div>

              </div>

              {/* =================================================
                  IMAGEN / LOGO
              ================================================= */}

              <div className="flex justify-center mt-2 md:mt-0">

                <img
                  src={imagenPrincipal}
                  alt={
                    contenido?.imagenAlt ||
                    "Escudos de la compañía"
                  }
                  className="max-w-[220px] sm:max-w-[260px] md:max-w-xs w-full mx-auto"
                />

              </div>

            </div>

            {/* =====================================================
                BENEFICIOS
            ===================================================== */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {beneficios.map((item, index) => {

                const {Icon, Detail, gradient, accent} = getIcon(item.tipo);

                return (
                  <div
                    key={
                      item._key ||
                      `${item.titulo}-${index}`
                    }
                    className="group bg-card rounded-xl p-8 border border-border text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                  >

                    <div className={`relative w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-6 ring-1 ring-border/70 transition-transform duration-300 group-hover:scale-105`}>

                      <div className="absolute inset-2 rounded-xl border border-white/60" aria-hidden="true" />

                      <Icon className="h-11 w-11 text-foreground" strokeWidth={1.7} aria-hidden="true" />

                      <span className={`absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full ${accent} shadow-md ring-4 ring-card`}>
                        <Detail className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                      </span>

                    </div>

                    <h3 className="text-sm md:text-base font-extrabold uppercase text-foreground mb-2">
                      {item.titulo ||
                        "Beneficio"}
                    </h3>

                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {item.descripcion || ""}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </section>

    </Layout>
  );
};

export default HazteSocio;
