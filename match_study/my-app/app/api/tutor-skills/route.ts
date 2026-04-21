import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

type TutorSkillRow = {
  tag_id: number;
  weight: number;
};

type SkillInput = {
  tag_name: string;
  weight?: number;
  name?: string;
};

type TagRow = {
  id: number;
  name: string;
};

export async function GET() {
  try {
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener skills del tutor
    const { data: skills, error } = await supabaseServer
      .from("tutor_skills")
      .select("tag_id, weight")
      .eq("user_email", user.email);

    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo skills: ${error.message}` },
        { status: 500 }
      );
    }

    const skillIds = Array.from(
      new Set((skills || []).map((skill: TutorSkillRow) => skill.tag_id)),
    );

    const { data: tagRows, error: tagsError } = await supabaseServer
      .from("tags")
      .select("id, name")
      .in("id", skillIds);

    if (tagsError) {
      return NextResponse.json(
        { error: `Error obteniendo nombres de tags: ${tagsError.message}` },
        { status: 500 }
      );
    }

    const tagNameMap = new Map(
      (tagRows || []).map((tag: TagRow) => [tag.id, tag.name]),
    );

    const formattedSkills = (skills || []).map((skill: TutorSkillRow) => ({
      tag_id: skill.tag_id,
      weight: skill.weight,
      tag_name: tagNameMap.get(skill.tag_id) || `Tag ${skill.tag_id}`,
    }));

    return NextResponse.json({ skills: formattedSkills }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo skills:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json() as { skills: SkillInput[] };
    const { skills } = body ?? { skills: [] };

    if (!Array.isArray(skills)) {
      return NextResponse.json(
        { error: "Skills debe ser un array" },
        { status: 400 }
      );
    }

    // Validar y resolver skill names a tag_ids
    const skillNames = skills
      .map((s: SkillInput) => (s.tag_name || s.name || "").trim())
      .filter((name): name is string => name.length > 0);

    if (skillNames.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un skill" },
        { status: 400 }
      );
    }

    // Normalizar nombres y mantener original
    const normalizedSkillMap = new Map<string, string>();
    skillNames.forEach((name) => {
      const normalized = name.toLowerCase();
      normalizedSkillMap.set(normalized, name);
    });

    // Obtener todos los tags actuales para matching case-insensitive
    const { data: allTags, error: tagsError } = await supabaseServer
      .from("tags")
      .select("id, name");

    if (tagsError) {
      return NextResponse.json(
        { error: `Error resolviendo tags: ${tagsError.message}` },
        { status: 500 }
      );
    }

    const existingTags = new Map<string, TagRow>();
    (allTags || []).forEach((tag: TagRow) => {
      existingTags.set(tag.name.toLowerCase(), tag);
    });

    const missingTags = [] as Array<{ name: string }>;
    normalizedSkillMap.forEach((name, lowerName) => {
      if (!existingTags.has(lowerName)) {
        missingTags.push({ name });
      }
    });

    if (missingTags.length > 0) {
      const { error: insertTagsError } = await supabaseServer
        .from("tags")
        .insert(missingTags);

      if (insertTagsError) {
        return NextResponse.json(
          { error: `Error creando tags: ${insertTagsError.message}` },
          { status: 500 }
        );
      }

      const { data: insertedTags, error: insertedTagsError } = await supabaseServer
        .from("tags")
        .select("id, name")
        .in("name", missingTags.map((t) => t.name));

      if (insertedTagsError) {
        return NextResponse.json(
          { error: `Error recuperando tags creados: ${insertedTagsError.message}` },
          { status: 500 }
        );
      }

      (insertedTags || []).forEach((tag: TagRow) => {
        existingTags.set(tag.name.toLowerCase(), tag);
      });
    }

    const resolvedSkills = [];
    for (const skill of skills) {
      const skillName = (skill.tag_name || skill.name || "").trim();
      const tagId = existingTags.get(skillName.toLowerCase())?.id;

      if (!tagId) {
        return NextResponse.json(
          { error: `Tag no encontrado: "${skillName}"` },
          { status: 404 }
        );
      }

      resolvedSkills.push({
        tag_id: tagId,
        weight: skill.weight || 5,
      });
    }

    // Eliminar skills existentes
    const { error: deleteError } = await supabaseServer
      .from("tutor_skills")
      .delete()
      .eq("user_email", user.email);

    if (deleteError) {
      return NextResponse.json(
        { error: `Error eliminando skills anteriores: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // Insertar nuevas skills
    if (resolvedSkills.length > 0) {
      const skillsToInsert = resolvedSkills.map(skill => ({
        user_email: user.email,
        tag_id: skill.tag_id,
        weight: skill.weight,
      }));

      const { error: insertError } = await supabaseServer
        .from("tutor_skills")
        .insert(skillsToInsert);

      if (insertError) {
        return NextResponse.json(
          { error: `Error guardando skills: ${insertError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error guardando skills:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}