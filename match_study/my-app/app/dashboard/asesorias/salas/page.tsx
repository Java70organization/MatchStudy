"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Video } from "lucide-react";

type SalaRow = {
  id: string;
  hora: string;
  codigoSala: string;
  titulo: string | null;
  asesor: string | null;
  estudiante: string | null;
  fecha: string | null;
};

export default function SalasIndexPage() {
  const router = useRouter();
  const [salas, setSalas] = useState<SalaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selfEmail, setSelfEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from("salas")
          .select("id, hora, codigoSala, titulo, asesor, estudiante, fecha")
          .order("hora", { ascending: false });
        if (error) throw error;
        setSalas((data as SalaRow[]) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando salas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setSelfEmail(data.user?.email ?? null);
      } catch {
        setSelfEmail(null);
      }
    })();
  }, []);

  const visibles = salas
    .filter((s) => {
      const em = (selfEmail ?? "").toLowerCase();
      return em && (s.asesor?.toLowerCase() === em || s.estudiante?.toLowerCase() === em);
    })
    .filter((s) => {
      const when = s.fecha ? new Date(s.fecha) : new Date(s.hora);
      const now = new Date();
      const sameDay = when.toDateString() === now.toDateString();
      return sameDay; // mostrar todas las de hoy; botón se deshabilita según hora
    });

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Video className="h-8 w-8 text-purple-400" />
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Salas programadas
        </h1>
      </div>

      {loading && <p className="text-slate-400">Cargando...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && !error && visibles.length === 0 && (
        <p className="text-slate-400">No hay salas programadas para ti.</p>
      )}

      <div className="grid gap-4">
        {visibles.map((s) => {
          const fechaProg = s.fecha ? new Date(s.fecha) : new Date(s.hora);
          const fechaFmt = fechaProg.toLocaleString();
          const roomHref = `/dashboard/asesorias/salas/${encodeURIComponent(s.codigoSala)}`;
          const testHref = `/dashboard/asesorias/salas/test/${encodeURIComponent(s.codigoSala)}`;
          const canJoin = Date.now() >= fechaProg.getTime();
          return (
            <div key={s.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{s.titulo || `Sala ${s.codigoSala}`}</div>
                <div className="text-slate-400 text-sm">Asesor: {s.asesor || "(sin asignar)"} · Estudiante: {s.estudiante || "(sin asignar)"}</div>
                <div className="text-slate-500 text-xs">{fechaFmt}</div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => { if (canJoin) router.push(testHref); }}
                  disabled={!canJoin}
                  className={`px-4 py-2 rounded-lg text-white ${
                    canJoin ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-700 cursor-not-allowed opacity-60"
                  }`}
                >
                  Unirse
                </button>
                <button
                  onClick={() => {
                    try {
                      const abs = typeof window !== "undefined" ? new URL(roomHref, window.location.origin).toString() : roomHref;
                      navigator.clipboard.writeText(abs);
                    } catch {
                      navigator.clipboard.writeText(roomHref);
                    }
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Copiar enlace
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
