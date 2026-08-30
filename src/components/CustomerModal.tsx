"use client";

import { useEffect, useState } from "react";
import { CustomerData } from "@/types";

export function CustomerModal({
  open,
  total,
  savedCustomer,
  onClose,
  onSubmit,
}: {
  open: boolean;
  total: number;
  savedCustomer: CustomerData | null;
  onClose: () => void;
  onSubmit: (data: CustomerData) => void;
}) {
  const [name, setName] = useState("");
  const [cedula, setCedula] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setName(savedCustomer?.name || "");
      setCedula(savedCustomer?.cedula || "");
      setPhone(savedCustomer?.phone || "");
      setAddress(savedCustomer?.address || "");
      setErrors({});
    }
  }, [open, savedCustomer]);

  if (!open) return null;

  const handleSubmit = () => {
    const newErrors = {
      name: !name.trim(),
      cedula: !cedula.trim(),
      phone: !phone.trim(),
      address: !address.trim(),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    onSubmit({
      name: name.trim(),
      cedula: cedula.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
  };

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

        <div className="modal-product-info" style={{ marginBottom: "1rem" }}>
          <div className="modal-product-image" style={{ fontSize: "2rem" }}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="modal-product-details">
            <h3>Datos del pedido</h3>
            <p>Completá tus datos para confirmar la entrega</p>
          </div>
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className={`customer-form-group ${errors.name ? "has-error" : ""}`}>
            <label htmlFor="customerName">Nombre y apellido</label>
            <input
              id="customerName"
              type="text"
              placeholder="Ej: María Gómez"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <span className="customer-form-error">Ingresá tu nombre</span>
          </div>

          <div className={`customer-form-group ${errors.cedula ? "has-error" : ""}`}>
            <label htmlFor="customerCedula">Cédula de identidad</label>
            <input
              id="customerCedula"
              type="text"
              placeholder="Ej: 12345678"
              autoComplete="off"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
            <span className="customer-form-error">Ingresá tu cédula de identidad</span>
          </div>

          <div className={`customer-form-group ${errors.phone ? "has-error" : ""}`}>
            <label htmlFor="customerPhone">Teléfono</label>
            <input
              id="customerPhone"
              type="tel"
              placeholder="Ej: 0412 123 4567"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <span className="customer-form-error">Ingresá tu número de teléfono</span>
          </div>

          <div className={`customer-form-group ${errors.address ? "has-error" : ""}`}>
            <label htmlFor="customerAddress">Dirección de entrega</label>
            <input
              id="customerAddress"
              type="text"
              placeholder="Calle, número, piso/depto, barrio"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <span className="customer-form-error">Ingresá la dirección de entrega</span>
          </div>
        </form>

        <div className="customer-order-summary">
          <span>🛒 Total del pedido</span>
          <strong>${total.toFixed(2)} $</strong>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose}>
            Volver al carrito
          </button>
          <button className="modal-btn-add" onClick={handleSubmit}>
            <i className="fab fa-whatsapp"></i> Enviar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
