import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logoCircular from "@/assets/logo-circular.jpg";

const menuItems = [
  { label: "Inicio", path: "/" },
  {
    label: "Nosotros",
    children: [
      { label: "Historia", path: "/historia" },
      { label: "Oficialidad", path: "/oficialidad" },
      { label: "Voluntarios", path: "/voluntarios" },
    ],
  },
  {
    label: "Nuestro Cuartel",
    children: [
      { label: "Especialidades", path: "/especialidades" },
      { label: "Material Mayor", path: "/material-mayor" },
    ],
  },
  { label: "Hazte Socio", path: "/hazte-socio" },
  { label: "Noticias", path: "/noticias" },
  { label: "Contacto", path: "/contacto" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy shadow-lg py-2"
          : "bg-navy/80 py-4"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
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

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.path ? (
                <Link
                  to={item.path}
                  className={`nav-link px-4 py-2 rounded-md inline-flex items-center gap-1 ${
                    location.pathname === item.path
                      ? "text-gold"
                      : "text-primary-foreground hover:text-gold"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className={`nav-link px-4 py-2 rounded-md inline-flex items-center gap-1 ${
                    item.children?.some((c) => location.pathname === c.path)
                      ? "text-gold"
                      : "text-primary-foreground hover:text-gold"
                  }`}
                >
                  {item.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}

              {/* Dropdown */}
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-0 bg-navy border border-primary-foreground/10 rounded-md shadow-xl min-w-[200px] py-2 z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`block px-5 py-2.5 text-sm font-semibold uppercase tracking-wider transition-colors ${
                        location.pathname === child.path
                          ? "text-gold bg-primary-foreground/5"
                          : "text-primary-foreground/80 hover:text-gold hover:bg-primary-foreground/5"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-primary-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-navy border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.path ? (
                  <Link
                    to={item.path}
                    className={`block py-3 px-4 nav-link ${
                      location.pathname === item.path
                        ? "text-gold"
                        : "text-primary-foreground hover:text-gold"
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
                      }
                      className="flex items-center justify-between w-full py-3 px-4 nav-link text-primary-foreground"
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openDropdown === item.label &&
                      item.children?.map((child) => (
                        <Link
                          key={child.path}
                          to={child.path}
                          className={`block py-2.5 pl-8 pr-4 text-sm font-semibold uppercase tracking-wider ${
                            location.pathname === child.path
                              ? "text-gold"
                              : "text-primary-foreground/70 hover:text-gold"
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
