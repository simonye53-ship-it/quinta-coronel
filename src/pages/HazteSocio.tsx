import {useEffect, useState} from "react";
import Layout from "@/components/Layout";
import {Heart, Shield, Users} from "lucide-react";
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
        console.log("Hazte Socio desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Hazte Socio desde Sanity:",
          error
        );
      });
  }, []);

  const beneficios =
    contenido?.beneficios && contenido.beneficios.length > 0
      ? contenido.beneficios
      : beneficiosFallback;

  const imagenPrincipal = contenido?.imagen
    ? urlFor(contenido.imagen)
        .width(900)
        .url()
    : escudos;

  const getIcon = (tipo?: string) => {
    if (tipo === "capacitacion") {
      return Users;
    }

    if (tipo === "comunidad") {
      return Heart;
    }

    return Shield;
  };

  return (
    <Layout>

      {/* HERO */}

      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20" />

        <div className="container mx-auto px-4 pb-16 relative z-10">

          <div className="w-16 h-1 bg-gold mb-6" />

          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">
            {contenido?.heroTitulo || "Hazte Socio"}
          </h1>

          <p className="text-primary-foreground/70 text-lg mt-3">
            {contenido?.heroSubtitulo ||
              "Apoya a tu Quinta Compañía"}
          </p>

        </div>

      </section>

      {/* CONTENIDO */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="max-w-4xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">

              <div>

                <div className="w-16 h-1 bg-secondary mb-6" />

                <h2 className="text-3xl font-extrabold uppercase text-foreground mb-4">
                  {contenido?.seccionTitulo ||
                    "Tu aporte hace la diferencia"}
                </h2>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {contenido?.texto1 ||
                    "La Quinta Compañía del Cuerpo de Bomberos de Coronel es una institución sin fines de lucro que depende del apoyo de la comunidad para mantener su operación y equipamiento."}
                </p>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {contenido?.texto2 ||
                    "Al hacerte socio colaborador, contribuyes directamente a la adquisición de equipos, mantenimiento de vehículos, capacitación de voluntarios y mejoras en nuestro cuartel."}
                </p>

                <a
                  href={
                    contenido?.botonLink ||
                    "https://app.reveniu.com/quintacoronel"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity"
                >
                  {contenido?.botonTexto ||
                    "Pagar Cuota de Socio"}
                </a>

              </div>

              <div className="flex justify-center">

                <img
                  src={imagenPrincipal}
                  alt={
                    contenido?.imagenAlt ||
                    "Escudos de la compañía"
                  }
                  className="max-w-xs w-full"
                />

              </div>

            </div>

            {/* BENEFICIOS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {beneficios.map((item, index) => {
                const Icon = getIcon(item.tipo);

                return (
                  <div
                    key={item._key || `${item.titulo}-${index}`}
                    className="bg-card rounded-lg p-8 border border-border text-center"
                  >

                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">

                      <Icon className="h-7 w-7 text-primary" />

                    </div>

                    <h3 className="font-extrabold uppercase text-foreground mb-2">
                      {item.titulo || "Beneficio"}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-relaxed">
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