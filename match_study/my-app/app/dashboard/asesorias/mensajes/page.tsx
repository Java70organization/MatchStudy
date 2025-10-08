"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Search, SendHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UIUser = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  urlFoto: string | null;
};

type UIMessage = {
  id: string | number;
  senderId: string; // "self" para el usuario actual en este mock
  body: string;
  createdAt: string; // ISO
};


export default function MensajesPage() {
  // Usuario actual (para alinear mensajes y filtrar en sidebar)
  const [selfId, setSelfId] = useState<string | null>(null);
  const [selfEmail, setSelfEmail] = useState<string | null>(null);

  // Usuarios del sidebar
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [uerr, setUerr] = useState<string | null>(null);
  const [qs, setQs] = useState("");

  // Conversación seleccionada
  const [selected, setSelected] = useState<UIUser | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Cargar usuario actual
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setSelfId(data.user?.id ?? null);
      setSelfEmail(data.user?.email ?? null);
    })();
  }, []);

  // Cargar usuarios registrados (tabla usuarios)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setUerr(null);
        const res = await fetch("/api/users", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error cargando usuarios");
        setUsers((json.data || []) as UIUser[]);
      } catch (e) {
        setUerr(e instanceof Error ? e.message : "Error cargando usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Búsqueda en sidebar
  const filtered = useMemo(() => {
    const se = (selfEmail ?? "").toLowerCase();
    const base = users.filter((u) => (u.email ?? "").toLowerCase() !== se);
    const t = qs.trim().toLowerCase();
    if (!t) return base;
    return base.filter((u) =>
      `${u.nombres} ${u.apellidos}`.toLowerCase().includes(t) ||
      (u.email ?? "").toLowerCase().includes(t)
    );
  }, [users, qs, selfEmail]);

  // Auto-scroll al final cuando cambian mensajes
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, selected]);

  // Seleccionar usuario: confirmar y crear/obtener conversación
  const onSelect = async (u: UIUser) => {
    setSelected(u);
    setMessages([]);
    // Confirmación antes de crear/conectar conversación
    const ok = window.confirm(`¿Quieres iniciar una conversación con ${u.nombres} ${u.apellidos}?`);
    if (!ok) return;
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: u.id }),
      });
      const json = await res.json();
      if (res.ok) {
        const convId = json.data?.id as string | undefined;
        setConversationId(convId ?? null);
      } else {
        setConversationId(null);
      }
    } catch {
      setConversationId(null);
    }
  };

  // Enviar mensaje (mock local). TODO: persistir en /api/messages
  const onSend = async () => {
    if (!selected || !body.trim()) return;
    try {
      setSending(true);
      const now = new Date().toISOString();
      setMessages((prev) => [
        ...prev,
        { id: now, senderId: selfId || "self", body: body.trim(), createdAt: now },
      ]);
      setBody("");
      // FUTURO: await fetch('/api/messages', { method: 'POST', body: JSON.stringify({ conversationId, body }) })
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Título */}
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mensajes
        </h1>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[70vh]">
        {/* Sidebar de usuarios */}
        <aside className="md:col-span-4 lg:col-span-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={qs}
              onChange={(e) => setQs(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-3 py-2 bg-slate-800/60 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="divide-y divide-slate-800">
            {loadingUsers && <p className="text-slate-400 py-2">Cargando...</p>}
            {uerr && <p className="text-red-400 py-2">{uerr}</p>}
            {!loadingUsers && !uerr && filtered.length === 0 && (
              <p className="text-slate-400 py-2">Sin usuarios</p>
            )}
            {!loadingUsers && !uerr && filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => onSelect(u)}
                className={`w-full flex items-center gap-3 py-3 hover:bg-slate-800/60 px-2 rounded-lg text-left ${
                  selected?.id === u.id ? "bg-slate-800/80" : ""
                }`}
              >
                {u.urlFoto ? (
                  <img
                    src={u.urlFoto}
                    alt={u.nombres}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    onError={(e) => ((e.currentTarget.style.display = "none"))}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    {(u.nombres || u.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{u.nombres} {u.apellidos}</div>
                  <div className="text-slate-400 text-xs truncate">{u.email}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Panel de conversación */}
        <main className="md:col-span-8 lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col">
          {/* Encabezado de la conversación */}
          <div className="border-b border-slate-800 pb-3 mb-3 min-h-[44px] flex items-center gap-3">
            {selected ? (
              <>
                {selected.urlFoto ? (
                  <img
                    src={selected.urlFoto}
                    alt={selected.nombres}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    {(selected.nombres || selected.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-white font-semibold">{selected.nombres} {selected.apellidos}</div>
                  <div className="text-slate-400 text-xs">{selected.email}</div>
                </div>
              </>
            ) : (
              <div className="text-slate-400">Selecciona un usuario para chatear</div>
            )}
          </div>

          {/* Lista de mensajes */}
          <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
            {selected && messages.length === 0 && (
              <p className="text-slate-400">Aún no hay mensajes. ¡Escribe el primero!</p>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                m.senderId === selfId ? "ml-auto bg-purple-600 text-white" : "bg-slate-800 text-slate-200"
              }`}>
                <div className="whitespace-pre-wrap">{m.body}</div>
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="pt-3 mt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={selected ? "Escribe un mensaje..." : "Selecciona un usuario"}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={!selected}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
              <button
                onClick={onSend}
                disabled={!selected || !body.trim() || sending}
                className="flex items-center gap-2 bg-purple-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                title="Enviar"
              >
                <SendHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}
