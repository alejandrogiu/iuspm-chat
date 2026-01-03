import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function resolveStoreName() {
  const store = process.env.FILE_SEARCH_STORE || 
               (process.env.GEMINI_FILE_STORE ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}` : undefined);
  if (!store) throw new Error("Falta FILE_SEARCH_STORE");
  return store;
}

// GET: Listar todos los archivos del Store
export async function GET() {
  try {
    const storeName = resolveStoreName();
    // Accedemos al listado de archivos dentro del store específico
    const response = await ai.fileSearchStores.listFiles({
      fileSearchStoreName: storeName
    });

    return NextResponse.json({ files: response.files || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE: Eliminar un archivo del Store por su nombre de recurso
export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json(); // El nombre viene como "fileSearchStores/.../files/..."
    if (!fileName) return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 });

    await ai.fileSearchStores.deleteFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}