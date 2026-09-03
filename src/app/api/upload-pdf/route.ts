import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const fileId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fileName = `pedido_${fileId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("pedidos_temp")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error al subir a Supabase:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Detectar el protocolo (http/https) y el host exacto de la petición
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    
    // Construir la URL garantizada sin fallas en móviles
    const cleanUrl = `${protocol}://${host}/pedido/${fileId}`;

    return NextResponse.json({ link: cleanUrl });
  } catch (error) {
    console.error("Error en servidor:", error);
    return NextResponse.json({ error: "Error interno procesando la subida" }, { status: 500 });
  }
}