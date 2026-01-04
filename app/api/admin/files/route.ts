import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    // Según tu log, el objeto es 'documents' y el método es 'list'
    const response = await api.documents.list({ 
      fileSearchStoreName: storeName 
    });

    // Ajustamos la respuesta: usualmente si el método es 'documents.list', 
    // la respuesta trae una propiedad 'documents'
    return NextResponse.json({ 
      files: response.documents || [] 
    });
  } catch (e: any) {
    console.error("Error detallado en GET /api/admin/files:", e);
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

    // Siguiendo la lógica de 'documents', el borrado debería ser:
    await api.documents.delete({ 
      fileSearchStoreFileName: fileName 
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error detallado en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}