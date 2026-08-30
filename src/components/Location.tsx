export function Location() {
  return (
    <section className="section-padded" id="ubicacion">
      <div className="app-wrapper">
        <div className="section-head" style={{ maxWidth: "100%", marginBottom: 20 }}>
          <span className="eyebrow">Ubicación</span>
          <h2>Visítanos</h2>
          <p>Estamos en el Llanito, Parroquia San Félix, Municipio Mauroa, Estado Falcón.</p>
        </div>
        <div className="map-wrapper">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31375.7513147297!2d-70.8775705!3d10.7937887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e85b4f08f0f0f0f%3A0x0!2zMTDCsDQ3JzM3LjYiTiA3MMKwNTInMzkuMSJX!5e0!3m2!1ses!2sve!4v1640000000000"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="ubi-details">
          <div className="ubi-item">
            <i className="fas fa-map-pin"></i> <span>Llanito, Parr. San Félix</span>
          </div>
          <div className="ubi-item">
            <i className="fas fa-city"></i> <span>Municipio Mauroa, Falcón</span>
          </div>
          <div className="ubi-item">
            <i className="fas fa-clock"></i> <span>Lun–Vie 8am–6pm · Sáb 8am–2pm</span>
          </div>
        </div>
      </div>
    </section>
  );
}
