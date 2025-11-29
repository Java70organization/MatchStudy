"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  CalendarClock,
  Plus,
  Search,
  Video,
  Calendar,
  Clock,
  Users,
} from "lucide-react";

type SalaRow = {
  id: number;
  hora: string; // timestamptz
  codigoSala: string;
  titulo: string | null;
  asesor: string | null;
  estudiante: string | null;
  fecha: string | null;
};

type UIUser = {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  urlFoto: string | null;
};

type FilterTab = "all" | "upcoming" | "past" | "calendar";

/* -------------------------------------------------------------------------- */
/*                               MODAL CREAR SALA                             */
/* -------------------------------------------------------------------------- */

type CreateSalaModalProps = {
  open: boolean;
  onClose: () => void;
  currentEmail: string | null;
  onCreated: (newSala: SalaRow) => void;
};

function CreateSalaModal({
  open,
  onClose,
  currentEmail,
  onCreated,
}: CreateSalaModalProps) {
  const [users, setUsers] = useState<UIUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);

  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setError(null);
        const res = await fetch("/api/users", {
          cache: "no-store",
          credentials: "include",
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error cargando usuarios");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

        const base = (json.data || []) as UIUser[];
        const normalized = base
          .filter((u) =>
            currentEmail
              ? u.email.toLowerCase() !== currentEmail.toLowerCase()
              : true
          )
          .map((u) => {
            let foto = u.urlFoto;
            if (foto && !/^https?:\/\//i.test(foto)) {
              foto = `${supabaseUrl}/storage/v1/object/public/Profile/${foto}`;
            }
            return { ...u, urlFoto: foto };
          });

        setUsers(normalized);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Error cargando usuarios para la sala"
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [open, currentEmail]);

  const filteredUsers = useMemo(() => {
    const t = search.trim().toLowerCase();
    if (!t) return users;
    return users.filter(
      (u) =>
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(t) ||
        u.email.toLowerCase().includes(t)
    );
  }, [users, search]);

  const resetAndClose = () => {
    setTitle("");
    setDatetime("");
    setSearch("");
    setSelectedUser(null);
    setError(null);
    onClose();
  };

  const handleCreateSala = async () => {
    try {
      setError(null);
      if (!currentEmail) {
        setError("No se pudo obtener el usuario actual.");
        return;
      }
      if (!selectedUser) {
        setError("Selecciona un estudiante.");
        return;
      }
      if (!title.trim()) {
        setError("El título es requerido.");
        return;
      }
      if (!datetime) {
        setError("Selecciona fecha y hora.");
        return;
      }

      setCreating(true);

      const dateObj = new Date(datetime);
      if (Number.isNaN(dateObj.getTime())) {
        setError("Fecha y hora inválidas.");
        setCreating(false);
        return;
      }

      const iso = dateObj.toISOString();

      const codigoSala =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10);

      const { data, error } = await supabase
        .from("salas")
        .insert({
          hora: iso,
          fecha: iso,
          codigoSala,
          titulo: title.trim(),
          asesor: currentEmail,
          estudiante: selectedUser.email,
        })
        .select("id,hora,codigoSala,titulo,asesor,estudiante,fecha")
        .single();

      if (error) throw error;

      const newSala = data as SalaRow;
      onCreated(newSala);
      resetAndClose();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo crear la sala. Intenta de nuevo."
      );
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={resetAndClose} />
      <div className="relative z-50 w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-950/95 p-5 shadow-2xl shadow-black/60">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Video className="h-5 w-5 text-purple-400" />
            Nueva sala 1 a 1
          </h2>
          <button
            onClick={resetAndClose}
            className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {/* Usuarios */}
          <div className="md:col-span-6 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selecciona un estudiante
            </p>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuarios..."
                className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-900/60">
              {loadingUsers && (
                <p className="py-2 text-center text-xs text-slate-400">
                  Cargando usuarios...
                </p>
              )}
              {!loadingUsers && filteredUsers.length === 0 && (
                <p className="py-2 text-center text-xs text-slate-400">
                  No se encontraron usuarios.
                </p>
              )}
              {!loadingUsers &&
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setSelectedUser(u)}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                      selectedUser?.id === u.id
                        ? "bg-slate-800"
                        : "hover:bg-slate-900"
                    }`}
                  >
                    {u.urlFoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={u.urlFoto}
                        alt={u.email}
                        className="h-8 w-8 rounded-full border border-slate-600 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-xs font-semibold text-white">
                        {(u.nombres || u.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-white">
                        {`${u.nombres} ${u.apellidos}`.trim() || u.email}
                      </div>
                      <div className="truncate text-[11px] text-slate-400">
                        {u.email}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Detalles sala */}
          <div className="md:col-span-6 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Detalles de la sala
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Título</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Tutoría de Matemáticas"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Fecha y hora</label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Asesor</p>
              <p className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200">
                {currentEmail ?? "No autenticado"}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-slate-400">Estudiante seleccionado</p>
              <p className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-200">
                {selectedUser
                  ? `${selectedUser.nombres} ${selectedUser.apellidos} (${selectedUser.email})`
                  : "Selecciona un estudiante en la lista de la izquierda"}
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-400 whitespace-pre-line">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={resetAndClose}
                className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={creating}
                onClick={handleCreateSala}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="h-3 w-3" />
                {creating ? "Creando..." : "Crear sala"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              PÁGINA PRINCIPAL                              */
/* -------------------------------------------------------------------------- */

export default function SalasPage() {
  const router = useRouter();
  const [salas, setSalas] = useState<SalaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selfEmail, setSelfEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const now = new Date();

  // función ventana: 1h antes – 2h después
  const getWindow = (when: Date) => {
    const start = new Date(when.getTime() - 60 * 60 * 1000); // -1h
    const end = new Date(when.getTime() + 2 * 60 * 60 * 1000); // +2h
    return { start, end };
  };

  const isFinished = (when: Date) => {
    const { end } = getWindow(when);
    return now.getTime() > end.getTime();
  };

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

  const mine = useMemo(
    () =>
      salas.filter((s) => {
        if (!selfEmail) return true;
        const em = selfEmail.toLowerCase();
        return (
          s.asesor?.toLowerCase() === em ||
          s.estudiante?.toLowerCase() === em
        );
      }),
    [salas, selfEmail],
  );

  // filtrado por pestañas (usando ventana)
  const filteredSalas = useMemo(() => {
    const withDate = mine.map((s) => {
      const when = s.hora ? new Date(s.hora) : new Date();
      const finished = isFinished(when);
      return { ...s, _when: when, _finished: finished };
    });

    const byFilter = withDate.filter((s) => {
      const finished = s._finished as boolean;
      if (filter === "upcoming") return !finished;
      if (filter === "past") return finished;
      // all & calendar: todas
      return true;
    });

    byFilter.sort(
      (a, b) => (b._when as Date).getTime() - (a._when as Date).getTime(),
    );

    return byFilter;
  }, [mine, filter, now]);

  // calendario (mes actual)
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDay = new Map<number, SalaRow[]>();
  mine.forEach((s) => {
    const d = new Date(s.hora);
    if (d.getMonth() === month && d.getFullYear() === year) {
      const day = d.getDate();
      const arr = eventsByDay.get(day) || [];
      arr.push(s);
      eventsByDay.set(day, arr);
    }
  });

  const monthName = now.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  // próximas (no finalizadas)
  const upcoming = mine
    .filter((s) => !isFinished(new Date(s.hora)))
    .sort(
      (a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime(),
    )
    .slice(0, 6);

  const handleJoin = (codigoSala: string, when: Date) => {
    const { start, end } = getWindow(when);
    const ms = Date.now();
    if (ms < start.getTime() || ms > end.getTime()) return; // fuera de la ventana
    const testHref = `/dashboard/asesorias/salas/test/${encodeURIComponent(
      codigoSala,
    )}`;
    router.push(testHref);
  };

  const handleCreatedSala = (newSala: SalaRow) => {
    setSalas((prev) => [newSala, ...prev]);
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Video className="h-8 w-8 text-purple-400" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Salas
            </h1>
            <p className="text-xs text-slate-400">
              Gestiona tus sesiones 1 a 1 en un solo lugar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Crear sala
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { k: "all" as FilterTab, label: "Todas" },
          { k: "upcoming" as FilterTab, label: "Próximas" },
          { k: "past" as FilterTab, label: "Pasadas" },
          { k: "calendar" as FilterTab, label: "Calendario" },
        ].map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => setFilter(t.k)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
              filter === t.k
                ? "border-purple-500 bg-purple-600/20 text-purple-200"
                : "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CALENDARIO */}
      {filter === "calendar" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-white capitalize">
                    {monthName}
                  </h2>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 gap-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                  (day) => (
                    <div
                      key={day}
                      className="py-2 text-center text-sm font-medium text-slate-400"
                    >
                      {day}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: startWeekday }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square" />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const date = new Date(year, month, day);
                    const isToday =
                      date.toDateString() === now.toDateString();
                    const evs = eventsByDay.get(day) || [];
                    return (
                      <div
                        key={day}
                        className={`relative flex aspect-square items-center justify-center rounded-lg border border-slate-700/60 text-sm ${
                          isToday
                            ? "bg-purple-600/20 text-white border-purple-600/40"
                            : "text-slate-300"
                        }`}
                        title={evs
                          .map((s) => s.titulo || s.codigoSala)
                          .join("\n")}
                      >
                        {day}
                        {evs.length > 0 && (
                          <div className="absolute bottom-2 flex gap-1">
                            {evs.slice(0, 3).map((_, idx) => (
                              <span
                                key={idx}
                                className="h-1.5 w-1.5 rounded-full bg-purple-400"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Próximas sesiones (no finalizadas) */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Clock className="h-5 w-5 text-purple-400" />
                Próximas sesiones
              </h2>

              {upcoming.length === 0 && (
                <p className="text-sm text-slate-400">
                  No hay sesiones próximas.
                </p>
              )}

              <div className="space-y-3">
                {upcoming.map((s) => {
                  const when = new Date(s.hora);
                  const fechaFmt = when.toLocaleString();
                  const { start, end } = getWindow(when);
                  const ms = now.getTime();
                  const canJoin =
                    ms >= start.getTime() && ms <= end.getTime();
                  const before = ms < start.getTime();

                  return (
                    <div
                      key={s.id}
                      className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
                    >
                      <div className="mb-1 flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-medium text-white">
                          {s.titulo || `Sala ${s.codigoSala}`}
                        </h3>
                      </div>
                      <p className="mb-1 text-xs text-slate-400">
                        {fechaFmt}
                      </p>
                      <div className="mb-2 space-y-1 text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>Asesor: {s.asesor || "(sin asignar)"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          <span>
                            Estudiante: {s.estudiante || "(sin asignar)"}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={!canJoin}
                        onClick={() => handleJoin(s.codigoSala, when)}
                        className={`mt-1 w-full rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                          canJoin
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-slate-700 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {canJoin
                          ? "Unirse"
                          : before
                          ? "Disponible 1h antes de la sesión"
                          : "Sesión finalizada"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTA DE SALAS (no en tab calendario) */}
      {filter !== "calendar" && (
        <>
          {loading && <p className="text-slate-400">Cargando salas...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && !error && filteredSalas.length === 0 && (
            <p className="text-sm text-slate-400">
              No hay salas para mostrar. Crea una nueva sala con el botón{" "}
              <span className="font-semibold">“Crear sala”</span>.
            </p>
          )}

          <div className="grid gap-4">
            {filteredSalas.map((s) => {
              const when = s.hora ? new Date(s.hora) : new Date();
              const fechaFmt = when.toLocaleString();
              const finished = isFinished(when);
              const { start, end } = getWindow(when);
              const ms = now.getTime();
              const canJoin =
                ms >= start.getTime() && ms <= end.getTime();
              const before = ms < start.getTime();
              const tagText = finished ? "Finalizada" : "Próxima";

              return (
                <div
                  key={s.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors md:flex-row md:items-center md:justify-between ${
                    finished
                      ? "border-slate-800 bg-slate-900/40 opacity-80"
                      : "border-slate-800 bg-slate-900/70"
                  }`}
                >
                  {/* Info izquierda */}
                  <div className="flex flex-1 items-start gap-3">
                    <div className="mt-1 rounded-full bg-purple-500/10 p-2">
                      <CalendarClock className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-white">
                          {s.titulo || `Sala ${s.codigoSala}`}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            finished
                              ? "bg-slate-800 text-slate-300"
                              : "bg-emerald-600/20 text-emerald-300"
                          }`}
                        >
                          {tagText}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Asesor:{" "}
                        <span className="text-slate-200">
                          {s.asesor || "(sin asignar)"}
                        </span>{" "}
                        · Estudiante:{" "}
                        <span className="text-slate-200">
                          {s.estudiante || "(sin asignar)"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Derecha: fecha + botón (ventana 1h antes–2h después) */}
                  <div className="flex flex-col items-end gap-1 text-right md:min-w-[220px]">
                    <p className="text-[11px] text-slate-400">{fechaFmt}</p>

                    {!finished && (
                      <button
                        type="button"
                        disabled={!canJoin}
                        onClick={() => handleJoin(s.codigoSala, when)}
                        className={`mt-1 rounded-lg px-4 py-1.5 text-xs font-semibold text-white ${
                          canJoin
                            ? "bg-purple-600 hover:bg-purple-700"
                            : "bg-slate-700 cursor-not-allowed opacity-60"
                        }`}
                      >
                        {canJoin
                          ? "Unirse"
                          : before
                          ? "Disponible 1h antes de la sesión"
                          : "Sesión finalizada"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <CreateSalaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentEmail={selfEmail}
        onCreated={handleCreatedSala}
      />
    </section>
  );
}
