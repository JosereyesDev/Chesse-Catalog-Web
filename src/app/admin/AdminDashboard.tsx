"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, LogOut, Check, Package, Loader2 } from "lucide-react";

export function AdminDashboard({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      base_price: parseFloat(formData.get("base_price") as string),
      image: formData.get("image") as string,
      unit: formData.get("unit") as string,
      weight_per_unit: parseFloat(formData.get("weight_per_unit") as string),
      in_stock: formData.get("in_stock") === "on",
      category: formData.get("category") as string,
    };

    if (isEditing?.id) {
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", isEditing.id)
        .select()
        .single();
      if (!error && data) {
        setProducts(products.map((p) => (p.id === data.id ? data : p)));
        setIsEditing(null);
      }
    } else {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();
      if (!error && data) {
        setProducts([...products, data]);
        setIsEditing(null);
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setProducts(products.filter((p) => p.id !== id));
      }
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  // Estilos en línea para respaldo (se sobreescriben con Tailwind si está configurado)
  const inlineStyles = {
    container: { minHeight: "100vh", backgroundColor: "#f5f2ed", fontFamily: "'Nunito', sans-serif", color: "#161512" },
    header: { backgroundColor: "#0a1a44", color: "white", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" },
    headerTitle: { fontSize: "1.5rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" },
    logoutBtn: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "9999px", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" },
    main: { maxWidth: "1200px", margin: "0 auto", padding: "24px" },
    headerActions: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
    title: { fontSize: "1.8rem", fontWeight: "bold", color: "#0a1a44" },
    newProductBtn: { display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#2d9b4e", color: "white", padding: "10px 20px", borderRadius: "9999px", fontWeight: "bold", border: "none", boxShadow: "0 4px 0 #1f8f42", cursor: "pointer", transition: "all 0.2s" },
    tableWrapper: { backgroundColor: "white", borderRadius: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #e5e0d8", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { padding: "16px", textAlign: "left", fontWeight: "bold", color: "#0a1a44", backgroundColor: "#f5f2ed", borderBottom: "1px solid #e5e0d8" },
    td: { padding: "16px", borderBottom: "1px solid #e5e0d8" },
    emptyState: { textAlign: "center", padding: "48px 16px", color: "#6b5e4f" },
    emptyIcon: { fontSize: "48px", marginBottom: "16px" },
    modalOverlay: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
    modalContent: { backgroundColor: "white", borderRadius: "24px", padding: "24px", maxWidth: "500px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
    modalTitle: { fontSize: "1.8rem", fontWeight: "bold", marginBottom: "16px", color: "#0a1a44" },
    form: { display: "flex", flexDirection: "column", gap: "16px" },
    label: { display: "block", fontSize: "0.9rem", fontWeight: "bold", color: "#6b5e4f", marginBottom: "4px" },
    input: { width: "100%", padding: "8px 12px", border: "1px solid #e5e0d8", borderRadius: "12px", backgroundColor: "#faf8f6", outline: "none" },
    select: { width: "100%", padding: "8px 12px", border: "1px solid #e5e0d8", borderRadius: "12px", backgroundColor: "#faf8f6", outline: "none" },
    checkbox: { width: "20px", height: "20px", accentColor: "#0a1a44" },
    formActions: { display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" },
    cancelBtn: { padding: "10px 20px", borderRadius: "9999px", fontWeight: "bold", border: "none", backgroundColor: "#f5f2ed", color: "#0a1a44", cursor: "pointer" },
    saveBtn: { padding: "10px 20px", borderRadius: "9999px", fontWeight: "bold", border: "none", backgroundColor: "#0a1a44", color: "white", boxShadow: "0 4px 0 #060f2e", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "8px" },
    stockBadgeIn: { backgroundColor: "#e6f4ea", color: "#1e8e3e", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "4px" },
    stockBadgeOut: { backgroundColor: "#fce8e6", color: "#d93025", padding: "4px 12px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: "bold", display: "inline-block" },
    actionBtn: { padding: "8px", background: "transparent", border: "none", borderRadius: "12px", cursor: "pointer", transition: "background 0.2s" },
  };

  return (
    <div style={inlineStyles.container}>
      {/* HEADER */}
      <header style={inlineStyles.header}>
        <h1 style={inlineStyles.headerTitle}>
          <span style={{ fontSize: "1.8rem" }}>⚙️</span> Panel Administrativo
        </h1>
        <button onClick={handleLogout} style={inlineStyles.logoutBtn}>
          <LogOut size={16} /> Salir
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main style={inlineStyles.main}>
        <div style={inlineStyles.headerActions}>
          <h2 style={inlineStyles.title}>Gestión de Productos</h2>
          <button
            onClick={() => setIsEditing({} as Product)}
            style={inlineStyles.newProductBtn}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>

        {/* MODAL DE EDICIÓN/CREACIÓN */}
        {isEditing !== null && (
          <div style={inlineStyles.modalOverlay}>
            <div style={inlineStyles.modalContent}>
              <h3 style={inlineStyles.modalTitle}>
                {isEditing.id ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <form onSubmit={handleSave} style={inlineStyles.form}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={inlineStyles.label}>Nombre</label>
                    <input name="name" defaultValue={isEditing.name} required style={inlineStyles.input} />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={inlineStyles.label}>Descripción</label>
                    <input name="description" defaultValue={isEditing.description || ""} style={inlineStyles.input} />
                  </div>
                  <div>
                    <label style={inlineStyles.label}>Precio ($)</label>
                    <input name="base_price" type="number" step="0.01" defaultValue={isEditing.base_price} required style={inlineStyles.input} />
                  </div>
                  <div>
                    <label style={inlineStyles.label}>Categoría</label>
                    <input name="category" defaultValue={isEditing.category || "Quesos"} required style={inlineStyles.input} />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={inlineStyles.label}>URL de Imagen</label>
                    <input name="image" defaultValue={isEditing.image || ""} style={inlineStyles.input} />
                  </div>
                  <div>
                    <label style={inlineStyles.label}>Unidad</label>
                    <select name="unit" defaultValue={isEditing.unit || "unit"} style={inlineStyles.select}>
                      <option value="unit">Unidad</option>
                      <option value="kg">Kilogramo</option>
                    </select>
                  </div>
                  <div>
                    <label style={inlineStyles.label}>Peso por unidad (kg)</label>
                    <input name="weight_per_unit" type="number" step="0.01" defaultValue={isEditing.weight_per_unit || 1} required style={inlineStyles.input} />
                  </div>
                  <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <input type="checkbox" name="in_stock" id="in_stock" defaultChecked={isEditing.id ? isEditing.in_stock : true} style={inlineStyles.checkbox} />
                    <label htmlFor="in_stock" style={{ fontWeight: "bold", color: "#0a1a44" }}>Disponible en stock</label>
                  </div>
                </div>

                <div style={inlineStyles.formActions}>
                  <button type="button" onClick={() => setIsEditing(null)} style={inlineStyles.cancelBtn}>
                    Cancelar
                  </button>
                  <button type="submit" style={inlineStyles.saveBtn} disabled={loading}>
                    {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : "Guardar Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        <div style={inlineStyles.tableWrapper}>
          <div style={{ overflowX: "auto" }}>
            <table style={inlineStyles.table}>
              <thead>
                <tr>
                  <th style={inlineStyles.th}>Producto</th>
                  <th style={inlineStyles.th}>Precio</th>
                  <th style={inlineStyles.th}>Unidad</th>
                  <th style={inlineStyles.th}>Stock</th>
                  <th style={{ ...inlineStyles.th, textAlign: "right" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={inlineStyles.emptyState}>
                      <div style={inlineStyles.emptyIcon}>📦</div>
                      <p style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#0a1a44" }}>No hay productos aún</p>
                      <p style={{ color: "#6b5e4f", marginTop: "8px" }}>
                        Conecta Supabase o agrega tu primer producto con el botón <strong>"Nuevo Producto"</strong>
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: "1px solid #e5e0d8", transition: "background 0.2s" }}>
                      <td style={inlineStyles.td}>
                        <div style={{ fontWeight: "bold", color: "#0a1a44" }}>{product.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b5e4f" }}>{product.category}</div>
                      </td>
                      <td style={{ ...inlineStyles.td, fontWeight: "bold", color: "#2d9b4e" }}>
                        ${Number(product.base_price).toFixed(2)}
                      </td>
                      <td style={{ ...inlineStyles.td, fontSize: "0.9rem", color: "#6b5e4f" }}>
                        {product.unit === "kg" ? "kg" : "unidad"} ({product.weight_per_unit}kg)
                      </td>
                      <td style={inlineStyles.td}>
                        {product.in_stock ? (
                          <span style={inlineStyles.stockBadgeIn}>
                            <Check size={12} /> Sí
                          </span>
                        ) : (
                          <span style={inlineStyles.stockBadgeOut}>Agotado</span>
                        )}
                      </td>
                      <td style={{ ...inlineStyles.td, textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            onClick={() => setIsEditing(product)}
                            style={{ ...inlineStyles.actionBtn, color: "#4a90d9" }}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            style={{ ...inlineStyles.actionBtn, color: "#d93025" }}
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Estilo de respaldo para animación de spinner (si Tailwind no carga) */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}