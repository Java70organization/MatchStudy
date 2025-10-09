"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Download, Eye, Search, Upload } from "lucide-react";

type MaterialRow = {
  id?: string | number;
  hora: string; // ISO date string
  usuario?: string | null;
  materia: string;
  descripcion: string;
  email: string | null;
  urlmaterial: string;
  downloadUrl?: string | null;
};

export default function MaterialesPage() {
  const [items, setItems] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d">("today");

  // Formulario de subida
  const [form, setForm] = useState({ materia: "", descripcion: "" });
  const [file, setFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const maxLen = 280;

  // Cargar materiales desde la API
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/materials", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok)
          throw new Error(json?.error || "Error cargando materiales");
        setItems((json.data as MaterialRow[]) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando materiales");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const baseByText = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (it) =>
        it.materia.toLowerCase().includes(t) ||
        it.descripcion.toLowerCase().includes(t) ||
        (it.usuario ?? "").toLowerCase().includes(t) ||
        (it.email ?? "").toLowerCase().includes(t)
    );
  }, [items, q]);

  const inRange = (iso: string, range: "all" | "today" | "7d" | "30d") => {
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
    today: baseByText.filter((it) => inRange(it.hora, "today")).length,
    d7: baseByText.filter((it) => inRange(it.hora, "7d")).length,
    d30: baseByText.filter((it) => inRange(it.hora, "30d")).length,
  }), [baseByText]);

  const filtered = useMemo(() => baseByText.filter((it) => inRange(it.hora, dateRange)), [baseByText, dateRange]);

  const onUpload = async () => {
    try {
      setPosting(true);
      setError(null);
      if (!form.materia.trim() || !form.descripcion.trim()) {
        setError("Materia y descripción son requeridas");
        return;
      }
      if (!file) {
        setError("Selecciona un archivo PDF");
        return;
      }

      const fd = new FormData();
      fd.append("materia", form.materia);
      fd.append("descripcion", form.descripcion);
      fd.append("file", file);

      const res = await fetch("/api/materials/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error subiendo material");
      setItems((prev) => [json.data as MaterialRow, ...prev]);
      setForm({ materia: "", descripcion: "" });
      setFile(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo material");
    } finally {
      setPosting(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Materiales
          </h1>
        </div>
        <p className="text-slate-400">
          Sube PDFs y navega los materiales compartidos.
        </p>
      </div>

      {/* Composer simple de material */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:p-5">
        <div className="flex-1 space-y-3">
          <textarea
            placeholder="Descripción del material (máx. 280)"
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder="Materia"
              value={form.materia}
              onChange={(e) =>
                setForm((f) => ({ ...f, materia: e.target.value }))
              }
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white"
            />
            <input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-slate-300 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
            />
            <div className="text-xs text-slate-400 hidden sm:block">
              {form.descripcion.length}/{maxLen}
            </div>
            <button
              onClick={onUpload}
              disabled={
                posting ||
                !form.materia.trim() ||
                !form.descripcion.trim() ||
                !file
              }
              className="flex items-center gap-2 bg-purple-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Upload className="h-4 w-4" />{" "}
              {posting ? "Compartiendo..." : "Compartir Material"}
            </button>
          </div>
          {file && (
            <div className="text-xs text-slate-400 bg-slate-800/60 border border-slate-700/60 rounded px-2 py-1 inline-flex">
              {file.name} • {(file.size / (1024 * 1024)).toFixed(2)} MB
            </div>
          )}
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      </div>

      {/* Búsqueda y pestañas */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por materia, descripción, usuario o email"
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
      </div>

      {loading && <p className="text-slate-400">Cargando...</p>}
      {error && !posting && <p className="text-red-400">{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-slate-400">No hay materiales.</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <div
            key={`${m.email}-${m.hora}-${m.urlmaterial}`}
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    {m.materia || "Material"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Publicado por {m.usuario || m.email || "Usuario"}
                  </p>
                </div>
              </div>
              <span className="bg-purple-600/20 text-purple-400 text-xs px-2 py-1 rounded-full">
                {new Date(m.hora).toLocaleDateString("es-ES")}
              </span>
            </div>

            <p className="text-slate-300 text-sm mb-4 whitespace-pre-wrap">
              {m.descripcion}
            </p>

            <div className="flex gap-2">
              {m.downloadUrl ? (
                <a
                  href={m.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Download className="h-3 w-3" /> Descargar
                </a>
              ) : (
                <span className="text-xs text-slate-500">Sin URL</span>
              )}
              {m.downloadUrl && (
                <a
                  href={m.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 border border-slate-600 text-slate-300 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                >
                  <Eye className="h-3 w-3" /> Ver
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
