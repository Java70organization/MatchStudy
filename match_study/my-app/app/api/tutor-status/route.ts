import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

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

    // Verificar si el usuario es tutor
    const { data: tutorProfile, error } = await supabaseServer
      .from("tutor_profiles")
      .select("active, modality, hourly_rate_min, hourly_rate_max")
      .eq("user_email", user.email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo perfil de tutor: ${error.message}` },
        { status: 500 }
      );
    }

    const isTutor = tutorProfile ? tutorProfile.active : false;

    return NextResponse.json({
      is_tutor: isTutor,
      profile: tutorProfile
    }, { status: 200 });
  } catch (error) {
    console.error("Error obteniendo estado de tutor:", error);
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

    const body = await request.json();
    const { is_tutor, modality, hourly_rate_min, hourly_rate_max } = body ?? {};

    if (typeof is_tutor !== "boolean") {
      return NextResponse.json(
        { error: "is_tutor debe ser un boolean" },
        { status: 400 }
      );
    }

    if (is_tutor) {
      // Crear o actualizar perfil de tutor
      const tutorData = {
        user_email: user.email,
        active: true,
        modality: modality || "online",
        hourly_rate_min: hourly_rate_min || null,
        hourly_rate_max: hourly_rate_max || null,
      };

      const { error: upsertError } = await supabaseServer
        .from("tutor_profiles")
        .upsert(tutorData, { onConflict: "user_email" });

      if (upsertError) {
        return NextResponse.json(
          { error: `Error guardando perfil de tutor: ${upsertError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Desactivar tutor (no eliminar, solo marcar como inactivo)
      const { error: updateError } = await supabaseServer
        .from("tutor_profiles")
        .update({ active: false })
        .eq("user_email", user.email);

      if (updateError) {
        return NextResponse.json(
          { error: `Error desactivando tutor: ${updateError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando estado de tutor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}