"use client";

import { useState, useEffect } from "react";

interface GeminiFile {
  name: string;         // ID interno completo: fileSearchStores/.../documents/...
  displayName: string;  // Nombre legible: informe-coneau.pdf
  createTime: string;   // ISO String de creación
}

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [files, setFiles] = useState<GeminiFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // Para el botón de borrar

  // Función para obtener la lista
  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/files");
      const data = await res.json();
      // Basado en el log de Vercel, el API Route ahora envía data.files correctamente
      setFiles(data.files || []);
    } catch (e) {
      console.error("Error cargando archivos", e);
      setStatus("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchFiles(); 
  }, []);

  async function onUpload() {
    if (!file) return;
    setStatus("Subiendo e indexando...");
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        setStatus("¡Archivo indexado con éxito!");
        setFile(null);
        // Limpiar el input file físicamente
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        
        fetchFiles(); // Refrescar lista
      } else {
        const errorData = await res.json();
        setStatus(`Error: ${errorData.error || "No se pudo subir"}`);
      }
    } catch (error) {
      setStatus("Error de red al intentar subir.");
    }
  }

  async function onDelete(fileName: string) {
    if (!confirm("¿Seguro que querés eliminar este documento del índice?")) return;
    
    setActionLoading(fileName);
    try {
      const res = await fetch("/api/admin/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName }),
      });

      if (res.ok) {
        fetchFiles(); // Refrescar lista
      } else {
        const errorData = await res.json();
        alert(`No se pudo eliminar: ${errorData.error}`);
      }
    } catch (error) {
      alert("Error de conexión al intentar eliminar.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 900, margin: 'auto' }}>
      <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>Panel de Control IUSPM</h1>
      
      {/* SECCIÓN SUBIDA */}
      <section style={{ marginBottom: 40, padding: 25, backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Subir nuevo documento</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.doc,.docx,.txt"
          />
          <button 
            onClick={onUpload} 
            disabled={!file || status === "Subiendo e indexando..."} 
            style={{ 
              padding: '10px 20px', 
              backgroundColor: !file ? '#ccc' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: !file ? 'not-allowed' : 'pointer'
            }}
          >
            Subir e Indexar
          </button>
        </div>
        <p style={{ fontSize: 14, marginTop: 15, fontWeight: 'bold', color: status.includes("Error") ? "red" : "#0070f3" }}>
          {status}
        </p>
      </section>

      {/* SECCIÓN TABLA */}
      <section>
        <h3>Documentos Indexados en Gemini</h3>
        {loading ? (
          <p>Cargando archivos desde el store...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={{ padding: '12px' }}>Nombre del Documento</th>
                  <th style={{ padding: '12px' }}>Fecha de Carga</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.length > 0 ? (
                  files.map((f) => (
                    <tr key={f.name} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>
                        <strong>{f.displayName}</strong>
                        <br />
                        <span style={{ fontSize: '10px', color: '#999' }}>ID: {f.name.split('/').pop()}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {new Date(f.createTime).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => onDelete(f.name)}
                          disabled={actionLoading === f.name}
                          style={{ 
                            color: actionLoading === f.name ? '#999' : 'red', 
                            cursor: actionLoading === f.name ? 'not-allowed' : 'pointer', 
                            background: 'none', 
                            border: '1px solid red',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          {actionLoading === f.name ? "Eliminando..." : "Eliminar"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      No se encontraron archivos en el store.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}