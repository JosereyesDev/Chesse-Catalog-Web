import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: obtener toda la configuración
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_config")
    .select("key, value")
    .order("key");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convertir array a objeto { key: value }
  const config = data.reduce((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {} as Record<string, string>);

  return NextResponse.json(config);
}

// PUT: actualizar múltiples claves
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const updates = await req.json(); // { key1: value1, key2: value2, ... }

  const results = [];
  for (const [key, value] of Object.entries(updates)) {
    const { data, error } = await supabase
      .from("site_config")
      .update({ value })
      .eq("key", key)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error updating ${key}: ${error.message}` },
        { status: 500 }
      );
    }
    results.push(data);
  }

  return NextResponse.json({ success: true, data: results });
}