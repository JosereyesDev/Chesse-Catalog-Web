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

  if (!fileId) {
    return new NextResponse("ID de pedido no válido", { status: 400 });
  }

  // Nombre exacto con el que se guardó en Supabase
  const fileName = `pedido_${fileId}.pdf`;

  // Obtener la URL pública de Supabase
  const { data } = supabase.storage
    .from("pedidos_temp")
    .getPublicUrl(fileName);

  if (!data?.publicUrl) {
    return new NextResponse("Pedido no encontrado o expirado", { status: 404 });
  }

  // Redirigir directamente al PDF real en Supabase
  return NextResponse.redirect(data.publicUrl);
}