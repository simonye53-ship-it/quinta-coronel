import {useEffect, useMemo, useState} from "react";
import Layout from "@/components/Layout";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

interface Voluntario {
  _key?: string;
  nombre?: string;
  designacion?: string;
  rol?: string;
  foto?: any;
  fotoAlt?: string;
}

interface VoluntariosContent {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroImagen?: any;
  heroAlt?: string;

  listaVoluntarios?: Voluntario[];
}

interface Categoria {
  id: string;
  titulo: string;
  descripcion: string;
}

// =====================================================
// CATEGORÍAS
// =====================================================

const categorias: Categoria[] = [
  {
    id: "insigne",
    titulo: "Voluntarios Insignes",
    descripcion:
      "Bomberos que han dejado un legado imborrable en la historia de nuestra compañía.",
  },
  {
    id: "honorario",
    titulo: "Voluntarios Honorarios",
    descripcion:
      "Reconocidos por su trayectoria y dedicación ejemplar.",
  },
  {
    id: "20-10",
    titulo: "Voluntarios con 20 a 10 años de servicio",
    descripcion:
      "Décadas de compromiso y experiencia al servicio de la comunidad.",
  },
  {
    id: "10-5",
    titulo: "Voluntarios con 10 a 5 años de servicio",
    descripcion:
      "Bomberos con sólida experiencia y formación continua.",
  },
  {
    id: "nuevo",
    titulo: "Voluntarios Nuevos",
    descripcion:
      "La nueva generación de bomberos que continúa el legado de Honor y Sacrificio.",
  },
];

// =====================================================
// CONTENIDO LOCAL DE RESPALDO
// =====================================================

const defaultVolunteers: Voluntario[] = [
  {
    nombre: "Voluntario Insigne 1",
    designacion: "insigne",
    rol: "Fundador",
  },
  {
    nombre: "Voluntario Insigne 2",
    designacion: "insigne",
    rol: "Director Honorario",
  },

  {
    nombre: "Voluntario Honorario 1",
    designacion: "honorario",
    rol: "Bombero Honorario",
  },
  {
    nombre: "Voluntario Honorario 2",
    designacion: "honorario",
    rol: "Bombero Honorario",
  },

  {
    nombre: "Voluntario Veterano 1",
    designacion: "20-10",
    rol: "Ex-Capitán",
  },
  {
    nombre: "Voluntario Veterano 2",
    designacion: "20-10",
    rol: "Maquinista",
  },
  {
    nombre: "Voluntario Veterano 3",
    designacion: "20-10",
    rol: "Operador de rescate",
  },

  {
    nombre: "Voluntario Experimentado 1",
    designacion: "10-5",
    rol: "Operador",
  },
  {
    nombre: "Voluntario Experimentado 2",
    designacion: "10-5",
    rol: "Rescatista",
  },
  {
    nombre: "Voluntario Experimentado 3",
    designacion: "10-5",
    rol: "Voluntario activo",
  },

  {
    nombre: "Voluntario Nuevo 1",
    designacion: "nuevo",
    rol: "Aspirante",
  },
  {
    nombre: "Voluntario Nuevo 2",
    designacion: "nuevo",
    rol: "Aspirante",
  },
  {
    nombre: "Voluntario Nuevo 3",
    designacion: "nuevo",
    rol: "Aspirante",
  },
  {
    nombre: "Voluntario Nuevo 4",
    designacion: "nuevo",
    rol: "Aspirante",
  },
];

const Voluntarios = () => {
  const [contenido, setContenido] =
    useState<VoluntariosContent | null>(null);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<VoluntariosContent>(
        `*[_type == "voluntarios"][0]`
      )
      .then((data) => {
        console.log("Voluntarios desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Voluntarios desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // HERO
  // =====================================================

  const heroImage = contenido?.heroImagen
    ? urlFor(contenido.heroImagen).width(1920).url()
    : fotoEquipo;

  const heroTitle =
    contenido?.heroTitulo || "Voluntarios";

  const heroSubtitle =
    contenido?.heroSubtitulo ||
    "El corazón de nuestra compañía";

  const heroAlt =
    contenido?.heroAlt ||
    "Voluntarios de la Quinta Compañía";

  // =====================================================
  // LISTA DE VOLUNTARIOS
  // =====================================================

  const volunteers =
    contenido?.listaVoluntarios &&
    contenido.listaVoluntarios.length > 0
      ? contenido.listaVoluntarios
      : defaultVolunteers;

  // =====================================================
  // AGRUPAR AUTOMÁTICAMENTE POR DESIGNACIÓN
  // =====================================================

  const categoriasConVoluntarios = useMemo(() => {
    return categorias
      .map((categoria) => ({
        ...categoria,

        voluntarios: volunteers
          .filter(
            (voluntario) =>
              voluntario.designacion === categoria.id
          )
          .map((voluntario) => ({
            nombre:
              voluntario.nombre ||
              "Nombre por agregar",

            rol:
              voluntario.rol || "",

            foto: voluntario.foto
              ? urlFor(voluntario.foto)
                  .width(700)
                  .height(700)
                  .url()
              : null,

            fotoAlt:
              voluntario.fotoAlt ||
              voluntario.nombre ||
              "Voluntario de la Quinta Compañía",
          })),
      }))
      .filter(
        (categoria) =>
          categoria.voluntarios.length > 0
      );
  }, [volunteers]);

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
          CATEGORÍAS DE VOLUNTARIOS
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          {categoriasConVoluntarios.map(
            (category, catIndex) => (

              <div
                key={category.id}
                className="mb-20 last:mb-0"
              >

                <div className="mb-8">

                  <div
                    className={`w-16 h-1 mb-4 ${
                      catIndex === 0
                        ? "bg-gold"
                        : catIndex === 1
                        ? "bg-primary"
                        : "bg-secondary"
                    }`}
                  />

                  <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-foreground">
                    {category.titulo}
                  </h2>

                  <p className="text-muted-foreground mt-2">
                    {category.descripcion}
                  </p>

                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">

                  {category.voluntarios.map(
                    (volunteer, index) => (

                      <div
                        key={`${volunteer.nombre}-${index}`}
                        className="bg-card rounded-lg overflow-hidden shadow-sm border border-border"
                      >

                        <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">

                          {volunteer.foto ? (

                            <img
                              src={volunteer.foto}
                              alt={volunteer.fotoAlt}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />

                          ) : (

                            <div className="text-center text-muted-foreground">

                              <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">

                                <span className="text-xl font-black text-primary">
                                  {volunteer.nombre.charAt(0)}
                                </span>

                              </div>

                              <p className="text-xs">
                                Foto por agregar
                              </p>

                            </div>

                          )}

                        </div>

                        <div className="p-4 text-center">

                          <h3 className="font-bold text-foreground text-sm">
                            {volunteer.nombre}
                          </h3>

                          {volunteer.rol && (

                            <p className="text-primary text-xs font-semibold mt-1">
                              {volunteer.rol}
                            </p>

                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )
          )}

        </div>

      </section>

    </Layout>
  );
};

export default Voluntarios;