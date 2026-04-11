import { useState } from "react";
import Layout from "@/components/Layout";
import { Mail, MapPin, Phone, Send } from "lucide-react";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    tipo: "consulta",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Formulario enviado. Nos pondremos en contacto contigo pronto.");
    setFormData({ nombre: "", email: "", tipo: "consulta", mensaje: "" });
  };

  return (
    <Layout>
      <section className="relative h-[40vh] min-h-[300px] flex items-end bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Contacto</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">¿Tienes consultas, sugerencias o quieres postular?</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="w-16 h-1 bg-secondary mb-6" />
              <h2 className="text-2xl font-extrabold uppercase text-foreground mb-6">Información de Contacto</h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm uppercase">Dirección</h3>
                    <p className="text-muted-foreground text-sm mt-1">Los Guayacanes 1308, Lagunillas 2, Coronel</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm uppercase">Correo Electrónico</h3>
                    <p className="text-muted-foreground text-sm mt-1">quinta@bomberoscoronel.cl</p>
                    <p className="text-muted-foreground text-sm">capitania.quintacoronel@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm uppercase">Teléfono</h3>
                    <p className="text-muted-foreground text-sm mt-1">Contactar vía correo electrónico</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-muted rounded-lg">
                <h3 className="font-extrabold uppercase text-foreground text-sm mb-2">¿Quieres ser bombero?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Si tienes vocación de servicio y quieres formar parte de nuestra compañía, 
                  envíanos tus datos a través del formulario indicando que deseas postular como voluntario.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={255}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    Motivo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors"
                  >
                    <option value="consulta">Consulta General</option>
                    <option value="postulacion">Postulación como Voluntario</option>
                    <option value="sugerencia">Sugerencia</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="felicitacion">Felicitación</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wider text-foreground mb-2">
                    Mensaje
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={5}
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors resize-none"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold uppercase text-sm tracking-wider px-8 py-4 rounded-md hover:opacity-90 transition-opacity"
                >
                  <Send className="h-4 w-4" />
                  Enviar Mensaje
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
