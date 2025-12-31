import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const STORE_NAME = "fileSearchStores/iuspmteststore-ntk4jf8lwt3q";

async function query(question) {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: question,
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

  console.log("\n🧠 Respuesta:\n");
  console.log(response.text);
}

const pregunta =
  process.argv.slice(2).join(" ") ||
  "¿Qué carreras o propuestas académicas ofrece el IUSPM?";

query(pregunta).catch(console.error);
