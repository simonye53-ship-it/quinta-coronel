import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import logoCircular from "@/assets/logo-circular.jpg";
import {sanityClient} from "../lib/sanity";

interface RedesSociales {
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

interface ContactoFooter {
  direccion?: string;
  correos?: string[];
  telefono?: string;
}

interface HazteSocioFooter {
  botonTexto?: string;
  botonLink?: string;
}

const Footer = () => {
  const [redes, setRedes] = useState<RedesSociales | null>(null);
  const [contacto, setContacto] = useState<ContactoFooter | null>(null);
  const [socio, setSocio] = useState<HazteSocioFooter | null>(null);

  useEffect(() => {
    sanityClient
      .fetch<RedesSociales>(
        `*[_type == "redesSociales"][0]{
          facebook,
          instagram,
          youtube
        }`
      )
      .then((data) => {
        console.log("Redes Footer:", data);
        setRedes(data);
      })
      .catch((error) => {
        console.error("Error cargando redes del Footer:", error);
      });

    sanityClient
      .fetch<ContactoFooter>(
        `*[_type == "contacto"][0]{
          direccion,
          correos,
          telefono
        }`
      )
      .then((data) => {
        console.log("Contacto Footer:", data);
        setContacto(data);
      })
      .catch((error) => {
        console.error("Error cargando contacto del Footer:", error);
      });

    sanityClient
      .fetch<HazteSocioFooter>(
        `*[_type == "hazteSocio"][0]{
          botonTexto,
          botonLink
        }`
      )
      .then((data) => {
        console.log("Hazte Socio Footer:", data);
        setSocio(data);
      })
      .catch((error) => {
        console.error("Error cargando Hazte Socio del Footer:", error);
      });
  }, []);

  const correoPrincipal =
    contacto?.correos?.[0] ||
    "quinta@bomberoscoronel.cl";

  const direccion =
    contacto?.direccion ||
    "Los Guayacanes 1308, Lagunillas 2, Coronel";

  const aporteLink =
    socio?.botonLink ||
    "https://app.reveniu.com/quintacoronel";

  const aporteTexto =
    socio?.botonTexto ||
    "Hazte Socio Ahora";

  return (
    <footer className="bg-navy text-navy-foreground">

      <div className="container mx-auto px-4 py-12">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* =====================================================
              HAZTE SOCIO
          ===================================================== */}

          <div className="flex flex-col items-center md:items-start">

            <h3 className="text-2xl font-extrabold uppercase tracking-tight text-gold mb-4">
              Hazte Socio
            </h3>

            <p className="text-navy-foreground/70 text-sm mb-6 text-center md:text-left">
              Apoya a tu Quinta Compañía con un aporte mensual y ayúdanos a seguir protegiendo a nuestra comunidad.
            </p>

            <a
              href={aporteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              {aporteTexto}
            </a>

          </div>

          {/* =====================================================
              NAVEGACIÓN
          ===================================================== */}

          <div className="grid grid-cols-2 gap-4 text-sm">

            <div>

              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">
                Menú
              </h4>

              <nav className="space-y-2">

                <Link
                  to="/"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Inicio
                </Link>

                <Link
                  to="/historia"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Historia
                </Link>

                <Link
                  to="/oficialidad"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Oficialidad
                </Link>

                <Link
                  to="/voluntarios"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Voluntarios
                </Link>

              </nav>

            </div>

            <div>

              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">
                &nbsp;
              </h4>

              <nav className="space-y-2">

                <Link
                  to="/especialidades"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Especialidades
                </Link>

                <Link
                  to="/material-mayor"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Material Mayor
                </Link>

                <Link
                  to="/noticias"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Noticias
                </Link>

                <Link
                  to="/contacto"
                  className="block text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  Contacto
                </Link>

              </nav>

            </div>

            {/* =====================================================
                REDES SOCIALES
            ===================================================== */}

            <div className="col-span-2 mt-4">

              <h4 className="font-bold uppercase tracking-wider text-gold mb-3 text-xs">
                Redes Sociales
              </h4>

              <div className="flex gap-4">

                <a
                  href={redes?.facebook || "#"}
                  target={redes?.facebook ? "_blank" : undefined}
                  rel={redes?.facebook ? "noopener noreferrer" : undefined}
                  aria-label="Facebook"
                  className="text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                <a
                  href={redes?.instagram || "#"}
                  target={redes?.instagram ? "_blank" : undefined}
                  rel={redes?.instagram ? "noopener noreferrer" : undefined}
                  aria-label="Instagram"
                  className="text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>

                <a
                  href={redes?.youtube || "#"}
                  target={redes?.youtube ? "_blank" : undefined}
                  rel={redes?.youtube ? "noopener noreferrer" : undefined}
                  aria-label="YouTube"
                  className="text-navy-foreground/70 hover:text-gold transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>

              </div>

            </div>

          </div>

          {/* =====================================================
              INFORMACIÓN INSTITUCIONAL
          ===================================================== */}

          <div className="flex flex-col items-center md:items-end">

            <img
              src={logoCircular}
              alt="Quinta Compañía de Bomberos de Coronel"
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

                <span>
                  {direccion}
                </span>

              </div>

              <div className="flex items-center gap-2 justify-center md:justify-end">

                <Mail className="h-3 w-3 flex-shrink-0" />

                <a
                  href={`mailto:${correoPrincipal}`}
                  className="hover:text-gold transition-colors"
                >
                  {correoPrincipal}
                </a>

              </div>

              {contacto?.telefono && (

                <div className="flex items-center gap-2 justify-center md:justify-end">

                  <Phone className="h-3 w-3 flex-shrink-0" />

                  <span>
                    {contacto.telefono}
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            PIE INFERIOR
        ===================================================== */}

        <div className="border-t border-navy-foreground/10 mt-10 pt-6 text-center">

          <p className="text-xs text-navy-foreground/40">
            © {new Date().getFullYear()} Quinta Compañía del Cuerpo de Bomberos de Coronel. Todos los derechos reservados.
          </p>

          <p className="text-xs text-navy-foreground/30 mt-1">
            "Honor y Sacrificio" · Fundada el 20 de febrero de 1951
          </p>

          <a
            href="https://quinta-coronel.sanity.studio/structure/noticias"
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-5 inline-block text-[10px] uppercase tracking-[0.18em] text-navy-foreground/20 transition-colors hover:text-navy-foreground/55 focus:text-navy-foreground/70"
          >
            Acceso interno
          </a>

        </div>

      </div>

    </footer>
  );
};

export default Footer;
