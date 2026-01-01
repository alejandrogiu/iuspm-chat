"use client";

import { useState } from "react";

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  async function onUpload() {
    if (!file) return;

    setStatus("Subiendo e indexando...");

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus(`Error: ${data?.error || "falló la subida"}`);
      return;
    }

    setStatus(`OK: ${data?.displayName || "archivo"} (indexado)`);
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Admin · IUSPM File Store</h1>
      <p>Subí un archivo para agregarlo al store e indexarlo.</p>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={onUpload}
        disabled={!file}
        style={{ marginLeft: 12, padding: "8px 12px" }}
      >
        Subir
      </button>

      <div style={{ marginTop: 16 }}>{status}</div>
    </main>
  );
}
