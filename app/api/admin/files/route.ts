import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

// app/api/admin/files/route.ts

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    // Ejecutamos la consulta
    const response = await api.documents.list({ parent: storeName });

    // LOG PARA DEBUG: Mirá esto en los logs de Vercel para ver qué devuelve Google exactamente
    console.log("Respuesta raw de Google:", JSON.stringify(response));

    // Intentamos extraer la lista de donde sea que esté
    const files = response.documents || 
                  response.fileSearchStoreFiles || 
                  (Array.isArray(response) ? response : []);

    return NextResponse.json({ files });
  } catch (e: any) {
    console.error("Error en GET /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;

    // Para el borrado, 'name' suele ser el identificador completo
    await api.documents.delete({ 
      name: fileName 
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error detallado en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}