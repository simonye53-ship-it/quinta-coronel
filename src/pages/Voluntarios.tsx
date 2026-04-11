import Layout from "@/components/Layout";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";

interface VolunteerCategory {
  title: string;
  description: string;
  volunteers: { name: string; role?: string }[];
}

const categories: VolunteerCategory[] = [
  {
    title: "Voluntarios Insignes",
    description: "Bomberos que han dejado un legado imborrable en la historia de nuestra compañía.",
    volunteers: [
      { name: "Voluntario Insigne 1", role: "Fundador" },
      { name: "Voluntario Insigne 2", role: "Director Honorario" },
    ],
  },
  {
    title: "Voluntarios Honorarios",
    description: "Reconocidos por su trayectoria y dedicación ejemplar.",
    volunteers: [
      { name: "Voluntario Honorario 1", role: "Bombero Honorario" },
      { name: "Voluntario Honorario 2", role: "Bombero Honorario" },
    ],
  },
  {
    title: "Voluntarios con 20 a 10 años de servicio",
    description: "Décadas de compromiso y experiencia al servicio de la comunidad.",
    volunteers: [
      { name: "Voluntario Veterano 1", role: "Ex-Capitán" },
      { name: "Voluntario Veterano 2", role: "Maquinista" },
      { name: "Voluntario Veterano 3", role: "Operador de rescate" },
    ],
  },
  {
    title: "Voluntarios con 10 a 5 años de servicio",
    description: "Bomberos con sólida experiencia y formación continua.",
    volunteers: [
      { name: "Voluntario Experimentado 1", role: "Operador" },
      { name: "Voluntario Experimentado 2", role: "Rescatista" },
      { name: "Voluntario Experimentado 3", role: "Voluntario activo" },
    ],
  },
  {
    title: "Voluntarios Nuevos",
    description: "La nueva generación de bomberos que continúa el legado de Honor y Sacrificio.",
    volunteers: [
      { name: "Voluntario Nuevo 1", role: "Aspirante" },
      { name: "Voluntario Nuevo 2", role: "Aspirante" },
      { name: "Voluntario Nuevo 3", role: "Aspirante" },
      { name: "Voluntario Nuevo 4", role: "Aspirante" },
    ],
  },
];

const Voluntarios = () => {
  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={fotoEquipo} alt="Voluntarios" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Voluntarios</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">El corazón de nuestra compañía</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          {categories.map((category, catIndex) => (
            <div key={category.title} className="mb-20 last:mb-0">
              <div className="mb-8">
                <div className={`w-16 h-1 mb-4 ${catIndex === 0 ? "bg-gold" : catIndex === 1 ? "bg-primary" : "bg-secondary"}`} />
                <h2 className="text-2xl md:text-3xl font-extrabold uppercase text-foreground">{category.title}</h2>
                <p className="text-muted-foreground mt-2">{category.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.volunteers.map((volunteer) => (
                  <div key={volunteer.name} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-2 flex items-center justify-center">
                          <span className="text-xl font-black text-primary">{volunteer.name.charAt(0)}</span>
                        </div>
                        <p className="text-xs">Foto por agregar</p>
                      </div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-foreground text-sm">{volunteer.name}</h3>
                      {volunteer.role && (
                        <p className="text-primary text-xs font-semibold mt-1">{volunteer.role}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Voluntarios;
