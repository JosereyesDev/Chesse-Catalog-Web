import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[API upload-pdf] Inicializando con URL:", supabaseUrl);
console.log("[API upload-pdf] Key presente:", !!supabaseServiceKey);

export async function GET() {
  return NextResponse.json(
    { message: "Endpoint activo. Envía una petición POST con el archivo PDF." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  console.log("[API upload-pdf] POST recibido");

  try {
    // 1. Validar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[API upload-pdf] ERROR: Faltan variables de entorno");
      return NextResponse.json(
        { error: "Error de configuración en el servidor" },
        { status: 500 }
      );
    }

    // 2. Crear cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("[API upload-pdf] Cliente Supabase creado");

    // 3. Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[API upload-pdf] No se recibió ningún archivo");
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    console.log("[API upload-pdf] Archivo recibido:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // 4. Generar nombre único
    const fileId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fileName = `pedido_${fileId}.pdf`;
    console.log("[API upload-pdf] Nombre generado:", fileName);

    // 5. Subir a Supabase
    console.log("[API upload-pdf] Intentando subir a Supabase...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pedidos_temp")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[API upload-pdf] Error en upload:", {
        message: uploadError.message,
        status: uploadError.status,
        name: uploadError.name,
        stack: uploadError.stack,
      });
      return NextResponse.json(
        { error: `Error al subir: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log("[API upload-pdf] Subida exitosa:", uploadData);

    // 6. Construir la URL para el frontend
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    
    // Si estamos en Vercel, usamos VERCEL_URL
    let baseUrl = `${protocol}://${host}`;
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
      console.log("[API upload-pdf] Usando VERCEL_URL:", baseUrl);
    } else {
      console.log("[API upload-pdf] Usando host/protocol:", baseUrl);
    }

    const cleanUrl = `${baseUrl}/pedido/${fileId}`;
    console.log("[API upload-pdf] URL generada:", cleanUrl);

    // 7. También podemos devolver la URL pública directa (opcional)
    const { data: publicUrlData } = supabase.storage
      .from("pedidos_temp")
      .getPublicUrl(fileName);
    console.log("[API upload-pdf] URL pública de Supabase:", publicUrlData?.publicUrl);

    return NextResponse.json({
      link: cleanUrl,
      supabaseUrl: publicUrlData?.publicUrl, // opcional, por si quieres depurar
    });

  } catch (error: any) {
    console.error("[API upload-pdf] Error general:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}