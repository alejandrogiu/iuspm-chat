import { NextResponse } from "next/server";
import { client } from "../../../../lib/gemini";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const api = (client as any).fileSearchStores;

    console.log("Generando nuevo File Search Store...");

    // Creamos un store con un nombre único basado en la fecha para evitar colisiones
    const timestamp = new Date().getTime();
    const response = await api.create({
      fileSearchStore: { 
        displayName: `IUSPM Store ${timestamp}` 
      },
      // Dejamos que el sistema genere el ID único automáticamente
    });

    return NextResponse.json({
      success: true,
      message: "¡Nuevo Store creado con éxito!",
      nuevo_ID_para_Vercel: response.name,
      instrucciones: [
        "1. Copia el valor de 'nuevo_ID_para_Vercel'",
        "2. Ve a Settings -> Environment Variables en Vercel",
        "3. Actualiza FILE_SEARCH_STORE con este nuevo valor",
        "4. Haz un REDEPLOY para que el chat use el nuevo índice vacío"
      ]
    });
  } catch (e: any) {
    console.error("Error creando el Store:", e);
    return NextResponse.json({ 
      error: "No se pudo crear el Store", 
      details: e.message 
    }, { status: 500 });
  }
}