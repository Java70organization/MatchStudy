"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Search } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UIUser = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  urlFoto: string | null;
};

export default function MensajesPage() {
  // Formulario
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [asunto, setAsunto] = useState("");
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sidebar usuarios
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [uerr, setUerr] = useState<string | null>(null);
  const [qs, setQs] = useState("");
  const [selfEmail, setSelfEmail] = useState<string | null>(null);
  const [selfFirst, setSelfFirst] = useState<string>("");
  const [selfLast, setSelfLast] = useState<string>("");
  const [selected, setSelected] = useState<UIUser | null>(null);

  // Cargar usuario actual (para excluirlo del listado)
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const em = data.user?.email ?? null;
      setSelfEmail(em);
      if (em) {
        try {
          const profile = await (await import("@/lib/supabase/user")).checkUserProfile(em);
          if (profile) {
            setSelfFirst(profile.nombres || "");
            setSelfLast(profile.apellidos || "");
          }
        } catch {}
      }
    })();
  }, []);

  // Cargar usuarios registrados (tabla usuarios) con credenciales para RLS
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setUerr(null);
        const res = await fetch("/api/users", {
          cache: "no-store",
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error cargando usuarios");
        const base = (json.data || []) as UIUser[];
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
        const normalized = base.map((u) => {
          let foto = u.urlFoto;
          if (foto && !/^https?:\/\//i.test(foto)) {
            foto = `${supabaseUrl}/storage/v1/object/public/Profile/${foto}`;
          }
          return { ...u, urlFoto: foto };
        });
        setUsers(normalized);
      } catch (e) {
        setUerr(e instanceof Error ? e.message : "Error cargando usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  // Filtrado: oculta al usuario actual y busca por nombre/apellido/email
  const filtered = useMemo(() => {
    const se = (selfEmail ?? "").toLowerCase();
    const base = users.filter((u) => (u.email ?? "").toLowerCase() !== se);
    const t = qs.trim().toLowerCase();
    if (!t) return base;
    return base.filter(
      (u) =>
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(t) ||
        (u.email ?? "").toLowerCase().includes(t)
    );
  }, [users, qs, selfEmail]);

  const displayNameOf = (u: UIUser) =>
    `${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim();

  const onSelect = (u: UIUser) => {
    setSelected(u);
    if (u.email) setEmail(u.email);
  };

  const isValidEmail = (v: string) => /.+@.+\..+/.test(v);

  const onEnviar = async () => {
    setOk(null);
    setError(null);
    if (!isValidEmail(email)) {
      setError("Correo inválido");
      return;
    }
    if (!mensaje.trim()) {
      setError("El mensaje es requerido");
      return;
    }
    try {
      setSending(true);
      const res = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: email,
          message: mensaje,
          subject: asunto.trim() || 'Mensaje desde Mensajes',
          fromEmail: selfEmail,
          fromFirstName: selfFirst,
          fromLastName: selfLast,
        })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || 'No se pudo enviar');
      setOk('Mensaje enviado correctamente.');
      setMensaje('');
      setAsunto('');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error enviando");
    } finally {
      setSending(false);
    }
  };

  const onLimpiar = () => {
    setEmail("");
    setMensaje("");
    setAsunto("");
    setOk(null);
    setError(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Mensajes
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Panel izquierdo: usuarios */}
        <aside className="md:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
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
            {!loadingUsers &&
              !uerr &&
              filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSelect(u)}
                  className={`w-full flex items-center gap-3 py-3 hover:bg-slate-800/60 px-2 rounded-lg text-left ${
                    selected?.id === u.id ? "bg-slate-800/80" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {displayNameOf(u)}
                    </div>
                    <div className="text-slate-500 text-[11px] truncate">
                      {u.email}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </aside>

        {/* Formulario derecho */}
        <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          {/* Encabezado dentro del panel */}
          <div className="border-b border-slate-800 pb-3 mb-3 min-h-[44px] flex items-center">
            {selected ? (
              <div>
                <div className="text-xs text-slate-400">Enviando correo a</div>
                <div className="text-white font-semibold">
                  {displayNameOf(selected) || selected.email}
                </div>
                <div className="text-slate-400 text-xs">{selected.email}</div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">
                Selecciona un usuario para rellenar el correo
              </div>
            )}
          </div>

          <h2 className="text-slate-200 font-semibold mb-3">Enviar mensaje</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Asunto</label>
              <input
                type="text"
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Asunto del mensaje"
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Correo a enviar
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@destino.com"
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Mensaje
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                rows={5}
                className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {ok && <p className="text-sm text-green-400">{ok}</p>}
            <div className="flex gap-2">
              <button
                onClick={onEnviar}
                disabled={sending}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white disabled:opacity-60 hover:bg-purple-700"
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={onLimpiar}
                className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}