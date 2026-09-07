"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { CategoryFormModal } from "./CategoryFormModal";

type Toast = { type: "success" | "error"; message: string } | null;

export function CategoriesPanel({
  initialCategories,
  supabase,
}: {
  initialCategories: string[];
  supabase: ReturnType<typeof createClient> | null;
}) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  // Estado para el modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingName, setEditingName] = useState("");

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.localeCompare(b)),
    [categories]
  );

  // Crear categoría
  const handleCreate = async (name: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("categories").insert([{ name }]);
      if (error) throw error;
      setCategories((prev) => [...prev, name]);
      setModalOpen(false);
      showToast({ type: "success", message: "Categoría creada" });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo crear la categoría" });
    } finally {
      setSaving(false);
    }
  };

  // Actualizar categoría
  const handleUpdate = async (newName: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    setSaving(true);
    try {
      // Actualizar en categories
      const { error } = await supabase
        .from("categories")
        .update({ name: newName })
        .eq("name", editingName);
      if (error) throw error;

      // Actualizar en productos que usen esta categoría
      const { error: updateProductsError } = await supabase
        .from("products")
        .update({ category: newName })
        .eq("category", editingName);
      if (updateProductsError) throw updateProductsError;

      setCategories((prev) =>
        prev.map((c) => (c === editingName ? newName : c))
      );
      setModalOpen(false);
      showToast({ type: "success", message: "Categoría actualizada" });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo actualizar la categoría" });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar categoría
  const handleDelete = async (name: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;
    setDeletingName(name);
    try {
      // Verificar si hay productos con esta categoría
      const { count, error: countError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("category", name);
      if (countError) throw countError;
      if (count && count > 0) {
        showToast({
          type: "error",
          message: `No se puede eliminar: ${count} producto(s) usan esta categoría`,
        });
        setDeletingName(null);
        return;
      }

      const { error } = await supabase.from("categories").delete().eq("name", name);
      if (error) throw error;
      setCategories((prev) => prev.filter((c) => c !== name));
      showToast({ type: "success", message: "Categoría eliminada" });
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo eliminar la categoría" });
    } finally {
      setDeletingName(null);
    }
  };

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

      <div className="admin-title-row">
        <div>
          <h2>Gestión de Categorías</h2>
          <p>Administra las categorías disponibles para los productos.</p>
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setEditingName("");
            setModalOpen(true);
          }}
          className="admin-btn-add"
        >
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      {/* Tabla de categorías */}
      <div className="admin-table-card">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th className="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div className="admin-empty">
                      <strong>No hay categorías</strong>
                      <p>Agrega tu primera categoría con el botón superior.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCategories.map((name) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          onClick={() => {
                            setModalMode("edit");
                            setEditingName(name);
                            setModalOpen(true);
                          }}
                          className="admin-action-btn edit"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(name)}
                          disabled={deletingName === name}
                          className="admin-action-btn delete"
                          title="Eliminar"
                        >
                          {deletingName === name ? (
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

      {/* Modal de categoría */}
      <CategoryFormModal
        mode={modalMode}
        initialName={editingName}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={modalMode === "create" ? handleCreate : handleUpdate}
        saving={saving}
        existingCategories={categories}
      />

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}