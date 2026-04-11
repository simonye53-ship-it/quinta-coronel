import Layout from "@/components/Layout";
import hero3 from "@/assets/hero-3.jpg";
import hero1 from "@/assets/hero-1.jpg";

const currentTrucks = [
  {
    name: "Unidad B5",
    type: "Carro Bomba",
    description: "Vehículo principal de la compañía, equipado para combate de incendios estructurales y forestales. Cuenta con bomba de alta presión, estanque de agua y equipo completo de combate.",
    specs: ["Bomba de alta presión", "Estanque de agua", "Equipo de combate completo", "Iluminación LED"],
  },
  {
    name: "Unidad Rx5",
    type: "Carro de Rescate",
    description: "Vehículo especializado en rescate vehicular y técnico. Equipado con herramientas hidráulicas Holmatro, sistemas de estabilización y equipo de protección.",
    specs: ["Herramientas hidráulicas Holmatro", "Sistema de estabilización", "Equipo de rescate en altura", "Iluminación de escena"],
  },
];

const historicVehicles = [
  { name: "Ambulancia", description: "Vehículo de transporte de pacientes que sirvió a la comunidad durante años, facilitando el traslado rápido a centros asistenciales." },
  { name: "Ñato 1", description: "Legendario carro bomba que marcó una época en la historia de la Quinta Compañía, siendo protagonista de innumerables emergencias." },
  { name: "Ñato 2", description: "Sucesor del primer Ñato, continuó la tradición de servicio con mayor capacidad y equipamiento mejorado." },
  { name: "La Cuca", description: "Querido vehículo que forma parte del patrimonio histórico de la compañía, recordado con cariño por generaciones de voluntarios." },
];

const MaterialMayor = () => {
  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={hero3} alt="Material Mayor" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Material Mayor</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">Nuestros vehículos de emergencia</p>
        </div>
      </section>

      {/* Main Photo */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-[21/9] rounded-lg overflow-hidden mb-12">
              <img src={hero3} alt="Carros de la compañía" className="w-full h-full object-cover" />
            </div>

            {/* Current Trucks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
              {currentTrucks.map((truck) => (
                <div key={truck.name} className="bg-card rounded-lg border border-border shadow-sm p-8">
                  <div className="w-12 h-1 bg-primary mb-4" />
                  <h3 className="text-2xl font-extrabold uppercase text-foreground">{truck.name}</h3>
                  <p className="text-primary font-bold text-sm uppercase tracking-wider mt-1">{truck.type}</p>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{truck.description}</p>
                  <ul className="mt-4 space-y-2">
                    {truck.specs.map((spec) => (
                      <li key={spec} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Historic Vehicles */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="w-16 h-1 bg-gold mx-auto mb-4" />
            <h2 className="section-title text-foreground">Vehículos Históricos</h2>
            <p className="text-muted-foreground mt-3">Los carros que forjaron nuestra historia</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {historicVehicles.map((vehicle, index) => (
              <div
                key={vehicle.name}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="w-full md:w-1/2">
                  <div className="aspect-[4/3] bg-card rounded-lg overflow-hidden border border-border flex items-center justify-center">
                    <img src={hero1} alt={vehicle.name} loading="lazy" className="w-full h-full object-cover opacity-60" />
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <div className="w-10 h-1 bg-secondary mb-3" />
                  <h3 className="text-xl font-extrabold uppercase text-foreground">{vehicle.name}</h3>
                  <p className="text-muted-foreground mt-3 leading-relaxed">{vehicle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MaterialMayor;
