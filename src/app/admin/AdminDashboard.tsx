"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit2, Trash2, LogOut, Check, Loader2 } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#161512] font-sans">
      {/* HEADER */}
      <header className="bg-[#0a1a44] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Panel Administrativo
        </h1>
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border-none text-white font-bold cursor-pointer hover:bg-white/20 transition-colors"
        >
          <LogOut size={16} /> Salir
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#0a1a44]">Gestión de Productos</h2>
          <button
            onClick={() => setIsEditing({} as Product)}
            className="flex items-center gap-2 bg-[#2d9b4e] text-white px-5 py-2.5 rounded-full font-bold border-none shadow-[0_4px_0_#1f8f42] cursor-pointer hover:-translate-y-0.5 transition-transform"
          >
            <Plus size={18} /> Nuevo Producto
          </button>
        </div>

        {/* MODAL DE EDICIÓN/CREACIÓN */}
        {isEditing !== null && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h3 className="text-2xl font-bold mb-4 text-[#0a1a44]">
                {isEditing.id ? "Editar Producto" : "Nuevo Producto"}
              </h3>
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Nombre</label>
                    <input name="name" defaultValue={isEditing.name} required className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Descripción</label>
                    <input name="description" defaultValue={isEditing.description || ""} className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Precio ($)</label>
                    <input name="base_price" type="number" step="0.01" defaultValue={isEditing.base_price} required className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Categoría</label>
                    <input name="category" defaultValue={isEditing.category || "Quesos"} required className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">URL de Imagen</label>
                    <input name="image" defaultValue={isEditing.image || ""} className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Unidad</label>
                    <select name="unit" defaultValue={isEditing.unit || "unit"} className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none">
                      <option value="unit">Unidad</option>
                      <option value="kg">Kilogramo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#6b5e4f] mb-1">Peso por unidad (kg)</label>
                    <input name="weight_per_unit" type="number" step="0.01" defaultValue={isEditing.weight_per_unit || 1} required className="w-full p-2 border border-[#e5e0d8] rounded-xl bg-[#faf8f6] outline-none" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2 mt-1">
                    <input type="checkbox" name="in_stock" id="in_stock" defaultChecked={isEditing.id ? isEditing.in_stock : true} className="w-5 h-5 accent-[#0a1a44]" />
                    <label htmlFor="in_stock" className="font-bold text-[#0a1a44]">Disponible en stock</label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsEditing(null)} className="px-5 py-2.5 rounded-full font-bold border-none bg-[#f5f2ed] text-[#0a1a44] cursor-pointer hover:bg-gray-200">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-5 py-2.5 rounded-full font-bold border-none bg-[#0a1a44] text-white shadow-[0_4px_0_#060f2e] cursor-pointer flex items-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TABLA DE PRODUCTOS */}
        <div className="bg-white rounded-3xl shadow-sm border border-[#e5e0d8] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-bold text-[#0a1a44] bg-[#f5f2ed] border-b border-[#e5e0d8]">Producto</th>
                  <th className="p-4 text-left font-bold text-[#0a1a44] bg-[#f5f2ed] border-b border-[#e5e0d8]">Precio</th>
                  <th className="p-4 text-left font-bold text-[#0a1a44] bg-[#f5f2ed] border-b border-[#e5e0d8]">Unidad</th>
                  <th className="p-4 text-left font-bold text-[#0a1a44] bg-[#f5f2ed] border-b border-[#e5e0d8]">Stock</th>
                  <th className="p-4 text-right font-bold text-[#0a1a44] bg-[#f5f2ed] border-b border-[#e5e0d8]">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 px-4 text-[#6b5e4f]">
                      <div className="text-5xl mb-4">📦</div>
                      <p className="text-[#0a1a44] text-xl font-bold">No hay productos aún</p>
                      <p className="text-[#6b5e4f] mt-2">
                        Conecta Supabase o agrega tu primer producto con el botón <strong>"Nuevo Producto"</strong>
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-b border-[#e5e0d8] hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#0a1a44]">{product.name}</div>
                        <div className="text-xs text-[#6b5e4f]">{product.category}</div>
                      </td>
                      <td className="p-4 font-bold text-[#2d9b4e]">
                        ${Number(product.base_price).toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-[#6b5e4f]">
                        {product.unit === "kg" ? "kg" : "unidad"} ({product.weight_per_unit}kg)
                      </td>
                      <td className="p-4">
                        {product.in_stock ? (
                          <span className="bg-[#e6f4ea] text-[#1e8e3e] px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                            <Check size={12} /> Sí
                          </span>
                        ) : (
                          <span className="bg-[#fce8e6] text-[#d93025] px-3 py-1 rounded-full text-xs font-bold inline-block">Agotado</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsEditing(product)}
                            className="p-2 bg-transparent border-none rounded-xl cursor-pointer text-[#4a90d9] hover:bg-blue-50"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-transparent border-none rounded-xl cursor-pointer text-[#d93025] hover:bg-red-50"
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
    </div>
  );
}