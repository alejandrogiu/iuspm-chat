import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    let response;

    // Intentamos la variante 1: métodos agrupados (v1.34.0+)
    if (api.fileSearchStoreFiles && typeof api.fileSearchStoreFiles.list === 'function') {
      response = await api.fileSearchStoreFiles.list({ fileSearchStoreName: storeName });
    } 
    // Intentamos la variante 2: métodos directos (versiones anteriores o flat)
    else if (typeof api.listFileSearchStoreFiles === 'function') {
      response = await api.listFileSearchStoreFiles({ fileSearchStoreName: storeName });
    } 
    else {
      throw new Error("No se encontró el método para listar archivos en el SDK. Estructura: " + Object.keys(api).join(", "));
    }

    return NextResponse.json({ 
      files: response.fileSearchStoreFiles || [] 
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

    // Variante 1
    if (api.fileSearchStoreFiles && typeof api.fileSearchStoreFiles.delete === 'function') {
      await api.fileSearchStoreFiles.delete({ fileSearchStoreFileName: fileName });
    } 
    // Variante 2
    else if (typeof api.deleteFileSearchStoreFile === 'function') {
      await api.deleteFileSearchStoreFile({ fileSearchStoreFileName: fileName });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error detallado en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}