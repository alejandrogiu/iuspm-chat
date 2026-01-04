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

    /**
     * ESTRATEGIA:
     * Para Google, un Document es como una carpeta con archivos (chunks).
     * Intentamos borrar el contenido interno primero si el SDK lo permite.
     */
    
    // Si tu versión del SDK tiene 'chunks' dentro de documents, hay que limpiarlos.
    // Pero la forma más directa que suele destrabar el 400 es llamar a 'delete'
    // asegurándonos de que no haya procesos de indexación activos.
    
    await api.documents.delete({ name: fileName });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error en DELETE:", e);

    // Si el error es el de 'non-empty', la solución real suele ser
    // borrar el Store completo o usar el servicio de 'Files' (no el de 'Documents')
    return NextResponse.json({ 
      error: "Google no permite borrar documentos ya indexados individualmente de forma simple.",
      suggestion: "Probá borrar el Store completo desde la consola de Google o crear uno nuevo.",
      technical: e.message 
    }, { status: 400 });
  }
}