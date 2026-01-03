import { NextResponse } from "next/server";
// La ruta correcta para subir 3 niveles y entrar a lib:
import { client } from "../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE || "fileSearchStores/iuspmteststore-ntk4jf8lwt3q";
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    const response = await api.listFileSearchStoreFiles({
      fileSearchStoreName: storeName
    });

    return NextResponse.json({ 
      files: response.fileSearchStoreFiles || [] 
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : "Error al listar archivos" 
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    
    await api.deleteFileSearchStoreFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e instanceof Error ? e.message : "Error al eliminar" 
    }, { status: 500 });
  }
}