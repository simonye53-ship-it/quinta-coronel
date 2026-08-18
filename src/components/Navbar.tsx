import {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {Menu, X, ChevronDown, Sparkles} from "lucide-react";
import logoCircular from "@/assets/logo-circular.jpg";

const menuItems = [
  {
    label: "Inicio",
    path: "/",
  },
  {
    label: "Nosotros",
    children: [
      {
        label: "Historia",
        path: "/historia",
      },
      {
        label: "Oficialidad",
        path: "/oficialidad",
      },
      {
        label: "Voluntarios",
        path: "/voluntarios",
      },
    ],
  },
  {
    label: "Nuestro Cuartel",
    children: [
      {
        label: "Especialidades",
        path: "/especialidades",
      },
      {
        label: "Material Mayor",
        path: "/material-mayor",
      },
    ],
  },
  {
    label: "Hazte Socio",
    path: "/hazte-socio",
  },
  {
    label: "Noticias",
    path: "/noticias",
  },
  {
    label: "Contacto",
    path: "/contacto",
  },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const location = useLocation();

  // =====================================================
  // DETECTAR SCROLL
  // =====================================================

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =====================================================
  // CERRAR MENÚ AL CAMBIAR DE RUTA
  // =====================================================

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // =====================================================
  // DETECTAR RUTA ACTIVA
  // =====================================================

  const isPathActive = (path?: string) => {
    if (!path) {
      return false;
    }

    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/noticias") {
      return (
        location.pathname === "/noticias" ||
        location.pathname.startsWith("/noticias/")
      );
    }

    return location.pathname === path;
  };

  // =====================================================
  // DETECTAR SI UN DROPDOWN ESTÁ ACTIVO
  // =====================================================

  const isDropdownActive = (
    children?: {
      label: string;
      path: string;
    }[]
  ) => {
    if (!children) {
      return false;
    }

    return children.some((child) => isPathActive(child.path));
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy shadow-lg py-2"
          : "bg-navy/80 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* =====================================================
            LOGO
        ===================================================== */}

        <Link
          to="/"
          className="flex items-center gap-3"
          aria-label="Ir al inicio"
        >
          <img
            src={logoCircular}
            alt="Quinta Compañía de Bomberos de Coronel"
            className="h-12 w-12 rounded-full object-cover"
          />

          <div className="hidden md:block">

            <span className="text-primary-foreground font-extrabold text-sm uppercase tracking-wide leading-tight block">
              Quinta Compañía
            </span>

            <span className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">
              Bomberos de Coronel
            </span>

          </div>
        </Link>

        {/* =====================================================
            MENÚ ESCRITORIO
        ===================================================== */}

        <div className="hidden lg:flex items-center">

          <Link
            to="/asistente"
            className={`mr-4 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-extrabold uppercase tracking-wider transition-all ${
              isPathActive("/asistente")
                ? "border-gold bg-gold text-gold-foreground shadow-[0_0_24px_hsl(var(--gold)/0.22)]"
                : "border-primary/60 bg-primary/20 text-primary-foreground hover:border-gold/70 hover:bg-primary/35 hover:text-gold"
            }`}
            aria-label="Abrir Asistente IA"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Asistente IA
          </Link>

          <div className="h-7 w-px bg-primary-foreground/15 mr-3" aria-hidden="true" />

          <div className="flex items-center gap-0">

          {menuItems.map((item) => {

            const itemActivo = item.path
              ? isPathActive(item.path)
              : isDropdownActive(item.children);

            return (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => {
                  if (item.children) {
                    setOpenDropdown(item.label);
                  }
                }}
                onMouseLeave={() => {
                  if (item.children) {
                    setOpenDropdown(null);
                  }
                }}
              >

                {item.path ? (

                  <Link
                    to={item.path}
                    className={`nav-link px-4 py-2 rounded-md inline-flex items-center gap-1 ${
                      itemActivo
                        ? "text-gold"
                        : "text-primary-foreground hover:text-gold"
                    }`}
                  >
                    {item.label}
                  </Link>

                ) : (

                  <button
                    type="button"
                    className={`nav-link px-4 py-2 rounded-md inline-flex items-center gap-1 ${
                      itemActivo
                        ? "text-gold"
                        : "text-primary-foreground hover:text-gold"
                    }`}
                  >
                    {item.label}

                    <ChevronDown className="h-3 w-3" />

                  </button>

                )}

                {/* =====================================================
                    DROPDOWN ESCRITORIO
                ===================================================== */}

                {item.children &&
                  openDropdown === item.label && (

                    <div className="absolute top-full left-0 mt-0 bg-navy border border-primary-foreground/10 rounded-md shadow-xl min-w-[200px] py-2 z-50">

                      {item.children.map((child) => {

                        const childActivo =
                          isPathActive(child.path);

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                              childActivo
                                ? "text-gold bg-primary-foreground/5"
                                : "text-primary-foreground/80 hover:text-gold hover:bg-primary-foreground/5"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}

                    </div>

                  )}

              </div>
            );
          })}

          </div>

        </div>

        {/* =====================================================
            BOTÓN MENÚ MÓVIL
        ===================================================== */}

        <button
          type="button"
          className="lg:hidden text-primary-foreground p-2"
          onClick={() => {
            setMobileOpen(!mobileOpen);
          }}
          aria-label={
            mobileOpen
              ? "Cerrar menú"
              : "Abrir menú"
          }
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

      </div>

      {/* =====================================================
          MENÚ MÓVIL
      ===================================================== */}

      {mobileOpen && (

        <div className="lg:hidden bg-navy border-t border-primary-foreground/10">

          <div className="container mx-auto px-4 py-4 space-y-1">

            <Link
              to="/asistente"
              className={`mb-3 flex items-center gap-3 rounded-md border px-4 py-3 text-sm font-extrabold uppercase tracking-wider ${
                isPathActive("/asistente")
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-primary/60 bg-primary/20 text-primary-foreground"
              }`}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Asistente IA
            </Link>

            <div className="h-px bg-primary-foreground/10 mb-3" aria-hidden="true" />

            {menuItems.map((item) => {

              const itemActivo = item.path
                ? isPathActive(item.path)
                : isDropdownActive(item.children);

              return (
                <div key={item.label}>

                  {item.path ? (

                    <Link
                      to={item.path}
                      className={`block py-3 px-4 nav-link ${
                        itemActivo
                          ? "text-gold"
                          : "text-primary-foreground hover:text-gold"
                      }`}
                    >
                      {item.label}
                    </Link>

                  ) : (

                    <>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenDropdown(
                            openDropdown === item.label
                              ? null
                              : item.label
                          );
                        }}
                        className={`flex items-center justify-between w-full py-3 px-4 nav-link ${
                          itemActivo
                            ? "text-gold"
                            : "text-primary-foreground"
                        }`}
                      >

                        {item.label}

                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            openDropdown === item.label
                              ? "rotate-180"
                              : ""
                          }`}
                        />

                      </button>

                      {openDropdown === item.label &&
                        item.children?.map((child) => {

                          const childActivo =
                            isPathActive(child.path);

                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`block py-2.5 pl-8 pr-4 text-sm font-semibold uppercase tracking-wider ${
                                childActivo
                                  ? "text-gold"
                                  : "text-primary-foreground/70 hover:text-gold"
                              }`}
                            >
                              {child.label}
                            </Link>
                          );
                        })}

                    </>

                  )}

                </div>
              );
            })}

          </div>

        </div>

      )}

    </nav>
  );
};

export default Navbar;
