import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const runtime = "nodejs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function resolveStoreName() {
  const store =
    process.env.FILE_SEARCH_STORE ||
    (process.env.GEMINI_FILE_STORE
      ? `fileSearchStores/${process.env.GEMINI_FILE_STORE}`
      : undefined);

  if (!store) throw new Error("Falta FILE_SEARCH_STORE o GEMINI_FILE_STORE");
  return store;
}

type OperationLike = {
  name?: string;
  done?: boolean;
};

async function waitOpDone(operation: OperationLike) {
  let op = operation;

  while (!op.done) {
    await new Promise((r) => setTimeout(r, 1000));
    op = await ai.operations.get({ operation: op });
  }

  return op;
}


export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta archivo" }, { status: 400 });
    }

    // Guardar en /tmp para poder pasar un path al SDK
    const bytes = Buffer.from(await file.arrayBuffer());
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "iuspm-"));
    const tmpPath = path.join(tmpDir, file.name);
    await fs.writeFile(tmpPath, bytes);

    const storeName = resolveStoreName();

    // Sube + indexa al store
    let op = await ai.fileSearchStores.uploadToFileSearchStore({
      file: tmpPath,
      fileSearchStoreName: storeName,
      config: {
        displayName: file.name,
      },
    });

    op = await waitOpDone(op);

    return NextResponse.json({
      ok: true,
      displayName: file.name,
      operationDone: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
