"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Check,
  Search,
  Package,
  PackageX,
  Layers,
  ImageOff,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type Toast = { type: "success" | "error"; message: string } | null;

export function AdminDashboard({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Todos");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Inicializamos el cliente de Supabase de forma segura: si faltan las
  // variables de entorno, createClient() puede lanzar una excepción y dejar
  // la pantalla en blanco. Aquí la atrapamos y mostramos un aviso en su lugar.
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch (err) {
      console.error("No se pudo inicializar Supabase (revisa tus variables de entorno):", err);
      return null;
    }
  });

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeCat === "Todos" || p.category === activeCat;
      const matchesSearch =
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeCat, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.in_stock).length;
    const outOfStock = total - inStock;
    const cats = new Set(products.map((p) => p.category)).size;
    return { total, inStock, outOfStock, cats };
  }, [products]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      base_price: parseFloat(formData.get("base_price") as string),
      image: (formData.get("image") as string) || null,
      unit: formData.get("unit") as string,
      weight_per_unit: parseFloat(formData.get("weight_per_unit") as string),
      in_stock: formData.get("in_stock") === "on",
      category: formData.get("category") as string,
    };

    try {
      if (isEditing?.id) {
        const { data, error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", isEditing.id)
          .select()
          .single();

        if (error) throw error;
        setProducts((prev) => prev.map((p) => (p.id === data.id ? data : p)));
        showToast({ type: "success", message: "Producto actualizado" });
      } else {
        const { data, error } = await supabase.from("products").insert([productData]).select().single();

        if (error) throw error;
        setProducts((prev) => [...prev, data]);
        showToast({ type: "success", message: "Producto creado" });
      }
      setIsEditing(null);
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo guardar el producto" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      showToast({ type: "success", message: "Producto eliminado" });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo eliminar el producto" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-badge">
            <span role="img" aria-label="cow">🐮</span>
          </div>
          <div>
            <h1 className="admin-header-title">Panel Administrativo</h1>
            <p className="admin-header-subtitle">Inv. El Rey 2020</p>
          </div>
        </div>
        <button onClick={handleLogout} className="admin-logout-btn">
          <LogOut size={16} /> Salir
        </button>
      </div>

      <div className="admin-container">
        {!supabase && (
          <div className="admin-alert">
            <AlertTriangle size={20} />
            <div>
              <strong>No se pudo conectar con la base de datos.</strong> Verifica que{" "}
              <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              estén definidas en tu <code>.env.local</code> y reinicia el servidor. Mientras tanto
              puedes ver el catálogo, pero no podrás guardar cambios.
            </div>
          </div>
        )}

        {/* Title + CTA */}
        <div className="admin-title-row">
          <div>
            <h2>Gestión de Productos</h2>
            <p>Administra el catálogo que ven tus clientes.</p>
          </div>
          <button onClick={() => setIsEditing({} as Product)} className="admin-btn-add">
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats-grid">
          <StatCard icon={<Package size={20} />} label="Productos" value={stats.total} color="blue" />
          <StatCard icon={<Check size={20} />} label="En stock" value={stats.inStock} color="green" />
          <StatCard icon={<PackageX size={20} />} label="Agotados" value={stats.outOfStock} color="red" />
          <StatCard icon={<Layers size={20} />} label="Categorías" value={stats.cats} color="yellow" />
        </div>

        {/* Toolbar */}
        <div className="admin-toolbar">
          <div className="admin-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
            />
          </div>
          <div className="admin-cat-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`admin-cat-chip ${activeCat === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modal */}
        {isEditing !== null && (
          <ProductFormModal
            product={isEditing}
            saving={saving}
            supabase={supabase}
            onCancel={() => setIsEditing(null)}
            onSubmit={handleSave}
          />
        )}

        {/* Table */}
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Unidad</th>
                  <th>Stock</th>
                  <th className="right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="admin-empty">
                        {products.length === 0 ? (
                          <>
                            <div className="icon">📦</div>
                            <strong>No hay productos aún</strong>
                            <p>
                              Conecta Supabase o agrega tu primer producto con el botón{" "}
                              <strong>&quot;Nuevo Producto&quot;</strong>
                            </p>
                          </>
                        ) : (
                          "Ningún producto coincide con tu búsqueda."
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="admin-prod-cell">
                          <div className="admin-prod-thumb">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} />
                            ) : (
                              <ImageOff size={16} />
                            )}
                          </div>
                          <div>
                            <div className="admin-prod-name">{product.name}</div>
                            <div className="admin-prod-cat">{product.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="admin-price-cell">${Number(product.base_price).toFixed(2)}</td>
                      <td className="admin-unit-cell">
                        {product.unit === "kg" ? "kg" : "unidad"} ({product.weight_per_unit}kg)
                      </td>
                      <td>
                        {product.in_stock ? (
                          <span className="admin-badge-stock in">
                            <Check size={12} /> Sí
                          </span>
                        ) : (
                          <span className="admin-badge-stock out">Agotado</span>
                        )}
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            onClick={() => setIsEditing(product)}
                            className="admin-action-btn edit"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="admin-action-btn delete"
                            title="Eliminar"
                          >
                            {deletingId === product.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
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
      </div>

      {/* Toast */}
      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "yellow";
}) {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="admin-stat-value">{value}</div>
        <div className="admin-stat-label">{label}</div>
      </div>
    </div>
  );
}

function ProductFormModal({
  product,
  saving,
  supabase,
  onCancel,
  onSubmit,
}: {
  product: Product;
  saving: boolean;
  supabase: ReturnType<typeof createClient> | null;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  const [image, setImage] = useState(product.image || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const isEditingExisting = !!product.id;

  const IMAGE_BUCKET = "products";
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!supabase) {
      setUploadError("Sin conexión a la base de datos");
      e.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("La imagen no debe superar 5MB");
      e.target.value = "";
      return;
    }

    setUploadError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(fileName, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName);
      setImage(data.publicUrl);
    } catch (err) {
      console.error(err);
      setUploadError("No se pudo subir la imagen. Verifica que el bucket \"products\" exista y sea público.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <button type="button" className="modal-close" onClick={onCancel} aria-label="Cerrar">
          <X size={20} />
        </button>

        <div className="admin-modal-header">
          <div className={`admin-modal-icon ${isEditingExisting ? "edit" : "create"}`}>
            {isEditingExisting ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h3>{isEditingExisting ? "Editar Producto" : "Nuevo Producto"}</h3>
            <p>{isEditingExisting ? "Actualiza los datos del producto" : "Completa los datos para agregarlo al catálogo"}</p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group span-2">
              <label>Nombre</label>
              <input name="name" type="text" defaultValue={product.name} required />
            </div>
            <div className="admin-form-group span-2">
              <label>Descripción</label>
              <input name="description" type="text" defaultValue={product.description || ""} />
            </div>
            <div className="admin-form-group">
              <label>Precio ($)</label>
              <input name="base_price" type="number" step="0.01" defaultValue={product.base_price} required />
            </div>
            <div className="admin-form-group">
              <label>Categoría</label>
              <input name="category" type="text" defaultValue={product.category || "Quesos"} required />
            </div>

            <div className="admin-form-group span-2">
              <label>Imagen</label>
              <div className="admin-image-row">
                <div className="admin-image-preview">
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="Vista previa" onError={() => setImage("")} />
                  ) : (
                    <ImageOff size={18} />
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    name="image"
                    type="text"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setUploadError("");
                    }}
                    placeholder="https://... o sube un archivo"
                  />
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      padding: "6px 10px",
                      border: "1px dashed #cbd5e1",
                      borderRadius: 6,
                      cursor: uploading ? "not-allowed" : "pointer",
                      color: "#475569",
                      width: "fit-content",
                    }}
                  >
                    {uploading && <Loader2 size={14} className="animate-spin" />}
                    {uploading ? "Subiendo..." : "Subir imagen desde tu dispositivo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                  </label>
                  {uploadError && (
                    <span style={{ color: "var(--danger, #dc2626)", fontSize: 12 }}>{uploadError}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-form-group">
              <label>Unidad</label>
              <select name="unit" defaultValue={product.unit || "unit"}>
                <option value="unit">Unidad</option>
                <option value="kg">Kilogramo</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Peso por unidad (kg)</label>
              <input name="weight_per_unit" type="number" step="0.01" defaultValue={product.weight_per_unit || 1} required />
            </div>

            <div className="admin-checkbox-row">
              <input
                type="checkbox"
                name="in_stock"
                id="in_stock"
                defaultChecked={product.id ? product.in_stock : true}
              />
              <label htmlFor="in_stock">Disponible en stock</label>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="button" onClick={onCancel} className="admin-btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="admin-btn-save">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando..." : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
