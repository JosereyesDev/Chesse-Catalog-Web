import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inicializa el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Nombre único para el archivo
    const fileName = `pedido_${Date.now()}_${Math.floor(Math.random() * 1000)}.pdf`;

    // 1. Subir el PDF al bucket 'pedidos_temp'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pedidos_temp")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error al subir a Supabase:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 2. Obtener la URL Pública
    const { data: publicUrlData } = supabase.storage
      .from("pedidos_temp")
      .getPublicUrl(fileName);

    return NextResponse.json({ link: publicUrlData.publicUrl });
  } catch (error) {
    console.error("Error en servidor:", error);
    return NextResponse.json({ error: "Error interno procesando la subida" }, { status: 500 });
  }
}