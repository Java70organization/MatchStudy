import React from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default function SalaRoomPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = React.use(params);
  return <SalaContent codigo={codigo} />;
}

async function SalaContent({ codigo }: { codigo: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("salas")
    .select("id, hora, codigoSala, titulo, asesor, estudiante, fecha")
    .eq("codigoSala", codigo)
    .maybeSingle();

  const title = data?.titulo || `Sala ${codigo}`;
  const asesor = data?.asesor || "(sin asignar)";
  const estudiante = data?.estudiante || "(sin asignar)";
  const iframeSrc = `https://p2p.mirotalk.com/join/match_study_room_${encodeURIComponent(codigo)}`;

  return (
    <section className="space-y-3">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white">{title}</h1>
      <div className="text-slate-400 text-sm">Asesor: {asesor} · Estudiante: {estudiante}</div>
      {error && (
        <p className="text-red-400 text-sm">No se pudo cargar la sala: {error.message}</p>
      )}
      <Link
        href="/dashboard/lobby"
        className="inline-flex items-center justify-center self-end px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors w-full"
      >
        Salir de la llamada
      </Link>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <iframe
          src={iframeSrc}
          width="100%"
          height="640"
          allow="camera; microphone; fullscreen"
          title={`Mirotalk - ${codigo}`}
          className="rounded-lg bg-black"
        />
      </div>
    </section>
  );
}
