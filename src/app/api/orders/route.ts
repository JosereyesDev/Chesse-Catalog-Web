import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

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

function generateSecureToken(): string {
  // Generar un ID aleatorio e impredecible de 20 caracteres (ej: fac_a8b9c0d1e2f3g4h5)
  const randomBytes = crypto.randomBytes(10).toString("hex");
  return `fac_${randomBytes}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerData = {},
      items = [],
      total_amount = 0,
      total_weight = 0,
      order_number,
    } = body;

    const supabase = await getSupabase();

    // ID seguro e imposible de adivinar
    const token = generateSecureToken();

    // Número visible de orden (ej: PD-20260913-482910)
    const now = new Date();
    const today = now.toISOString().slice(0, 10).replace(/-/g, "");
    const generatedOrderNumber =
      order_number || `PD-${today}-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderRecord = {
      token,
      order_number: generatedOrderNumber,
      customer_name: customerData.name || null,
      customer_cedula: customerData.cedula || null,
      customer_phone: customerData.phone || null,
      customer_address: customerData.address || null,
      items: items,
      total_amount: Number(total_amount) || 0,
      total_weight: Number(total_weight) || 0,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([orderRecord])
      .select()
      .single();

    if (error) {
      console.error("[POST /api/orders] Error al guardar pedido:", error);
      return NextResponse.json(
        { error: `Error al guardar el pedido en base de datos: ${error.message}` },
        { status: 500 }
      );
    }

    // Determinar la URL base de forma inteligente para no depender de URLs con bloqueo
    let baseUrl: string;
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    } else {
      const forwardedHost = req.headers.get("x-forwarded-host");
      const host = forwardedHost || req.headers.get("host") || "localhost:3000";
      const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
      baseUrl = `${proto}://${host}`;
    }

    const facturaUrl = `${baseUrl}/factura/${token}`;

    return NextResponse.json({
      success: true,
      token,
      orderNumber: generatedOrderNumber,
      url: facturaUrl,
      order: data,
    });
  } catch (err: any) {
    console.error("[POST /api/orders] Excepción:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno al procesar el pedido" },
      { status: 500 }
    );
  }
}
