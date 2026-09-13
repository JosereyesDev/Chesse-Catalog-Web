"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Search,
  Receipt,
  Eye,
  Download,
  Trash2,
  Calendar,
  User,
  Phone,
  CreditCard,
  Scale,
  DollarSign,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
  X,
  MapPin,
  Package
} from "lucide-react";
import { generateInvoicePDF } from "@/utils/pdf";

interface Order {
  id: number;
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
}

type Toast = { type: "success" | "error"; message: string } | null;

export function OrdersPanel({
  supabase,
}: {
  supabase: ReturnType<typeof createClient> | null;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const fetchOrders = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error("Error al cargar órdenes:", err);
      showToast({ type: "error", message: "Error al cargar las facturas" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [supabase]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) => {
      const matchesNumber = (o.order_number || "").toLowerCase().includes(q);
      const matchesName = (o.customer_name || "").toLowerCase().includes(q);
      const matchesPhone = (o.customer_phone || "").toLowerCase().includes(q);
      const matchesCedula = (o.customer_cedula || "").toLowerCase().includes(q);
      const matchesAddress = (o.customer_address || "").toLowerCase().includes(q);
      return (
        matchesNumber ||
        matchesName ||
        matchesPhone ||
        matchesCedula ||
        matchesAddress
      );
    });
  }, [orders, search]);

  const stats = useMemo(() => {
    const totalCount = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalWeight = orders.reduce((sum, o) => sum + Number(o.total_weight || 0), 0);
    const totalItems = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
    return { totalCount, totalSales, totalWeight, totalItems };
  }, [orders]);

  const handleDelete = async (order: Order) => {
    if (!supabase) return;
    if (
      !confirm(
        `¿Estás seguro de eliminar el registro de la factura ${order.order_number}?`
      )
    )
      return;

    setDeletingId(order.id);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", order.id);
      if (error) throw error;

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast({ type: "success", message: "Factura eliminada del historial" });
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo eliminar la factura" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPDF = (order: Order) => {
    try {
      const formattedDate = new Date(order.created_at).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

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
        showToast({ type: "success", message: "PDF descargado con éxito" });
      } else {
        showToast({
          type: "error",
          message: "El generador de PDF está cargando, intente nuevamente",
        });
      }
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "Error al generar el PDF" });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          padding: "3rem 1rem",
          justifyContent: "center",
          color: "var(--gris-texto)",
        }}
      >
        <Loader2 className="animate-spin" size={24} color="var(--azul-rey)" />
        <span>Cargando facturas y pedidos...</span>
      </div>
    );
  }

  return (
    <div>
      {!supabase && (
        <div className="admin-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>No se pudo conectar con la base de datos.</strong> Verifica tus
            variables de entorno.
          </div>
        </div>
      )}

      {/* Encabezado */}
      <div className="admin-title-row">
        <div>
          <h2>Facturas Generadas</h2>
          <p>Consulta, descarga o inspecciona todos los pedidos y facturas emitidas.</p>
        </div>
      </div>

      {/* Barra de Búsqueda */}
      <div className="admin-toolbar" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por N° Pedido, cliente, teléfono, cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla de Facturas */}
      <div className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Pedido / Fecha</th>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Artículos</th>
                <th>Total</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty">
                      <Receipt size={40} className="icon" style={{ opacity: 0.4 }} />
                      <strong>No se encontraron facturas</strong>
                      <p>
                        {search
                          ? "No hay resultados para el término de búsqueda ingresado."
                          : "Aún no se han generado pedidos desde la tienda."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateFormatted = new Date(order.created_at).toLocaleDateString(
                    "es-ES",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <tr key={order.id}>
                      <td>
                        <div style={{ fontWeight: 800, color: "var(--azul-rey)" }}>
                          {order.order_number}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--gris-texto)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginTop: "2px",
                          }}
                        >
                          <Calendar size={12} /> {dateFormatted}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700, color: "var(--azul-rey)" }}>
                          {order.customer_name || "Cliente general"}
                        </div>
                        {order.customer_cedula && (
                          <div style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                            C.I.: {order.customer_cedula}
                          </div>
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Phone size={13} color="var(--azul-rey)" />
                          <span>{order.customer_phone || "Sin teléfono"}</span>
                        </div>
                        {order.customer_address && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--gris-texto)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "180px",
                              marginTop: "2px",
                            }}
                            title={order.customer_address}
                          >
                            {order.customer_address}
                          </div>
                        )}
                      </td>

                      <td>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            background: "#eef4fd",
                            color: "var(--azul-rey)",
                            border: "none",
                            borderRadius: "999px",
                            padding: "4px 10px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {order.items?.length || 0} producto(s)
                        </button>
                      </td>

                      <td>
                        <div style={{ fontWeight: 800, color: "var(--verde)", fontSize: "1rem" }}>
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                          {Number(order.total_weight).toFixed(2)} kg
                        </div>
                      </td>

                      <td>
                        <div className="admin-row-actions">
                          {/* Abrir enlace público de la factura */}
                          <a
                            href={`/factura/${order.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-action-btn edit"
                            title="Abrir factura en pestaña nueva"
                            style={{ display: "inline-flex", alignItems: "center" }}
                          >
                            <ExternalLink size={17} />
                          </a>

                          {/* Ver detalle rápido */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="admin-action-btn edit"
                            title="Ver detalle del pedido"
                          >
                            <Eye size={17} />
                          </button>

                          {/* Descargar PDF directamente */}
                          <button
                            onClick={() => handleDownloadPDF(order)}
                            className="admin-action-btn edit"
                            title="Descargar PDF"
                          >
                            <Download size={17} />
                          </button>

                          {/* Eliminar orden */}
                          <button
                            onClick={() => handleDelete(order)}
                            disabled={deletingId === order.id}
                            className="admin-action-btn delete"
                            title="Eliminar factura"
                          >
                            {deletingId === order.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle de Factura */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              padding: "1.75rem",
              border: "1px solid var(--gris-borde)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--gris-borde)",
                paddingBottom: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--amarillo-2, #d99b00)",
                  }}
                >
                  Detalle de Factura
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: "1.3rem",
                    color: "var(--azul-rey)",
                  }}
                >
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gris-texto)",
                  padding: "0.25rem",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Datos del Cliente */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid var(--gris-borde)",
                borderRadius: "14px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <div>
                <span style={{ color: "var(--gris-texto)" }}>Cliente:</span>{" "}
                <strong>{selectedOrder.customer_name || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--gris-texto)" }}>Cédula:</span>{" "}
                <strong>{selectedOrder.customer_cedula || "N/A"}</strong>
              </div>
              <div>
                <span style={{ color: "var(--gris-texto)" }}>Teléfono:</span>{" "}
                <strong>{selectedOrder.customer_phone || "N/A"}</strong>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: "var(--gris-texto)" }}>Dirección:</span>{" "}
                <strong>{selectedOrder.customer_address || "N/A"}</strong>
              </div>
            </div>

            {/* Lista de Productos */}
            <h4
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.9rem",
                color: "var(--azul-rey)",
                fontFamily: "'Baloo 2', sans-serif",
              }}
            >
              Artículos del Pedido
            </h4>
            <div
              style={{
                border: "1px solid var(--gris-borde)",
                borderRadius: "14px",
                overflow: "hidden",
                marginBottom: "1.25rem",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px" }}>Producto</th>
                    <th style={{ padding: "8px 12px", textAlign: "center" }}>Cant.</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Precio</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <tr key={idx} style={{ borderTop: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px 12px" }}>
                          <strong>{it.name}</strong>
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          {it.unit === "kg"
                            ? Number(it.quantity).toFixed(1)
                            : it.quantity}{" "}
                          {it.unit === "kg" ? "kg" : "ud."}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", color: "#64748b" }}>
                          ${Number(it.base_price).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "8px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "var(--azul-rey)",
                          }}
                        >
                          ${Number(it.total_price).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: "12px", textAlign: "center" }}>
                        Sin artículos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "1rem",
                borderRadius: "14px",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "#166534" }}>
                Peso total: <strong>{Number(selectedOrder.total_weight).toFixed(2)} kg</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>
                  TOTAL A PAGAR
                </span>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: "var(--azul-rey)",
                    fontFamily: "'Baloo 2', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  ${Number(selectedOrder.total_amount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Acciones dentro del modal */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <a
                href={`/factura/${selectedOrder.token}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "999px",
                  border: "1px solid var(--gris-borde)",
                  background: "#ffffff",
                  color: "var(--azul-rey)",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                <ExternalLink size={16} /> Ver en Web
              </a>

              <button
                onClick={() => handleDownloadPDF(selectedOrder)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  border: "none",
                  background: "var(--azul-rey)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                <Download size={16} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
