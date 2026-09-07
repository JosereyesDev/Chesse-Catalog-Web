"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Edit2, Plus } from "lucide-react";

type Mode = "create" | "edit";

export function CategoryFormModal({
  mode,
  initialName = "",
  isOpen,
  onClose,
  onSave,
  saving,
  existingCategories,
}: {
  mode: Mode;
  initialName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  saving: boolean;
  existingCategories: string[];
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState("");

  // Resetear cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setError("");
    }
  }, [isOpen, initialName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("El nombre no puede estar vacío");
      return;
    }
    if (mode === "create" && existingCategories.includes(trimmed)) {
      setError("Ya existe una categoría con ese nombre");
      return;
    }
    if (mode === "edit" && trimmed !== initialName && existingCategories.includes(trimmed)) {
      setError("Ya existe una categoría con ese nombre");
      return;
    }
    setError("");
    await onSave(trimmed);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="admin-modal-header">
          <div className={`admin-modal-icon ${mode === "edit" ? "edit" : "create"}`}>
            {mode === "edit" ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h3>{mode === "edit" ? "Editar Categoría" : "Nueva Categoría"}</h3>
            <p>
              {mode === "edit"
                ? "Actualiza el nombre de la categoría"
                : "Agrega una nueva categoría al sistema"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group span-2">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Quesos, Embutidos, ..."
                required
                autoFocus
              />
              {error && (
                <span style={{ color: "var(--danger, #dc2626)", fontSize: 13, marginTop: 4 }}>
                  {error}
                </span>
              )}
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="button" onClick={onClose} className="admin-btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="admin-btn-save">
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Guardando..." : mode === "edit" ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}