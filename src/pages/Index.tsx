import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Facebook, Instagram, Youtube } from "lucide-react";
import Layout from "@/components/Layout";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import fotoEquipo from "@/assets/foto-equipo-rescate.jpg";
import fotoRescate from "@/assets/foto-rescate-vehicular.jpg";
import fotoComunidad from "@/assets/foto-comunidad.jpg";
import fotoFormacion from "@/assets/foto-formacion.jpg";

const slides = [
  {
    image: hero1,
    title: "Honor y Sacrificio",
    subtitle: "Quinta Compañía del Cuerpo de Bomberos de Coronel",
    description: "Desde 1951 al servicio de nuestra comunidad",
  },
  {
    image: hero2,
    title: "Rescate Vehicular",
    subtitle: "Especialistas en salvar vidas",
    description: "Formación continua en técnicas de rescate de última generación",
  },
  {
    image: hero3,
    title: "Nuestro Cuartel",
    subtitle: "Bomba Reino de Bélgica",
    description: "Equipamiento y tecnología al servicio de Coronel",
  },
];

const newsItems = [
  {
    id: 1,
    title: "Entrenamiento de Rescate Vehicular 2025",
    excerpt: "Nuestros voluntarios completaron con éxito la última jornada de capacitación en rescate vehicular con herramientas Holmatro.",
    image: fotoRescate,
    date: "15 Mar 2025",
  },
  {
    id: 2,
    title: "Jornada Comunitaria en Lagunillas",
    excerpt: "La compañía participó en una actividad comunitaria con los vecinos del sector, acercando la labor bomberil a los más pequeños.",
    image: fotoComunidad,
    date: "28 Feb 2025",
  },
  {
    id: 3,
    title: "Nuevo Equipamiento para la Compañía",
    excerpt: "Gracias al apoyo de nuestros socios, la compañía recibió nuevo equipamiento de protección personal para sus voluntarios.",
    image: fotoEquipo,
    date: "10 Feb 2025",
  },
  {
    id: 4,
    title: "Ceremonia de Aniversario 74°",
    excerpt: "La Quinta Compañía celebró su 74° aniversario con una emotiva ceremonia en el cuartel de Lagunillas 2.",
    image: fotoFormacion,
    date: "20 Feb 2025",
  },
];

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <Layout>
      {/* Hero Slider - Full Screen */}
      <section className="relative h-screen w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            className="absolute inset-0"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="hero-overlay absolute inset-0" />
          </motion.div>
        </AnimatePresence>

        {/* Slide Content */}
        <div className="absolute inset-0 flex items-end pb-32 md:pb-40">
          <div className="container mx-auto px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-2xl"
              >
                <div className="w-16 h-1 bg-gold mb-6" />
                <h1 className="text-4xl md:text-6xl font-black uppercase text-primary-foreground leading-tight mb-4">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg md:text-xl font-semibold text-gold uppercase tracking-wider mb-3">
                  {slides[currentSlide].subtitle}
                </p>
                <p className="text-primary-foreground/80 text-base md:text-lg max-w-lg">
                  {slides[currentSlide].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="absolute bottom-10 left-0 right-0">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === currentSlide ? "w-12 bg-gold" : "w-6 bg-primary-foreground/30"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="p-2 border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Bar */}
      <section className="bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-primary-foreground/10">
            {[
              { label: "Nuestra Historia", path: "/historia" },
              { label: "Oficialidad", path: "/oficialidad" },
              { label: "Material Mayor", path: "/material-mayor" },
              { label: "Contacto", path: "/contacto" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className="py-5 px-4 text-center text-primary-foreground font-bold text-xs md:text-sm uppercase tracking-wider hover:bg-primary-foreground/10 transition-colors flex items-center justify-center gap-2"
              >
                {item.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="w-16 h-1 bg-secondary mx-auto mb-4" />
            <h2 className="section-title text-foreground">Novedades</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Últimas noticias y actividades de la Quinta Compañía
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsItems.map((item) => (
              <Link
                key={item.id}
                to={`/noticias/${item.id}`}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-border"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {item.date}
                  </span>
                  <h3 className="font-bold text-foreground mt-2 mb-2 text-sm leading-snug group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/noticias"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground font-bold uppercase text-sm tracking-wider px-8 py-3 rounded-md hover:opacity-90 transition-opacity"
            >
              Ver Todas las Noticias
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social / CTA Section */}
      <section className="bg-navy py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-1 bg-gold mb-6" />
              <h2 className="text-3xl md:text-4xl font-black uppercase text-navy-foreground leading-tight mb-4">
                Síguenos en Redes Sociales
              </h2>
              <p className="text-navy-foreground/70 mb-8 max-w-md">
                Mantente informado sobre nuestras actividades, entrenamientos y servicios a la comunidad de Coronel.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Youtube, label: "YouTube", href: "#" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-navy-foreground/10 text-navy-foreground hover:bg-gold hover:text-gold-foreground px-5 py-3 rounded-md font-bold text-sm uppercase tracking-wider transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <img src={fotoEquipo} alt="Equipo de rescate" loading="lazy" className="rounded-lg object-cover w-full aspect-square" />
              <img src={fotoComunidad} alt="Comunidad" loading="lazy" className="rounded-lg object-cover w-full aspect-square mt-6" />
              <img src={fotoFormacion} alt="Formación" loading="lazy" className="rounded-lg object-cover w-full aspect-square -mt-6" />
              <img src={fotoRescate} alt="Rescate" loading="lazy" className="rounded-lg object-cover w-full aspect-square" />
            </div>
          </div>
        </div>
      </section>

      {/* Hazte Socio Banner */}
      <section className="bg-secondary py-14">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black uppercase text-secondary-foreground mb-3">
            ¿Quieres apoyar a tu Quinta Compañía?
          </h2>
          <p className="text-secondary-foreground/80 mb-6 max-w-lg mx-auto">
            Hazte socio colaborador con un aporte mensual y ayúdanos a seguir sirviendo a Coronel.
          </p>
          <a
            href="https://app.reveniu.com/quintacoronel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-navy text-navy-foreground font-bold uppercase text-sm tracking-wider px-10 py-4 rounded-md hover:opacity-90 transition-opacity"
          >
            Hazte Socio Ahora
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
