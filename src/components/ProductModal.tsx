"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";

export function ProductModal({
  product,
  existingQty,
  cartTotal,
  onClose,
  onAdd,
}: {
  product: Product | null;
  existingQty: number;
  cartTotal: number;
  onClose: () => void;
  onAdd: (product: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);
  const [bumpKey, setBumpKey] = useState(0);

  useEffect(() => {
    if (product) {
      setQty(existingQty || 1);
    }
  }, [product, existingQty]);

  if (!product) return null;

  const isKg = product.unit === "kg";
  const step = isKg ? 0.5 : 1;
  const unitLabel = isKg ? "kg" : "unidad";

  const clamp = (v: number) => {
    let val = isKg ? Math.round(v * 2) / 2 : Math.round(v);
    if (isNaN(val) || val < 1) val = 1;
    return val;
  };

  const changeQty = (delta: number) => {
    setQty((prev) => clamp(prev + delta));
    setBumpKey((k) => k + 1);
  };

  const subtotal = qty * product.base_price;
  const weightNow = qty * product.weight_per_unit;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <button className="modal-close" aria-label="Cerrar" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-product-info">
          <div className="modal-product-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              "🧀"
            )}
          </div>
          <div className="modal-product-details">
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className="modal-price-per-kg">
              ${product.base_price.toFixed(2)} / {unitLabel} (
              {product.weight_per_unit} kg/{unitLabel})
            </span>
          </div>
        </div>

        <div className="modal-min-badge">
          <i className="fas fa-info-circle"></i> Venta mínima: 1 {unitLabel}
        </div>

        <div className="modal-kg-control">
          <button aria-label="Disminuir cantidad" onClick={() => changeQty(-step)}>
            −
          </button>
          <input
            type="number"
            value={qty}
            step={step}
            min={1}
            onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
            onBlur={(e) => setQty(clamp(parseFloat(e.target.value)))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onAdd(product, clamp(qty));
              }
            }}
          />
          <span className="kg-label">{unitLabel}</span>
          <button aria-label="Aumentar cantidad" onClick={() => changeQty(step)}>
            +
          </button>
        </div>

        {!isKg && (
          <div className="modal-weight-live">
            <i className="fas fa-weight-hanging"></i>
            <span>Equivale a</span>
            <span key={bumpKey} className="modal-weight-number bump">
              {weightNow.toFixed(2)}
            </span>
            <span>kg</span>
          </div>
        )}

        <div className="modal-total-row">
          <span>Subtotal producto</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="modal-cart-summary">
          <span>🛒 Carrito acumulado</span>
          <span className="summary-total">${(cartTotal + subtotal).toFixed(2)}</span>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="modal-btn-add" onClick={() => onAdd(product, clamp(qty))}>
            <i className="fas fa-cart-plus"></i> Añadir
          </button>
        </div>
      </div>
    </div>
  );
}
