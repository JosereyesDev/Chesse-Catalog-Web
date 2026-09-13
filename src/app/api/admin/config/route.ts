import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_CONFIG: Record<string, string> = {
  whatsapp_number: "584121234253",
  phone_number: "+58 412 1234253",
  email: "info@invelrey.com",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  youtube_url: "",
  map_embed_url:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31375.7513147297!2d-70.8775705!3d10.7937887!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e85b4f08f0f0f0f%3A0x0!2zMTDCsDQ3JzM3LjYiTiA3MMKwNTInMzkuMSJX!5e0!3m2!1ses!2sve!4v1640000000000",
};

// Obtener cliente con privilegios de service_role si está disponible, o el cliente de servidor habitual
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

// GET: obtener toda la configuración
export async function GET() {
  try {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("site_config")
      .select("key, value")
      .order("key");

    if (error) {
      console.warn("[GET /api/admin/config] Advertencia de Supabase:", error.message);
      // Si la tabla no existe o hay error de permisos, devolvemos los valores por defecto
      const isMissing = error.message.includes("does not exist") || (error as any).code === "42P01";
      return NextResponse.json({
        ...DEFAULT_CONFIG,
        _tableMissing: isMissing,
      });
    }

    // Convertir array a objeto { key: value }
    const config = (data || []).reduce((acc, row) => {
      if (row.key) {
        acc[row.key] = row.value ?? "";
      }
      return acc;
    }, {} as Record<string, string>);

    // Asegurar que todas las claves esperadas tengan al menos el valor por defecto si no existen
    const mergedConfig = { ...DEFAULT_CONFIG, ...config, _tableMissing: false };

    return NextResponse.json(mergedConfig);
  } catch (err: any) {
    console.warn("[GET /api/admin/config] Excepción recuperada con valores por defecto:", err);
    return NextResponse.json({
      ...DEFAULT_CONFIG,
      _tableMissing: true,
    });
  }
}

// PUT: actualizar o insertar múltiples claves
export async function PUT(req: NextRequest) {
  try {
    const supabase = await getSupabase();
    const updates = await req.json(); // { key1: value1, key2: value2, ... }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Cuerpo de solicitud inválido" },
        { status: 400 }
      );
    }

    const results = [];

    // Limpiar claves internas como _tableMissing
    const cleanUpdates = { ...updates };
    delete cleanUpdates._tableMissing;

    for (const [key, value] of Object.entries(cleanUpdates)) {
      const stringValue = value !== undefined && value !== null ? String(value) : "";

      // Intentar primero con upsert (inserta si no existe, actualiza si existe)
      const { data: upsertData, error: upsertError } = await supabase
        .from("site_config")
        .upsert(
          { key, value: stringValue },
          { onConflict: "key" }
        )
        .select();

      if (upsertError) {
        console.warn(`[PUT /api/admin/config] Upsert falló para "${key}":`, upsertError.message);

        if (upsertError.message.includes("does not exist") || (upsertError as any).code === "42P01") {
          return NextResponse.json(
            {
              error:
                "La tabla 'site_config' no existe en tu base de datos de Supabase. Por favor ejecuta el archivo site_config_setup.sql en el SQL Editor de Supabase.",
            },
            { status: 500 }
          );
        }

        // Fallback en caso de que la tabla no tenga constraint UNIQUE en "key"
        const { data: existing } = await supabase
          .from("site_config")
          .select("key")
          .eq("key", key)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase
            .from("site_config")
            .update({ value: stringValue })
            .eq("key", key)
            .select();

          if (updateError) {
            return NextResponse.json(
              { error: `Error al actualizar "${key}": ${updateError.message}` },
              { status: 500 }
            );
          }
          results.push(updated);
        } else {
          const { data: inserted, error: insertError } = await supabase
            .from("site_config")
            .insert({ key, value: stringValue })
            .select();

          if (insertError) {
            return NextResponse.json(
              { error: `Error al insertar "${key}": ${insertError.message}` },
              { status: 500 }
            );
          }
          results.push(inserted);
        }
      } else {
        results.push(upsertData);
      }
    }

    return NextResponse.json({ success: true, count: results.length });
  } catch (err: any) {
    console.error("[PUT /api/admin/config] Exception:", err);
    return NextResponse.json(
      { error: err?.message || "Error interno del servidor al guardar configuración" },
      { status: 500 }
    );
  }
}
