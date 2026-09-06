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
  // Ref para el "watcher" que detecta cuándo el scroll realmente terminó
  const scrollWatcherRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Limpieza del watcher si el componente se desmonta a mitad de un scroll
  useEffect(() => {
    return () => {
      if (scrollWatcherRef.current) clearTimeout(scrollWatcherRef.current);
    };
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    const element = document.getElementById(targetId);
    if (!element) return;

    // 1. Activamos la bandera para bloquear la detección automática mientras viaja la pantalla
    isClickScrollRef.current = true;

    // 2. Activamos de una el link al que diste clic
    setActiveSection(targetId);

    // Medimos solo la barra superior (.navbar), NO el <header> completo.
    // Si midiéramos ".site-header" aquí, en móvil incluiría también la altura
    // del menú desplegable (todavía abierto en este punto, porque React no
    // actualiza el DOM de forma síncrona al llamar a setMobileOpen). Eso
    // generaba un offset más grande de lo real y el scroll quedaba
    // desalineado. La altura de ".navbar" no cambia al abrir/cerrar el menú
    // móvil, así que el cálculo es consistente en cualquier tamaño de pantalla.
    const navbarElement = document.querySelector(".navbar");
    const navOffset = navbarElement ? navbarElement.getBoundingClientRect().height : 0;

    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navOffset;

    // Cerramos el menú móvil después de calcular la posición.
    setMobileOpen(false);

    // Dejamos que el navegador haga el scroll suave de forma NATIVA.
    // Esto evita el "se queda pegado y luego salta raro": ya no compiten
    // dos animaciones a la vez (la nuestra por rAF + la del navegador),
    // y el scroll corre en el hilo de composición, no se traba con los
    // re-renders de React que dispara el IntersectionObserver.
    window.scrollTo({ top: targetPosition, behavior: "smooth" });

    // 3. Desbloqueamos la detección automática cuando el scroll REALMENTE
    // termina (dos lecturas seguidas de scrollY sin cambios), en vez de
    // adivinar con un temporizador fijo que se desincroniza según la
    // distancia recorrida o el rendimiento del dispositivo.
    if (scrollWatcherRef.current) clearTimeout(scrollWatcherRef.current);

    let lastY = window.pageYOffset;
    let stableTicks = 0;

    const checkScrollEnd = () => {
      const currentY = window.pageYOffset;

      if (currentY === lastY) {
        stableTicks += 1;
      } else {
        stableTicks = 0;
        lastY = currentY;
      }

      // Dos chequeos seguidos (100ms) sin movimiento = el scroll terminó
      if (stableTicks >= 2) {
        isClickScrollRef.current = false;
        return;
      }

      scrollWatcherRef.current = setTimeout(checkScrollEnd, 100);
    };

    scrollWatcherRef.current = setTimeout(checkScrollEnd, 100);
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
