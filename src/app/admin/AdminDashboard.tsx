"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Package, Tags, PlusCircle } from "lucide-react";
import { ProductsPanel } from "./components/ProductsPanel";
import { CategoriesPanel } from "./components/CategoriesPanel";

type Tab = "products" | "categories";

export function AdminDashboard({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: string[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  // Inicializar Supabase una sola vez
  const [supabase] = useState(() => {
    try {
      return createClient();
    } catch (err) {
      console.error("Error initializing Supabase:", err);
      return null;
    }
  });

  const handleLogout = () => {
    document.cookie =
      "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/admin/login";
  };

  return (
    <div className="admin-page">
      {/* Header común */}
      <div className="admin-header">
        <div className="admin-header-brand">
          <div className="admin-badge">
            <span role="img" aria-label="cow">
              🐮
            </span>
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
        {/* Navegación por pestañas */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={18} />
            Productos
          </button>
          <button
            className={`admin-tab ${activeTab === "categories" ? "active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            <Tags size={18} />
            Categorías
          </button>
          {/* Aquí puedes añadir más pestañas en el futuro */}
        </div>

        {/* Paneles según pestaña activa */}
        <div className="admin-panel">
          {activeTab === "products" && (
            <ProductsPanel
              initialProducts={initialProducts}
              supabase={supabase}
            />
          )}
          {activeTab === "categories" && (
            <CategoriesPanel
              initialCategories={initialCategories}
              supabase={supabase}
            />
          )}
        </div>
      </div>
    </div>
  );
}