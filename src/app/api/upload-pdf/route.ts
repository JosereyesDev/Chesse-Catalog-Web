import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  return NextResponse.json(
    { message: "Endpoint activo. Envía una petición POST con el archivo PDF." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("[POST /api/upload-pdf] Iniciando subida...");

  try {
    // 1. Validar variables de entorno
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[POST] Faltan variables de entorno de Supabase");
      return NextResponse.json(
        { error: "Error de configuración en el servidor" },
        { status: 500 }
      );
    }
    console.log("[POST] Variables de entorno OK");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("[POST] No se recibió ningún archivo");
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    console.log(`[POST] Archivo recibido: ${file.name}, tamaño: ${file.size} bytes, tipo: ${file.type}`);

    const fileId = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const fileName = `pedido_${fileId}.pdf`;
    console.log(`[POST] Nombre de archivo generado: ${fileName}`);

    // 2. Subir a Supabase
    const { error: uploadError } = await supabase.storage
      .from("pedidos_temp")
      .upload(fileName, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("[POST] Error al subir a Supabase:", uploadError);
      return NextResponse.json(
        { error: `Supabase upload error: ${uploadError.message}` },
        { status: 500 }
      );
    }

    console.log(`[POST] Archivo subido exitosamente: ${fileName}`);

    // 3. Construir URL pública de redirección (evitamos depender de cabeceras)
    // Usamos la variable de entorno VERCEL_URL si existe, o construimos con cabeceras
    let baseUrl: string;
    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
      console.log(`[POST] Usando VERCEL_URL: ${baseUrl}`);
    } else {
      const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      baseUrl = `${protocol}://${host}`;
      console.log(`[POST] Usando cabeceras: ${baseUrl}`);
    }

    const cleanUrl = `${baseUrl}/pedido/${fileId}`;
    console.log(`[POST] Enlace generado: ${cleanUrl}`);

    const elapsed = Date.now() - startTime;
    console.log(`[POST] Subida completada en ${elapsed}ms`);

    return NextResponse.json({ link: cleanUrl });
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.error(`[POST] Error después de ${elapsed}ms:`, error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}