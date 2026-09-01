import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
    }

    // El servidor hace el fetch a file.io (aquí no hay problemas de CORS)
    const fileIoFormData = new FormData();
    fileIoFormData.append("file", file);

    const res = await fetch("https://file.io", {
      method: "POST",
      body: fileIoFormData,
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Error en servidor externo" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ link: data.link });
  } catch (error) {
    console.error("Error enviando PDF:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}