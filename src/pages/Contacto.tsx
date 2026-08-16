import {useEffect, useState} from "react";
import Layout from "@/components/Layout";
import {Mail, MapPin, Phone, Send} from "lucide-react";
import {sanityClient} from "../lib/sanity";

interface ContactoContent {
  heroTitulo?: string;
  heroSubtitulo?: string;

  seccionTitulo?: string;

  direccion?: string;
  correos?: string[];
  telefono?: string;

  postulacionTitulo?: string;
  postulacionTexto?: string;

  formularioNombreLabel?: string;
  formularioEmailLabel?: string;
  formularioMotivoLabel?: string;
  formularioMensajeLabel?: string;

  botonTexto?: string;
  mensajeExito?: string;
}

const Contacto = () => {
  const [contenido, setContenido] =
    useState<ContactoContent | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    tipo: "consulta",
    mensaje: "",
  });

  // =====================================================
  // CARGAR CONTENIDO DESDE SANITY
  // =====================================================

  useEffect(() => {
    sanityClient
      .fetch<ContactoContent>(
        `*[_type == "contacto"][0]{
          heroTitulo,
          heroSubtitulo,
          seccionTitulo,
          direccion,
          correos,
          telefono,
          postulacionTitulo,
          postulacionTexto,
          formularioNombreLabel,
          formularioEmailLabel,
          formularioMotivoLabel,
          formularioMensajeLabel,
          botonTexto,
          mensajeExito
        }`
      )
      .then((data) => {
        console.log("Contacto desde Sanity:", data);
        setContenido(data);
      })
      .catch((error) => {
        console.error(
          "Error cargando Contacto desde Sanity:",
          error
        );
      });
  }, []);

  // =====================================================
  // ENVÍO DEL FORMULARIO
  // =====================================================

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    alert(
      contenido?.mensajeExito ||
        "Formulario enviado. Nos pondremos en contacto contigo pronto."
    );

    setFormData({
      nombre: "",
      email: "",
      tipo: "consulta",
      mensaje: "",
    });
  };

  // =====================================================
  // FALLBACKS
  // =====================================================

  const heroTitulo =
    contenido?.heroTitulo || "Contacto";

  const heroSubtitulo =
    contenido?.heroSubtitulo ||
    "¿Tienes consultas, sugerencias o quieres postular?";

  const seccionTitulo =
    contenido?.seccionTitulo ||
    "Información de Contacto";

  const direccion =
    contenido?.direccion ||
    "Los Guayacanes 1308, Lagunillas 2, Coronel";

  const correos =
    contenido?.correos &&
    contenido.correos.length > 0
      ? contenido.correos
      : [
          "quinta@bomberoscoronel.cl",
          "capitania.quintacoronel@gmail.com",
        ];

  const telefono =
    contenido?.telefono ||
    "Contactar vía correo electrónico";

  const postulacionTitulo =
    contenido?.postulacionTitulo ||
    "¿Quieres ser bombero?";

  const postulacionTexto =
    contenido?.postulacionTexto ||
    "Si tienes vocación de servicio y quieres formar parte de nuestra compañía, envíanos tus datos a través del formulario indicando que deseas postular como voluntario.";

  return (
    <Layout>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative h-[40vh] min-h-[300px] flex items-end bg-navy overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />

        <div className="container mx-auto px-4 pb-16 relative z-10">

          <div className="w-16 h-1 bg-gold mb-6" />

          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">
            {heroTitulo}
          </h1>

          <p className="text-primary-foreground/70 text-lg mt-3">
            {heroSubtitulo}
          </p>

        </div>

      </section>

      {/* =====================================================
          CONTACTO
      ===================================================== */}

      <section className="py-20 bg-background">

        <div className="container mx-auto px-4">

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* =====================================================
                INFORMACIÓN
            ===================================================== */}

            <div>

              <div className="w-16 h-1 bg-secondary mb-6" />

              <h2 className="text-2xl font-extrabold uppercase text-foreground mb-6">
                {seccionTitulo}
              </h2>

              <div className="space-y-6">

                {/* DIRECCIÓN */}

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">

                    <MapPin className="h-5 w-5 text-primary" />

                  </div>

                  <div>

                    <h3 className="font-bold text-foreground text-sm uppercase">
                      Dirección
                    </h3>

                    <p className="text-muted-foreground text-sm mt-1">
                      {direccion}
                    </p>

                  </div>

                </div>

                {/* CORREO */}

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">

                    <Mail className="h-5 w-5 text-primary" />

                  </div>

                  <div>

                    <h3 className="font-bold text-foreground text-sm uppercase">
                      Correo Electrónico
                    </h3>

                    <div className="mt-1">

                      {correos.map((correo, index) => (

                        <p
                          key={`${correo}-${index}`}
                          className="text-muted-foreground text-sm"
                        >
                          {correo}
                        </p>

                      ))}

                    </div>

                  </div>

                </div>

                {/* TELÉFONO */}

                <div className="flex items-start gap-4">

                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">

                    <Phone className="h-5 w-5 text-primary" />

                  </div>

                  <div>

                    <h3 className="font-bold text-foreground text-sm uppercase">
                      Teléfono
                    </h3>

                    <p className="text-muted-foreground text-sm mt-1">
                      {telefono}
                    </p>

                  </div>

                </div>

              </div>

              {/* =====================================================
                  POSTULACIÓN
              ===================================================== */}

              <div className="mt-10 p-6 bg-muted rounded-lg">

                <h3 className="font-extrabold uppercase text-foreground text-sm mb-2">
                  {postulacionTitulo}
                </h3>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {postulacionTexto}
                </p>

              </div>

            </div>

            {/* =====================================================
                FORMULARIO
            ===================================================== */}

            <div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NOMBRE */}

                <div>

                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    {contenido?.formularioNombreLabel ||
                      "Nombre Completo"}
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="Tu nombre"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    {contenido?.formularioEmailLabel ||
                      "Correo Electrónico"}
                  </label>

                  <input
                    type="email"
                    required
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="tu@email.com"
                  />

                </div>

                {/* MOTIVO */}

                <div>

                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    {contenido?.formularioMotivoLabel ||
                      "Motivo"}
                  </label>

                  <select
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >

                    <option value="consulta">
                      Consulta General
                    </option>

                    <option value="postulacion">
                      Postulación como Voluntario
                    </option>

                    <option value="sugerencia">
                      Sugerencia
                    </option>

                    <option value="reclamo">
                      Reclamo
                    </option>

                    <option value="felicitacion">
                      Felicitación
                    </option>

                  </select>

                </div>

                {/* MENSAJE */}

                <div>

                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    {contenido?.formularioMensajeLabel ||
                      "Mensaje"}
                  </label>

                  <textarea
                    required
                    maxLength={1000}
                    rows={5}
                    value={formData.mensaje}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mensaje: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />

                </div>

                {/* BOTÓN */}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wider px-8 py-4 rounded-md hover:opacity-90 transition-opacity"
                >

                  <Send className="h-4 w-4" />

                  {contenido?.botonTexto ||
                    "Enviar Mensaje"}

                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

    </Layout>
  );
};

export default Contacto;