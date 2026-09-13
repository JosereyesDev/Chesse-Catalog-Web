"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Printer, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { generateInvoicePDF } from "@/utils/pdf";

interface FacturaViewerProps {
  order: {
    token: string;
    order_number: string;
    customer_name: string | null;
    customer_cedula: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    items: Array<{
      id?: number;
      name: string;
      unit: string;
      weight_per_unit?: number;
      quantity: number;
      base_price: number;
      total_price: number;
    }>;
    total_amount: number;
    total_weight: number;
    created_at: string;
  };
}

export function FacturaViewer({ order }: FacturaViewerProps) {
  const [downloading, setDownloading] = useState(false);

  const formattedDate = new Date(order.created_at).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleDownloadPDF = () => {
    setDownloading(true);
    try {
      const doc = generateInvoicePDF({
        orderNumber: order.order_number,
        dateStr: formattedDate,
        customer: {
          name: order.customer_name || undefined,
          cedula: order.customer_cedula || undefined,
          phone: order.customer_phone || undefined,
          address: order.customer_address || undefined,
        },
        items: order.items || [],
        total: order.total_amount,
        weight: order.total_weight,
      });

      if (doc) {
        doc.save(`factura_${order.order_number}.pdf`);
      } else {
        alert("El generador de PDF aún se está cargando. Por favor, reintenta en un momento o usa el botón 'Imprimir'.");
      }
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Hubo un error al generar el PDF. Puedes utilizar el botón 'Imprimir' para guardarlo como PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="factura-wrapper" style={{ minHeight: "100vh", backgroundColor: "#f4f6f9", padding: "2rem 1rem" }}>
      {/* Botones de acción (ocultos al imprimir) */}
      <div className="no-print" style={{ maxWidth: "800px", margin: "0 auto 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "var(--azul-rey)",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "0.95rem"
          }}
        >
          <ArrowLeft size={18} /> Volver a la tienda
        </Link>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handlePrint}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#ffffff",
              color: "var(--azul-rey)",
              border: "1px solid var(--gris-borde)",
              padding: "0.65rem 1.25rem",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <Printer size={18} /> Imprimir
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--azul-rey)",
              color: "#ffffff",
              border: "none",
              padding: "0.65rem 1.5rem",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "0.9rem",
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(19,42,99,0.2)"
            }}
          >
            <Download size={18} /> {downloading ? "Generando..." : "Descargar PDF"}
          </button>
        </div>
      </div>

      {/* Documento de la Factura */}
      <div
        className="factura-card"
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 12px 35px rgba(19, 42, 99, 0.08)",
          border: "1px solid var(--gris-borde)"
        }}
      >
        {/* Cabecera Azul */}
        <div style={{ backgroundColor: "var(--azul-rey)", color: "#ffffff", padding: "2rem", position: "relative" }}>
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "var(--amarillo)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, var(--amarillo-2), var(--amarillo) 60%, #d99b00 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  color: "var(--azul-rey)",
                  border: "2px solid #ffffff",
                  flexShrink: 0
                }}
              >
                🐮
              </div>
              <div>
                <h1 style={{ margin: 0, fontFamily: "'Baloo 2', sans-serif", fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.1 }}>
                  INV. EL REY 2020
                </h1>
                <small style={{ color: "var(--amarillo-2)", fontWeight: 700, letterSpacing: "0.1em", fontSize: "0.75rem" }}>
                  LÁCTEOS DE FALCÓN · NOTA DE ENTREGA
                </small>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", padding: "0.4rem 0.8rem", borderRadius: "8px", display: "inline-block" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--amarillo)" }}>Factura / Pedido</span>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "'Baloo 2', sans-serif" }}>{order.order_number}</div>
              </div>
              <div style={{ fontSize: "0.8rem", marginTop: "0.4rem", opacity: 0.85 }}>Fecha: {formattedDate}</div>
            </div>
          </div>
        </div>

        {/* Cuerpo de la Factura */}
        <div style={{ padding: "2rem" }}>
          {/* Banner de Verificación */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "0.75rem 1rem", borderRadius: "12px", marginBottom: "1.5rem", fontSize: "0.85rem", fontWeight: 600 }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>Pedido registrado con éxito en nuestro sistema central.</span>
          </div>

          {/* Datos del Cliente */}
          {(order.customer_name || order.customer_cedula || order.customer_phone || order.customer_address) && (
            <div style={{ background: "#f8fafc", border: "1px solid var(--gris-borde)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.75rem" }}>
              <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--azul-rey)", fontWeight: 800 }}>
                Datos del Cliente
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", fontSize: "0.9rem" }}>
                {order.customer_name && (
                  <div>
                    <span style={{ color: "var(--gris-texto)", fontSize: "0.8rem", display: "block" }}>Nombre:</span>
                    <strong>{order.customer_name}</strong>
                  </div>
                )}
                {order.customer_cedula && (
                  <div>
                    <span style={{ color: "var(--gris-texto)", fontSize: "0.8rem", display: "block" }}>Cédula:</span>
                    <strong>{order.customer_cedula}</strong>
                  </div>
                )}
                {order.customer_phone && (
                  <div>
                    <span style={{ color: "var(--gris-texto)", fontSize: "0.8rem", display: "block" }}>Teléfono:</span>
                    <strong>{order.customer_phone}</strong>
                  </div>
                )}
                {order.customer_address && (
                  <div>
                    <span style={{ color: "var(--gris-texto)", fontSize: "0.8rem", display: "block" }}>Dirección:</span>
                    <strong>{order.customer_address}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabla de Productos */}
          <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid var(--gris-borde)", color: "var(--azul-rey)" }}>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "left" }}>Producto</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "center" }}>Cantidad</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Precio Unit.</th>
                  <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => {
                    const unitLabel = item.unit === "kg" ? "kg" : "unidad";
                    const displayQty = unitLabel === "kg" ? Number(item.quantity).toFixed(1) : Math.round(item.quantity);
                    const weightInfo = item.weight_per_unit ? ` (${(item.quantity * item.weight_per_unit).toFixed(2)} kg)` : "";

                    return (
                      <tr key={index} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <strong>{item.name}</strong>
                          {weightInfo && <span style={{ color: "var(--gris-texto)", fontSize: "0.8rem" }}>{weightInfo}</span>}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                          {displayQty} {unitLabel}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#475569" }}>
                          ${Number(item.base_price).toFixed(2)}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 700, color: "var(--azul-rey)" }}>
                          ${Number(item.total_price).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: "1.5rem", textAlign: "center", color: "var(--gris-texto)" }}>
                      Sin artículos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Resumen Total */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem"
            }}
          >
            <div>
              <div style={{ color: "#166534", fontWeight: 600, fontSize: "0.85rem" }}>
                Artículos: <strong>{order.items?.length || 0}</strong> &nbsp;|&nbsp; Peso total: <strong>{Number(order.total_weight).toFixed(2)} kg</strong>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "0.2rem" }}>
                Moneda de referencia: USD ($)
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Total a pagar:</span>
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--azul-rey)", fontFamily: "'Baloo 2', sans-serif", lineHeight: 1 }}>
                ${Number(order.total_amount).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Pie de factura */}
          <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px dashed var(--gris-borde)", textAlign: "center", color: "var(--gris-texto)", fontSize: "0.85rem" }}>
            <p style={{ margin: "0 0 0.3rem", fontWeight: 700, color: "var(--azul-rey)" }}>¡Gracias por preferir Inv. El Rey 2020!</p>
            <p style={{ margin: 0 }}>Llanito, Parr. San Félix, Mcpio Mauroa, Edo. Falcón · WhatsApp: +58 412 1234253</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .factura-wrapper {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .factura-card {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
