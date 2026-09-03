import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ✅ Firma corregida: params es una Promesa
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: fileId } = await params; // 👈 await para resolver la promesa

    if (!fileId) {
      console.warn("[GET /pedido] ID no proporcionado");
      return new NextResponse("ID de pedido no válido", { status: 400 });
    }

    const fileName = `pedido_${fileId}.pdf`;
    console.log(`[GET /pedido] Buscando archivo: ${fileName}`);

    const { data } = supabase.storage
      .from("pedidos_temp")
      .getPublicUrl(fileName);

    if (!data?.publicUrl) {
      console.warn(`[GET /pedido] No se encontró URL pública para ${fileName}`);
      return new NextResponse("Pedido no encontrado o expirado", { status: 404 });
    }

    console.log(`[GET /pedido] Redirigiendo a: ${data.publicUrl}`);
    return NextResponse.redirect(data.publicUrl);
  } catch (error) {
    console.error("[GET /pedido] Error inesperado:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}