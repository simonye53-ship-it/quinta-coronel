import {useEffect, useState} from "react";
import Layout from "@/components/Layout";

import hero3 from "@/assets/hero-3.jpg";
import hero1 from "@/assets/hero-1.jpg";

import {sanityClient, urlFor} from "../lib/sanity";

interface VehiculoActual {
  _key?: string;
  nombre?: string;
  tipo?: string;
  descripcion?: string;
  imagen?: any;
  imagenAlt?: string;
  especificaciones?: string[];
}

interface VehiculoHistorico {
  _key?: string;
  nombre?: string;
  descripcion?: string;
  imagen?: any;
  imagenAlt?: string;
}

interface MaterialMayorContent {
  heroTitulo?: string;
  heroSubtitulo?: string;
  heroImagen?: any;
  heroAlt?: string;

  fotoPrincipal?: any;
  fotoPrincipalAlt?: string;

  actualesTitulo?: string;
  vehiculosActuales?: VehiculoActual[];

  historicosTitulo?: string;
  historicosSubtitulo?: string;
  vehiculosHistoricos?: VehiculoHistorico[];
}

// =====================================================
// CONTENIDO LOCAL DE RESPALDO
// =====================================================

const defaultCurrentTrucks = [
  {
    nombre: "Unidad B5",
    tipo: "Carro Bomba",
    descripcion:
      "Vehículo principal de la compañía, equipado para combate de incendios estructurales y forestales. Cuenta con bomba de alta presión, estanque de agua y equipo completo de combate.",
    especificaciones: [
      "Bomba de alta presión",
      "Estanque de agua",
      "Equipo de combate completo",
      "Iluminación LED",
    ],
  },

  {
    nombre: "Unidad Rx5",
    tipo: "Carro de Rescate",
    descripcion:
      "Vehículo especializado en rescate vehicular y técnico. Equipado con herramientas hidráulicas Holmatro, sistemas de estabilización y equipo de protección.",
    especificaciones: [
      "Herramientas hidráulicas Holmatro",
      "Sistema de estabilización",
      "Equipo de rescate en altura",
      "Iluminación de escena",
    ],
  },
];

const defaultHistoricVehicles = [
  {
    nombre: "Ambulancia",
    descripcion:
      "Vehículo de transporte de pacientes que sirvió a la comunidad durante años, facilitando el traslado rápido a centros asistenciales.",
  },

  {
    nombre: "Ñato 1",
    descripcion:
      "Legendario carro bomba que marcó una época en la historia de la Quinta Compañía, siendo protagonista de innumerables emergencias.",
  },

  {
    nombre: "Ñato 2",
    descripcion:
      "Sucesor del primer Ñato, continuó la tradición de servicio con mayor capacidad y equipamiento mejorado.",
  },

  {
    nombre: "La Cuca",
    descripcion:
      "Querido vehículo que forma parte del patrimonio histórico de la compañía, recordado con cariño por generaciones de voluntarios.",
  },
];

const MaterialMayor = () => {
  const [contenido, setContenido] =
    useState<MaterialMayorContent | null>(null);

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<MaterialMayorContent>(
        `*[_type == "materialMayor"][0]`
      )
      .then((data) => {
        console.log(
          "Material Mayor desde Sanity:",
          data
        );

        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Material Mayor desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // HERO
  // =====================================================

  const heroImage = contenido?.heroImagen
    ? urlFor(contenido.heroImagen)
        .width(1920)
        .url()
    : hero3;

  const heroTitle =
    contenido?.heroTitulo ||
    "Material Mayor";

  const heroSubtitle =
    contenido?.heroSubtitulo ||
    "Nuestros vehículos de emergencia";

  const heroAlt =
    contenido?.heroAlt ||
    "Material Mayor de la Quinta Compañía";

  // =====================================================
  // FOTO PRINCIPAL
  // =====================================================

  const mainPhoto = contenido?.fotoPrincipal
    ? urlFor(contenido.fotoPrincipal)
        .width(1800)
        .url()
    : hero3;

  const mainPhotoAlt =
    contenido?.fotoPrincipalAlt ||
    "Carros de la compañía";

  // =====================================================
  // VEHÍCULOS ACTUALES
  // =====================================================

  const currentTrucks =
    contenido?.vehiculosActuales &&
    contenido.vehiculosActuales.length > 0
      ? contenido.vehiculosActuales.map(
          (vehiculo) => ({
            nombre:
              vehiculo.nombre ||
              "Unidad",

            tipo:
              vehiculo.tipo ||
              "Vehículo de emergencia",

            descripcion:
              vehiculo.descripcion || "",

            especificaciones:
              vehiculo.especificaciones || [],

            imagen: vehiculo.imagen
              ? urlFor(vehiculo.imagen)
                  .width(1200)
                  .height(800)
                  .url()
              : null,

            imagenAlt:
              vehiculo.imagenAlt ||
              vehiculo.nombre ||
              "Vehículo de la Quinta Compañía",
          })
        )
      : defaultCurrentTrucks.map(
          (vehiculo) => ({
            ...vehiculo,
            imagen: null,
            imagenAlt: vehiculo.nombre,
          })
        );

  // =====================================================
  // VEHÍCULOS HISTÓRICOS
  // =====================================================

  const historicVehicles =
    contenido?.vehiculosHistoricos &&
    contenido.vehiculosHistoricos.length > 0
      ? contenido.vehiculosHistoricos.map(
          (vehiculo) => ({
            nombre:
              vehiculo.nombre ||
              "Vehículo histórico",

            descripcion:
              vehiculo.descripcion || "",

            imagen: vehiculo.imagen
              ? urlFor(vehiculo.imagen)
                  .width(1200)
                  .height(900)
                  .url()
              : hero1,

            imagenAlt:
              vehiculo.imagenAlt ||
              vehiculo.nombre ||
              "Vehículo histórico de la Quinta Compañía",
          })
        )
      : defaultHistoricVehicles.map(
          (vehiculo) => ({
            ...vehiculo,
            imagen: hero1,
            imagenAlt: vehiculo.nombre,
          })
        );

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
          FOTO PRINCIPAL
      ===================================================== */}

      <section className="py-16 bg-background">

        <div className="container mx-auto px-4">

          <div className="max-w-5xl mx-auto">

            <div className="aspect-[21/9] rounded-lg overflow-hidden mb-12">

              <img
                src={mainPhoto}
                alt={mainPhotoAlt}
                className="w-full h-full object-cover"
              />

            </div>

            {/* =====================================================
                VEHÍCULOS ACTUALES
            ===================================================== */}

            {contenido?.actualesTitulo && (

              <div className="text-center mb-10">

                <div className="w-16 h-1 bg-primary mx-auto mb-4" />

                <h2 className="section-title text-foreground">
                  {contenido.actualesTitulo}
                </h2>

              </div>

            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">

              {currentTrucks.map(
                (truck, index) => (

                  <div
                    key={`${truck.nombre}-${index}`}
                    className="bg-card rounded-lg border border-border shadow-sm overflow-hidden"
                  >

                    {truck.imagen && (

                      <div className="aspect-[4/3] overflow-hidden">

                        <img
                          src={truck.imagen}
                          alt={truck.imagenAlt}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />

                      </div>

                    )}

                    <div className="p-8">

                      <div className="w-12 h-1 bg-primary mb-4" />

                      <h3 className="text-2xl font-extrabold uppercase text-foreground">
                        {truck.nombre}
                      </h3>

                      <p className="text-primary font-bold text-sm uppercase tracking-wider mt-1">
                        {truck.tipo}
                      </p>

                      {truck.descripcion && (

                        <p className="text-muted-foreground mt-4 leading-relaxed">
                          {truck.descripcion}
                        </p>

                      )}

                      {truck.especificaciones.length >
                        0 && (

                        <ul className="mt-4 space-y-2">

                          {truck.especificaciones.map(
                            (spec, specIndex) => (

                              <li
                                key={`${spec}-${specIndex}`}
                                className="flex items-center gap-2 text-sm text-muted-foreground"
                              >

                                <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />

                                {spec}

                              </li>

                            )
                          )}

                        </ul>

                      )}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          VEHÍCULOS HISTÓRICOS
      ===================================================== */}

      <section className="py-20 bg-muted">

        <div className="container mx-auto px-4">

          <div className="text-center mb-14">

            <div className="w-16 h-1 bg-gold mx-auto mb-4" />

            <h2 className="section-title text-foreground">

              {contenido?.historicosTitulo ||
                "Vehículos Históricos"}

            </h2>

            <p className="text-muted-foreground mt-3">

              {contenido?.historicosSubtitulo ||
                "Los carros que forjaron nuestra historia"}

            </p>

          </div>

          <div className="max-w-4xl mx-auto space-y-8">

            {historicVehicles.map(
              (vehicle, index) => (

                <div
                  key={`${vehicle.nombre}-${index}`}
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 !== 0
                      ? "md:flex-row-reverse"
                      : ""
                  }`}
                >

                  <div className="w-full md:w-1/2">

                    <div className="aspect-[4/3] bg-card rounded-lg overflow-hidden border border-border">

                      <img
                        src={vehicle.imagen}
                        alt={vehicle.imagenAlt}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />

                    </div>

                  </div>

                  <div className="w-full md:w-1/2">

                    <div className="w-10 h-1 bg-secondary mb-3" />

                    <h3 className="text-xl font-extrabold uppercase text-foreground">
                      {vehicle.nombre}
                    </h3>

                    {vehicle.descripcion && (

                      <p className="text-muted-foreground mt-3 leading-relaxed">
                        {vehicle.descripcion}
                      </p>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        </div>

      </section>

    </Layout>
  );
};

export default MaterialMayor;