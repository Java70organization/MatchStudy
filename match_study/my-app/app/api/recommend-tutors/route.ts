import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type TagWeight = { tag_id: number; weight: number };

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
    const body = await req.json().catch(() => ({}));
    const assessmentId: string | undefined = body?.assessment_id;

    if (!assessmentId) {
      return NextResponse.json({ error: "assessment_id requerido" }, { status: 400 });
    }

    // ✅ IMPORTANTE: usa service role para poder leer/escribir sin trabas de RLS (en server only)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    // 1) Cargar assessment (para validar existe)
    const { data: assessment, error: errA } = await supabase
      .from("assessments")
      .select("id, student_email, modality, budget_min, budget_max")
      .eq("id", assessmentId)
      .maybeSingle();

    if (errA || !assessment?.id) {
      return NextResponse.json({ error: `Assessment no encontrado: ${errA?.message ?? ""}` }, { status: 404 });
    }

    // 2) Cargar assessment_tags (vector del estudiante)
    const { data: aTags, error: errAT } = await supabase
      .from("assessment_tags")
      .select("tag_id, weight")
      .eq("assessment_id", assessmentId);

    if (errAT) {
      return NextResponse.json({ error: `assessment_tags error: ${errAT.message}` }, { status: 500 });
    }

    const studentVec = new Map<number, number>();
    (aTags ?? []).forEach((r: TagWeight) => studentVec.set(r.tag_id, r.weight ?? 1));

    if (studentVec.size === 0) {
      return NextResponse.json(
        { error: "Este assessment no tiene tags. No se puede recomendar.", hint: "Llena assessment_tags" },
        { status: 400 },
      );
    }

    // 3) Cargar tutores candidatos (activos)
    const { data: tutors, error: errT } = await supabase
      .from("tutor_profiles")
      .select("user_email, active, modality, hourly_rate_min, hourly_rate_max")
      .eq("active", true);

    if (errT) {
      return NextResponse.json({ error: `tutor_profiles error: ${errT.message}` }, { status: 500 });
    }

    const tutorEmails = (tutors ?? []).map((t: any) => t.user_email).filter(Boolean);
    if (tutorEmails.length === 0) {
      return NextResponse.json({ ok: true, saved: 0, reason: "No hay tutores activos" });
    }

    // 4) Cargar skills de todos los tutores (tutor_skills)
    const { data: tSkills, error: errS } = await supabase
      .from("tutor_skills")
      .select("user_email, tag_id, weight")
      .in("user_email", tutorEmails);

    if (errS) {
      return NextResponse.json({ error: `tutor_skills error: ${errS.message}` }, { status: 500 });
    }

    // 5) Construir vectores por tutor
    const skillsByTutor = new Map<string, Map<number, number>>();
    (tSkills ?? []).forEach((r: any) => {
      const email = r.user_email as string;
      const tagId = r.tag_id as number;
      const w = (r.weight ?? 1) as number;
      if (!skillsByTutor.has(email)) skillsByTutor.set(email, new Map());
      skillsByTutor.get(email)!.set(tagId, w);
    });

    // 6) Score + filtros básicos (modalidad/presupuesto)
    const wantModality = (assessment.modality ?? "online") as string;
    const bMin = assessment.budget_min ?? null;
    const bMax = assessment.budget_max ?? null;

    const scored: { tutor_email: string; score: number }[] = [];

    for (const t of tutors ?? []) {
      const email = t.user_email as string;
      if (!email) continue;

      const tutorVec = skillsByTutor.get(email);
      if (!tutorVec || tutorVec.size === 0) continue;

      // Filtro modalidad (si assessment pide online/presencial/ambos)
      const tutorModality = (t.modality ?? "online") as string;
      const modalityOk =
        wantModality === "ambos" ||
        tutorModality === "ambos" ||
        tutorModality === wantModality;

      if (!modalityOk) continue;

      // Filtro presupuesto (suave)
      if (bMin !== null || bMax !== null) {
        const tMin = t.hourly_rate_min ?? null;
        const tMax = t.hourly_rate_max ?? null;

        // Si tutor no tiene precio definido, lo dejamos pasar (MVP)
        if (tMin !== null && bMax !== null && tMin > bMax) continue;
        if (tMax !== null && bMin !== null && tMax < bMin) continue;
      }

      const sim = cosineSim(studentVec, tutorVec);
      if (sim <= 0) continue;

      scored.push({ tutor_email: email, score: sim });
    }

    // 7) Top N
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 12);

    // 8) Guardar (upsert)
    // Primero borra anteriores para este assessment (simple)
    await supabase.from("tutor_recommendations").delete().eq("assessment_id", assessmentId);

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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error desconocido" }, { status: 500 });
  }
}
