import {useEffect, useState} from "react";
import Layout from "@/components/Layout";
import fotoFormacion from "@/assets/foto-formacion.jpg";
import {sanityClient, urlFor} from "../lib/sanity";

interface Oficial {
  _key?: string;
  nombre?: string;
  cargo?: string;
  descripcion?: string;
  foto?: any;
  fotoAlt?: string;
}

interface OficialidadContent {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroImagen?: any;
  heroAlt?: string;

  seccionTitulo?: string;
  seccionDescripcion?: string;

  oficiales?: Oficial[];
}

// =====================================================
// CONTENIDO LOCAL DE RESPALDO
// =====================================================

const defaultOfficers = [
  {
    nombre: "Director",
    cargo: "Director de Compañía",
    descripcion:
      "Máxima autoridad de la compañía, encargado de dirigir y representar a la institución.",
  },
  {
    nombre: "Capitán",
    cargo: "Capitán",
    descripcion:
      "Responsable de la operación en terreno y la coordinación de los voluntarios durante las emergencias.",
  },
  {
    nombre: "Teniente 1°",
    cargo: "Teniente 1°",
    descripcion:
      "Segundo al mando en operaciones, encargado de la logística y el equipamiento.",
  },
  {
    nombre: "Teniente 2°",
    cargo: "Teniente 2°",
    descripcion:
      "Apoya en la coordinación operativa y en la formación de los voluntarios.",
  },
  {
    nombre: "Teniente 3°",
    cargo: "Teniente 3°",
    descripcion:
      "Apoya la gestión operativa, el entrenamiento y las tareas asignadas por la oficialidad.",
  },
  {
    nombre: "Teniente 4°",
    cargo: "Teniente 4°",
    descripcion:
      "Colabora en funciones operativas, organización interna y apoyo a los voluntarios.",
  },
  {
    nombre: "Secretario",
    cargo: "Secretario",
    descripcion:
      "Encargado de la documentación, actas y correspondencia oficial de la compañía.",
  },
  {
    nombre: "Tesorero",
    cargo: "Tesorero",
    descripcion:
      "Responsable de la administración financiera y gestión de recursos.",
  },
  {
    nombre: "Ayudante",
    cargo: "Ayudante de Compañía",
    descripcion:
      "Apoya las labores administrativas y operativas de la compañía y colabora con la oficialidad.",
  },
];

const Oficialidad = () => {
  const [contenido, setContenido] =
  useState<OficialidadContent | null>(null);

useEffect(() => {
  sanityClient
    .fetch<OficialidadContent>(
      `*[_type == "oficialidad"][0]`
    )
    .then((data) => {
      console.log("Oficialidad desde Sanity:", data);
      setContenido(data);
    })
    .catch((error) => {
      console.error(
        "Error cargando Oficialidad desde Sanity:",
        error
      );
    });
}, []);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<OficialidadContent>(
        `*[_type == "oficialidad"][0]`
      )
      .then((data) => {
        console.log("Oficialidad desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Oficialidad desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // HERO
  // =====================================================

  const heroImage = contenido?.heroImagen
    ? urlFor(contenido.heroImagen).width(1920).url()
    : fotoFormacion;

  const heroTitle =
    contenido?.heroTitulo || "Oficialidad";

  const heroSubtitle =
    contenido?.heroSubtitulo ||
    "Liderazgo y compromiso al servicio de Coronel";

  const heroAlt =
    contenido?.heroAlt || "Oficialidad de la Quinta Compañía";

  // =====================================================
  // OFICIALES
  // =====================================================

  const officers =
    contenido?.oficiales && contenido.oficiales.length > 0
      ? contenido.oficiales.map((oficial) => ({
          nombre:
            oficial.nombre ||
            "Nombre por agregar",

          cargo:
            oficial.cargo ||
            "Cargo por definir",

          descripcion:
            oficial.descripcion || "",

          foto: oficial.foto
            ? urlFor(oficial.foto)
                .width(900)
                .height(675)
                .url()
            : null,

          fotoAlt:
            oficial.fotoAlt ||
            oficial.nombre ||
            oficial.cargo ||
            "Oficial de la Quinta Compañía",
        }))
      : defaultOfficers.map((oficial) => ({
          ...oficial,
          foto: null,
          fotoAlt: oficial.nombre,
        }));

  return (
    <Layout>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">

        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
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
          SECCIÓN OFICIALES
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="text-center mb-14">

            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />

            <h2 className="section-title text-foreground">
              {contenido?.seccionTitulo ||
                "Nuestros Oficiales"}
            </h2>

            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              {contenido?.seccionDescripcion ||
                "El cuerpo de oficiales lidera con ejemplo, dedicación y profesionalismo"}
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {officers.map((officer, index) => (

              <div
                key={`${officer.cargo}-${index}`}
                className="bg-card rounded-lg overflow-hidden shadow-sm border border-border group hover:shadow-lg transition-shadow"
              >

                <div className="aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">

                  {officer.foto ? (

                    <img
                      src={officer.foto}
                      alt={officer.fotoAlt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="text-center text-muted-foreground">

                      <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">

                        <span className="text-2xl font-black text-primary">
                          {officer.nombre.charAt(0)}
                        </span>

                      </div>

                      <p className="text-xs">
                        Foto por agregar
                      </p>

                    </div>

                  )}

                </div>

                <div className="p-6">

                  <h3 className="font-extrabold uppercase text-foreground text-lg">
                    {officer.cargo}
                  </h3>

                  <p className="text-primary font-semibold text-sm mt-1">
                    {officer.nombre}
                  </p>

                  {officer.descripcion && (

                    <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                      {officer.descripcion}
                    </p>

                  )}

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

    </Layout>
  );
};

export default Oficialidad;