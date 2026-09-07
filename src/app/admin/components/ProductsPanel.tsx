"use client";

import { useMemo, useState, useEffect } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
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
import { ProductFormModal } from "./ProductFormModal";

type Toast = { type: "success" | "error"; message: string } | null;

export function ProductsPanel({
  initialProducts,
  supabase,
}: {
  initialProducts: Product[];
  supabase: ReturnType<typeof createClient> | null;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("Todos");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    if (!supabase) return;
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name');
      if (error) {
        console.error('Error cargando categorías:', error);
        return;
      }
      setAllCategories(data.map(item => item.name));
    };
    fetchCategories();
  }, [supabase]);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const productCategories = useMemo(
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
        const { data, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();

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

  return (
    <div>
      {!supabase && (
        <div className="admin-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>No se pudo conectar con la base de datos.</strong> Verifica que{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> estén definidas en tu{" "}
            <code>.env.local</code> y reinicia el servidor. Mientras tanto puedes
            ver el catálogo, pero no podrás guardar cambios.
          </div>
        </div>
      )}

      <div className="admin-title-row">
        <div>
          <h2>Gestión de Productos</h2>
          <p>Administra el catálogo que ven tus clientes.</p>
        </div>
        <button
          onClick={() => setIsEditing({} as Product)}
          className="admin-btn-add"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          icon={<Package size={20} />}
          label="Productos"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<Check size={20} />}
          label="En stock"
          value={stats.inStock}
          color="green"
        />
        <StatCard
          icon={<PackageX size={20} />}
          label="Agotados"
          value={stats.outOfStock}
          color="red"
        />
        <StatCard
          icon={<Layers size={20} />}
          label="Categorías"
          value={stats.cats}
          color="yellow"
        />
      </div>

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
          {productCategories.map((cat) => (
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

      {isEditing !== null && (
        <ProductFormModal
          product={isEditing}
          saving={saving}
          supabase={supabase}
          categories={allCategories}
          onCancel={() => setIsEditing(null)}
          onSubmit={handleSave}
        />
      )}

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
                            Conecta Supabase o agrega tu primer producto con el
                            botón <strong>&quot;Nuevo Producto&quot;</strong>
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
                    <td className="admin-price-cell">
                      ${Number(product.base_price).toFixed(2)}
                    </td>
                    <td className="admin-unit-cell">
                      {product.unit === "kg" ? "kg" : "unidad"} (
                      {product.weight_per_unit}kg)
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