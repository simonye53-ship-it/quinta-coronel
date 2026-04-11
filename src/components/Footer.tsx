import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react";
import logoCircular from "@/assets/logo-circular.jpg";

const Footer = () => {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Left - Hazte Socio CTA */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-gold mb-4">
              Hazte Socio
            </h3>
            <p className="text-navy-foreground/70 text-sm mb-6 text-center md:text-left">
              Apoya a tu Quinta Compañía con un aporte mensual y ayúdanos a seguir protegiendo a nuestra comunidad.
            </p>
            <a
              href="https://app.reveniu.com/quintacoronel"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Colaborar
            </a>
          </div>

          {/* Center - Navigation */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">Menú</h4>
              <nav className="space-y-2">
                <Link to="/" className="block text-navy-foreground/70 hover:text-gold transition-colors">Inicio</Link>
                <Link to="/historia" className="block text-navy-foreground/70 hover:text-gold transition-colors">Historia</Link>
                <Link to="/oficialidad" className="block text-navy-foreground/70 hover:text-gold transition-colors">Oficialidad</Link>
                <Link to="/voluntarios" className="block text-navy-foreground/70 hover:text-gold transition-colors">Voluntarios</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">&nbsp;</h4>
              <nav className="space-y-2">
                <Link to="/especialidades" className="block text-navy-foreground/70 hover:text-gold transition-colors">Especialidades</Link>
                <Link to="/material-mayor" className="block text-navy-foreground/70 hover:text-gold transition-colors">Material Mayor</Link>
                <Link to="/noticias" className="block text-navy-foreground/70 hover:text-gold transition-colors">Noticias</Link>
                <Link to="/contacto" className="block text-navy-foreground/70 hover:text-gold transition-colors">Contacto</Link>
              </nav>
            </div>
            <div className="col-span-2 mt-4">
              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">Redes Sociales</h4>
              <div className="flex gap-3">
                <a href="#" className="text-navy-foreground/70 hover:text-gold transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-navy-foreground/70 hover:text-gold transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-navy-foreground/70 hover:text-gold transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right - Logo & Contact */}
          <div className="flex flex-col items-center md:items-end">
            <img
              src={logoCircular}
              alt="Quinta Compañía"
              className="h-20 w-20 rounded-full object-cover mb-4"
            />
            <p className="font-extrabold uppercase text-sm tracking-wider text-center md:text-right">
              Quinta Compañía
            </p>
            <p className="text-navy-foreground/60 text-xs uppercase tracking-wider mb-4 text-center md:text-right">
              Cuerpo de Bomberos de Coronel
            </p>
            <div className="space-y-2 text-xs text-navy-foreground/60 text-center md:text-right">
              <div className="flex items-center gap-2 justify-center md:justify-end">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span>Los Guayacanes 1308, Lagunillas 2, Coronel</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-end">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span>quinta@bomberoscoronel.cl</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-navy-foreground/10 mt-10 pt-6 text-center">
          <p className="text-xs text-navy-foreground/40">
            © {new Date().getFullYear()} Quinta Compañía del Cuerpo de Bomberos de Coronel. Todos los derechos reservados.
          </p>
          <p className="text-xs text-navy-foreground/30 mt-1">
            "Honor y Sacrificio" — Fundada el 20 de febrero de 1951
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
