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
    const { fileName } = await req.json(); // Aunque no lo usemos para el borrado individual, lo recibimos
    const storeName = process.env.FILE_SEARCH_STORE;

    if (!storeName) return NextResponse.json({ error: "No hay store configurado" }, { status: 500 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;

    console.log("Iniciando purga total del Store para eliminar:", fileName);

    /**
     * LÓGICA DE RESET:
     * 1. Borramos el contenedor completo (esto elimina todos los documentos y chunks)
     * 2. Lo creamos de nuevo con el mismo nombre
     */
    
    // Paso 1: Borrado físico del Store
    await api.delete({ name: storeName });

    // Paso 2: Recreación (esto lo deja vacío y listo para nuevas subidas)
    // El ID debe ser el original sin el prefijo 'fileSearchStores/'
    const shortId = storeName.split('/').pop();
    await api.create({
      fileSearchStore: { displayName: "IUSPM Main Store" },
      fileSearchStoreId: shortId
    });

    return NextResponse.json({ 
      ok: true, 
      message: "Store reseteado. Todos los documentos han sido eliminados del índice." 
    });
  } catch (e: any) {
    console.error("Error en purga de Store:", e);
    return NextResponse.json({ 
      error: "No se pudo resetear el Store. Posiblemente está en proceso de indexación.",
      technical: e.message 
    }, { status: 500 });
  }
}