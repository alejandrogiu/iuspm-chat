import "dotenv/config";
import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";


const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const DOCS_DIR = "./docs";

async function main() {
  // 1. Crear el store (solo una vez)
  const store = await client.fileSearchStores.create({
    config: { displayName: "iuspm-test-store" },
  });

  const storeName = store.name;
  console.log("Store creado:", storeName);

  // 2. Leer todos los archivos de la carpeta
  const files = fs.readdirSync(DOCS_DIR);

  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);

    if (!fs.statSync(filePath).isFile()) continue;

    console.log("Subiendo:", file);

    const operation = await client.fileSearchStores.uploadToFileSearchStore({
      file: filePath,
      fileSearchStoreName: storeName,
      config: {
        displayName: file,
      },
    });

    // esperar indexación
    let current = operation;
    while (!current.done) {
      await new Promise(r => setTimeout(r, 2000));
      current = await client.operations.get({ operation: current });
    }

    console.log("✔ Indexado:", file);
  }

  console.log("\n✅ Todos los documentos fueron indexados.");
}

main().catch(console.error);
