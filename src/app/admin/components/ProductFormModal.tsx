"use client";

import { useState, useMemo } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ImageOff, Edit2, Plus } from "lucide-react";

export function ProductFormModal({
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
      setUploadError(
        'No se pudo subir la imagen. Verifica que el bucket "products" exista y sea público.'
      );
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
        <button
          type="button"
          className="modal-close"
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="admin-modal-header">
          <div
            className={`admin-modal-icon ${isEditingExisting ? "edit" : "create"}`}
          >
            {isEditingExisting ? <Edit2 size={20} /> : <Plus size={20} />}
          </div>
          <div>
            <h3>{isEditingExisting ? "Editar Producto" : "Nuevo Producto"}</h3>
            <p>
              {isEditingExisting
                ? "Actualiza los datos del producto"
                : "Completa los datos para agregarlo al catálogo"}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group span-2">
              <label>Nombre</label>
              <input
                name="name"
                type="text"
                defaultValue={product.name}
                required
              />
            </div>
            <div className="admin-form-group span-2">
              <label>Descripción</label>
              <input
                name="description"
                type="text"
                defaultValue={product.description || ""}
              />
            </div>
            <div className="admin-form-group">
              <label>Precio ($)</label>
              <input
                name="base_price"
                type="number"
                step="0.01"
                defaultValue={product.base_price}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Categoría</label>
              <input
                name="category"
                type="text"
                defaultValue={product.category || "Quesos"}
                required
              />
            </div>

            <div className="admin-form-group span-2">
              <label>Imagen</label>
              <div className="admin-image-row">
                <div className="admin-image-preview">
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt="Vista previa"
                      onError={() => setImage("")}
                    />
                  ) : (
                    <ImageOff size={18} />
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
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
                    <span style={{ color: "var(--danger, #dc2626)", fontSize: 12 }}>
                      {uploadError}
                    </span>
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
              <input
                name="weight_per_unit"
                type="number"
                step="0.01"
                defaultValue={product.weight_per_unit || 1}
                required
              />
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