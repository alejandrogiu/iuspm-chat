import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type Role = "user" | "assistant" | "system";

interface ChatMessage {
  role: Role;
  content: string;
}

interface RequestBody {
  message?: string;
  messages?: ChatMessage[];
}

function extractUserMessage(body: RequestBody): string | null {
  if (typeof body.message === "string" && body.message.trim()) {
    return body.message.trim();
  }

  if (Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i--) {
      const m = body.messages[i];
      if (m.role === "user" && typeof m.content === "string" && m.content.trim()) {
        return m.content.trim();
      }
    }
  }

  return null;
}

function buildHistory(messages?: ChatMessage[]) {
  if (!messages?.length) return [];

  return messages
    .filter(m => m.role !== "system" && m.content?.trim())
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const userMessage = extractUserMessage(body);
    if (!userMessage) {
      return NextResponse.json({ error: "Falta el mensaje" }, { status: 400 });
    }

    const systemPrompt = [
      "Sos un asistente institucional del Instituto Universitario de Seguridad Pública.",
      "Respondé únicamente usando la información contenida en los documentos proporcionados.",
      "Si la información no está disponible, decilo claramente.",
    ].join("\n");

    const history = buildHistory(body.messages);

    const store =
      process.env.FILE_SEARCH_STORE ||
      (process.env.GEMINI_FILE_STORE
        ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}`
        : undefined);

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        ...history,
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nPregunta:\n${userMessage}`,
            },
          ],
        },
      ],
      ...(store && {
        config: {
          tools: [
            {
              fileSearch: {
                fileSearchStoreNames: [store],
              },
            },
          ],
        },
      }),
    });

    return NextResponse.json({
      answer: response.text ?? "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Error procesando la consulta" },
      { status: 500 }
    );
  }
}
