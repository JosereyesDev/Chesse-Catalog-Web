"use client";

import { useState, useRef } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { X, Loader2, ImageOff, Edit2, Plus } from "lucide-react";

type ProductFormData = Omit<Product, "id">;

export function ProductFormModal({
  product,
  saving,
  supabase,
  categories = [],
  onCancel,
  onSave,
}: {
  product: Partial<Product>; // puede ser vacío para nuevo producto
  saving: boolean;
  supabase: ReturnType<typeof createClient> | null;
  categories?: string[];
  onCancel: () => void;
  onSave: (data: ProductFormData) => Promise<void>;
}) {
  const [imageUrl, setImageUrl] = useState(product.image || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const isEditingExisting = !!product.id;

  // Previsualización local (si hay archivo seleccionado)
  const previewImage = selectedFile
    ? URL.createObjectURL(selectedFile)
    : imageUrl;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setUploadError("El archivo debe ser una imagen");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("La imagen no debe superar 5MB");
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    setUploadError("");
    // Limpiar el campo de texto URL si se sube archivo (opcional)
    // setImageUrl("");
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!supabase) {
      setUploadError("Sin conexión a la base de datos");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = (formData.get("description") as string) || "";
    const base_price = parseFloat(formData.get("base_price") as string);
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const weight_per_unit = parseFloat(formData.get("weight_per_unit") as string);
    const in_stock = formData.get("in_stock") === "on";

    let finalImageUrl = imageUrl; // URL manual o preexistente

    // Si hay un archivo seleccionado, lo subimos ahora
    if (selectedFile) {
      setUploading(true);
      setUploadError("");
      try {
        const ext = selectedFile.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("products")
          .upload(fileName, selectedFile, { cacheControl: "3600", upsert: false });
        if (uploadErr) throw uploadErr;

        const { data } = supabase.storage.from("products").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      } catch (err) {
        console.error(err);
        setUploadError(
          'No se pudo subir la imagen. Verifica que el bucket "products" exista y sea público.'
        );
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Preparar datos del producto
    const productData: ProductFormData = {
      name,
      description,
      base_price,
      image: finalImageUrl || null,
      unit,
      weight_per_unit,
      in_stock,
      category,
    };

    // Si es edición, necesitamos pasar el id, pero el modal no lo maneja
    // El padre se encarga de saber si es edición o creación
    await onSave(productData);
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

        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group span-2">
              <label>Nombre</label>
              <input
                name="name"
                type="text"
                defaultValue={product.name || ""}
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
                defaultValue={product.base_price || 0}
                required
              />
            </div>
            <div className="admin-form-group">
              <label>Categoría</label>
              <select
                name="category"
                defaultValue={product.category || ""}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group span-2">
              <label>Imagen</label>
              <div className="admin-image-row">
                <div className="admin-image-preview">
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : previewImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewImage}
                      alt="Vista previa"
                      onError={() => setImageUrl("")}
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
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      // Si se escribe una URL, se descarta el archivo seleccionado
                      if (selectedFile) setSelectedFile(null);
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
                      onChange={handleFileSelect}
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
            <button
              type="submit"
              disabled={saving || uploading}
              className="admin-btn-save"
            >
              {(saving || uploading) && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {uploading
                ? "Subiendo imagen..."
                : saving
                ? "Guardando..."
                : "Guardar Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}