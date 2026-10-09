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
  Phone,
  Scale,
  DollarSign,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Check,
  X,
  Package,
  Filter,
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
type DateFilter = "all" | "today" | "7days" | "month" | "custom";

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

  // Filtros por fecha
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

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

  // Filtrado por Búsqueda de Texto y por Fecha
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Filtrado de Texto
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (o.order_number || "").toLowerCase().includes(q) ||
        (o.customer_name || "").toLowerCase().includes(q) ||
        (o.customer_phone || "").toLowerCase().includes(q) ||
        (o.customer_cedula || "").toLowerCase().includes(q) ||
        (o.customer_address || "").toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Filtrado de Fecha
      const orderDate = new Date(o.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        return orderDate.toDateString() === now.toDateString();
      }

      if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      }

      if (dateFilter === "month") {
        return (
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        );
      }

      if (dateFilter === "custom") {
        if (customStartDate && new Date(o.created_at) < new Date(customStartDate)) {
          return false;
        }
        if (
          customEndDate &&
          new Date(o.created_at) > new Date(`${customEndDate}T23:59:59`)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [orders, search, dateFilter, customStartDate, customEndDate]);

  const stats = useMemo(() => {
    const totalCount = filteredOrders.length;
    const totalSales = filteredOrders.reduce(
      (sum, o) => sum + Number(o.total_amount || 0),
      0
    );
    const totalWeight = filteredOrders.reduce(
      (sum, o) => sum + Number(o.total_weight || 0),
      0
    );
    const totalItems = filteredOrders.reduce(
      (sum, o) => sum + (o.items?.length || 0),
      0
    );
    return { totalCount, totalSales, totalWeight, totalItems };
  }, [filteredOrders]);

  // Función corregida para eliminar factura en Supabase
  const handleDelete = async (order: Order) => {
    if (!supabase) return;
    if (
      !confirm(
        `¿Estás seguro de eliminar de forma permanente la factura ${order.order_number}?`
      )
    ) {
      return;
    }

    setDeletingId(order.id);
    try {
      const { error, count } = await supabase
        .from("orders")
        .delete({ count: "exact" })
        .eq("id", order.id);

      if (error) throw error;

      // Verificar si realmente se eliminó la fila en la BD
      if (count === 0) {
        showToast({
          type: "error",
          message: "No se pudo eliminar: Verifica los permisos RLS en Supabase",
        });
        fetchOrders();
        return;
      }

      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      showToast({ type: "success", message: "Factura eliminada con éxito" });
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.error("Error al eliminar factura:", err);
      showToast({
        type: "error",
        message: err.message || "Error al eliminar la factura",
      });
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
          <p>Consulta, gestiona y exporta todas las facturas emitidas.</p>
        </div>
      </div>

      {/* Estadísticas en tiempo real basadas en filtros */}
      <div className="admin-stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Receipt size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.totalCount}</div>
            <div className="admin-stat-label">Facturas Filtradas</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <DollarSign size={22} />
          </div>
          <div>
            <div className="admin-stat-value">${stats.totalSales.toFixed(2)}</div>
            <div className="admin-stat-label">Total Facturado</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon yellow">
            <Scale size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.totalWeight.toFixed(2)} kg</div>
            <div className="admin-stat-label">Peso Despachado</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">
            <Package size={22} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.totalItems}</div>
            <div className="admin-stat-label">Artículos Registrados</div>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros de Fecha */}
      <div
        className="admin-toolbar"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", width: "100%" }}>
          <div className="admin-search" style={{ flex: 1, minWidth: "280px" }}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar por N° Pedido, cliente, teléfono, cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtros rápidos por fecha */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
            <Filter size={16} color="var(--azul-rey)" />
            <button
              onClick={() => setDateFilter("all")}
              className={`admin-cat-chip ${dateFilter === "all" ? "active" : ""}`}
            >
              Todas
            </button>
            <button
              onClick={() => setDateFilter("today")}
              className={`admin-cat-chip ${dateFilter === "today" ? "active" : ""}`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDateFilter("7days")}
              className={`admin-cat-chip ${dateFilter === "7days" ? "active" : ""}`}
            >
              Últimos 7 días
            </button>
            <button
              onClick={() => setDateFilter("month")}
              className={`admin-cat-chip ${dateFilter === "month" ? "active" : ""}`}
            >
              Este mes
            </button>
            <button
              onClick={() => setDateFilter("custom")}
              className={`admin-cat-chip ${dateFilter === "custom" ? "active" : ""}`}
            >
              Rango
            </button>
          </div>
        </div>

        {/* Inputs de fecha personalizada si selecciona 'Rango' */}
        {dateFilter === "custom" && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              background: "#f8fafc",
              padding: "0.75rem 1rem",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Desde:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Hasta:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.85rem",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Facturas */}
      <div className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Pedido / Fecha</th>
                <th>Cliente / Documento</th>
                <th>Contacto / Dirección</th>
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
                      <p>No hay registros para la búsqueda o rango de fechas seleccionado.</p>
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
                          {order.customer_name || "CLIENTE GENERAL"}
                        </div>
                        {order.customer_cedula && (
                          <div style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                            C.I / RIF: {order.customer_cedula}
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
                          <a
                            href={`/factura/${order.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-action-btn edit"
                            title="Abrir nota pública"
                          >
                            <ExternalLink size={17} />
                          </a>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="admin-action-btn edit"
                            title="Ver nota de entrega"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            onClick={() => handleDownloadPDF(order)}
                            className="admin-action-btn edit"
                            title="Descargar PDF"
                          >
                            <Download size={17} />
                          </button>

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

      {/* Modal Visualizador de Factura / Nota de Entrega */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
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
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
              padding: "2rem",
              border: "1px solid #cbd5e1",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado Estilo Factura Impresa */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "2px solid #132a63",
                paddingBottom: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Baloo 2', sans-serif",
                    fontSize: "1.5rem",
                    color: "var(--azul-rey)",
                  }}
                >
                  INVERSIONES EL REY 2020
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                  Lácteos de Falcón y Occidente
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    background: "#ffc72c",
                    color: "#132a63",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                    marginBottom: "4px",
                  }}
                >
                  NOTA DE ENTREGA
                </span>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#132a63" }}>
                  {selectedOrder.order_number}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Fecha: {new Date(selectedOrder.created_at).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>

            {/* Datos del Cliente */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <div>
                <span style={{ color: "#64748b" }}>Cliente / Razón Social:</span>{" "}
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  {selectedOrder.customer_name || "CLIENTE GENERAL"}
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Cédula / RIF:</span>{" "}
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  {selectedOrder.customer_cedula || "N/A"}
                </div>
              </div>
              <div>
                <span style={{ color: "#64748b" }}>Teléfono:</span>{" "}
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  {selectedOrder.customer_phone || "N/A"}
                </div>
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={{ color: "#64748b" }}>Dirección de Entrega:</span>{" "}
                <div style={{ fontWeight: 700, color: "#1e293b" }}>
                  {selectedOrder.customer_address || "N/A"}
                </div>
              </div>
            </div>

            {/* Tabla de Artículos */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "1.25rem",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "#132a63", color: "#ffffff", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px" }}>Descripción</th>
                    <th style={{ padding: "10px 12px", textAlign: "center" }}>Cant.</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>P. Unit ($)</th>
                    <th style={{ padding: "10px 12px", textAlign: "right" }}>Total ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((it, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderTop: "1px solid #f1f5f9",
                          background: idx % 2 === 0 ? "#ffffff" : "#f8fafc",
                        }}
                      >
                        <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                          {it.name}
                          <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 400 }}>
                            Peso unitario: {it.weight_per_unit || 1} kg
                          </div>
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          {it.unit === "kg" ? Number(it.quantity).toFixed(1) : it.quantity}{" "}
                          {it.unit === "kg" ? "kg" : "ud."}
                        </td>
                        <td style={{ padding: "10px 12px", textAlign: "right" }}>
                          ${Number(it.base_price).toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: "10px 12px",
                            textAlign: "right",
                            fontWeight: 700,
                            color: "#132a63",
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

            {/* Resumen Total */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "1rem 1.25rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "#166534" }}>
                Peso Total Despachado:{" "}
                <strong>{Number(selectedOrder.total_weight).toFixed(2)} kg</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.75rem", color: "#166534", fontWeight: 700 }}>
                  TOTAL FACTURA
                </span>
                <div
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "var(--azul-rey)",
                    lineHeight: 1,
                  }}
                >
                  ${Number(selectedOrder.total_amount).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedOrder(null)}
                className="admin-btn-cancel"
                style={{ borderRadius: "999px" }}
              >
                Cerrar
              </button>

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

      {/* Toast Notification */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}