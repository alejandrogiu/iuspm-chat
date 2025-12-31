import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const DOCS_DIR = "docs";

async function main() {
  const store = await client.fileSearchStores.create({
  config: { displayName: "iuspm-test-store" },
});

if (!store.name) {
  throw new Error("No se pudo crear el File Search Store");
}

const storeName = store.name;

  console.log("Store:", storeName);

  const files = fs.readdirSync(DOCS_DIR);

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);

    if (!fs.statSync(filePath).isFile()) continue;

    console.log("Subiendo:", file);

    let operation = await client.fileSearchStores.uploadToFileSearchStore({
      file: filePath,
      fileSearchStoreName: storeName,
      config: {
        displayName: file,
      },
    });

    while (!operation.done) {
      await new Promise(r => setTimeout(r, 2000));
      operation = await client.operations.get({ operation });
    }

    console.log("✔ Indexado:", file);
  }

  console.log("✅ Todos los documentos fueron indexados.");
}

main().catch(console.error);
