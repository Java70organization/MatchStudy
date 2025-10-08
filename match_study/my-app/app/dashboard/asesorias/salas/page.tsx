"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SalasIndexPage() {
  const router = useRouter();
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_MIROTALK_URL || "";
    if (base) {
      try {
        if (typeof window !== "undefined") window.location.href = base;
        else router.replace(base);
      } catch {
        router.replace(base);
      }
    }
  }, [router]);

  const base = process.env.NEXT_PUBLIC_MIROTALK_URL || "";
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-white">Salas</h1>
      {!base && (
        <p className="text-red-400">
          Configura NEXT_PUBLIC_MIROTALK_URL en tu .env.local para redirigir a tu instancia.
        </p>
      )}
      {base && (
        <p className="text-slate-300">
          Si no redirige automáticamente, haz clic aquí: {" "}
          <a className="text-purple-400 underline" href={base}>
            Abrir Salas
          </a>
        </p>
      )}
    </section>
  );
}

