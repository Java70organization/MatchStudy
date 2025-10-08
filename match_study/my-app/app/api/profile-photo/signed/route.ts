import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Profile";

function extractObjectKey(input: string): string | null {
  try {
    if (!input) return null;
    if (/^https?:\/\//i.test(input)) {
      const url = new URL(input);
      // Expected: /storage/v1/object/public/Profile/<objectKey>
      const marker = "/storage/v1/object/public/" + BUCKET + "/";
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      return url.pathname.substring(idx + marker.length);
    }
    // Already a path
    return input;
  } catch {
    return null;
  }
}

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    // Obtener path guardado en usuarios.urlFoto
    const { data: row, error } = await supabaseAdmin
      .from("usuarios")
      .select("urlFoto")
      .eq("email", user.email)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo perfil: ${error.message}` },
        { status: 500 }
      );
    }
    const value = row?.urlFoto as string | null;
    if (!value) {
      return NextResponse.json({ error: "Sin foto" }, { status: 404 });
    }

    const objectKey = extractObjectKey(value);
    if (!objectKey) {
      return NextResponse.json({ error: "Path inválido" }, { status: 400 });
    }

    const { data: signed, error: signedErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(objectKey, 60 * 60 * 24 * 7); // 7 días

    if (signedErr) {
      return NextResponse.json(
        { error: `Error generando URL firmada: ${signedErr.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: signed?.signedUrl }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno del servidor: ${msg}` },
      { status: 500 }
    );
  }
}
