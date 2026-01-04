import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    // CAMBIO CLAVE: En esta versión, el método .list() a menudo espera 
    // un objeto con la propiedad 'parent' en lugar de 'fileSearchStoreName'
    const response = await api.documents.list({ 
      parent: storeName 
    });

    return NextResponse.json({ 
      files: response.documents || [] 
    });
  } catch (e: any) {
    console.error("Error detallado en GET /api/admin/files:", e);
    // Intentamos una segunda opción si la primera falla por el mismo error de parámetros
    try {
        const storeName = process.env.FILE_SEARCH_STORE;
        const api = (client as any).fileSearchStores;
        // Intento 2: Pasar el string directamente si el objeto falla
        const response = await api.documents.list(storeName);
        return NextResponse.json({ files: response.documents || [] });
    } catch (innerError: any) {
        return NextResponse.json({ 
            error: e.message,
            stack: e.stack 
        }, { status: 500 });
    }
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