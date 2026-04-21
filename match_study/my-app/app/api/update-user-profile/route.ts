import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function PATCH(request: NextRequest) {
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
    const { nombres, apellidos, telefono, universidad, displayName } =
      body ?? {};

    if (
      typeof nombres !== "string" &&
      typeof apellidos !== "string" &&
      typeof telefono !== "string" &&
      typeof universidad !== "string" &&
      typeof displayName !== "string"
    ) {
      return NextResponse.json(
        { error: "Sin cambios vÃ¡lidos" },
        { status: 400 }
      );
    }

    // Construir objeto de actualizaciÃ³n solo con campos presentes
    const update: Record<string, string | null> = {};
    if (typeof nombres === "string") update.nombres = nombres.trim();
    if (typeof apellidos === "string") update.apellidos = apellidos.trim();
    if (typeof telefono === "string") update.telefono = telefono.trim();
    if (typeof universidad === "string")
      update.universidad = universidad.trim();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase" },
        { status: 500 }
      );
    }

    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin
      .from("usuarios")
      .update(update)
      .eq("email", user.email)
      .select(
        "id, createdAt, nombres, apellidos, email, telefono, universidad, urlFoto"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error actualizando perfil: ${error.message}` },
        { status: 500 }
      );
    }

    // Si viene displayName, actualizamos el metadata del usuario (full_name)
    if (typeof displayName === "string") {
      try {
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: { full_name: displayName.trim() },
        });
      } catch {
        // No hacer fail si falla la actualización del metadata
      }
    }

    return NextResponse.json({ data, displayName }, { status: 200 });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
