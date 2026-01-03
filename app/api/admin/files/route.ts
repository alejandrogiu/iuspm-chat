import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function resolveStoreName() {
  const store = process.env.FILE_SEARCH_STORE || 
               (process.env.GEMINI_FILE_STORE ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}` : undefined);
  if (!store) throw new Error("Falta FILE_SEARCH_STORE");
  return store;
}

export async function GET() {
  try {
    const storeName = resolveStoreName();
    
    // El método correcto en la v1.34.0 es list dentro de fileSearchStoreFiles
    const response = await ai.fileSearchStores.fileSearchStoreFiles.list({
      fileSearchStoreName: storeName
    });

    return NextResponse.json({ files: response.fileSearchStoreFiles || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json(); 
    if (!fileName) return NextResponse.json({ error: "Nombre de archivo requerido" }, { status: 400 });

    // El método correcto para borrar es delete dentro de fileSearchStoreFiles
    await ai.fileSearchStores.fileSearchStoreFiles.delete({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}