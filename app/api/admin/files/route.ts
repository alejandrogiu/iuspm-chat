import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function resolveStoreName() {
  const store = process.env.FILE_SEARCH_STORE || 
               (process.env.GEMINI_FILE_STORE ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}` : undefined);
  if (!store) throw new Error("Falta FILE_SEARCH_STORE");
  return store;
}

// GET: Listar archivos
export async function GET() {
  try {
    const storeName = resolveStoreName();
    
    // CAMBIO: El método correcto es listFileSearchStoreFiles
    const response = await ai.fileSearchStores.listFileSearchStoreFiles({
      fileSearchStoreName: storeName
    });

    // La respuesta suele venir en 'fileSearchStoreFiles'
    return NextResponse.json({ files: response.fileSearchStoreFiles || [] });
  } catch (e: any) {
    console.error("Error en GET files:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Eliminar un archivo
export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json(); 
    if (!fileName) return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 });

    // CAMBIO: El método correcto es deleteFileSearchStoreFile
    await ai.fileSearchStores.deleteFileSearchStoreFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Error en DELETE file:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}