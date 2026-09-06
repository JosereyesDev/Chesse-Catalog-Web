"use client";

import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const LINKS = [
  { targetId: "inicio", label: "Inicio" },
  { targetId: "catalogo", label: "Catálogo" },
  { targetId: "nosotros", label: "Nosotros" },
  { targetId: "ubicacion", label: "Ubicación" },
  { targetId: "contacto", label: "Contacto" },
];

export function Navbar({
  cartCount,
  onCartClick,
}: {
  cartCount: number;
  onCartClick: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("inicio");

  const isClickScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Observer para detectar sección activa durante scroll manual
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      if (isClickScrollRef.current) return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    LINKS.forEach((link) => {
      const section = document.getElementById(link.targetId);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  // Scroll suave con easing cúbico
  const smoothScrollTo = (targetPosition: number, duration: number) => {
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Easing easeInOutCubic
    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const currentPosition = startPosition + distance * easedProgress;
      window.scrollTo(0, currentPosition);
      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // Bloquear observer durante el scroll automático
    isClickScrollRef.current = true;
    setActiveSection(targetId);

    const element = document.getElementById(targetId);
    if (!element) return;

    // Calcular offset usando la altura del navbar (consistente en todos los tamaños)
    const navbarElement = document.querySelector(".navbar");
    const navOffset = navbarElement ? navbarElement.getBoundingClientRect().height : 0;

    // Margen extra de 10px para separar la sección del borde superior
    const extraMargin = 10;
    const targetPosition =
      element.getBoundingClientRect().top + window.scrollY - navOffset - extraMargin;

    // Cerrar menú móvil (el offset ya está calculado)
    setMobileOpen(false);

    const DURATION_MS = 800; // más ágil
    smoothScrollTo(targetPosition, DURATION_MS);

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isClickScrollRef.current = false;
    }, DURATION_MS + 50);
  };

  return (
    <header className="site-header">
      <div className="navbar">
        <div className="brandmark">
          <div className="badge-mini">
            <i className="fas fa-cow"></i>
          </div>
          <div className="name">
            INV. EL REY
            <small>LÁCTEOS DE FALCÓN · 2020</small>
          </div>
        </div>

        <nav className="links">
          {LINKS.map((l) => (
            <a
              key={l.targetId}
              href={`#${l.targetId}`}
              className={activeSection === l.targetId ? "active" : ""}
              onClick={(e) => handleScroll(e, l.targetId)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-cta">
          <button className="cart-pill" onClick={onCartClick}>
            <i className="fas fa-shopping-cart"></i> <span>Carrito</span>{" "}
            <span className="count">{cartCount}</span>
          </button>
          <button className="burger" onClick={() => setMobileOpen((v) => !v)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <nav id="mobileNav" style={{ display: mobileOpen ? "flex" : "none" }}>
        {LINKS.map((l) => (
          <a
            key={l.targetId}
            href={`#${l.targetId}`}
            className={activeSection === l.targetId ? "active" : ""}
            onClick={(e) => handleScroll(e, l.targetId)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}