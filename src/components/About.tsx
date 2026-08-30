export function About() {
  return (
    <section className="section-padded-alt" id="nosotros">
      <div className="app-wrapper">
        <div className="section-head" style={{ maxWidth: "100%", marginBottom: 30 }}>
          <span className="eyebrow">Conócenos</span>
          <h2>Más de 10 años de tradición</h2>
          <p>
            En Inv. El Rey 2020 llevamos el sabor auténtico del campo a tu mesa, con
            productos lácteos de la más alta calidad.
          </p>
        </div>
        <div className="grid-2col">
          <div className="text-block">
            <p>
              <strong>Somos una empresa familiar</strong> con más de dos décadas de
              experiencia en la elaboración de quesos, cremas y derivados lácteos.
              Nuestra planta está ubicada en el corazón de Falcón, rodeada de los
              mejores hatos lecheros de la región.
            </p>
            <p>
              <strong>Misión:</strong> Proveer a nuestros clientes productos lácteos
              frescos, nutritivos y deliciosos, elaborados con estrictos estándares de
              higiene y calidad, preservando las técnicas artesanales que nos
              distinguen.
            </p>
            <p>
              <strong>Visión:</strong> Consolidarnos como la principal referencia de
              lácteos artesanales en el occidente de Venezuela, expandiendo nuestra
              presencia y manteniendo el compromiso con la excelencia.
            </p>
            <div className="values-list">
              <div className="value-item">
                <i className="fas fa-leaf"></i>
                <span>Naturalidad</span>
              </div>
              <div className="value-item">
                <i className="fas fa-hand-holding-heart"></i>
                <span>Compromiso</span>
              </div>
              <div className="value-item">
                <i className="fas fa-users"></i>
                <span>Calidad</span>
              </div>
              <div className="value-item">
                <i className="fas fa-recycle"></i>
                <span>Sostenibilidad</span>
              </div>
            </div>
          </div>
          <div className="image-block">
           <img src="/images/inv_el_rey_tradicion.jfif" alt="Nuestra producción" height="450"/>
            <p style={{ fontSize: "0.8rem", color: "#6b7a8a", marginTop: 8, textAlign: "center" }}>
              Elaboración artesanal en nuestra finca.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
