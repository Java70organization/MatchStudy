"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  Upload,
  X,
  Download,
  Image as ImageIcon,
  Video as VideoIcon,
  File as GenericFile,
  Eye,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Tipos                                                                      */
/* -------------------------------------------------------------------------- */

type MaterialRow = {
  id?: string | number;
  hora: string; // ISO date string
  usuario?: string | null;
  materia: string;
  descripcion: string;
  email: string | null;
  urlmaterial: string;
  downloadUrl?: string | null; // viene desde la API, NO es columna obligatoria
};

type DateRange = "all" | "today" | "7d" | "30d";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function inRange(iso: string, range: DateRange): boolean {
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
}

function getFileType(url: string): "pdf" | "image" | "video" | "other" {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (/\.(png|jpg|jpeg|gif|webp|avif)$/.test(lower)) return "image";
  if (/\.(mp4|webm|ogg|mov)$/.test(lower)) return "video";
  return "other";
}

/* -------------------------------------------------------------------------- */
/*  MaterialCard                                                               */
/* -------------------------------------------------------------------------- */

type MaterialCardProps = {
  material: MaterialRow;
  onPreview: (m: MaterialRow) => void;
};

function MaterialCard({ material, onPreview }: MaterialCardProps) {
  // protección: si por algún motivo llega undefined no revienta
  if (!material) return null;

  const url =
    (material.downloadUrl ?? material.urlmaterial ?? "").toString() || "";

  const type = getFileType(url || "");
  const Icon =
    type === "pdf"
      ? FileText
      : type === "image"
      ? ImageIcon
      : type === "video"
      ? VideoIcon
      : GenericFile;

  const fecha = new Date(material.hora);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-sm shadow-slate-950/40 transition-all hover:-translate-y-0.5 hover:border-purple-500/60 hover:shadow-md hover:shadow-purple-900/40">
      {/* Header */}
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/15">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {material.materia || "Material"}
            </h3>
            <p className="text-xs text-slate-400">
              Publicado por{" "}
              <span className="text-slate-200">
                {material.usuario || material.email || "Usuario"}
              </span>
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
          {fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </span>
      </header>

      {/* Descripción */}
      <p className="mb-4 line-clamp-3 text-sm text-slate-200">
        {material.descripcion}
      </p>

      {/* Footer / acciones */}
      <footer className="mt-auto flex flex-wrap gap-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            Descargar
          </a>
        ) : (
          <span className="text-xs text-slate-500">Sin URL disponible</span>
        )}

        <button
          type="button"
          onClick={() => onPreview(material)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-900"
        >
          <Eye className="h-4 w-4" />
          Previsualizar
        </button>
      </footer>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal: Nuevo material                                                      */
/* -------------------------------------------------------------------------- */

type NewMaterialModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (m: MaterialRow) => void;
};

type FilePreview =
  | { kind: "none" }
  | { kind: "image"; src: string; name: string }
  | { kind: "pdf" | "video" | "other"; name: string };

const MAX_DESC = 280;

function NewMaterialModal({
  open,
  onClose,
  onCreated,
}: NewMaterialModalProps) {
  const [materia, setMateria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FilePreview>({ kind: "none" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const reset = () => {
    setMateria("");
    setDescripcion("");
    setFile(null);
    setPreview({ kind: "none" });
    setError(null);
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  const buildPreview = (f: File) => {
    const name = f.name;
    const lower = name.toLowerCase();
    if (lower.endsWith(".pdf")) {
      setPreview({ kind: "pdf", name });
    } else if (/\.(png|jpe?g|gif|webp|avif)$/.test(lower)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview({
          kind: "image",
          src: String(e.target?.result || ""),
          name,
        });
      };
      reader.readAsDataURL(f);
    } else if (/\.(mp4|webm|ogg|mov)$/.test(lower)) {
      setPreview({ kind: "video", name });
    } else {
      setPreview({ kind: "other", name });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f ?? null);
    if (f) buildPreview(f);
    else setPreview({ kind: "none" });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (!materia.trim() || !descripcion.trim()) {
        setError("Materia y descripción son requeridas.");
        return;
      }
      if (!file) {
        setError("Selecciona un archivo.");
        return;
      }

      setLoading(true);

      const fd = new FormData();
      fd.append("materia", materia.trim());
      fd.append("descripcion", descripcion.trim());
      fd.append("file", file);

      const res = await fetch("/api/materials/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || "Error subiendo material");
      }

      onCreated(json.data as MaterialRow);
      reset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error subiendo material");
    } finally {
      setLoading(false);
    }
  };

  const iconForPreview = () => {
    if (preview.kind === "pdf") return FileText;
    if (preview.kind === "image") return ImageIcon;
    if (preview.kind === "video") return VideoIcon;
    return GenericFile;
  };

  const PreviewIcon = iconForPreview();

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
      <div
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/70">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Upload className="h-5 w-5 text-purple-400" />
            Nuevo material
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Materia
              </label>
              <input
                value={materia}
                onChange={(e) => setMateria(e.target.value)}
                placeholder="Ej. Cálculo diferencial"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Descripción{" "}
                <span className="text-slate-500">(máx. {MAX_DESC})</span>
              </label>
              <textarea
                rows={5}
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(e.target.value.slice(0, MAX_DESC))
                }
                placeholder="Describe brevemente qué contiene el material…"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="mt-1 text-right text-[11px] text-slate-500">
                {descripcion.length}/{MAX_DESC}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-400">
                Archivo
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-purple-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-purple-700"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Puedes subir PDFs, imágenes, videos u otros formatos.
              </p>
            </div>
          </div>

          {/* Previsualización */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Previsualización
            </p>
            <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/80 p-4 text-sm text-slate-400">
              {preview.kind === "none" && (
                <span className="text-center">
                  Selecciona un archivo para ver una previsualización.
                </span>
              )}

              {preview.kind === "image" && (
                <div className="space-y-3 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview.src}
                    alt={preview.name}
                    className="mx-auto max-h-36 rounded-lg object-contain"
                  />
                  <p className="truncate text-xs text-slate-300">
                    {preview.name}
                  </p>
                </div>
              )}

              {preview.kind !== "none" && preview.kind !== "image" && (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600/20">
                    <PreviewIcon className="h-7 w-7 text-purple-400" />
                  </div>
                  <p className="max-w-[220px] truncate text-xs text-slate-200">
                    {preview.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {preview.kind === "pdf"
                      ? "Archivo PDF"
                      : preview.kind === "video"
                      ? "Archivo de video"
                      : "Archivo"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 whitespace-pre-line text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Footer */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-900 disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {loading ? "Subiendo…" : "Subir material"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Modal: Previsualizar material                                             */
/* -------------------------------------------------------------------------- */

type PreviewMaterialModalProps = {
  open: boolean;
  material: MaterialRow | null;
  onClose: () => void;
};

function PreviewMaterialModal({
  open,
  material,
  onClose,
}: PreviewMaterialModalProps) {
  if (!open || !material) return null;

  const url =
    (material.downloadUrl ?? material.urlmaterial ?? "").toString() || "";
  const type = getFileType(url || "");
  const Icon =
    type === "pdf"
      ? FileText
      : type === "image"
      ? ImageIcon
      : type === "video"
      ? VideoIcon
      : GenericFile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 flex h-[80vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-slate-950 px-5 pb-5 pt-4 shadow-2xl shadow-black/80">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/15">
              <Icon className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {material.materia || "Material"}
              </h2>
              <p className="text-xs text-slate-400">
                {material.descripcion}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                <Download className="h-4 w-4" />
                Descargar
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
          {type === "image" && (
            <div className="flex h-full items-center justify-center bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={material.materia || "Imagen"}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}

          {type === "video" && (
            <video
              controls
              className="h-full w-full rounded-xl bg-black object-contain"
              src={url}
            />
          )}

          {type === "pdf" && (
            <iframe
              src={url}
              className="h-full w-full rounded-xl"
              title="PDF"
            />
          )}

          {type === "other" && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-300">
              <GenericFile className="h-10 w-10 text-purple-400" />
              <p>Previsualización no disponible para este tipo de archivo.</p>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
                >
                  <Download className="h-4 w-4" />
                  Descargar archivo
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Página: Materiales (export default)                                       */
/* -------------------------------------------------------------------------- */

export default function MaterialesPage() {
  const [items, setItems] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>("today");

  const [openNew, setOpenNew] = useState(false);
  const [previewMaterial, setPreviewMaterial] = useState<MaterialRow | null>(
    null,
  );
  const [openPreview, setOpenPreview] = useState(false);

  // Cargar materiales
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/materials", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || "Error cargando materiales");
        }
        setItems((json.data as MaterialRow[]) || []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando materiales");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Búsqueda
  const baseByText = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) => {
      const usuario = (it.usuario ?? "").toLowerCase();
      const email = (it.email ?? "").toLowerCase();
      return (
        it.materia.toLowerCase().includes(t) ||
        it.descripcion.toLowerCase().includes(t) ||
        usuario.includes(t) ||
        email.includes(t)
      );
    });
  }, [items, q]);

  // Contadores por rango
  const counts = useMemo(
    () => ({
      all: baseByText.length,
      today: baseByText.filter((it) => inRange(it.hora, "today")).length,
      d7: baseByText.filter((it) => inRange(it.hora, "7d")).length,
      d30: baseByText.filter((it) => inRange(it.hora, "30d")).length,
    }),
    [baseByText],
  );

  // Lista filtrada
  const filtered = useMemo(
    () => baseByText.filter((it) => inRange(it.hora, dateRange)),
    [baseByText, dateRange],
  );

  const handleCreated = (m: MaterialRow) => {
    setItems((prev) => [m, ...prev]);
  };

  const handleOpenPreview = (m: MaterialRow) => {
    setPreviewMaterial(m);
    setOpenPreview(true);
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-purple-400" />
            <div>
              <h1 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                Materiales
              </h1>
              <p className="text-xs text-slate-400 md:text-sm">
                Organiza y comparte tus recursos de estudio con tus asesorías.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenNew(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-purple-900/40 transition-transform transition-colors hover:-translate-y-0.5 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo material
          </button>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:flex-row md:items-center md:justify-between">
        {/* Buscador */}
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por materia, descripción, usuario o email…"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filtros de rango */}
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
          {(
            [
              { key: "today", label: "Hoy", count: counts.today },
              { key: "7d", label: "7 días", count: counts.d7 },
              { key: "30d", label: "30 días", count: counts.d30 },
              { key: "all", label: "Todos", count: counts.all },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDateRange(tab.key)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors ${
                dateRange === tab.key
                  ? "border-purple-500 bg-purple-600/20 text-purple-100"
                  : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Estado de carga / error */}
      {loading && (
        <p className="text-sm text-slate-400">Cargando materiales…</p>
      )}
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-sm text-slate-400">
          No se encontraron materiales para los filtros seleccionados.
        </p>
      )}

      {/* Grid de materiales */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((m) => (
          <MaterialCard
            key={`${m.id ?? ""}-${m.hora}`}
            material={m}
            onPreview={handleOpenPreview}
          />
        ))}
      </div>

      {/* Modal nuevo material */}
      <NewMaterialModal
        open={openNew}
        onClose={() => setOpenNew(false)}
        onCreated={handleCreated}
      />

      {/* Modal previsualizar */}
      <PreviewMaterialModal
        open={openPreview}
        material={previewMaterial}
        onClose={() => setOpenPreview(false)}
      />
    </section>
  );
}
