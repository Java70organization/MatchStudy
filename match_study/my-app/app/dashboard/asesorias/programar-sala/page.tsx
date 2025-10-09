"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Video } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type UIUser = {
  id: string;
  nombres: string;
  apellidos: string;
  email: string | null;
  urlFoto: string | null;
};

export default function ProgramarSalaPage() {
  // Formulario sala
  const [titulo, setTitulo] = useState("");
  const [fechaHora, setFechaHora] = useState("");
  const [resultado, setResultado] = useState<{
    url: string;
    code: string;
  } | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [asesor, setAsesor] = useState("");
  const [estudiante, setEstudiante] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sidebar usuarios (para seleccionar estudiante)
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersErr, setUsersErr] = useState<string | null>(null);
  const [qs, setQs] = useState("");
  const [selected, setSelected] = useState<UIUser | null>(null);
  const [selfEmail, setSelfEmail] = useState<string | null>(null);

  const mirotalkP2P = "https://p2p.mirotalk.com";

  const code = useMemo(() => genCode(8), []);

  function genCode(len = 8) {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let out = "";
    const rnd =
      typeof globalThis !== "undefined" &&
      globalThis.crypto &&
      globalThis.crypto.getRandomValues
        ? (n: number) => {
            const arr = new Uint32Array(n);
            globalThis.crypto.getRandomValues(arr);
            return Array.from(arr);
          }
        : (n: number) =>
            Array.from({ length: n }, () =>
              Math.floor(Math.random() * 0xffffffff)
            );
    const r = rnd(len);
    for (let i = 0; i < len; i++) out += chars[r[i] % chars.length];
    return out;
  }

  // Usuario actual: email para autollenar asesor y excluir en listado
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const em = data.user?.email ?? null;
        setSelfEmail(em);
        if (em) {
          setAsesor((prev) => prev || em);
        }
      } catch {
        // noop
      }
    })();
  }, []);

  // Carga de usuarios desde API (tabla usuarios)
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingUsers(true);
        setUsersErr(null);
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
        setUsersErr(e instanceof Error ? e.message : "Error cargando usuarios");
      } finally {
        setLoadingUsers(false);
      }
    };
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const t = qs.trim().toLowerCase();
    const se = (selfEmail ?? "").toLowerCase();
    const base = users.filter((u) => (u.email ?? "").toLowerCase() !== se);
    if (!t) return base;
    return base.filter(
      (u) =>
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(t) ||
        (u.email ?? "").toLowerCase().includes(t)
    );
  }, [users, qs, selfEmail]);

  const displayNameOf = (u: UIUser) =>
    `${u.nombres ?? ""} ${u.apellidos ?? ""}`.trim();

  const onSelectUser = (u: UIUser) => {
    setSelected(u);
    setEstudiante(u.email || displayNameOf(u));
  };

  const onProgramar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const codigoSala = code;
      const url = `${mirotalkP2P}/room/${codigoSala}`;

      // Insertar en la tabla salas (campos: id, hora, codigoSala, titulo, asesor, estudiante, fecha)
      const hora = new Date().toISOString();
      const fecha = fechaHora || null;
      const payload: {
        hora: string;
        codigoSala: string;
        titulo: string | null;
        asesor: string | null;
        estudiante: string | null;
        fecha: string | null;
      } = {
        hora,
        codigoSala,
        titulo: titulo || null,
        asesor: asesor || null,
        estudiante: estudiante || null,
        fecha,
      };

      const { error: insErr } = await supabase.from("salas").insert(payload);
      if (insErr) {
        throw new Error(insErr.message);
      }

      // Enviar correos de notificación
      try {
        const when = fecha
          ? new Date(fecha).toLocaleString()
          : new Date().toLocaleString();
        const subject = `Sesión programada: ${titulo || codigoSala}`;
        const message = `Se ha programado una nueva sala de asesoría.\n\nTítulo: ${
          titulo || "(sin título)"
        }\nFecha/Hora: ${when}\n\nIngresa a MatchStudy para ver los detalles de la sesión.`;
        const sendTo = async (to?: string | null) => {
          if (!to) return;
          await fetch("/api/messages/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              to,
              subject,
              message,
              fromName: "MatchStudy",
            }),
          });
        };
        await Promise.all([sendTo(asesor || selfEmail), sendTo(estudiante)]);
      } catch (mailErr) {
        console.warn(
          "No se pudo enviar alguna notificación de correo",
          mailErr
        );
      }

      setResultado({ url, code: codigoSala });
      setOkMsg("Se envió la notificación por correo a los participantes.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al programar");
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Programar sesiones
          </h1>
        </div>
        <p className="text-slate-400">
          Crea un enlace de videollamada y compártelo.
        </p>
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
            {usersErr && <p className="text-red-400 py-2">{usersErr}</p>}
            {!loadingUsers && !usersErr && filteredUsers.length === 0 && (
              <p className="text-slate-400 py-2">Sin usuarios</p>
            )}
            {!loadingUsers &&
              !usersErr &&
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => onSelectUser(u)}
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
        <div className="md:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 mb-3 min-h-[44px] flex items-center">
            {selected ? (
              <div>
                <div className="text-xs text-slate-400">
                  Estudiante seleccionado
                </div>
                <div className="text-white font-semibold">
                  {displayNameOf(selected)}
                </div>
                <div className="text-slate-400 text-xs">{selected.email}</div>
              </div>
            ) : (
              <div className="text-slate-400 text-sm">
                Selecciona un usuario para rellenar el estudiante
              </div>
            )}
          </div>

          <form onSubmit={onProgramar} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Tutoría de Matemáticas"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Asesor
                </label>
                <input
                  type="text"
                  value={asesor}
                  readOnly
                  placeholder="Se autocompleta con tu correo"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  Estudiante
                </label>
                <input
                  type="text"
                  value={estudiante}
                  readOnly
                  placeholder="Selecciona desde la izquierda"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/70 border border-slate-700/70 text-white placeholder-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                Generar enlace
              </button>
              <button
                type="reset"
                onClick={() => {
                  setTitulo("");
                  setFechaHora("");
                  setResultado(null);
                  setError(null);
                }}
                className="px-5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Limpiar
              </button>
            </div>
          </form>

          {resultado && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <h3 className="text-white font-semibold">Enlace generado</h3>
              {okMsg && <p className="text-slate-300">{okMsg}</p>}
              <p className="text-slate-500 text-sm break-all">
                Código: {resultado.code}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    // Limpiar formulario al aceptar
                    setTitulo("");
                    setFechaHora("");
                    setEstudiante("");
                    setSelected(null);
                    setResultado(null);
                    setOkMsg(null);
                    setError(null);
                    if (selfEmail) setAsesor(selfEmail);
                    else setAsesor("");
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Aceptar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
