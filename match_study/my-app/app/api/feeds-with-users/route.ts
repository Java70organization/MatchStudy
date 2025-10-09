import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Profile";

function extractObjectKey(input: string | null | undefined): string | null {
  if (!input) return null;
  try {
    if (/^https?:\/\//i.test(input)) {
      const url = new URL(input);
      const marker = "/storage/v1/object/public/" + BUCKET + "/";
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) return null;
      return url.pathname.substring(idx + marker.length);
    }
    return input;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase" },
        { status: 500 }
      );
    }
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { data: feeds, error } = await admin
      .from("feeds")
      .select("id, hora, usuario, email, materia, descripcion")
      .order("hora", { ascending: false })
      .limit(100);
    if (error) {
      return NextResponse.json(
        { error: `Error obteniendo feeds: ${error.message}` },
        { status: 500 }
      );
    }

    type FeedRow = {
      id?: string | number;
      hora: string;
      usuario: string | null;
      email?: string | null;
      materia: string;
      descripcion: string;
    };

    const result = await Promise.all(
      (feeds ?? []).map(async (f: FeedRow) => {
        let universidad: string | null = null;
        let avatar_url: string | null = null;
        let nombres: string | null = null;
        let apellidos: string | null = null;
        if (f.email) {
          const { data: u } = await admin
            .from("usuarios")
            .select("nombres, apellidos, universidad, urlFoto")
            .eq("email", f.email)
            .maybeSingle();
          if (u) {
            universidad = u.universidad ?? null;
            nombres = (u.nombres as string | null) ?? null;
            apellidos = (u.apellidos as string | null) ?? null;
            const key = extractObjectKey(
              (u as { urlFoto?: string | null }).urlFoto ?? null
            );
            if (key) {
              const { data: signed } = await admin.storage
                .from(BUCKET)
                .createSignedUrl(key, 60 * 60 * 24 * 7);
              avatar_url = signed?.signedUrl ?? null;
            }
          }
        }
        const fullName = `${nombres ?? ""} ${apellidos ?? ""}`.trim();
        const usuario = fullName || f.usuario;
        return {
          id: (f as { id: number }).id,
          hora: f.hora,
          usuario,
          email: (f as { email?: string }).email ?? null,
          materia: f.materia,
          descripcion: f.descripcion,
          likes: 0,
          universidad,
          avatar_url,
        };
      })
    );

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno del servidor: ${msg}` },
      { status: 500 }
    );
  }
}
