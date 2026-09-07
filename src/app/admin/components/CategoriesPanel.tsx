// src/app/admin/components/CategoriesPanel.tsx
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
  initialCategories = [],
  supabase,
  onUpdateCategories,
}: {
  initialCategories?: string[];
  supabase: ReturnType<typeof createClient> | null;
  onUpdateCategories: (categories: string[]) => void;
}) {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingName, setEditingName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 2800);
  };

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.localeCompare(b)),
    [categories]
  );

  const openCreateModal = () => {
    setModalMode("create");
    setEditingName("");
    setModalOpen(true);
  };

  const openEditModal = (name: string) => {
    setModalMode("edit");
    setEditingName(name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingName("");
  };

  const handleCreate = async (name: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    if (categories.includes(name)) {
      showToast({ type: "error", message: "La categoría ya existe" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("categories").insert([{ name }]);
      if (error) throw error;
      const newCategories = [...categories, name];
      setCategories(newCategories);
      onUpdateCategories(newCategories);
      showToast({ type: "success", message: "Categoría creada" });
      closeModal();
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo crear la categoría" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (newName: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    if (!editingName) return;
    if (newName === editingName) {
      closeModal();
      return;
    }
    if (categories.includes(newName)) {
      showToast({ type: "error", message: "Ya existe una categoría con ese nombre" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("categories")
        .update({ name: newName })
        .eq("name", editingName);
      if (error) throw error;

      const { error: updateProductsError } = await supabase
        .from("products")
        .update({ category: newName })
        .eq("category", editingName);
      if (updateProductsError) throw updateProductsError;

      const newCategories = categories.map((c) =>
        c === editingName ? newName : c
      );
      setCategories(newCategories);
      onUpdateCategories(newCategories);
      showToast({ type: "success", message: "Categoría actualizada" });
      closeModal();
    } catch (err) {
      console.error(err);
      showToast({ type: "error", message: "No se pudo actualizar la categoría" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    if (!confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) return;
    setDeletingName(name);
    try {
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
      const newCategories = categories.filter((c) => c !== name);
      setCategories(newCategories);
      onUpdateCategories(newCategories);
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
          onClick={openCreateModal}
          className="admin-btn-add"
        >
          <Plus size={18} /> Nueva Categoría
        </button>
      </div>

      <CategoryFormModal
        mode={modalMode}
        initialName={editingName}
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={modalMode === "create" ? handleCreate : handleUpdate}
        saving={saving}
        existingCategories={categories}
      />

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
                          onClick={() => openEditModal(name)}
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

      {toast && (
        <div className={`admin-toast ${toast.type}`}>
          {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}