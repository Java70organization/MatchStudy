import { Calendar, Clock, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type SalaRow = {
  id: string;
  hora: string;
  codigoSala: string;
  titulo: string | null;
  asesor: string | null;
  estudiante: string | null;
  fecha: string | null;
};

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const selfEmail = auth.user?.email?.toLowerCase() ?? null;

  const { data, error } = await supabase
    .from("salas")
    .select("id, hora, codigoSala, titulo, asesor, estudiante, fecha")
    .order("hora", { ascending: true });

  const all: SalaRow[] = (error ? [] : (data as SalaRow[])) || [];

  const mine = all.filter((s) => {
    if (!selfEmail) return false;
    const a = (s.asesor || "").toLowerCase();
    const e = (s.estudiante || "").toLowerCase();
    return a === selfEmail || e === selfEmail;
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = new Map<number, SalaRow[]>();
  for (const s of mine) {
    const d = new Date(s.fecha || s.hora);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      const arr = eventsByDay.get(day) || [];
      arr.push(s);
      eventsByDay.set(day, arr);
    }
  }

  const monthName = now.toLocaleString("es-ES", { month: "long", year: "numeric" });

  const upcoming = mine
    .filter((s) => new Date(s.fecha || s.hora).getTime() >= Date.now())
    .sort((a, b) => new Date(a.fecha || a.hora).getTime() - new Date(b.fecha || b.hora).getTime())
    .slice(0, 8);

  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Calendario
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Calendario del mes actual */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white capitalize">{monthName}</h2>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Días */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: startWeekday }).map((_, i) => (
                <div key={`pad-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const date = new Date(year, month, day);
                const isToday = date.toDateString() === now.toDateString();
                const evs = eventsByDay.get(day) || [];
                return (
                  <div
                    key={day}
                    className={`relative aspect-square flex items-center justify-center text-sm rounded-lg border border-slate-700/60 ${
                      isToday ? "bg-purple-600/20 text-white border-purple-600/40" : "text-slate-300"
                    }`}
                    title={evs.map((s) => s.titulo || s.codigoSala).join("\n")}
                  >
                    {day}
                    {evs.length > 0 && (
                      <div className="absolute bottom-2 flex gap-1">
                        {evs.slice(0, 3).map((_, idx) => (
                          <span key={idx} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Próximas asesorías */}
        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas asesorías
            </h2>

            {upcoming.length === 0 && (
              <p className="text-slate-400 text-sm">No hay asesorías próximas.</p>
            )}

            <div className="space-y-3">
              {upcoming.map((s) => {
                const when = new Date(s.fecha || s.hora);
                const fechaFmt = when.toLocaleString();
                return (
                  <div key={s.id} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-white truncate">
                        {s.titulo || `Sala ${s.codigoSala}`}
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{fechaFmt}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>Asesor: {s.asesor || "(sin asignar)"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span>Estudiante: {s.estudiante || "(sin asignar)"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

