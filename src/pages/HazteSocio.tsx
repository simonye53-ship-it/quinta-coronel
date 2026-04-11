import Layout from "@/components/Layout";
import { Heart, Shield, Users } from "lucide-react";
import escudos from "@/assets/escudos-traslapados.png";

const HazteSocio = () => {
  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/20" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Hazte Socio</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">Apoya a tu Quinta Compañía</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <div className="w-16 h-1 bg-secondary mb-6" />
                <h2 className="text-3xl font-extrabold uppercase text-foreground mb-4">
                  Tu aporte hace la diferencia
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  La Quinta Compañía del Cuerpo de Bomberos de Coronel es una institución sin fines de lucro 
                  que depende del apoyo de la comunidad para mantener su operación y equipamiento.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Al hacerte socio colaborador, contribuyes directamente a la adquisición de equipos, 
                  mantenimiento de vehículos, capacitación de voluntarios y mejoras en nuestro cuartel.
                </p>
                <a
                  href="https://app.reveniu.com/quintacoronel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity"
                >
                  Pagar Cuota de Socio
                </a>
              </div>
              <div className="flex justify-center">
                <img src={escudos} alt="Escudos de la compañía" className="max-w-xs w-full" />
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: Shield, title: "Equipamiento", description: "Tu aporte financia equipos de protección personal y herramientas de rescate de última generación." },
                { icon: Users, title: "Capacitación", description: "Apoyamos la formación continua de nuestros voluntarios en técnicas avanzadas de rescate." },
                { icon: Heart, title: "Comunidad", description: "Cada peso invertido vuelve a la comunidad en forma de mejor servicio y respuesta más rápida." },
              ].map((item) => (
                <div key={item.title} className="bg-card rounded-lg p-8 border border-border text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-extrabold uppercase text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HazteSocio;
