export function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand-icon">
            <div className="badge-mini">
              <i className="fas fa-cow"></i>
            </div>
            <div className="name">
              INV. EL REY
              <small>LÁCTEOS DE FALCÓN · 2020</small>
            </div>
          </div>
          <p>
            Productos lácteos artesanales de la mejor calidad, elaborados con pasión
            en el occidente de Falcón.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://wa.me/584121234253"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <i className="fab fa-whatsapp"></i>
            </a>
            <a href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <div className="contact-item">
            <i className="fas fa-phone-alt"></i>
            <span>+58 412 1234253</span>
          </div>
          <div className="contact-item">
            <i className="fab fa-whatsapp"></i>
            <span>+58 412 1234253</span>
          </div>
          <div className="contact-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>Llanito, Parr. San Félix, Mcpio Mauroa, Edo. Falcón</span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Horario</h4>
          <ul>
            <li style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
              Lun – Vie: 8:00 am – 6:00 pm
            </li>
            <li style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
              Sábado: 8:00 am – 2:00 pm
            </li>
            <li style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.9rem" }}>
              Domingo: Cerrado
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; 2026 <a href="#">Inv. El Rey 2020</a> — Todos los derechos reservados. Created By <a href="https://josermdev.vercel.app/" target="_blank">JosermDev</a>
      </div>
    </footer>
  );
}
