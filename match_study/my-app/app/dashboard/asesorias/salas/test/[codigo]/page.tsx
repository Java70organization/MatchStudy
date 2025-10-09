import React from "react";
import { createClient } from "@/lib/supabase/server";

export default function SalaTestPage({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  const { codigo } = React.use(params);
  return <SalaTestContent codigo={codigo} />;
}

async function SalaTestContent({ codigo }: { codigo: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("salas")
    .select("titulo, asesor, estudiante")
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <iframe
          src={iframeSrc}
          width="100%"
          height="640"
          allow="camera; microphone; fullscreen"
          title={`Mirotalk test - ${codigo}`}
          className="rounded-lg bg-black"
        />
      </div>
    </section>
  );
}
