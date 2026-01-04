import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini"; 

export const runtime = "nodejs";

export async function GET() {
  try {
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta FILE_SEARCH_STORE" }, { status: 500 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;
    const response = await api.documents.list({ parent: storeName });
    const files = response.pageInternal || [];
    return NextResponse.json({ files });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { fileName } = await req.json();
    const storeName = process.env.FILE_SEARCH_STORE;
    if (!storeName) return NextResponse.json({ error: "Falta STORE ID" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;

    console.log("Intentando limpieza profunda del Store...");

    // 1. Listamos TODOS los documentos del store para borrarlos uno por uno
    const listResponse = await api.documents.list({ parent: storeName });
    const docs = listResponse.pageInternal || [];

    for (const doc of docs) {
      try {
        console.log("Borrando documento:", doc.name);
        await api.documents.delete({ name: doc.name });
      } catch (innerErr) {
        console.warn("No se pudo borrar un documento individual, puede que ya no exista.");
      }
    }

    // 2. Ahora que intentamos vaciarlo, probamos borrar el Store completo
    try {
      await api.delete({ name: storeName });
      console.log("Store eliminado con éxito.");
    } catch (e) {
      console.error("Todavía no se puede borrar el Store principal:", e);
    }

    // 3. Recreamos el Store (vacio y limpio) para que tu ID siga siendo válido
    const shortId = storeName.split('/').pop();
    await api.create({
      fileSearchStore: { displayName: "IUSPM Main Store" },
      fileSearchStoreId: shortId
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Se ejecutó la limpieza. La lista debería aparecer vacía ahora." 
    });

  } catch (e: any) {
    console.error("Error en DELETE:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}