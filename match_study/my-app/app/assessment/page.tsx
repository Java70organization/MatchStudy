"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { checkUserProfile } from "@/lib/supabase/user";
import { Target, ArrowRight, RefreshCw } from "lucide-react";

type Option = { value: string; label: string };

type FormState = {
  area: string;
  objective: string;
  weeklyTime: string;
  tutorStyle: string;
  learningFormat: string;
  level: string;
  frequency: string;
  modalityStudy: string;
  materials: string;
  rigor: string;
  preferences: string;
  expected: string;
  notes: string;
};

const QUESTIONS = [
  {
    key: "area" as const,
    title: "1. Área académica principal",
    desc: "¿En qué área necesitas más apoyo?",
    options: [
      { value: "matematicas", label: "A) Matemáticas" },
      { value: "programacion", label: "B) Programación / Tecnología" },
      { value: "fisica_quimica", label: "C) Física / Química" },
      { value: "idiomas", label: "D) Idiomas" },
      { value: "sociales_humanidades", label: "E) Ciencias sociales / Humanidades" },
      { value: "otra", label: "F) Otra" },
    ] satisfies Option[],
  },
  {
    key: "objective" as const,
    title: "2. Objetivo principal",
    desc: "¿Cuál es tu objetivo actual?",
    options: [
      { value: "aprobar_materia", label: "A) Aprobar una materia" },
      { value: "subir_promedio", label: "B) Subir promedio" },
      { value: "preparar_examen", label: "C) Preparar examen importante" },
      { value: "aprender_cero", label: "D) Aprender desde cero" },
      { value: "resolver_tareas", label: "E) Resolver tareas específicas" },
      { value: "preparacion_profesional", label: "F) Preparación profesional" },
    ] satisfies Option[],
  },
  {
    key: "weeklyTime" as const,
    title: "3. Disponibilidad de tiempo",
    desc: "¿Cuánto tiempo puedes dedicar por semana?",
    options: [
      { value: "lt_2h", label: "A) Menos de 2 horas" },
      { value: "2_5h", label: "B) 2–5 horas" },
      { value: "5_10h", label: "C) 5–10 horas" },
      { value: "gt_10h", label: "D) Más de 10 horas" },
    ] satisfies Option[],
  },
  {
    key: "tutorStyle" as const,
    title: "4. Tipo de asesor que prefieres",
    desc: "¿Qué estilo de asesor te ayuda más?",
    options: [
      { value: "paso_a_paso", label: "A) Explicación paso a paso" },
      { value: "ejercicios", label: "B) Práctica con ejercicios" },
      { value: "dudas_rapidas", label: "C) Resolución de dudas rápidas" },
      { value: "dinamico", label: "D) Método dinámico y participativo" },
      { value: "examen", label: "E) Estricto y enfocado a exámenes" },
    ] satisfies Option[],
  },
  {
    key: "learningFormat" as const,
    title: "5. Formato de aprendizaje preferido",
    desc: "¿Cómo prefieres aprender?",
    options: [
      { value: "videollamada", label: "A) Videollamadas en vivo" },
      { value: "videos_grabados", label: "B) Videos grabados" },
      { value: "pdfs", label: "C) PDFs y apuntes" },
      { value: "interactivos", label: "D) Ejercicios interactivos" },
      { value: "foros_chat", label: "E) Foros o chat con asesores" },
    ] satisfies Option[],
  },
  {
    key: "level" as const,
    title: "6. Nivel actual en la materia",
    desc: "¿Cuál es tu nivel?",
    options: [
      { value: "basico", label: "A) Básico (casi no entiendo)" },
      { value: "intermedio", label: "B) Intermedio (entiendo pero me cuesta)" },
      { value: "avanzado", label: "C) Avanzado (solo dudas específicas)" },
      { value: "experto", label: "D) Experto (quiero perfeccionar)" },
    ] satisfies Option[],
  },
  {
    key: "frequency" as const,
    title: "7. Frecuencia de asesorías",
    desc: "¿Con qué frecuencia quieres asesorías?",
    options: [
      { value: "diario", label: "A) Diario" },
      { value: "2_3_semana", label: "B) 2–3 veces por semana" },
      { value: "1_semana", label: "C) 1 vez por semana" },
      { value: "cuando_dudas", label: "D) Solo cuando tenga dudas" },
    ] satisfies Option[],
  },
  {
    key: "modalityStudy" as const,
    title: "8. Modalidad de estudio",
    desc: "¿Cómo prefieres estudiar?",
    options: [
      { value: "individual", label: "A) Individual con asesor" },
      { value: "grupo_pequeno", label: "B) Grupo pequeño" },
      { value: "comunidad", label: "C) Comunidad abierta" },
      { value: "autoestudio", label: "D) Autoestudio con materiales" },
    ] satisfies Option[],
  },
  {
    key: "materials" as const,
    title: "9. Tipo de materiales útiles",
    desc: "¿Qué materiales te ayudan más?",
    options: [
      { value: "ejercicios_resueltos", label: "A) Ejercicios resueltos" },
      { value: "resumen_teoria", label: "B) Resúmenes y teoría" },
      { value: "examenes_practica", label: "C) Exámenes de práctica" },
      { value: "videos_explicativos", label: "D) Videos explicativos" },
      { value: "guias_paso_a_paso", label: "E) Guías paso a paso" },
    ] satisfies Option[],
  },
  {
    key: "rigor" as const,
    title: "10. Nivel de exigencia del asesor",
    desc: "¿Qué tan exigente quieres que sea tu asesor?",
    options: [
      { value: "relajado", label: "A) Relajado" },
      { value: "equilibrado", label: "B) Equilibrado" },
      { value: "estricto", label: "C) Estricto" },
      { value: "muy_exigente", label: "D) Muy exigente tipo examen real" },
    ] satisfies Option[],
  },
  {
    key: "preferences" as const,
    title: "11. Preferencias adicionales",
    desc: "¿Qué valoras más en un asesor?",
    options: [
      { value: "paciencia", label: "A) Paciencia" },
      { value: "experiencia", label: "B) Experiencia" },
      { value: "claridad", label: "C) Claridad al explicar" },
      { value: "rapidez", label: "D) Rapidez" },
      { value: "motivacion", label: "E) Buen trato y motivación" },
    ] satisfies Option[],
  },
  {
    key: "expected" as const,
    title: "12. Resultado esperado del sistema",
    desc: "¿Qué esperas que te recomiende MatchStudy?",
    options: [
      { value: "mejores_asesores", label: "A) Mejores asesores" },
      { value: "materiales_personalizados", label: "B) Materiales personalizados" },
      { value: "plan_estudio", label: "C) Plan de estudio" },
      { value: "todo", label: "D) Todo lo anterior" },
    ] satisfies Option[],
  },
] as const;

/**
 * ✅ Mapeo respuestas -> tag.name (usa el seed que te di)
 * Esto te permite llenar assessment_tags automáticamente.
 */
const TAG_MAP = {
  area: {
    matematicas: "area_matematicas",
    programacion: "area_programacion",
    fisica_quimica: "area_fisica_quimica",
    idiomas: "area_idiomas",
    sociales_humanidades: "area_sociales_humanidades",
    otra: "area_otra",
  },
  objective: {
    aprobar_materia: "obj_aprobar_materia",
    subir_promedio: "obj_subir_promedio",
    preparar_examen: "obj_preparar_examen",
    aprender_cero: "obj_aprender_desde_cero",
    resolver_tareas: "obj_resolver_tareas",
    preparacion_profesional: "obj_preparacion_profesional",
  },
  weeklyTime: {
    lt_2h: "time_menos_2h",
    "2_5h": "time_2_5h",
    "5_10h": "time_5_10h",
    gt_10h: "time_mas_10h",
  },
  tutorStyle: {
    paso_a_paso: "style_paso_a_paso",
    ejercicios: "style_ejercicios",
    dudas_rapidas: "style_dudas_rapidas",
    dinamico: "style_dinamico",
    examen: "style_enfocado_examen",
  },
  learningFormat: {
    videollamada: "format_videollamada",
    videos_grabados: "format_videos_grabados",
    pdfs: "format_pdfs",
    interactivos: "format_interactivo",
    foros_chat: "format_chat_foros",
  },
  level: {
    basico: "level_basico",
    intermedio: "level_intermedio",
    avanzado: "level_avanzado",
    experto: "level_experto",
  },
  frequency: {
    diario: "freq_diario",
    "2_3_semana": "freq_2_3_semana",
    "1_semana": "freq_1_semana",
    cuando_dudas: "freq_solo_dudas",
  },
  modalityStudy: {
    individual: "mode_individual",
    grupo_pequeno: "mode_grupo_pequeno",
    comunidad: "mode_comunidad",
    autoestudio: "mode_autoestudio",
  },
  materials: {
    ejercicios_resueltos: "mat_ejercicios_resueltos",
    resumen_teoria: "mat_resumen_teoria",
    examenes_practica: "mat_examenes_practica",
    videos_explicativos: "mat_videos_explicativos",
    guias_paso_a_paso: "mat_guias_paso_a_paso",
  },
  rigor: {
    relajado: "rigor_relajado",
    equilibrado: "rigor_equilibrado",
    estricto: "rigor_estricto",
    muy_exigente: "rigor_muy_exigente",
  },
  preferences: {
    paciencia: "pref_paciencia",
    experiencia: "pref_experiencia",
    claridad: "pref_claridad",
    rapidez: "pref_rapidez",
    motivacion: "pref_motivacion",
  },
  expected: {
    mejores_asesores: "expect_mejores_asesores",
    materiales_personalizados: "expect_materiales_personalizados",
    plan_estudio: "expect_plan_estudio",
    todo: "expect_todo",
  },
} as const;

type TagMapKey = keyof typeof TAG_MAP;

export default function AssessmentPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiOk, setUiOk] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    area: "",
    objective: "",
    weeklyTime: "",
    tutorStyle: "",
    learningFormat: "",
    level: "",
    frequency: "",
    modalityStudy: "",
    materials: "",
    rigor: "",
    preferences: "",
    expected: "",
    notes: "",
  });

  const isComplete = useMemo(() => {
    return (
      !!form.area &&
      !!form.objective &&
      !!form.weeklyTime &&
      !!form.tutorStyle &&
      !!form.learningFormat &&
      !!form.level &&
      !!form.frequency &&
      !!form.modalityStudy &&
      !!form.materials &&
      !!form.rigor &&
      !!form.preferences &&
      !!form.expected
    );
  }, [form]);

  useEffect(() => {
    const init = async () => {
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
        }
      } catch (e) {
        console.error(e);
        setUiError("Error inicializando formulario");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const setAnswer = (key: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  /**
   * ✅ Paso 5 agregado:
   *  - Guardar assessment
   *  - Guardar assessment_tags (mapeo a tags)
   *  - Llamar API route /api/recommend-tutors con assessment_id
   *  - Redirigir a Lobby
   */
  const onSubmit = async () => {
    if (!userEmail) return;

    if (!isComplete) {
      setUiError("Completa todas las preguntas antes de guardar.");
      return;
    }

    setSaving(true);
    setUiError(null);
    setUiOk(null);

    try {
      // 1) Payload (para auditoría y debug)
      const payload = {
        v: 1,
        area: form.area,
        objective: form.objective,
        weeklyTime: form.weeklyTime,
        tutorStyle: form.tutorStyle,
        learningFormat: form.learningFormat,
        level: form.level,
        frequency: form.frequency,
        modalityStudy: form.modalityStudy,
        materials: form.materials,
        rigor: form.rigor,
        preferences: form.preferences,
        expected: form.expected,
        notes: form.notes.trim() || null,
      };

      // 2) Insert assessment
      const topic = `${form.area} | ${form.objective}`;

      const { data: assessment, error: errA } = await supabase
        .from("assessments")
        .insert({
          student_email: userEmail,
          subject: "Assessment v1",
          modality: "online", // campo del schema (separado de tu pregunta 8, que es modalityStudy)
          topic,
          notes: JSON.stringify(payload),
        })
        .select("id")
        .single();

      if (errA || !assessment?.id) {
        setUiError(`No se pudo guardar el assessment: ${errA?.message ?? "Error desconocido"}`);
        return;
      }

      // 3) Resolver tag_ids a partir de tag.name (seed) y guardar assessment_tags
      const tagNames: string[] = [];

      (Object.keys(TAG_MAP) as TagMapKey[]).forEach((k) => {
        const answer = form[k] as string;
        const tagName = (TAG_MAP[k] as any)[answer] as string | undefined;
        if (tagName) tagNames.push(tagName);
      });

      // Seguridad extra
      const uniqueTagNames = Array.from(new Set(tagNames));
      if (uniqueTagNames.length === 0) {
        setUiError("No se pudieron derivar tags del formulario. Revisa TAG_MAP y el seed de tags.");
        return;
      }

      const { data: tagRows, error: errTags } = await supabase
        .from("tags")
        .select("id,name")
        .in("name", uniqueTagNames);

      if (errTags) {
        setUiError(`Error cargando tags: ${errTags.message}`);
        return;
      }

      const nameToId = new Map<string, number>((tagRows ?? []).map((t: any) => [t.name, t.id]));
      const missing = uniqueTagNames.filter((n) => !nameToId.has(n));
      if (missing.length > 0) {
        setUiError(`Faltan tags en BD (seed incompleto): ${missing.join(", ")}`);
        return;
      }

      const rows = uniqueTagNames.map((name) => ({
        assessment_id: assessment.id,
        tag_id: nameToId.get(name)!,
        weight: 1,
      }));

      const { error: errAT } = await supabase.from("assessment_tags").insert(rows);
      if (errAT) {
        setUiError(`Assessment guardado, pero falló assessment_tags: ${errAT.message}`);
        return;
      }

      // 4) Log event
      await supabase.from("user_events").insert({
        user_email: userEmail,
        event_type: "assessment_submit_v1",
        entity_type: "feed",
        entity_id: 0,
        meta: payload,
      });

      // ✅ 5) Llamar API route que corre KNN y guarda tutor_recommendations
      const resp = await fetch("/api/recommend-tutors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessment.id }),
      });

      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        setUiError(
          `Assessment guardado, pero falló recomendación: ${errJson?.error ?? resp.statusText}`,
        );
        // Igual puedes mandar al lobby si quieres, pero aquí lo dejo en UI para depurar.
        return;
      }

      setUiOk("¡Listo! Guardamos tu formulario y generamos recomendaciones. Redirigiendo…");
      setTimeout(() => {
        window.location.href = "/dashboard/lobby";
      }, 650);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto" />
          <p className="text-slate-300">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-400" />
              Formulario de necesidades (12 preguntas)
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Contesta estas preguntas para recomendarte tutores y recursos de manera más precisa.
            </p>

            {uiError && (
              <div className="mt-2 rounded-xl border border-red-500/30 bg-red-900/10 px-3 py-2 text-xs text-red-300">
                {uiError}
              </div>
            )}
            {uiOk && (
              <div className="mt-2 rounded-xl border border-green-500/30 bg-green-900/10 px-3 py-2 text-xs text-green-300">
                {uiOk}
              </div>
            )}
          </div>

          <button
            onClick={() => (window.location.href = "/dashboard/lobby")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/20 px-4 py-2 text-sm text-slate-200 hover:border-purple-500/50"
          >
            <ArrowRight className="h-4 w-4" />
            Volver al Lobby
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/20 p-6 space-y-6">
        {QUESTIONS.map((q) => (
          <div key={q.key} className="rounded-2xl border border-slate-800 bg-slate-950/10 p-5">
            <div className="space-y-1">
              <div className="text-white font-semibold">{q.title}</div>
              <div className="text-sm text-slate-300">{q.desc}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {q.options.map((opt) => {
                const active = form[q.key] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(q.key, opt.value)}
                    className={[
                      "rounded-xl px-3 py-2 text-sm border transition-all",
                      active
                        ? "border-purple-500/60 bg-purple-900/20 text-white"
                        : "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-purple-500/40",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-800 bg-slate-950/10 p-5">
          <div className="text-white font-semibold">Notas adicionales (opcional)</div>
          <p className="mt-1 text-sm text-slate-300">
            Si quieres, describe tu caso (tema específico, fecha de examen, qué te cuesta, etc.).
          </p>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="mt-3 min-h-[120px] w-full rounded-xl border border-slate-700 bg-slate-950/40 px-4 py-2 text-sm text-slate-100 outline-none focus:border-purple-500/60"
            placeholder="Ej: Tengo examen el viernes, necesito practicar recursión y árboles en C++."
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!isComplete || saving || !userEmail}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              Guardar formulario
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-xs text-slate-400">
          Requisito: responder las 12 preguntas. (Se guardan tags + se corre KNN via API route).
        </div>
      </div>
    </section>
  );
}
