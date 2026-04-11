import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import fotoFormacion from "@/assets/foto-formacion.jpg";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";

const decades = [
  {
    period: "1951 - 1960",
    title: "Los Inicios",
    description: "El 20 de febrero de 1951 se funda la Quinta Compañía del Cuerpo de Bomberos de Coronel, bajo el nombre de 'Bomba Reino de Bélgica'. Un grupo de valientes voluntarios decidió organizarse para servir a la comunidad con honor y sacrificio.",
    image: fotoFormacion,
    highlights: ["Fundación oficial el 20 de febrero de 1951", "Primeros voluntarios se organizan", "Establecimiento de la identidad belga"],
  },
  {
    period: "1960 - 1970",
    title: "Consolidación",
    description: "La compañía se consolida como una fuerza esencial en la protección de Coronel. Se adquieren los primeros equipos y se establece una estructura organizacional sólida.",
    image: fotoEquipo,
    highlights: ["Adquisición de primeros equipos", "Crecimiento del cuerpo voluntario", "Fortalecimiento institucional"],
  },
  {
    period: "1970 - 1980",
    title: "Crecimiento y Servicio",
    description: "Década de gran crecimiento donde la compañía amplía su capacidad de respuesta y fortalece los lazos con la comunidad de Coronel.",
    image: fotoComunidad,
    highlights: ["Ampliación de servicios", "Mayor presencia comunitaria", "Nuevos programas de capacitación"],
  },
  {
    period: "1980 - 1990",
    title: "Profesionalización",
    description: "Se inician los primeros programas de especialización en rescate, marcando el comienzo de una era de profesionalización continua.",
    image: fotoFormacion,
    highlights: ["Inicio de especialización en rescate", "Modernización de equipos", "Programas de formación avanzada"],
  },
  {
    period: "1990 - 2000",
    title: "Modernización",
    description: "La década de los 90 trae consigo una importante modernización del equipamiento y la incorporación de nuevas tecnologías de rescate.",
    image: fotoEquipo,
    highlights: ["Incorporación de tecnología moderna", "Nuevos vehículos de emergencia", "Ampliación del cuartel"],
  },
  {
    period: "2000 - 2010",
    title: "Nueva Era",
    description: "El nuevo milenio marca una nueva era para la compañía, con la incorporación de especialidades en rescate vehicular y trabajo con cuerdas.",
    image: fotoComunidad,
    highlights: ["Especialización en rescate vehicular", "Formación en trabajo con cuerdas", "Participación en emergencias mayores"],
  },
  {
    period: "2010 - 2020",
    title: "Reconstrucción y Resiliencia",
    description: "Tras el devastador incendio del cuartel en 2013, la compañía demuestra su resiliencia reconstruyendo sus instalaciones e inaugurando un nuevo cuartel en 2018.",
    image: fotoFormacion,
    highlights: ["Incendio del cuartel (2013)", "Reconstrucción con apoyo de la comunidad", "Inauguración del nuevo cuartel (2018)"],
  },
  {
    period: "2020 - Actualidad",
    title: "Presente y Futuro",
    description: "La Quinta Compañía continúa sirviendo a Coronel con el mismo espíritu de Honor y Sacrificio que la caracteriza desde 1951, ahora con equipamiento de última generación y un equipo altamente capacitado.",
    image: fotoEquipo,
    highlights: ["Equipamiento de última generación", "Equipo altamente capacitado", "Continuo servicio a la comunidad"],
  },
];

const Historia = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={fotoFormacion} alt="Historia" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Nuestra Historia</h1>
          <p className="text-primary-foreground/70 text-lg mt-3 max-w-xl">Más de 70 años de Honor y Sacrificio al servicio de Coronel</p>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

            {decades.map((decade, index) => (
              <motion.div
                key={decade.period}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative mb-20 md:mb-32 ${index % 2 === 0 ? "md:pr-[55%]" : "md:pl-[55%]"}`}
              >
                {/* Dot on timeline */}
                <div className="hidden md:block absolute left-1/2 top-8 w-4 h-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 z-10" />

                {/* Content */}
                <div className="bg-card rounded-lg overflow-hidden shadow-md border border-border">
                  <div className="aspect-[16/9] overflow-hidden">
                    <img src={decade.image} alt={decade.period} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6 md:p-8">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{decade.period}</span>
                    <h3 className="text-2xl font-extrabold uppercase text-foreground mt-2 mb-3">{decade.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">{decade.description}</p>
                    <ul className="space-y-2">
                      {decade.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Historia;
