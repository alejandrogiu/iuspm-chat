// app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown"; 
import Image from "next/image";

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hola 👋 Soy el asistente del **Instituto Universitario de Seguridad**. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setLoading(true);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error en la conexión");

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: (data?.answer ?? "").trim() || "No tengo respuesta." },
      ]);
    } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado";
    setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex items-center justify-center p-4 md:p-6 text-slate-200">
      
      {/* Contenedor Principal */}
      <div className="w-full max-w-4xl h-[90vh] flex flex-col bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-slate-700">
              <Image
                src="/iuspm-logo.png"
                alt="IUSPM"
                fill
                sizes="40px"
                className="object-contain p-1"
                priority
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white leading-none">IUSPM Chat</h1>
              <p className="text-xs text-slate-400 mt-1">Asistente Institucional Inteligente</p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([messages[0]])}
            className="text-xs font-medium px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            Limpiar chat
          </button>
        </header>

        {/* Área de Chat */}
        <section className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800/80 border border-slate-700 text-slate-100 rounded-tl-none"
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold opacity-50 mb-1">
                  {m.role === "user" ? "Tú" : "IA Asistente"}
                </div>
                <div className="text-sm md:text-base leading-relaxed prose prose-invert max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-3 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-auto max-w-md bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-center text-sm">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </section>

        {/* Input Form */}
        <footer className="p-4 md:p-6 bg-slate-900/60 border-t border-slate-800">
          <form onSubmit={sendMessage} className="relative max-w-3xl mx-auto">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              disabled={loading}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 pl-4 pr-14 py-4 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:bg-slate-800 disabled:text-slate-500 group"
            >
              <ArrowIcon />
            </button>
          </form>
          <p className="text-center text-[10px] text-slate-500 mt-3 uppercase tracking-widest">
            Instituto Universitario de Seguridad de la Provincia de Misiones • Argentina • Consulta Digital
          </p>
        </footer>
      </div>
    </main>
  );
}

// Icono simple para el botón
function ArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
    </svg>
  );
}