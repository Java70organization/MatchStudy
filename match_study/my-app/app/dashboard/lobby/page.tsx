"use client";

import type React from "react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { checkUserProfile } from "@/lib/supabase/user";
import { getOrCreateConversation } from "@/lib/supabase/chat";
import {
  Users,
  BookOpen,
  Video,
  Target,
  Flame,
  Sparkles,
  Clock,
  RefreshCw,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

type FeedRow = {
  id: number;
  hora: string;
  usuario: string | null;
  materia: string | null;
  descripcion: string | null;
  email: string | null;
  categoria: string | null;
  images?: string[] | null;
  likes_count?: number | null;
  comments_count?: number | null;

  views_72h?: number | null;
  trend_score?: number | null;

  affinity_score?: number | null;
};

type TutorRecommendationRow = {
  tutor_email: string;
  score: number;
  model_version?: string | null;
  created_at?: string | null;

  nombres?: string | null;
  apellidos?: string | null;
  universidad?: string | null;
  urlFoto?: string | null;

  bio?: string | null;
  modality?: string | null;
  hourly_rate_min?: number | null;
  hourly_rate_max?: number | null;
  location?: string | null;
};

type UserRow = {
  email: string;
  nombres: string | null;
  apellidos: string | null;
  universidad: string | null;
  urlFoto: string | null;
};

type TutorProfileRow = {
  user_email: string;
  bio: string | null;
  modality: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  location: string | null;
};

type FeedSectionKey = "para_ti" | "tendencias" | "recientes";

function formatDate(ts: string) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function formatName(r: TutorRecommendationRow) {
  const full = `${r.nombres ?? ""} ${r.apellidos ?? ""}`.trim();
  return full || r.tutor_email;
}

export default function LobbyPage() {
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<FeedSectionKey>("para_ti");

  const [feedsParaTi, setFeedsParaTi] = useState<FeedRow[]>([]);
  const [feedsTendencias, setFeedsTendencias] = useState<FeedRow[]>([]);
  const [feedsRecientes, setFeedsRecientes] = useState<FeedRow[]>([]);

  const [showIntake, setShowIntake] = useState(false);
  const [intakeText, setIntakeText] = useState("");

  // ✅ Recomendaciones de tutores
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorRecs, setTutorRecs] = useState<TutorRecommendationRow[]>([]);
  const [hasAssessment, setHasAssessment] = useState<boolean>(false);

  // modal for tutor actions (schedule / message)
  const [selectedTutor, setSelectedTutor] = useState<TutorRecommendationRow | null>(null);
  const [showTutorModal, setShowTutorModal] = useState(false);

  const [uiError, setUiError] = useState<string | null>(null);

  const sections = useMemo(
    () => [
      { key: "para_ti" as const, label: "Para ti", icon: Sparkles },
      { key: "tendencias" as const, label: "Tendencias", icon: Flame },
      { key: "recientes" as const, label: "Recientes", icon: Clock },
    ],
    [],
  );

  const logEvent = async (
    email: string,
    event_type: string,
    entity_type: "feed" | "material" | "sala",
    entity_id: number,
    meta: Record<string, unknown> = {},
  ) => {
    try {
      await supabase.from("user_events").insert({
        user_email: email,
        event_type,
        entity_type,
        entity_id,
        meta,
      });
    } catch {
      // silent
    }
  };

  const loadFeedSections = async (email: string) => {
    setFeedLoading(true);
    setUiError(null);

    try {
      // 1) Para ti: RPC
      const { data: paraTi, error: errPT } = await supabase.rpc("get_feeds_para_ti", {
        p_user_email: email,
        p_limit: 9,
      });

      // 2) Tendencias: view
      const { data: tendencias, error: errT } = await supabase.from("feeds_tendencias").select("*").limit(12);

      // 3) Recientes: view
      const { data: recientes, error: errR } = await supabase.from("feeds_recientes").select("*").limit(12);

      if (errPT) setUiError(`Para ti: ${errPT.message}`);
      else if (errT) setUiError(`Tendencias: ${errT.message}`);
      else if (errR) setUiError(`Recientes: ${errR.message}`);

      const pt = (paraTi ?? []) as FeedRow[];
      const td = (tendencias ?? []) as FeedRow[];
      const rc = (recientes ?? []) as FeedRow[];

      setFeedsParaTi(pt);
      setFeedsTendencias(td);
      setFeedsRecientes(rc);

      setShowIntake(pt.length === 0);
    } finally {
      setFeedLoading(false);
    }
  };

  /**
   * ✅ Carga recomendaciones de tutores basadas en el último assessment del usuario.
   */
  const loadTutorRecommendations = async (email: string) => {
    setTutorLoading(true);
    setUiError(null);

    try {
      // 1) Último assessment
      const { data: lastAssessment, error: errA } = await supabase
        .from("assessments")
        .select("id, created_at")
        .eq("student_email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string; created_at: string }>();

      if (errA) {
        setUiError(`Assessments: ${errA.message}`);
        setHasAssessment(false);
        setTutorRecs([]);
        return;
      }

      if (!lastAssessment?.id) {
        setHasAssessment(false);
        setTutorRecs([]);
        return;
      }

      setHasAssessment(true);

      // 2) Recomendaciones
      const { data: recs, error: errR } = await supabase
        .from("tutor_recommendations")
        .select("tutor_email, score, model_version, created_at")
        .eq("assessment_id", lastAssessment.id)
        .order("score", { ascending: false })
        .limit(12);

      if (errR) {
        setUiError(`Recomendaciones: ${errR.message}`);
        setTutorRecs([]);
        return;
      }

      const base = (recs ?? []) as TutorRecommendationRow[];
      if (base.length === 0) {
        setTutorRecs([]);
        return;
      }

      const emails = base.map((r) => r.tutor_email).filter((x): x is string => typeof x === "string" && x.length > 0);
      if (emails.length === 0) {
        setTutorRecs(base);
        return;
      }

      // 3) Usuarios (tipado)
      const { data: users, error: errU } = await supabase
        .from("usuarios")
        .select('email, nombres, apellidos, universidad, "urlFoto"')
        .in("email", emails);

      if (errU) setUiError(`Usuarios: ${errU.message}`);

      // 4) Perfiles tutor (tipado)
      const { data: profiles, error: errP } = await supabase
        .from("tutor_profiles")
        .select("user_email, bio, modality, hourly_rate_min, hourly_rate_max, location")
        .in("user_email", emails);

      if (errP) setUiError((prev) => prev ?? `Tutor profile: ${errP.message}`);

      const userRows = (users ?? []) as UserRow[];
      const profileRows = (profiles ?? []) as TutorProfileRow[];

      const userMap = new Map<string, UserRow>(userRows.map((u) => [u.email, u]));
      const profileMap = new Map<string, TutorProfileRow>(profileRows.map((p) => [p.user_email, p]));

      const merged: TutorRecommendationRow[] = base.map((r) => {
        const u = userMap.get(r.tutor_email);
        const p = profileMap.get(r.tutor_email);
        return {
          ...r,
          nombres: u?.nombres ?? null,
          apellidos: u?.apellidos ?? null,
          universidad: u?.universidad ?? null,
          urlFoto: u?.urlFoto ?? null,
          bio: p?.bio ?? null,
          modality: p?.modality ?? null,
          hourly_rate_min: p?.hourly_rate_min ?? null,
          hourly_rate_max: p?.hourly_rate_max ?? null,
          location: p?.location ?? null,
        };
      });

      setTutorRecs(merged);
    } finally {
      setTutorLoading(false);
    }
  };

  useEffect(() => {
    const checkUserProfileOnLoad = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          window.location.href = "/auth/login";
          return;
        }

        const email = user.email ?? null;
        setUserEmail(email);

        if (email) {
          const userProfile = await checkUserProfile(email);
          if (!userProfile) {
            window.location.href = "/auth/completar-perfil";
            return;
          }

          await Promise.all([loadFeedSections(email), loadTutorRecommendations(email)]);
        }
      } catch (error: unknown) {
        console.error("Error verificando perfil:", error);
        setUiError("Error verificando perfil");
      } finally {
        setLoading(false);
      }
    };

    void checkUserProfileOnLoad();
  }, []);

  const currentFeeds: FeedRow[] = useMemo(() => {
    if (activeSection === "para_ti") {
      return feedsParaTi.length > 0 ? feedsParaTi : feedsRecientes;
    }
    if (activeSection === "tendencias") return feedsTendencias;
    return feedsRecientes;
  }, [activeSection, feedsParaTi, feedsTendencias, feedsRecientes]);

  const onSubmitIntake = async () => {
    if (!userEmail) return;
    const text = intakeText.trim();
    if (!text) return;

    await supabase.from("user_events").insert({
      user_email: userEmail,
      event_type: "intake_submit",
      entity_type: "feed",
      entity_id: 0,
      meta: { text },
    });

    setShowIntake(false);
    setIntakeText("");

    await loadFeedSections(userEmail);
  };

  const onOpenFeed = async (feed: FeedRow) => {
    if (userEmail) {
      await logEvent(userEmail, "feed_view", "feed", feed.id, { section: activeSection });
    }
    window.location.href = "/feeds";
  };

  const onGoToAssessment = async () => {
    if (userEmail) {
      await logEvent(userEmail, "assessment_cta_click", "feed", 0, {});
    }
    window.location.href = "/assessment";
  };

  const onSelectTutor = async (t: TutorRecommendationRow) => {
    if (userEmail) {
      await logEvent(userEmail, "tutor_rec_click", "feed", 0, { tutorEmail: t.tutor_email });
    }
    setSelectedTutor(t);
    setShowTutorModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="text-slate-300">Verificando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="text-center space-y-6">
        <div className="flex justify-center mb-6">
          <Image
            src="https://lksruyrnhqwvkwaacwjq.supabase.co/storage/v1/object/public/Imagenes/logo.png"
            alt="MatchStudy Logo"
            width={150}
            height={150}
            className="rounded-2xl shadow-2xl border-4 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Bienvenido a MatchStudy
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Tu plataforma integral para conectar con compañeros de estudio, compartir conocimientos y organizar sesiones
            colaborativas de aprendizaje.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <FeatureCard
            title="Videollamadas"
            icon={<Video className="h-6 w-6 text-purple-400" />}
            iconBg="bg-purple-600/20"
            desc="Conéctate en tiempo real con tus compañeros para sesiones de estudio colaborativas."
          />
          <FeatureCard
            title="Biblioteca"
            icon={<BookOpen className="h-6 w-6 text-green-400" />}
            iconBg="bg-green-600/20"
            desc="Comparte y accede a materiales de estudio, apuntes y recursos educativos."
          />
          <FeatureCard
            title="Comunidad"
            icon={<Users className="h-6 w-6 text-blue-400" />}
            iconBg="bg-blue-600/20"
            desc="Encuentra Feeds con intereses similares y forma grupos de estudio mediante la comunidad de MatchStudy."
          />
        </div>
      </div>

      {/* ✅ Recomendaciones de tutores */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-purple-400" />
              Tutores recomendados
            </h2>
            <p className="text-sm text-slate-300">
              Basado en tu formulario (assessment). Si aún no lo llenas, te mando a hacerlo.
            </p>

            {uiError && (
              <div className="mt-2 rounded-xl border border-red-500/30 bg-red-900/10 px-3 py-2 text-xs text-red-300">
                {uiError}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => userEmail && loadTutorRecommendations(userEmail)}
              disabled={tutorLoading || !userEmail}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 hover:border-purple-500/50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${tutorLoading ? "animate-spin" : ""}`} />
              Actualizar
            </button>

            <button
              onClick={onGoToAssessment}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Llenar formulario
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5">
          {tutorLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto" />
                <p className="text-slate-300 text-sm">Buscando tutores...</p>
              </div>
            </div>
          ) : !hasAssessment ? (
            <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-5">
              <div className="flex items-center gap-2 text-white font-semibold">
                <Target className="h-5 w-5 text-purple-400" />
                Aún no tenemos tu necesidad
              </div>
              <p className="mt-1 text-sm text-slate-300">
                Llena el formulario para recomendarte tutores de programación más adecuados (KNN).
              </p>

              <div className="mt-4">
                <button
                  onClick={onGoToAssessment}
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
                >
                  Ir al formulario
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : tutorRecs.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6 text-slate-300 text-sm">
              Ya tienes formulario, pero todavía no hay recomendaciones guardadas. (Esto pasa si aún no corriste el
              algoritmo o no existe tutor_recommendations).
              <div className="mt-3">
                <button
                  onClick={onGoToAssessment}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 hover:border-purple-500/50"
                >
                  Editar formulario
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tutorRecs.map((t) => (
                <button
                  key={t.tutor_email}
                  onClick={() => onSelectTutor(t)}
                  className="text-left rounded-2xl border border-slate-800 bg-slate-950/20 p-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center shrink-0">
                      {t.urlFoto ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.urlFoto} alt={formatName(t)} className="h-full w-full object-cover" />
                      ) : (
                        <GraduationCap className="h-6 w-6 text-purple-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-white font-semibold line-clamp-1">{formatName(t)}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{t.universidad ?? "Tutor"}</div>
                        </div>

                        <span className="text-xs rounded-lg border border-purple-500/30 bg-purple-900/10 px-2 py-1 text-purple-300">
                          Match {Math.round((t.score ?? 0) * 100)}%
                        </span>
                      </div>

                      {t.bio && <p className="mt-2 text-sm text-slate-300 line-clamp-2">{t.bio}</p>}

                      
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Sección existente: feeds */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Contenido personalizado
            </h2>
            <p className="text-sm text-slate-300">
              “Para ti” usa tus eventos (views/likes/comments/intake). Si no hay eventos, mostrará Recientes.
            </p>

            {uiError && (
              <div className="mt-2 rounded-xl border border-red-500/30 bg-red-900/10 px-3 py-2 text-xs text-red-300">
                {uiError}
              </div>
            )}
          </div>

          <button
            onClick={() => userEmail && loadFeedSections(userEmail)}
            disabled={feedLoading || !userEmail}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 hover:border-purple-500/50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${feedLoading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        {(showIntake || activeSection === "para_ti") && (
          <div className="mt-5 rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Target className="h-5 w-5 text-purple-400" />
              Cuéntame qué necesitas (mejora tu “Para ti”)
            </div>
            <p className="mt-1 text-sm text-slate-300">Ejemplo: “integrales”, “SQL joins”, “examen cálculo”.</p>

            <div className="mt-3 flex flex-col md:flex-row gap-3">
              <input
                value={intakeText}
                onChange={(e) => setIntakeText(e.target.value)}
                placeholder="Escribe tu objetivo o tema..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500/60"
              />
              <button
                onClick={onSubmitIntake}
                disabled={!userEmail || !intakeText.trim()}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {sections.map(({ key, label, icon: Icon }) => {
            const active = key === activeSection;
            return (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={[
                  "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm border transition-all",
                  active
                    ? "border-purple-500/60 bg-purple-900/20 text-white"
                    : "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-purple-500/40",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {feedLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto" />
                <p className="text-slate-300 text-sm">Cargando contenido...</p>
              </div>
            </div>
          ) : currentFeeds.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6 text-slate-300 text-sm">
              No hay resultados por ahora.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentFeeds.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onOpenFeed(f)}
                  className="text-left rounded-2xl border border-slate-800 bg-slate-950/20 p-4 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-white font-semibold line-clamp-1">
                        {f.materia || f.categoria || "Publicación"}
                      </div>
                      <div className="text-xs text-slate-400">{formatDate(f.hora)}</div>
                    </div>

                    {activeSection === "tendencias" && (
                      <span className="text-xs rounded-lg border border-orange-500/30 bg-orange-900/10 px-2 py-1 text-orange-300">
                        Score {f.trend_score ?? 0}
                      </span>
                    )}

                    {activeSection === "para_ti" && (
                      <span className="text-xs rounded-lg border border-purple-500/30 bg-purple-900/10 px-2 py-1 text-purple-300">
                        Afinidad {Math.round((f.affinity_score ?? 0) * 10) / 10}
                      </span>
                    )}
                  </div>

                  {f.descripcion && <p className="mt-2 text-sm text-slate-300 line-clamp-3">{f.descripcion}</p>}

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span className="line-clamp-1">
                      {f.usuario ? `Por ${f.usuario}` : f.email ? `Por ${f.email}` : "Autor"}
                    </span>
                    <span className="flex items-center gap-3">
                      <span>👍 {f.likes_count ?? 0}</span>
                      <span>💬 {f.comments_count ?? 0}</span>
                      {activeSection === "tendencias" && <span>👀 {f.views_72h ?? 0}</span>}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <QuickLink href="/dashboard/asesorias/feeds" label="Ir a Feeds" />
          <QuickLink href="/dashboard/asesorias/salas" label="Ir a Salas" />
          <QuickLink href="/dashboard/asesorias/materiales" label="Ir a Biblioteca" />
          <QuickLink href="/dashboard/asesorias/mensajes" label="Mensajes" />
        </div>
      </div>

      {/* tutor actions popup */}
      <TutorActionsModal
        open={showTutorModal}
        tutor={selectedTutor}
        currentEmail={userEmail}
        onClose={() => setShowTutorModal(false)}
        logEvent={logEvent}
      />
    </section>
  );
}

function FeatureCard({
  title,
  desc,
  icon,
  iconBg,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <p className="text-slate-300 text-sm">{desc}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="inline-flex items-center rounded-xl border border-slate-800 bg-slate-950/20 px-3 py-2 text-sm text-slate-200 hover:border-purple-500/50 hover:bg-slate-900/40 transition-all"
    >
      {label}
    </a>
  );
}

// ----------------------------------------------------------------------------
// Modal that appears when a tutor recommendation is clicked
// provides quick actions: agendar sesión o enviar mensaje.
// ----------------------------------------------------------------------------

function TutorActionsModal({
  open,
  tutor,
  currentEmail,
  onClose,
  logEvent,
}: {
  open: boolean;
  tutor: TutorRecommendationRow | null;
  currentEmail: string | null;
  onClose: () => void;
  logEvent: (email: string, event_type: string, entity_type: "feed" | "material" | "sala", entity_id: number, meta?: Record<string, unknown>) => Promise<void>;
}) {
  const router = useRouter();

  const [step, setStep] = useState<"actions" | "schedule">("actions");
  const [title, setTitle] = useState("");
  const [datetime, setDatetime] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  const reset = () => {
    setStep("actions");
    setTitle("");
    setDatetime("");
    setCreating(false);
    setError(null);
    setMessaging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleMessage = async () => {
    if (!currentEmail || !tutor) return;
    if (currentEmail) await logEvent(currentEmail, "tutor_message_initiate", "feed", 0, { tutorEmail: tutor.tutor_email });
    setMessaging(true);
    try {
      const convId = await getOrCreateConversation(currentEmail, tutor.tutor_email);
      handleClose();
      router.push(`/dashboard/asesorias/mensajes?c=${encodeURIComponent(convId)}`);
    } catch (e) {
      console.error("error creando chat:", e);
      setError("No se pudo iniciar el chat");
    } finally {
      setMessaging(false);
    }
  };

  const handleCreateSession = async () => {
    if (!currentEmail || !tutor) return;
    if (currentEmail) await logEvent(currentEmail, "tutor_schedule_initiate", "feed", 0, { tutorEmail: tutor.tutor_email });
    if (!title.trim()) {
      setError("El título es requerido.");
      return;
    }
    if (!datetime) {
      setError("Selecciona fecha y hora.");
      return;
    }

    setError(null);
    setCreating(true);

    try {
      const dateObj = new Date(datetime);
      if (Number.isNaN(dateObj.getTime())) {
        setError("Fecha/hora inválida.");
        setCreating(false);
        return;
      }
      const iso = dateObj.toISOString();
      const codigoSala =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 10);

      const { error: err } = await supabase
        .from("salas")
        .insert({
          hora: iso,
          fecha: iso,
          codigoSala,
          titulo: title.trim(),
          asesor: tutor.tutor_email,
          estudiante: currentEmail,
        })
        .select("id") // we don't actually need the full row here
        .single();

      if (err) throw err;

      // Insert notification for the tutor
      await supabase.from("notifications").insert({
        user_email: tutor.tutor_email,
        title: "Nueva sesión agendada",
        body: `Sesión agendada con ${currentEmail} el ${dateObj.toLocaleString('es-ES')}`,
        created_at: new Date().toISOString(),
      });

      handleClose();
      router.push("/dashboard/asesorias/salas");
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Error creando la sala");
    } finally {
      setCreating(false);
    }
  };

  if (!open || !tutor) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative z-50 w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/95 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Acciones para tutor</h2>
          <button
            onClick={handleClose}
            className="rounded-full px-2 py-1 text-xs text-slate-400 hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              {tutor.urlFoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tutor.urlFoto} alt={formatName(tutor)} className="h-full w-full object-cover" />
              ) : (
                <GraduationCap className="h-6 w-6 text-purple-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold line-clamp-1">{formatName(tutor)}</div>
              {tutor.universidad && (
                <div className="text-xs text-slate-400 line-clamp-1">{tutor.universidad}</div>
              )}
            </div>
          </div>

          {step === "actions" && (
            <div className="space-y-3">
              <button
                onClick={() => setStep("schedule")}
                className="w-full rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Agendar sesión
              </button>
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 hover:border-purple-500/50 disabled:opacity-60"
              >
                {messaging ? "Creando chat..." : "Enviar mensaje"}
              </button>
            </div>
          )}

          {step === "schedule" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Título</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Tutoría con tutor"
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

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("actions")}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  ← Volver
                </button>
                <button
                  type="button"
                  disabled={creating}
                  onClick={handleCreateSession}
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? "Agendando..." : "Confirmar sesión"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
