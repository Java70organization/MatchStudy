import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Profile";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase" },
        { status: 500 },
      );
    }
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin
      .from("feeds")
      .select(
        "id, created_at, email, materia, descripcion, numero_likes, display_name, url_foto_path",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo feeds: ${error.message}` },
        { status: 500 },
      );
    }

    const items = await Promise.all(
      (data ?? []).map(async (row) => {
        let signedUrl: string | null = null;
        const key = row.url_foto_path as string | null;
        if (key) {
          const { data: signed } = await admin.storage
            .from(BUCKET)
            .createSignedUrl(key, 60 * 60 * 24 * 7);
          signedUrl = signed?.signedUrl ?? null;
        }
        return { ...row, avatar_url: signedUrl };
      }),
    );

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno del servidor: ${msg}` },
      { status: 500 },
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
    const { materia, descripcion } = body ?? {};
    if (!materia || !descripcion) {
      return NextResponse.json(
        { error: "materia y descripcion son requeridos" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    // Leer perfil del usuario para urlFoto path
    let url_foto_path: string | null = null;
    const { data: perfil } = await admin
      .from("usuarios")
      .select("urlFoto, nombres, apellidos")
      .eq("email", user.email)
      .maybeSingle();
    if (perfil?.urlFoto) url_foto_path = perfil.urlFoto as string;

    const display_name =
      (user.user_metadata?.full_name as string | undefined) || null;

    const insert = {
      email: user.email,
      materia: String(materia),
      descripcion: String(descripcion),
      numero_likes: 0,
      display_name: display_name,
      url_foto_path,
    };

    const { data, error } = await admin
      .from("feeds")
      .insert(insert)
      .select(
        "id, created_at, email, materia, descripcion, numero_likes, display_name, url_foto_path",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Error creando feed: ${error.message}` },
        { status: 500 },
      );
    }

    // Devolver con avatar firmado
    let avatar_url: string | null = null;
    if (data?.url_foto_path) {
      const { data: signed } = await admin.storage
        .from(BUCKET)
        .createSignedUrl(data.url_foto_path as string, 60 * 60 * 24 * 7);
      avatar_url = signed?.signedUrl ?? null;
    }

    return NextResponse.json({ data: { ...data, avatar_url } }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno del servidor: ${msg}` },
      { status: 500 },
    );
  }
}

