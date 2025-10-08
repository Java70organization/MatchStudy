"use client";

import { useState } from "react";

type Props = {
  onUploaded?: (result: { path: string; signedUrl?: string }) => void;
};

export default function ProfilePhotoUploader({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSelect = (f: File | null) => {
    setError(null);
    setSuccess(null);
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile-photo", {
        method: "POST",
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error subiendo imagen");
      }
      const path: string | undefined = data?.path;
      const signedUrl: string | undefined = data?.signedUrl;

      // Si el backend no devolvió signedUrl, lo pedimos ahora
      let finalSignedUrl = signedUrl;
      if (!finalSignedUrl) {
        try {
          const sres = await fetch("/api/profile-photo/signed", {
            cache: "no-store",
            credentials: "include",
          });
          const sdata = await sres.json();
          if (sres.ok) finalSignedUrl = sdata.url;
        } catch {}
      }

      setSuccess("Foto actualizada correctamente");
      onUploaded?.({ path: path!, signedUrl: finalSignedUrl });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("profile-photo-updated"));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
        />
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="bg-purple-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {loading ? "Subiendo..." : "Subir"}
        </button>
      </div>
      {preview && (
        <div className="flex items-center gap-4">
          <img
            src={preview}
            alt="Vista previa"
            className="w-16 h-16 rounded-full object-cover border border-slate-600"
          />
          <span className="text-xs text-slate-400">Vista previa</span>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400">{success}</p>
      )}
      <p className="text-xs text-slate-500">
        Formatos permitidos: JPG, PNG, WEBP. Máximo 5MB.
      </p>
    </div>
  );
}
