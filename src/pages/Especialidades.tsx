import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";

const Especialidades = () => {
  return (
    <Layout>
      {/* Video / Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={fotoRescate} alt="Rescate Vehicular" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Especialidades</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">Formación especializada para salvar vidas</p>
        </div>
      </section>

      {/* Video Placeholder */}
      <section className="bg-navy py-16">
        <div className="container mx-auto px-4">
          <div className="aspect-video bg-foreground/10 rounded-lg flex items-center justify-center max-w-4xl mx-auto">
            <div className="text-center text-navy-foreground/50">
              <div className="w-20 h-20 rounded-full border-2 border-navy-foreground/30 flex items-center justify-center mx-auto mb-4">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-14 border-l-navy-foreground/50 ml-1" 
                  style={{ borderLeftWidth: '14px' }}
                />
              </div>
              <p className="font-bold uppercase text-sm tracking-wider">Video de Rescate Vehicular</p>
              <p className="text-xs mt-1">Próximamente</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
            <h2 className="section-title text-foreground">Nuestras Especialidades</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-extrabold uppercase text-foreground mb-4">Rescate Vehicular</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nuestra compañía cuenta con un equipo altamente capacitado en técnicas de rescate vehicular, 
                utilizando herramientas hidráulicas Holmatro de última generación. Realizamos entrenamientos 
                constantes para mantener nuestras habilidades al más alto nivel.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Atendemos accidentes vehiculares de distinta complejidad, desde colisiones simples hasta 
                volcamientos y atrapamientos múltiples, siempre con el objetivo de preservar la vida humana.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-extrabold uppercase text-foreground mb-4">Rescate en Cuerdas</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Contamos con personal certificado en técnicas de rescate en altura y espacios confinados. 
                Nuestro equipo puede operar en situaciones complejas que requieren el uso de sistemas de 
                cuerdas y equipamiento especializado.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                La formación continua en estas disciplinas nos permite responder con eficacia ante 
                emergencias que demandan habilidades técnicas avanzadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-foreground text-center mb-10">Nuestro Trabajo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[fotoRescate, fotoEquipo, fotoComunidad].map((img, i) => (
              <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden">
                <img src={img} alt={`Trabajo ${i + 1}`} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-black uppercase text-primary-foreground mb-4">
            Conoce nuestro trabajo en redes sociales
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-gold text-gold-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
          >
            Síguenos
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Especialidades;
