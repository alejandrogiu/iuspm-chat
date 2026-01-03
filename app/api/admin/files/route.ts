import { NextResponse } from "next/server";
import { client } from "@/gemini"; // Importamos el cliente que exportamos arriba

export const runtime = "nodejs";

function resolveStoreName() {
  const store = process.env.FILE_SEARCH_STORE || "fileSearchStores/iuspmteststore-ntk4jf8lwt3q";
  return store;
}

export async function GET() {
  try {
    const storeName = resolveStoreName();
    
    // Acceso directo bypasseando el tipado estricto que está fallando
    const storesApi = (client as any).fileSearchStores;
    const response = await storesApi.listFileSearchStoreFiles({
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
    if (!fileName) return NextResponse.json({ error: "Falta fileName" }, { status: 400 });

    const storesApi = (client as any).fileSearchStores;
    await storesApi.deleteFileSearchStoreFile({
      fileSearchStoreFileName: fileName
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}