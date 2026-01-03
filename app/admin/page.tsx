"use client";

import { useState, useEffect } from "react";

interface GeminiFile {
  name: string;         // ID interno de Google
  displayName: string;  // Nombre que vos ves
  createTime: string;
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [files, setFiles] = useState<GeminiFile[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para obtener la lista
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (e) {
      console.error("Error cargando archivos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  async function onUpload() {
    if (!file) return;
    setStatus("Subiendo e indexando...");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      setStatus("¡Archivo indexado con éxito!");
      setFile(null);
      fetchFiles(); // Refrescar lista
    } else {
      setStatus("Error en la subida");
    }
  }

  async function onDelete(fileName: string) {
    if (!confirm("¿Seguro que querés eliminar este documento del índice?")) return;
    
    const res = await fetch("/api/admin/files", {
      method: "DELETE",
      body: JSON.stringify({ fileName }),
    });

    if (res.ok) {
      fetchFiles(); // Refrescar lista
    } else {
      alert("No se pudo eliminar");
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 800, margin: 'auto' }}>
      <h1>Panel de Control IUSPM</h1>
      
      <section style={{ marginBottom: 40, padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
        <h3>Subir nuevo documento</h3>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={onUpload} disabled={!file} style={{ padding: '8px 16px', marginLeft: 10 }}>
          Subir e Indexar
        </button>
        <p style={{ fontSize: 12, color: '#666' }}>{status}</p>
      </section>

      <section>
        <h3>Documentos Indexados en Gemini</h3>
        {loading ? <p>Cargando lista...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th align="left">Nombre</th>
                <th align="left">Fecha</th>
                <th align="right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.name} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px 0' }}>{f.displayName}</td>
                  <td>{new Date(f.createTime).toLocaleDateString()}</td>
                  <td align="right">
                    <button 
                      onClick={() => onDelete(f.name)}
                      style={{ color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {files.length === 0 && !loading && <p>No hay archivos en el store.</p>}
      </section>
    </main>
  );
}