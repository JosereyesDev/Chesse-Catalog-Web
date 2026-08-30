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

  // Ref para saber si el scroll lo causó un clic en el menú
  const isClickScrollRef = useRef(false);
  // Ref para almacenar el timer de desbloqueo
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detecta qué sección está visible en la pantalla durante el scroll manual
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Si el desplazamiento fue causado por un clic, ignoramos las secciones intermedias
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

  const smoothScrollTo = (targetPosition: number, duration: number) => {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setMobileOpen(false);

    // 1. Activamos la bandera para bloquear la detección automática mientras viaja la pantalla
    isClickScrollRef.current = true;

    // 2. Activamos de una el link al que diste clic
    setActiveSection(targetId);

    const element = document.getElementById(targetId);
    if (!element) return;

    const headerElement = document.querySelector(".site-header");
    const navOffset = headerElement ? headerElement.getBoundingClientRect().height : 0;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navOffset;

    const DURATION_MS = 1200;
    smoothScrollTo(targetPosition, DURATION_MS);

    // Limpiamos cualquier timeout previo
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

    // 3. Volvemos a permitir que el scroll manual controle los botones justo al terminar la animación
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