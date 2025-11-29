"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Settings,
  Trash2,
  FileText,
  Video,
  Rss,
  CalendarDays,
  Clock,
} from "lucide-react";

type FeedItem = {
  id: string | number;
  hora?: string;
  usuario?: string | null;
  materia?: string | null;
  descripcion?: string | null;
  email?: string | null;
};

type MaterialItem = {
  id: string | number;
  hora: string;
  email: string | null;
  materia: string;
  descripcion: string;
  urlmaterial?: string | null;
};

type SalaItem = {
  id: string;
  codigoSala: string;
  titulo: string | null;
  asesor: string | null;
  estudiante: string | null;
  fecha: string | null;
  hora: string;
};

export default function AdminPage() {
  const [myFeeds, setMyFeeds] = useState<FeedItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [salas, setSalas] = useState<SalaItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: u } = await supabase.auth.getUser();
        const me = u.user?.email ?? null;
        const meLower = (me ?? "").toLowerCase();

        // Feeds
        const rf = await fetch("/api/feeds-with-users", { cache: "no-store" });
        const jf = await rf.json().catch(() => ({ data: [] }));
        const allFeeds: FeedItem[] = rf.ok ? (jf.data as FeedItem[]) ?? [] : [];

        // Materiales
        const rm = await fetch("/api/materials", {
          cache: "no-store",
          credentials: "include",
        });
        const jm = await rm.json().catch(() => ({ data: [] }));
        const allMats: MaterialItem[] = rm.ok
          ? (jm.data as MaterialItem[]) ?? []
          : [];

        // Salas donde soy asesor
        let mySalas: SalaItem[] = [];
        if (me) {
          const { data: sdata } = await supabase
            .from("salas")
            .select("id, hora, codigoSala, titulo, asesor, estudiante, fecha")
            .eq("asesor", me);
          mySalas = (sdata as SalaItem[]) ?? [];
        }

        setMyFeeds(
          allFeeds.filter(
            (f) => (f.email ?? "").toLowerCase() === meLower,
          ),
        );
        setMaterials(
          allMats.filter(
            (m) => (m.email ?? "").toLowerCase() === meLower,
          ),
        );
        setSalas(mySalas);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando datos");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const total = useMemo(
    () => myFeeds.length + materials.length + salas.length,
    [myFeeds.length, materials.length, salas.length],
  );

  /* -------------------------- acciones de eliminar -------------------------- */

  const delFeed = async (id: string | number) => {
    try {
      if (!confirm("¿Eliminar este feed?")) return;
      const res = await fetch(`/api/feeds/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error || "No se pudo eliminar el feed");
        return;
      }
      setMyFeeds((prev) => prev.filter((x) => x.id !== id));
    } catch {
      // noop
    }
  };

  const delMaterial = async (id: string | number) => {
    if (!confirm("¿Eliminar este material?")) return;
    const res = await fetch(`/api/materials/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setMaterials((prev) => prev.filter((x) => x.id !== id));
  };

  const delSala = async (id: string) => {
    if (!confirm("¿Eliminar esta sala?")) return;
    const res = await fetch(`/api/salas/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) setSalas((prev) => prev.filter((x) => x.id !== id));
  };

  /* --------------------------------- UI --------------------------------- */

  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/70 to-pink-500/80 shadow-lg shadow-purple-900/40">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Administración
            </h1>
            <p className="text-sm text-slate-400">
              Gestiona tus feeds, materiales y salas creadas.
            </p>
          </div>
        </div>

        <div className="flex gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1">
            <CalendarDays className="h-3 w-3" />
            <span>{new Date().toLocaleDateString("es-MX")}</span>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1">
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </header>

      {/* Tarjetas de resumen */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Total elementos"
          value={total}
          subtitle="Feeds, materiales y salas"
        />
        <SummaryCard
          label="Mis feeds"
          value={myFeeds.length}
          icon={Rss}
          accent="from-orange-400 to-pink-500"
        />
        <SummaryCard
          label="Mis materiales"
          value={materials.length}
          icon={FileText}
          accent="from-sky-400 to-purple-500"
        />
        <SummaryCard
          label="Salas como asesor"
          value={salas.length}
          icon={Video}
          accent="from-emerald-400 to-teal-500"
        />
      </div>

      {loading && (
        <p className="text-slate-400">Cargando información de tu cuenta…</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-900/20 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && (
        <div className="space-y-6">
          {/* FEEDS ---------------------------------------------------- */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20">
                  <Rss className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Mis feeds
                  </h2>
                  <p className="text-xs text-slate-400">
                    Publicaciones que tú creaste.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {myFeeds.length} registros
              </span>
            </header>

            {myFeeds.length === 0 ? (
              <EmptyState text="No tienes feeds creados aún." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {myFeeds.map((f) => (
                  <div
                    key={String(f.id)}
                    className="group flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-purple-500/60 hover:bg-slate-900"
                  >
                    <div className="pr-2">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-purple-500/15 px-2 py-0.5 text-[11px] font-medium text-purple-300">
                          {f.materia || "Sin materia"}
                        </span>
                        {f.hora && (
                          <span className="text-[11px] text-slate-400">
                            {new Date(f.hora).toLocaleString("es-MX")}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 text-xs text-slate-300">
                        {f.descripcion || "(Sin descripción)"}
                      </p>
                    </div>
                    <button
                      onClick={() => delFeed(f.id)}
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                      title="Eliminar feed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* MATERIALES ----------------------------------------------- */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15">
                  <FileText className="h-4 w-4 text-blue-300" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Mis materiales
                  </h2>
                  <p className="text-xs text-slate-400">
                    Archivos que has compartido con otros.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {materials.length} materiales
              </span>
            </header>

            {materials.length === 0 ? (
              <EmptyState text="No has subido materiales todavía." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {materials.map((m) => (
                  <div
                    key={String(m.id)}
                    className="group flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-purple-500/60 hover:bg-slate-900"
                  >
                    <div className="pr-2">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-200">
                          {m.materia}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(m.hora).toLocaleString("es-MX")}
                        </span>
                      </div>
                      <p className="line-clamp-3 text-xs text-slate-300">
                        {m.descripcion}
                      </p>
                    </div>
                    <button
                      onClick={() => delMaterial(m.id)}
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                      title="Eliminar material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SALAS ----------------------------------------------------- */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/40">
            <header className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
                  <Video className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Mis salas como asesor
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sesiones 1 a 1 que has creado.
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {salas.length} salas
              </span>
            </header>

            {salas.length === 0 ? (
              <EmptyState text="No tienes salas creadas como asesor." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {salas.map((s) => (
                  <div
                    key={s.id}
                    className="group flex items-start justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-purple-500/60 hover:bg-slate-900"
                  >
                    <div className="pr-2">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-200">
                          {s.titulo || `Sala ${s.codigoSala}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Asesor:{" "}
                        <span className="font-medium">
                          {s.asesor || "(yo)"}
                        </span>{" "}
                        · Estudiante:{" "}
                        <span className="font-medium">
                          {s.estudiante || "(sin asignar)"}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(s.fecha || s.hora).toLocaleString("es-MX")}
                      </p>
                    </div>
                    <button
                      onClick={() => delSala(s.id)}
                      className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                      title="Eliminar sala"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </section>
  );
}

/* ------------------------------ componentes auxiliares ------------------------------ */

type SummaryProps = {
  label: string;
  value: number;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: string; // gradient tailwind classes (from-.. to-..)
};

function SummaryCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = "from-purple-500 to-pink-500",
}: SummaryProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div
        className={`pointer-events-none absolute inset-x-0 -top-16 h-24 bg-gradient-to-b ${accent} opacity-25`}
      />
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950/60">
            <Icon className="h-5 w-5 text-slate-200" />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}
