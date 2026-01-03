import { NextResponse } from "next/server";
// Asegúrate de que esta ruta llegue a lib/gemini.ts
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    // Tomamos la variable tal cual está en Vercel
    const storeName = process.env.FILE_SEARCH_STORE;

    if (!storeName) {
      return NextResponse.json({ error: "Variable FILE_SEARCH_STORE no configurada" }, { status: 500 });
    }

    console.log("Consultando Store:", storeName);

    // Usamos 'any' con el comentario de escape para ESLint
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    const response = await api.listFileSearchStoreFiles({
      fileSearchStoreName: storeName
    });

    return NextResponse.json({ 
      files: response.fileSearchStoreFiles || [] 
    });
  } catch (e: any) {
    // Este log es vital para ver el error en el dashboard de Vercel -> Logs
    console.error("Error detallado en GET /api/admin/files:", e);
    
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : "Error interno al listar archivos",
      details: e.toString()
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    const storeName = process.env.FILE_SEARCH_STORE;

    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    await api.deleteFileSearchStoreFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error detallado en DELETE /api/admin/files:", e);
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : "Error al eliminar" 
    }, { status: 500 });
  }
}