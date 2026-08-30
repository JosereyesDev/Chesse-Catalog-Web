"use client";

import { CartItem } from "@/types";

export function CartSidebar({
  isOpen,
  onClose,
  cart,
  updateQuantity,
  removeFromCart,
  clearCart,
  onConfirmOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  onConfirmOrder: () => void;
}) {
  const total = cart.reduce((sum, item) => sum + item.quantity * item.product.base_price, 0);

  return (
    <>
      <div className={`cart-panel-overlay ${isOpen ? "active" : ""}`} onClick={onClose} />

      <div className={`cart-panel ${isOpen ? "open" : ""}`}>
        <div className="cart-panel-header">
          <h2>
            <i className="fas fa-shopping-cart"></i> Carrito
          </h2>
          <button className="cart-panel-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cart-panel-body">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <i className="fas fa-box-open"></i> Aún no hay productos
            </div>
          ) : (
            cart.map((item) => {
              const unitLabel = item.product.unit === "kg" ? "kg" : "unidad";
              const displayQty =
                item.product.unit === "kg" ? item.quantity.toFixed(1) : Math.round(item.quantity);
              const weightTotal = (item.quantity * item.product.weight_per_unit).toFixed(2);
              const step = item.product.unit === "kg" ? 0.5 : 1;

              return (
                <div className="cart-item" key={item.product.id}>
                  <div className="cart-item-top">
                    <div className="cart-item-left">
                      <span className="cart-item-icon">📦</span>
                      <span className="cart-item-name">{item.product.name}</span>
                      <span className="cart-item-unit">{unitLabel}</span>
                    </div>
                    <button
                      className="cart-item-remove"
                      aria-label="Eliminar"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </div>

                  <div className="cart-item-details">
                    <span className="cart-item-detail">
                      <i className="fas fa-weight-hanging"></i> <strong>{weightTotal}</strong> kg
                    </span>
                    <span className="cart-item-detail">
                      <i className="fas fa-tag"></i>{" "}
                      <strong>${item.product.base_price.toFixed(2)}</strong> / {unitLabel}
                    </span>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="cart-qty-control">
                      <button aria-label="Disminuir" onClick={() => updateQuantity(item.product.id, -step)}>
                        −
                      </button>
                      <span className="qty-display">{displayQty}</span>
                      <button aria-label="Aumentar" onClick={() => updateQuantity(item.product.id, step)}>
                        +
                      </button>
                    </div>
                    <span className="cart-item-subtotal">
                      ${(item.quantity * item.product.base_price).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-panel-footer">
          <div className="cart-panel-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="cart-panel-actions">
            <button className="btn-clear" onClick={clearCart} disabled={cart.length === 0}>
              <i className="fas fa-trash-alt"></i> Vaciar
            </button>
            <button className="btn-confirm" onClick={onConfirmOrder} disabled={cart.length === 0}>
              <i className="fab fa-whatsapp"></i> Confirmar pedido
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
