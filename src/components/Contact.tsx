"use client";

import { useState } from "react";

export function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <section className="section-padded-alt" id="contacto">
      <div className="app-wrapper">
        <div className="section-head" style={{ maxWidth: "100%", marginBottom: 30 }}>
          <span className="eyebrow">Contacto</span>
          <h2>Escríbenos</h2>
          <p>
            ¿Tienes dudas, quieres hacer un pedido especial o necesitas más
            información? Estamos aquí para ayudarte.
          </p>
        </div>
        <div className="contact-grid">
          <div className="contact-form">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                e.currentTarget.reset();
              }}
            >
              <div className="form-group">
                <label htmlFor="contactName">Nombre completo</label>
                <input type="text" id="contactName" placeholder="Tu nombre" required />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Correo electrónico</label>
                <input type="email" id="contactEmail" placeholder="tucorreo@ejemplo.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone">Teléfono</label>
                <input type="tel" id="contactPhone" placeholder="Ej: 0412 123 4567" />
              </div>
              <div className="form-group">
                <label htmlFor="contactMessage">Mensaje</label>
                <textarea id="contactMessage" placeholder="¿En qué podemos ayudarte?" />
              </div>
              <button type="submit" className="btn-submit">
                <i className="fas fa-paper-plane"></i> Enviar mensaje
              </button>
            </form>
            <p style={{ fontSize: "0.8rem", color: "#6b7a8a", marginTop: 12 }}>
              {sent ? "¡Gracias! Te responderemos a la brevedad." : "* Te responderemos a la brevedad."}
            </p>
          </div>

          <div className="contact-info-list">
            <div className="contact-info-item">
              <i className="fas fa-phone-alt"></i>
              <div className="info-text">
                <strong>Teléfono</strong>
                <small>+58 412 1234253</small>
              </div>
            </div>
            <div className="contact-info-item">
              <i className="fab fa-whatsapp"></i>
              <div className="info-text">
                <strong>WhatsApp</strong>
                <small>+58 412 1234253</small>
              </div>
            </div>
            <div className="contact-info-item">
              <i className="fas fa-envelope"></i>
              <div className="info-text">
                <strong>Correo electrónico</strong>
                <small>info@invelrey.com</small>
              </div>
            </div>
            <div className="contact-info-item">
              <i className="fas fa-map-marker-alt"></i>
              <div className="info-text">
                <strong>Dirección</strong>
                <small>Llanito, Parr. San Félix, Mcpio Mauroa, Edo. Falcón</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
