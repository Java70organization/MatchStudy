"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Settings, Trash2, FileText, Video, Rss } from "lucide-react"; // marker

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
  type FeedItem = {
    id: string | number;
    hora?: string;
    usuario?: string | null;
    materia?: string | null;
    descripcion?: string | null;
    email?: string | null;
  };
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

        // Cargar feeds (filtrar por email de sesión en cliente)
        const rf = await fetch("/api/feeds-with-users", { cache: "no-store" });
        const jf = await rf.json().catch(() => ({ data: [] }));
        const allFeeds: FeedItem[] = rf.ok ? (jf.data as FeedItem[]) ?? [] : [];

        // Cargar materiales
        const rm = await fetch("/api/materials", {
          cache: "no-store",
          credentials: "include",
        });
        const jm = await rm.json().catch(() => ({ data: [] }));
        const allMats: MaterialItem[] = rm.ok
          ? (jm.data as MaterialItem[]) ?? []
          : [];

        // Cargar salas donde soy asesor
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
            (f) => (f.email ?? "").toLowerCase() === (me ?? "").toLowerCase()
          )
        );
        setMaterials(
          allMats.filter(
            (m) => (m.email ?? "").toLowerCase() === (me ?? "").toLowerCase()
          )
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
    () => materials.length + salas.length,
    [materials, salas]
  );

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

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Administración
        </h1>
      </div>
      <p className="text-slate-400">
        Gestiona tus publicaciones y salas. Total: {total}
      </p>

      {loading && <p className="text-slate-400">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Mis feeds con eliminar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Rss className="h-5 w-5 text-purple-300" />
              <h2 className="text-white font-semibold">
                Mis feeds ({myFeeds.length})
              </h2>
            </div>
            {myFeeds.length === 0 ? (
              <p className="text-slate-400 text-sm">No tienes feeds.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {myFeeds.map((f) => (
                  <div
                    key={String(f.id)}
                    className="rounded-lg border border-slate-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">
                        {f.materia || "(sin materia)"}
                      </div>
                      <div className="text-slate-400 text-xs break-words">
                        {f.descripcion}
                      </div>
                      {f.hora && (
                        <div className="text-slate-500 text-[11px] mt-1">
                          {new Date(f.hora).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => delFeed(f.id)}
                      className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Materiales */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-purple-300" />
              <h2 className="text-white font-semibold">
                Mis materiales ({materials.length})
              </h2>
            </div>
            {materials.length === 0 ? (
              <p className="text-slate-400 text-sm">No tienes materiales.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {materials.map((m) => (
                  <div
                    key={String(m.id)}
                    className="rounded-lg border border-slate-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">
                        {m.materia}
                      </div>
                      <div className="text-slate-400 text-xs break-words">
                        {m.descripcion}
                      </div>
                    </div>
                    <button
                      onClick={() => delMaterial(m.id)}
                      className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Salas donde soy asesor */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-purple-300" />
              <h2 className="text-white font-semibold">
                Mis salas como asesor ({salas.length})
              </h2>
            </div>
            {salas.length === 0 ? (
              <p className="text-slate-400 text-sm">No tienes salas creadas.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {salas.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-slate-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white text-sm font-medium">
                        {s.titulo || `Sala ${s.codigoSala}`}
                      </div>
                      <div className="text-slate-400 text-xs">
                        Asesor: {s.asesor || "(yo)"} · Estudiante:{" "}
                        {s.estudiante || "(sin asignar)"}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {new Date(s.fecha || s.hora).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => delSala(s.id)}
                      className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
