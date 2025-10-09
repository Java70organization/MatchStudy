"use client";
import { useEffect, useMemo, useState } from "react";
import { Rss, Search, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type FeedRow = {
  id?: string | number;
  hora: string;
  usuario: string;
  materia: string;
  descripcion: string;
  universidad?: string | null;
  avatar_url?: string | null;
};

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const days = Math.floor(h / 24);
  return `hace ${days}d`;
}

export default function FeedsPage() {
  const [items, setItems] = useState<FeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ materia: "", descripcion: "" });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // filtros desplegables eliminados; usamos pestañas con conteos
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d">(
    "today"
  );
  const maxLen = 500;
  const [selfAvatarUrl, setSelfAvatarUrl] = useState<string | null>(null);
  const [selfInitial, setSelfInitial] = useState<string>("U");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const now = new Date();
    const inRange = (iso: string) => {
      if (dateRange === "all") return true;
      const d = new Date(iso);
      if (dateRange === "today") return d.toDateString() === now.toDateString();
      if (dateRange === "7d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 7);
        return d >= past && d <= now;
      }
      if (dateRange === "30d") {
        const past = new Date(now);
        past.setDate(now.getDate() - 30);
        return d >= past && d <= now;
      }
      return true;
    };
    return items.filter((it) => {
      const textMatch =
        !t ||
        it.materia.toLowerCase().includes(t) ||
        it.descripcion.toLowerCase().includes(t) ||
        (it.usuario ?? "").toLowerCase().includes(t) ||
        (it.universidad ?? "").toLowerCase().includes(t);
      return textMatch && inRange(it.hora);
    });
  }, [items, q, dateRange]);

  // Pestañas con conteo: calcula resultados por texto y conteos por rango
  const baseByText = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) =>
      it.materia.toLowerCase().includes(t) ||
      it.descripcion.toLowerCase().includes(t) ||
      (it.usuario ?? "").toLowerCase().includes(t) ||
      (it.universidad ?? "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const inRangeTab = (iso: string, range: "all" | "today" | "7d" | "30d") => {
    if (range === "all") return true;
    const now = new Date();
    const d = new Date(iso);
    if (range === "today") return d.toDateString() === now.toDateString();
    if (range === "7d") {
      const past = new Date(now);
      past.setDate(now.getDate() - 7);
      return d >= past && d <= now;
    }
    if (range === "30d") {
      const past = new Date(now);
      past.setDate(now.getDate() - 30);
      return d >= past && d <= now;
    }
    return true;
  };

  const counts = useMemo(() => ({
    all: baseByText.length,
    today: baseByText.filter((it) => inRangeTab(it.hora, "today")).length,
    d7: baseByText.filter((it) => inRangeTab(it.hora, "7d")).length,
    d30: baseByText.filter((it) => inRangeTab(it.hora, "30d")).length,
  }), [baseByText]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/feeds-with-users", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error cargando feeds");
      setItems((json.data as FeedRow[]) || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando feeds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Cargar avatar y nombre del usuario actual para el composer
  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        const nameInitial =
          (u?.user?.user_metadata?.full_name as string | undefined)?.charAt(
            0
          ) ||
          u?.user?.email?.charAt(0) ||
          "U";
        setSelfInitial(nameInitial.toUpperCase());
        const res = await fetch("/api/profile-photo/signed", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.ok) {
          const j = await res.json();
          if (j?.url) setSelfAvatarUrl(j.url as string);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const onPost = async () => {
    try {
      setPosting(true);
      setError(null);
      if (!form.materia.trim() || !form.descripcion.trim()) {
        setError("Materia y descripción son requeridas");
        return;
      }
      const { data: u, error: authError } = await supabase.auth.getUser();
      if (authError || !u || !u.user) throw new Error("No autorizado");
      const displayName =
        (u.user.user_metadata?.full_name as string | undefined) ||
        u.user.email?.split("@")[0] ||
        "Usuario";
      const now = new Date().toISOString();
      const insertRow: FeedRow = {
        hora: now,
        usuario: displayName,
        materia: form.materia.trim(),
        descripcion: form.descripcion.trim(),
      };
      let { error } = await supabase
        .from("feeds")
        .insert({ ...insertRow, email: u.user.email });
      if (
        error &&
        String(error.message || "")
          .toLowerCase()
          .includes("email")
      ) {
        const r2 = await supabase.from("feeds").insert(insertRow);
        const error2 = r2.error;
        if (error2) error = error2;
      }
      if (error) throw new Error(error.message);
      setItems((prev) => [insertRow, ...prev]);
      setForm({ materia: "", descripcion: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error publicando");
    } finally {
      setPosting(false);
    }
  };

  // Likes deshabilitados

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Rss className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Feeds
          </h1>
        </div>
      </div>

      {/* Composer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
        <div className="flex items-start gap-3">
          {selfAvatarUrl ? (
            <img
              src={selfAvatarUrl}
              alt="mi avatar"
              className="w-10 h-10 rounded-full object-cover border border-slate-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              {selfInitial}
            </div>
          )}
          <div className="flex-1 space-y-3">
            <textarea
              placeholder="¿Qué estás pensando?"
              value={form.descripcion}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  descripcion: e.target.value.slice(0, maxLen),
                }))
              }
              className="w-full px-4 py-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-white min-h-[96px] resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              maxLength={maxLen}
            />
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Materia"
                value={form.materia}
                onChange={(e) =>
                  setForm((f) => ({ ...f, materia: e.target.value }))
                }
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white"
              />
              <div className="text-xs text-slate-400 pr-2">
                {form.descripcion.length}/{maxLen}
              </div>
              <button
                onClick={onPost}
                disabled={
                  posting || !form.descripcion.trim() || !form.materia.trim()
                }
                className="flex items-center gap-2 bg-purple-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Upload className="h-4 w-4" />{" "}
                {posting ? "Publicando..." : "Publicar"}
              </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y pestañas */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex gap-4 flex-1 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar feeds..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-2 text-sm">
            {([
              { k: "today", label: "Hoy", n: counts.today },
              { k: "7d", label: "7 días", n: counts.d7 },
              { k: "30d", label: "30 días", n: counts.d30 },
              { k: "all", label: "Todos", n: counts.all },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setDateRange(t.k as any)}
                className={`px-3 py-1.5 rounded-lg border ${
                  dateRange === (t.k as any)
                    ? "bg-purple-600 text-white border-purple-600"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.label} <span className="opacity-80">({t.n})</span>
              </button>
            ))}
          </div>
          {/* Botón de filtros eliminado: pestañas cubren el filtrado por fecha */}
        </div>
      </div>

      {/* Lista de feeds */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-400">No hay feeds aún.</p>
        ) : (
          filtered.map((f) => (
            <article
              key={`${f.usuario}-${f.hora}`}
              className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700"
            >
              <div className="flex items-start gap-3">
                {f.avatar_url ? (
                  <img
                    src={f.avatar_url}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                    {(f.usuario || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-white font-medium">
                      {f.usuario || "Usuario"}
                    </span>
                    <span>•</span>
                    <span>{timeAgo(f.hora)}</span>
                  </div>
                  {typeof f.universidad === "string" && f.universidad && (
                    <p className="text-xs text-slate-400">{f.universidad}</p>
                  )}
                  <h3 className="text-white font-semibold mt-1">{f.materia}</h3>
                  <p className="text-slate-300 mt-1 whitespace-pre-wrap">
                    {f.descripcion}
                  </p>
                  {/* Likes deshabilitados */}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
