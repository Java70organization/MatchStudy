import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type AssessmentRow = {
  id: string;
  student_email: string | null;
  modality: "online" | "presencial" | "ambos" | null;
  budget_min: number | null;
  budget_max: number | null;
};

type AssessmentTagRow = {
  tag_id: number;
  weight: number | null;
};

type TutorProfileRow = {
  user_email: string;
  active: boolean | null;
  modality: "online" | "presencial" | "ambos" | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
};

type TutorSkillRow = {
  user_email: string;
  tag_id: number;
  weight: number | null;
};

type RequestBody = {
  assessment_id?: string;
};

function cosineSim(a: Map<number, number>, b: Map<number, number>) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [k, av] of a.entries()) {
    normA += av * av;
    const bv = b.get(k);
    if (bv !== undefined) dot += av * bv;
  }
  for (const [, bv] of b.entries()) {
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const assessmentId = body.assessment_id;

    if (!assessmentId) {
      return NextResponse.json({ error: "assessment_id requerido" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Faltan env vars: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY" },
        { status: 500 },
      );
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // 1) Assessment
    const { data: assessment, error: errA } = await supabase
      .from("assessments")
      .select("id, student_email, modality, budget_min, budget_max")
      .eq("id", assessmentId)
      .maybeSingle<AssessmentRow>();

    if (errA || !assessment?.id) {
      return NextResponse.json(
        { error: `Assessment no encontrado: ${errA?.message ?? ""}` },
        { status: 404 },
      );
    }

    // 2) Tags del assessment (vector estudiante)
    const { data: aTags, error: errAT } = await supabase
      .from("assessment_tags")
      .select("tag_id, weight")
      .eq("assessment_id", assessmentId);

    if (errAT) {
      return NextResponse.json({ error: `assessment_tags error: ${errAT.message}` }, { status: 500 });
    }

    const studentVec = new Map<number, number>();
    (aTags as AssessmentTagRow[] | null)?.forEach((r) => {
      studentVec.set(r.tag_id, r.weight ?? 1);
    });

    if (studentVec.size === 0) {
      return NextResponse.json(
        { error: "Este assessment no tiene tags. No se puede recomendar.", hint: "Llena assessment_tags" },
        { status: 400 },
      );
    }

    // 3) Tutores activos
    const { data: tutors, error: errT } = await supabase
      .from("tutor_profiles")
      .select("user_email, active, modality, hourly_rate_min, hourly_rate_max")
      .eq("active", true);

    if (errT) {
      return NextResponse.json({ error: `tutor_profiles error: ${errT.message}` }, { status: 500 });
    }

    const tutorRows = (tutors ?? []) as TutorProfileRow[];
    const tutorEmails = tutorRows.map((t) => t.user_email).filter(Boolean);

    if (tutorEmails.length === 0) {
      return NextResponse.json({ ok: true, saved: 0, reason: "No hay tutores activos" });
    }

    // 4) Skills de tutores
    const { data: tSkills, error: errS } = await supabase
      .from("tutor_skills")
      .select("user_email, tag_id, weight")
      .in("user_email", tutorEmails);

    if (errS) {
      return NextResponse.json({ error: `tutor_skills error: ${errS.message}` }, { status: 500 });
    }

    const skillsByTutor = new Map<string, Map<number, number>>();
    (tSkills as TutorSkillRow[] | null)?.forEach((r) => {
      if (!skillsByTutor.has(r.user_email)) skillsByTutor.set(r.user_email, new Map());
      skillsByTutor.get(r.user_email)!.set(r.tag_id, r.weight ?? 1);
    });

    // 5) Score + filtros suaves (modalidad y presupuesto)
    const wantModality = (assessment.modality ?? "online") as "online" | "presencial" | "ambos";
    const bMin = assessment.budget_min;
    const bMax = assessment.budget_max;

    const scored: { tutor_email: string; score: number }[] = [];

    for (const t of tutorRows) {
      const email = t.user_email;
      const tutorVec = skillsByTutor.get(email);
      if (!tutorVec || tutorVec.size === 0) continue;

      const tutorModality = (t.modality ?? "online") as "online" | "presencial" | "ambos";
      const modalityOk = wantModality === "ambos" || tutorModality === "ambos" || tutorModality === wantModality;
      if (!modalityOk) continue;

      if (bMin !== null || bMax !== null) {
        const tMin = t.hourly_rate_min;
        const tMax = t.hourly_rate_max;

        if (tMin !== null && bMax !== null && tMin > bMax) continue;
        if (tMax !== null && bMin !== null && tMax < bMin) continue;
      }

      const sim = cosineSim(studentVec, tutorVec);
      if (sim > 0) scored.push({ tutor_email: email, score: sim });
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 12);

    // 6) Persistir recomendaciones
    const { error: errDel } = await supabase
      .from("tutor_recommendations")
      .delete()
      .eq("assessment_id", assessmentId);

    if (errDel) {
      return NextResponse.json({ error: `delete tutor_recommendations error: ${errDel.message}` }, { status: 500 });
    }

    if (top.length > 0) {
      const rows = top.map((r) => ({
        assessment_id: assessmentId,
        tutor_email: r.tutor_email,
        score: r.score,
        model_version: "knn_v1",
      }));

      const { error: errSave } = await supabase.from("tutor_recommendations").insert(rows);
      if (errSave) {
        return NextResponse.json({ error: `save error: ${errSave.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, saved: top.length, top });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
