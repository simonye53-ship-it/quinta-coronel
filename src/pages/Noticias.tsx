import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

const posts = [
  {
    id: 1,
    title: "Entrenamiento de Rescate Vehicular 2025",
    excerpt: "Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro de última generación.",
    image: fotoRescate,
    date: "15 Mar 2025",
    category: "Entrenamiento",
  },
  {
    id: 2,
    title: "Jornada Comunitaria en Lagunillas",
    excerpt: "La compañía participó en una actividad comunitaria con los vecinos del sector, acercando la labor bomberil a los más pequeños.",
    image: fotoComunidad,
    date: "28 Feb 2025",
    category: "Comunidad",
  },
  {
    id: 3,
    title: "Nuevo Equipamiento para la Compañía",
    excerpt: "Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.",
    image: fotoEquipo,
    date: "10 Feb 2025",
    category: "Equipamiento",
  },
  {
    id: 4,
    title: "Ceremonia de Aniversario 74°",
    excerpt: "La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.",
    image: fotoFormacion,
    date: "20 Feb 2025",
    category: "Institucional",
  },
  {
    id: 5,
    title: "Simulacro de Emergencia con Carabineros",
    excerpt: "Se realizó un simulacro conjunto con Carabineros y SAMU para mejorar la coordinación interinstitucional.",
    image: fotoRescate,
    date: "5 Ene 2025",
    category: "Entrenamiento",
  },
  {
    id: 6,
    title: "Campaña de Recaudación de Fondos",
    excerpt: "La campaña anual de recaudación permitió adquirir insumos médicos y equipamiento básico para la compañía.",
    image: fotoComunidad,
    date: "15 Dic 2024",
    category: "Institucional",
  },
];

const Noticias = () => {
  return (
    <Layout>
      <section className="relative h-[40vh] min-h-[300px] flex items-end bg-navy overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-navy" />
        <div className="container mx-auto px-4 pb-16 relative z-10">
          <div className="w-16 h-1 bg-gold mb-6" />
          <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground">Noticias</h1>
          <p className="text-primary-foreground/70 text-lg mt-3">Novedades de la Quinta Compañía</p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                to={`/noticias/${post.id}`}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all border border-border"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <h3 className="font-extrabold text-foreground text-lg leading-snug group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Noticias;
