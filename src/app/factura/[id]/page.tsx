import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { FacturaViewer } from "./FacturaViewer";
import Link from "next/link";
import { AlertCircle, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 0; // No cachear para ver cambios en tiempo real

async function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }

  return await createServerClient();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Factura ${id} · Inv. El Rey 2020`,
    description: "Detalle de orden y factura en Inv. El Rey 2020",
  };
}

export default async function FacturaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await getSupabase();

  // Buscar por el token seguro único
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("token", id)
    .maybeSingle();

  if (error || !order) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "var(--crema, #ffffff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          fontFamily: "'Nunito Sans', sans-serif"
        }}
      >
        <div
          style={{
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            padding: "2.5rem 2rem",
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(19, 42, 99, 0.08)",
            border: "1px solid var(--gris-borde, #e6ecf4)"
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem"
            }}
          >
            <AlertCircle size={32} />
          </div>

          <h2 style={{ fontSize: "1.5rem", color: "var(--azul-rey, #132a63)", marginBottom: "0.5rem", fontFamily: "'Baloo 2', sans-serif" }}>
            Factura no encontrada
          </h2>
          <p style={{ color: "var(--gris-texto, #5a6e7e)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1.75rem" }}>
            El enlace que ingresaste no coincide con ningún pedido registrado o ya no está disponible.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "var(--azul-rey, #132a63)",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.95rem"
            }}
          >
            <ShoppingBag size={18} /> Ir al Catálogo de Productos
          </Link>
        </div>
      </div>
    );
  }

  return <FacturaViewer order={order} />;
}
