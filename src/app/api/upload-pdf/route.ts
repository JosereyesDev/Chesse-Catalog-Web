import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 1. Manejador para GET (Evita el 405 si alguien accede directamente)
export async function GET() {
  return NextResponse.json(
    { message: "Endpoint activo. Envía una petición POST con el archivo PDF." },
    { status: 200 }
  );
}

// 2. Manejador principal para POST
export async function POST(req: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Faltan las variables de entorno de Supabase en Vercel");
      return NextResponse.json(
        { error: "Error de configuración en el servidor" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
      console.error("Error al subir a Supabase en Vercel:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    
    const cleanUrl = `${protocol}://${host}/pedido/${fileId}`;

    return NextResponse.json({ link: cleanUrl });
  } catch (error: any) {
    console.error("Error en /api/upload-pdf:", error);
    return NextResponse.json({ error: error?.message || "Error interno" }, { status: 500 });
  }
}