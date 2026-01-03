import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;

    if (!storeName) {
      return NextResponse.json({ error: "Variable FILE_SEARCH_STORE no configurada" }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storesApi = (client as any).fileSearchStores;
    
    // EL CAMBIO: En el SDK, los métodos de archivos están dentro de 'fileSearchStoreFiles'
    // y el método se llama simplemente 'list'
    const response = await storesApi.fileSearchStoreFiles.list({
      fileSearchStoreName: storeName
    });

    return NextResponse.json({ 
      files: response.fileSearchStoreFiles || [] 
    });
  } catch (e: any) {
    console.error("Error detallado en GET /api/admin/files:", e);
    return NextResponse.json({ 
      error: e.message || "Error al listar archivos",
      stack: e.stack // Esto nos ayudará si vuelve a fallar
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    const storeName = process.env.FILE_SEARCH_STORE;

    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storesApi = (client as any).fileSearchStores;
    
    // EL CAMBIO: Para borrar es el método 'delete' dentro de 'fileSearchStoreFiles'
    await storesApi.fileSearchStoreFiles.delete({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error detallado en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}