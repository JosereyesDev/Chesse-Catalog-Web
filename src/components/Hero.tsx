export function Hero() {
  return (
    <header className="hero-header" id="inicio">
      <svg className="clouds" viewBox="0 0 1180 500" preserveAspectRatio="none">
        <ellipse cx="120" cy="60" rx="90" ry="30" fill="#fff" />
        <ellipse cx="200" cy="45" rx="70" ry="26" fill="#fff" />
        <ellipse cx="980" cy="110" rx="110" ry="34" fill="#fff" />
        <ellipse cx="1080" cy="80" rx="70" ry="24" fill="#fff" />
        <ellipse cx="560" cy="30" rx="60" ry="18" fill="#fff" opacity=".6" />
      </svg>

      <div className="hero-header-inner">
        <div className="hero-copy">
          <h1 className="headline">El Queso</h1>
          <span className="script-line">en tu mesa es de&hellip;</span>
          <h1 className="wordmark">INV. EL REY 2020</h1>
          <p className="lead">
            Te ofrecemos los mejores productos lácteos del occidente de Falcón.
          </p>
          <div className="locbox">
            <i className="fas fa-map-marker-alt"></i>{" "}
            <span>
              Ubicados en el Llanito — Parr. San Félix, Mcpio Mauroa, Edo. Falcón
            </span>
          </div>
          <div className="cta-row">
            <a href="#catalogo" className="btn btn-yellow">
              Ver catálogo
            </a>
            <a
              href="https://wa.me/584121234253"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <i className="fab fa-whatsapp"></i> Pedir por WhatsApp
            </a>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-art-circle">
            <div
              className="hero-art-bg"
              style={{ backgroundImage: "url('/images/inv_el_rey_milk.png')" }}
            />
            <div
              style={{ backgroundImage: "url('/images/inv_el_rey.png')" }}
              className="hero-art-image"
            />
          </div>
        </div>
      </div>

      <div className="wave-divider">
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none">
          <path
            d="M0,40 C240,110 480,0 720,40 C960,80 1200,10 1440,50 L1440,110 L0,110 Z"
            fill="#ffffff"
          />
          <circle cx="220" cy="92" r="8" fill="#ffffff" />
          <circle cx="700" cy="98" r="6" fill="#ffffff" />
          <circle cx="1180" cy="90" r="9" fill="#ffffff" />
        </svg>
      </div>
    </header>
  );
}