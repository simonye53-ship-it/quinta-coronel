import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

const postsData: Record<string, { title: string; date: string; category: string; image: string; content: string }> = {
  "1": {
    title: "Entrenamiento de Rescate Vehicular 2025",
    date: "15 de Marzo, 2025",
    category: "Entrenamiento",
    image: fotoRescate,
    content: `Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro de última generación.\n\nDurante tres días intensivos de formación, los bomberos perfeccionaron técnicas de corte, separación y estabilización vehicular, bajo la dirección de instructores certificados.\n\nLa capacitación incluyó escenarios simulados de volcamientos, colisiones laterales y atrapamientos múltiples, preparando al equipo para enfrentar cualquier tipo de emergencia vehicular.\n\nEste tipo de entrenamientos son fundamentales para mantener los estándares de excelencia que caracterizan a nuestra compañía y para asegurar la mejor respuesta posible ante cada emergencia.`,
  },
  "2": {
    title: "Jornada Comunitaria en Lagunillas",
    date: "28 de Febrero, 2025",
    category: "Comunidad",
    image: fotoComunidad,
    content: `La compañía participó en una actividad comunitaria con los vecinos del sector Lagunillas, acercando la labor bomberil a los más pequeños.\n\nLos niños y niñas del sector pudieron conocer de cerca los vehículos de emergencia, probarse equipos de protección y aprender sobre prevención de incendios.\n\nEsta actividad refuerza el compromiso de la Quinta Compañía con su comunidad, promoviendo la educación en seguridad y prevención desde temprana edad.`,
  },
  "3": {
    title: "Nuevo Equipamiento para la Compañía",
    date: "10 de Febrero, 2025",
    category: "Equipamiento",
    image: fotoEquipo,
    content: `Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.\n\nEl nuevo equipamiento incluye trajes estructurales, cascos, botas y guantes que cumplen con las normas internacionales de seguridad más exigentes.\n\nEsta inversión en seguridad es posible gracias a las contribuciones mensuales de nuestros socios colaboradores y al esfuerzo de autogestión de la compañía.`,
  },
  "4": {
    title: "Ceremonia de Aniversario 74°",
    date: "20 de Febrero, 2025",
    category: "Institucional",
    image: fotoFormacion,
    content: `La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.\n\nLa ceremonia contó con la participación de autoridades locales, representantes del Cuerpo de Bomberos de Coronel y la comunidad.\n\nSe realizó un reconocimiento a los voluntarios más antiguos y se renovó el compromiso de servicio que desde 1951 guía a nuestra institución bajo el lema "Honor y Sacrificio".`,
  },
};

const NoticiaDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const post = postsData[id || ""];

  if (!post) {
    return (
      <Layout>
        <div className="pt-32 pb-20 container mx-auto px-4 text-center">
          <h1 className="text-3xl font-black uppercase text-foreground mb-4">Noticia no encontrada</h1>
          <Link to="/noticias" className="text-primary font-bold hover:underline">Volver a Noticias</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-navy overflow-hidden">
        <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="hero-overlay absolute inset-0" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <Link to="/noticias" className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-gold text-sm font-semibold uppercase tracking-wider mb-4">
            <ArrowLeft className="h-4 w-4" /> Volver a Noticias
          </Link>
          <span className="block text-xs font-bold uppercase tracking-wider text-gold mb-2">{post.category} — {post.date}</span>
          <h1 className="text-3xl md:text-5xl font-black uppercase text-primary-foreground leading-tight max-w-3xl">
            {post.title}
          </h1>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {post.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-foreground/80 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NoticiaDetalle;
