import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const filePath = "docs/MAESTRÍA EN SEGURIDAD - Brochure.pdf"

async function main() {
  const store = await client.fileSearchStores.create({
    config: { displayName: "iuspm-test-store" },
  });

  const storeName = store.name!;
  console.log("Store:", storeName);

  const operation = await client.fileSearchStores.uploadToFileSearchStore({
    file: filePath,
    fileSearchStoreName: storeName,
    config: {
      displayName: "Brochure-Maestría",
    },
  });

  // ✅ LOOP CORRECTO
  let current = operation;

  while (!current.done) {
    await new Promise(r => setTimeout(r, 2000));
    current = await client.operations.get({ operation: current });
  }

  console.log("Indexación terminada");

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "¿qué asignaturas hay con menos de 40 horas?",
    config: {
      tools: [
        {
          fileSearch: {
            fileSearchStoreNames: [storeName],
          },
        },
      ],
    },
  });

  console.log("\nRespuesta:\n", response.text);
}

main().catch(console.error);
