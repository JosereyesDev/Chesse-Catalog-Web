import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const fileId = params.id;

  console.log("[pedido/[id]] GET recibido para ID:", fileId);
  console.log("[pedido/[id]] Supabase URL:", supabaseUrl);
  console.log("[pedido/[id]] Key exists:", !!supabaseServiceKey);

  if (!fileId) {
    console.error("[pedido/[id]] ID no válido");
    return new NextResponse("ID de pedido no válido", { status: 400 });
  }

  const fileName = `pedido_${fileId}.pdf`;
  console.log("[pedido/[id]] Nombre del archivo buscado:", fileName);

  const { data } = supabase.storage
    .from("pedidos_temp")
    .getPublicUrl(fileName);

  console.log("[pedido/[id]] Datos obtenidos de getPublicUrl:", data);

  if (!data?.publicUrl) {
    console.error("[pedido/[id]] No se encontró URL pública para:", fileName);
    return new NextResponse("Pedido no encontrado o expirado", { status: 404 });
  }

  console.log("[pedido/[id]] Redirigiendo a:", data.publicUrl);
  return NextResponse.redirect(data.publicUrl);
}