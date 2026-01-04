import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    // Ejecutamos la consulta a 'documents'
    const response = await api.documents.list({ parent: storeName });

    // Mapeo exacto basado en tu log: los archivos están en 'pageInternal'
    const files = response.pageInternal || [];

    return NextResponse.json({ files });
  } catch (e: any) {
    console.error("Error en GET /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;

    // Para borrar, el SDK suele esperar el 'name' completo que recibimos 
    // (ej: fileSearchStores/.../documents/...)
    await api.documents.delete({ name: fileName });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}