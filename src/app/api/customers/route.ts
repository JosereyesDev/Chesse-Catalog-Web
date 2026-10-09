import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET: Buscar usuario por cédula
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cedula = searchParams.get("cedula")?.trim();

  if (!cedula) {
    return NextResponse.json({ error: "Cédula requerida" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("cedula", cedula)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customer: data });
}

// POST: Crear o actualizar usuario
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cedula, name, phone, address } = body;

    if (!cedula || !name || !phone || !address) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("customers")
      .upsert(
        {
          cedula: cedula.trim(),
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "cedula" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, customer: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Error al guardar usuario" }, { status: 500 });
  }
}