"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  Check,
  X,
  AlertTriangle,
  Save,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Share2,
  Globe,
  Info,
  ExternalLink
} from "lucide-react";

type Toast = { type: "success" | "error"; message: string } | null;

export function ConfigPanel({
  supabase,
}: {
  supabase: ReturnType<typeof createClient> | null;
}) {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const showToast = (t: Toast) => {
    setToast(t);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/admin/config");
        const data = await res.json().catch(() => ({}));
        if (data._tableMissing) {
          setTableMissing(true);
        }
        setConfig(data || {});
      } catch (err: any) {
        console.warn("Cargando con valores por defecto:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [supabase]);

  const handleChange = (key: string, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!supabase) {
      showToast({ type: "error", message: "Sin conexión a la base de datos" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al guardar");
      }
      showToast({ type: "success", message: "Configuración guardada correctamente" });
    } catch (err: any) {
      console.error(err);
      showToast({
        type: "error",
        message: err?.message || "No se pudo guardar la configuración",
      });
    } finally {
      setSaving(false);
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
        <span>Cargando configuración del sitio...</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px" }}>
      {!supabase && (
        <div className="admin-alert">
          <AlertTriangle size={20} />
          <div>
            <strong>No se pudo conectar con la base de datos.</strong> Verifica tus
            variables de entorno.
          </div>
        </div>
      )}

      {tableMissing && (
        <div
          className="admin-alert"
          style={{ background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }}
        >
          <AlertTriangle size={20} color="#d97706" />
          <div>
            <strong>Tabla de configuración pendiente en Supabase:</strong> La tabla{" "}
            <code>site_config</code> aún no se ha creado en tu base de datos.
            Se están usando los valores predeterminados. Para guardar cambios en la nube,
            ejecuta el archivo <code>site_config_setup.sql</code> en el SQL Editor de tu proyecto en Supabase.
          </div>
        </div>
      )}

      {/* Título y Botón Superior */}
      <div className="admin-title-row" style={{ marginBottom: "2rem" }}>
        <div>
          <h2>Configuración del Sitio</h2>
          <p>
            Modifica la información de contacto, números de WhatsApp, redes sociales y ubicación que se muestran en la tienda.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-save"
          style={{ minWidth: "160px", justifyContent: "center" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* SECCIÓN 1: Canales de Atención y Contacto */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid var(--gris-borde)",
            boxShadow: "0 4px 15px rgba(19, 42, 99, 0.04)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "#fafbfd",
              borderBottom: "1px solid var(--gris-borde)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(0, 191, 30, 0.12)",
                color: "var(--verde)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Phone size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--azul-rey)", fontFamily: "'Baloo 2', sans-serif" }}>
                Contacto y Atención al Cliente
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--gris-texto)" }}>
                Estos datos son usados para recibir pedidos por WhatsApp y en los botones de llamada.
              </p>
            </div>
          </div>

          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* WhatsApp */}
            <div className="admin-form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <MessageCircle size={15} color="#16a34a" /> WhatsApp de Pedidos
              </label>
              <input
                type="text"
                placeholder="Ej: 584121234253"
                value={config.whatsapp_number || ""}
                onChange={(e) => handleChange("whatsapp_number", e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                Código de país seguido del número (sin signos +, espacios ni guiones).
              </span>
            </div>

            {/* Teléfono */}
            <div className="admin-form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Phone size={15} color="var(--azul-rey)" /> Teléfono de Llamadas
              </label>
              <input
                type="text"
                placeholder="Ej: +58 412 1234253"
                value={config.phone_number || ""}
                onChange={(e) => handleChange("phone_number", e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                Formato legible visible en el encabezado y pie de página.
              </span>
            </div>

            {/* Correo Electrónico */}
            <div className="admin-form-group" style={{ gridColumn: "span 1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Mail size={15} color="#d97706" /> Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Ej: info@invelrey.com"
                value={config.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--gris-texto)" }}>
                Correo oficial para dudas y consultas de clientes.
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Redes Sociales */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid var(--gris-borde)",
            boxShadow: "0 4px 15px rgba(19, 42, 99, 0.04)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "#fafbfd",
              borderBottom: "1px solid var(--gris-borde)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(63, 123, 240, 0.12)",
                color: "var(--azul-cielo-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Share2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--azul-rey)", fontFamily: "'Baloo 2', sans-serif" }}>
                Enlaces a Redes Sociales
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--gris-texto)" }}>
                Conecta tus perfiles sociales en el pie de página de la tienda.
              </p>
            </div>
          </div>

          <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
            {/* Instagram */}
            <div className="admin-form-group">
              <label>Instagram URL</label>
              <input
                type="url"
                placeholder="https://instagram.com/tu_cuenta"
                value={config.instagram_url || ""}
                onChange={(e) => handleChange("instagram_url", e.target.value)}
              />
            </div>

            {/* Facebook */}
            <div className="admin-form-group">
              <label>Facebook URL</label>
              <input
                type="url"
                placeholder="https://facebook.com/tu_pagina"
                value={config.facebook_url || ""}
                onChange={(e) => handleChange("facebook_url", e.target.value)}
              />
            </div>

            {/* Twitter / X */}
            <div className="admin-form-group">
              <label>Twitter / X URL</label>
              <input
                type="url"
                placeholder="https://twitter.com/tu_cuenta"
                value={config.twitter_url || ""}
                onChange={(e) => handleChange("twitter_url", e.target.value)}
              />
            </div>

            {/* YouTube */}
            <div className="admin-form-group">
              <label>YouTube URL (opcional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/@tu_canal"
                value={config.youtube_url || ""}
                onChange={(e) => handleChange("youtube_url", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Ubicación y Mapa */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid var(--gris-borde)",
            boxShadow: "0 4px 15px rgba(19, 42, 99, 0.04)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              background: "#fafbfd",
              borderBottom: "1px solid var(--gris-borde)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(255, 199, 44, 0.2)",
                color: "#b45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--azul-rey)", fontFamily: "'Baloo 2', sans-serif" }}>
                Ubicación y Mapa Interactivo
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--gris-texto)" }}>
                Configura el mapa de Google Maps para que los clientes puedan llegar a tu negocio.
              </p>
            </div>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div className="admin-form-group" style={{ marginBottom: "1rem" }}>
              <label>URL del mapa embebido (iframe src de Google Maps)</label>
              <textarea
                rows={3}
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={config.map_embed_url || ""}
                onChange={(e) => handleChange("map_embed_url", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "1px solid var(--gris-borde)",
                  background: "var(--gris-claro)",
                  outline: "none",
                  fontSize: "0.85rem",
                  fontFamily: "monospace",
                  resize: "vertical",
                }}
              />
              <div
                style={{
                  marginTop: "6px",
                  fontSize: "0.78rem",
                  color: "var(--gris-texto)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Info size={14} color="var(--azul-cielo-1)" />
                <span>
                  Para obtener este enlace: Ve a Google Maps, busca tu ubicación, haz clic en <strong>Compartir</strong>, selecciona <strong>"Incorporar un mapa"</strong> y copia el enlace que aparece dentro de <code>src="..."</code>.
                </span>
              </div>
            </div>

            {/* Vista previa pequeña si hay URL */}
            {config.map_embed_url && (
              <div style={{ marginTop: "1rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--azul-rey)", display: "block", marginBottom: "6px" }}>
                  Vista previa del mapa:
                </span>
                <div style={{ borderRadius: "14px", overflow: "hidden", border: "1px solid var(--gris-borde)", height: "200px" }}>
                  <iframe
                    src={config.map_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botón inferior fijo para comodidad en móviles/pantallas largas */}
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          className="admin-btn-save"
          style={{ minWidth: "180px", justifyContent: "center", padding: "12px 24px" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Guardando..." : "Guardar todos los cambios"}
        </button>
      </div>

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