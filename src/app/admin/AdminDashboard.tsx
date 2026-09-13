"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { LogOut, Package, Tags, Settings, Receipt } from "lucide-react";
import { ProductsPanel } from "./components/ProductsPanel";
import { CategoriesPanel } from "./components/CategoriesPanel";
import { OrdersPanel } from "./components/OrdersPanel";
import { ConfigPanel } from "./components/ConfigPanel";

type Tab = "products" | "categories" | "orders" | "config";

export function AdminDashboard({
  initialProducts,
  initialCategories,
}: {
  initialProducts: Product[];
  initialCategories: string[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("products");

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
          <button
            className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <Receipt size={18} />
            Facturas
          </button>
          <button
            className={`admin-tab ${activeTab === "config" ? "active" : ""}`}
            onClick={() => setActiveTab("config")}
          >
            <Settings size={18} />
            Configuración
          </button>
        </div>

        <div className="admin-panel">
          {activeTab === "products" && (
            <ProductsPanel initialProducts={initialProducts} supabase={supabase} />
          )}
          {activeTab === "categories" && (
            <CategoriesPanel
              initialCategories={initialCategories}
              supabase={supabase}
              onUpdateCategories={() => {}}
            />
          )}
          {activeTab === "orders" && (
            <OrdersPanel supabase={supabase} />
          )}
          {activeTab === "config" && (
            <ConfigPanel supabase={supabase} />
          )}
        </div>
      </div>
    </div>
  );
}