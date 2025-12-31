import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const STORE_NAME = process.env.FILE_SEARCH_STORE!;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      systemInstruction: `
Sos un asistente institucional del Instituto Universitario de Seguridad Pública.
Respondé únicamente usando la información contenida en los documentos proporcionados.
Si la información no está disponible, decilo claramente.
Usá un tono claro, formal y orientado a futuros estudiantes.
`,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [STORE_NAME],
            },
          },
        ],
      },
    });

    return NextResponse.json({
      answer: response.text,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error procesando la consulta" },
      { status: 500 }
    );
  }
}
