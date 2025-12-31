import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Falta GEMINI_API_KEY en variables de entorno");
}

const client = new GoogleGenAI({ apiKey });

// 👉 poné acá el store que ya estás usando
const FILE_SEARCH_STORE = "fileSearchStores/iuspmteststore-ntk4jf8lwt3q";

export async function askGemini(message: string) {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: message,
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [FILE_SEARCH_STORE],
          },
        },
      ],
    },
  });

  return response.text ?? "";
}
