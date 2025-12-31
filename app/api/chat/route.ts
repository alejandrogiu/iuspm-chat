import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Soporta:
    // { message: "hola" }
    // o
    // { messages: [{ role: "user", content: "hola" }] }

    let userMessage: string | undefined;

    if (typeof body.message === "string") {
      userMessage = body.message;
    } else if (Array.isArray(body.messages)) {
      const lastUser = body.messages.findLast(
        (m: any) => m.role === "user"
      );
      userMessage = lastUser?.content;
    }

    if (!userMessage) {
      return NextResponse.json(
        { error: "Falta el mensaje" },
        { status: 400 }
      );
    }

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Sos un asistente institucional del Instituto Universitario de Seguridad Pública.
Respondé únicamente usando la información contenida en los documentos proporcionados.
Si la información no está disponible, decilo claramente.

Pregunta:
${userMessage}
              `,
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      answer: response.text,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error procesando la consulta" },
      { status: 500 }
    );
  }
}
