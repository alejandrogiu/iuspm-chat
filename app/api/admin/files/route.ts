import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Forzamos el uso de Node.js por las librerías de Google
export const runtime = "nodejs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function resolveStoreName() {
  const store = process.env.FILE_SEARCH_STORE || 
               (process.env.GEMINI_FILE_STORE ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}` : undefined);
  if (!store) throw new Error("Falta la variable de entorno FILE_SEARCH_STORE");
  return store;
}

export async function GET() {
  try {
    const storeName = resolveStoreName();
    
    // MÉTODO CORRECTO: listFileSearchStoreFiles (en plural)
    // Este método reside directamente en ai.fileSearchStores
    const response = await (ai.fileSearchStores as any).listFileSearchStoreFiles({
      fileSearchStoreName: storeName
    });

    // Google devuelve un objeto con la propiedad fileSearchStoreFiles
    return NextResponse.json({ 
      files: response.fileSearchStoreFiles || [] 
    });
  } catch (e: any) {
    console.error("Error en GET /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json(); 
    if (!fileName) return NextResponse.json({ error: "fileName es requerido" }, { status: 400 });

    // MÉTODO CORRECTO: deleteFileSearchStoreFile (en singular)
    await (ai.fileSearchStores as any).deleteFileSearchStoreFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error en DELETE /api/admin/files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}