import Layout from "@/components/Layout";
import fotoFormacion from "@/assets/foto-formacion.jpg";

const officers = [
  { name: "Director", title: "Director de Compañía", description: "Máxima autoridad de la compañía, encargado de dirigir y representar a la institución." },
  { name: "Capitán", title: "Capitán", description: "Responsable de la operación en terreno y la coordinación de los voluntarios durante las emergencias." },
  { name: "Teniente 1°", title: "Primer Teniente", description: "Segundo al mando en operaciones, encargado de la logística y el equipamiento." },
  { name: "Teniente 2°", title: "Segundo Teniente", description: "Apoya en la coordinación operativa y en la formación de los voluntarios." },
  { name: "Secretario", title: "Secretario", description: "Encargado de la documentación, actas y correspondencia oficial de la compañía." },
  { name: "Tesorero", title: "Tesorero", description: "Responsable de la administración financiera y gestión de recursos." },
];

const Oficialidad = () => {
  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={fotoFormacion} alt="Oficialidad" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Oficialidad</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">Liderazgo y compromiso al servicio de Coronel</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
            <h2 className="section-title text-foreground">Nuestros Oficiales</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              El cuerpo de oficiales lidera con ejemplo, dedicación y profesionalismo
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {officers.map((officer) => (
              <div key={officer.title} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border group hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-black text-primary">{officer.name.charAt(0)}</span>
                    </div>
                    <p className="text-xs">Foto por agregar</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-extrabold uppercase text-foreground text-lg">{officer.title}</h3>
                  <p className="text-primary font-semibold text-sm mt-1">{officer.name}</p>
                  <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{officer.description}</p>
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
