"use client";

import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/components/CartProvider";

export function Catalog({ products }: { products: Product[] }) {
  const [activeCat, setActiveCat] = useState("Todos");
  const { openProductModal } = useCart();

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts =
    activeCat === "Todos" ? products : products.filter((p) => p.category === activeCat);

  return (
    <div className="app-wrapper">
      <section className="catalog" id="catalogo">
        <div className="section-head">
          <span className="eyebrow">Catálogo</span>
          <h2>Arma tu pedido</h2>
          <p>
            Selecciona la cantidad de cada producto y agrégalo al carrito. Al
            finalizar, te ayudamos a enviar el pedido directo por WhatsApp.
          </p>
        </div>

        <div className="cat-filterbar">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`chip ${activeCat === cat ? "active" : ""}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="prod-grid">
          {filteredProducts.map((product) => {
            const outOfStock = !product.in_stock;
            const unitLabel = product.unit === "kg" ? "kg" : "unidad";
            const weightInfo = `(${product.weight_per_unit} kg/${unitLabel})`;

            return (
              <div className="prod-card" key={product.id}>
                <div
                  className="prod-media"
                  style={
                    product.image
                      ? { backgroundImage: `url('${product.image}')` }
                      : undefined
                  }
                >
                  {!product.image && <span style={{ fontSize: "2.5rem" }}>🧀</span>}
                  {outOfStock && <span className="prod-tag">Sin stock</span>}
                </div>
                <div className="prod-body">
                  <h3>{product.name}</h3>
                  <p className="desc">{product.description}</p>
                  <div className="prod-price">
                    <span className="amount">${Number(product.base_price).toFixed(2)}</span>
                    <span className="unit">
                      / {unitLabel} {weightInfo}
                    </span>
                  </div>
                  <div className="prod-actions">
                    <button
                      className="btn-add"
                      disabled={outOfStock}
                      onClick={() => openProductModal(product)}
                    >
                      <i className={`fas ${outOfStock ? "fa-ban" : "fa-cart-plus"}`}></i>
                      {outOfStock ? "Sin stock" : "Añadir"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
