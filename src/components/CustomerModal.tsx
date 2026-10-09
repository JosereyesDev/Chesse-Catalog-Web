"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowRight, UserPlus, RotateCcw } from "lucide-react";

export interface CustomerData {
  name?: string;
  address?: string;
  cedula?: string;
  phone?: string;
  saveUserPreference?: boolean;
}

// Función de formateo de Cédula de Identidad o RIF (Jurídico / Personal)
function formatCedulaORif(input: string): string {
  if (!input) return "";

  let raw = input.toUpperCase().trim();

  // Si el usuario borra todo hasta dejar solo 'V' o solo un carácter no numérico
  if (raw.length === 1 && !/\d/.test(raw)) {
    return ["V", "E", "J", "G", "C"].includes(raw) ? raw : "V";
  }

  // Determinar la letra inicial (V por defecto si empieza por número)
  let letter = "V";
  const firstChar = raw.charAt(0);
  if (["V", "E", "J", "G", "C"].includes(firstChar)) {
    letter = firstChar;
  }

  // Extraer solo los números
  let digits = raw.replace(/\D/g, "");

  // Si es persona natural (V o E) y los números superan 80.000.000, pasa a 'E'
  if ((letter === "V" || letter === "E") && digits.length >= 8 && parseInt(digits.substring(0, 8), 10) > 80000000) {
    letter = "E";
  }

  // Limitar longitud máxima de números
  const maxDigits = (letter === "J" || letter === "G" || letter === "C") ? 9 : 8;
  if (digits.length > maxDigits) {
    digits = digits.substring(0, maxDigits);
  }

  // Si no hay dígitos aún, devolver solo la letra (sin forzar el guión permanentemente)
  if (!digits) {
    return raw.endsWith("-") ? `${letter}-` : letter;
  }

  return `${letter}-${digits}`;
}

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
  const [cedula, setCedula] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [step, setStep] = useState<"cedula" | "details">("cedula");
  const [searching, setSearching] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [saveUser, setSaveUser] = useState(true);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      if (savedCustomer?.cedula || cedula.trim().length >= 5) {
        if (savedCustomer?.cedula && !cedula) {
          setCedula(formatCedulaORif(savedCustomer.cedula));
          setName((savedCustomer.name || "").toUpperCase());
          setPhone(savedCustomer.phone || "");
          setAddress((savedCustomer.address || "").toUpperCase());
          setIsRegistered(true);
        }
        if (cedula.trim().length >= 5) {
          setStep("details");
        }
      } else {
        setStep("cedula");
      }
      setErrors({});
    }
  }, [open, savedCustomer]);

  // Resetea todo el formulario en blanco
  const resetForm = () => {
    setCedula("");
    setName("");
    setPhone("");
    setAddress("");
    setIsRegistered(false);
    setErrors({});
    setStep("cedula");
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (!val) {
      setCedula("");
      return;
    }

    const formatted = formatCedulaORif(val);
    setCedula(formatted);
    setErrors((prev) => ({ ...prev, cedula: false }));
  };

  const handleCheckCedula = async () => {
    const trimmedCedula = cedula.trim();
    const digitsOnly = trimmedCedula.replace(/\D/g, "");
    
    if (!trimmedCedula || digitsOnly.length < 5) {
      setErrors({ cedula: true });
      return;
    }

    setSearching(true);
    setErrors({});

    try {
      const res = await fetch(`/api/customers?cedula=${encodeURIComponent(trimmedCedula)}`);
      if (res.ok) {
        const { customer } = await res.json();
        if (customer) {
          setName((customer.name || "").toUpperCase());
          setPhone(customer.phone || "");
          setAddress((customer.address || "").toUpperCase());
          setIsRegistered(true);
        } else {
          setName("");
          setPhone("");
          setAddress("");
          setIsRegistered(false);
        }
        setStep("details");
      } else {
        setStep("details");
      }
    } catch (err) {
      console.error("Error consultando documento:", err);
      setStep("details");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    const formattedName = name.trim().toUpperCase();
    const formattedAddress = address.trim().toUpperCase();

    const newErrors = {
      name: !formattedName,
      phone: !phone.trim(),
      address: !formattedAddress,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    onSubmit({
      name: formattedName,
      cedula: cedula.trim(),
      phone: phone.trim(),
      address: formattedAddress,
      saveUserPreference: !isRegistered ? saveUser : false,
    });
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <button className="modal-close" aria-label="Cerrar" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-product-info" style={{ marginBottom: "1rem" }}>
          <div className="modal-product-image" style={{ fontSize: "2rem" }}>
            <i className="fas fa-clipboard-list"></i>
          </div>
          <div className="modal-product-details">
            <h3>Datos del pedido</h3>
            <p>
              {step === "cedula"
                ? "Ingresa tu cédula o RIF para consultar tus datos registrados"
                : isRegistered
                ? "Confirma o actualiza tus datos para la entrega"
                : "Completa tus datos para registrarte y continuar"}
            </p>
          </div>
        </div>

        {/* PASO 1: Ingreso de Cédula / RIF */}
        {step === "cedula" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckCedula();
            }}
          >
            <div className={`customer-form-group ${errors.cedula ? "has-error" : ""}`}>
              <label htmlFor="customerCedula">Cédula de Identidad o RIF</label>
              <input
                id="customerCedula"
                type="text"
                placeholder="V-12345678 o J-123456789"
                autoFocus
                value={cedula}
                onChange={handleCedulaChange}
              />
              {errors.cedula && (
                <span className="customer-form-error">
                  Ingresa un documento válido (mínimo 5 dígitos)
                </span>
              )}
            </div>

            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
              <button type="button" className="modal-btn-cancel" onClick={onClose}>
                Volver al carrito
              </button>
              <button
                type="submit"
                disabled={searching}
                className="modal-btn-add"
                style={{ justifyContent: "center" }}
              >
                {searching ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    Continuar <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: Formulario Completo / Autocompletado */}
        {step === "details" && (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Cédula/RIF ingresado con opción 'Cambiar' que resetea todo */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                  Documento ingresado:
                </span>
                <strong style={{ fontSize: "1rem", color: "var(--azul-rey)" }}>{cedula}</strong>
              </div>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--azul-rey)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <RotateCcw size={13} /> Cambiar
              </button>
            </div>

            {/* Banner informativo únicamente si NO está registrado */}
            {!isRegistered && (
              <div
                style={{
                  padding: "0.6rem 0.8rem",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  color: "#1e40af",
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "1rem",
                }}
              >
                <UserPlus size={18} color="#2563eb" />
                <span>Documento no registrado. Por favor ingresa tus datos por primera vez.</span>
              </div>
            )}

            {/* Campos de texto en Mayúsculas */}
            <div className={`customer-form-group ${errors.name ? "has-error" : ""}`}>
              <label htmlFor="customerName">Nombre y apellido / Razón Social</label>
              <input
                id="customerName"
                type="text"
                placeholder="EJ: MARÍA GÓMEZ O INVERSIONES LOS ANDES C.A."
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase" }}
              />
              <span className="customer-form-error">Ingresa tu nombre o razón social</span>
            </div>

            <div className={`customer-form-group ${errors.phone ? "has-error" : ""}`}>
              <label htmlFor="customerPhone">Teléfono</label>
              <input
                id="customerPhone"
                type="tel"
                placeholder="Ej: 0412 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <span className="customer-form-error">Ingresa tu número de teléfono</span>
            </div>

            <div className={`customer-form-group ${errors.address ? "has-error" : ""}`}>
              <label htmlFor="customerAddress">Dirección de entrega</label>
              <input
                id="customerAddress"
                type="text"
                placeholder="CALLE, NÚMERO, PISO/DEPTO, SECTOR"
                value={address}
                onChange={(e) => setAddress(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase" }}
              />
              <span className="customer-form-error">Ingresa la dirección</span>
            </div>

            {/* Checkbox de guardado: solo se muestra si NO está registrado */}
            {!isRegistered && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "0.75rem 1rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="checkbox"
                  id="saveUserCheck"
                  checked={saveUser}
                  onChange={(e) => setSaveUser(e.target.checked)}
                  style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--azul-rey)" }}
                />
                <label htmlFor="saveUserCheck" style={{ fontSize: "0.82rem", color: "#334155", cursor: "pointer", fontWeight: 600 }}>
                  ¿Deseas Guardar tu Usuario con esta Cédula / RIF?
                </label>
              </div>
            )}

            <div className="customer-order-summary" style={{ marginTop: "1rem" }}>
              <span>🛒 Total del pedido</span>
              <strong>${total.toFixed(2)}$</strong>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setStep("cedula")}
              >
                Atrás
              </button>
              <button type="submit" className="modal-btn-add">
                <i className="fab fa-whatsapp"></i> Enviar pedido
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}