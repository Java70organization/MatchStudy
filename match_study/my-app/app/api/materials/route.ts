import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Files";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Faltan variables de entorno" }, { status: 500 });
    }
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await admin
      .from("material")
      .select("id, hora, usuario, materia, descripcion, email, urlmaterial")
      .order("hora", { ascending: false })
      .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = await Promise.all(
      (data ?? []).map(async (row) => {
        let downloadUrl: string | null = null;
        if (row.urlmaterial) {
          const { data: signed } = await admin.storage
            .from(BUCKET)
            .createSignedUrl(row.urlmaterial as string, 60 * 60 * 24 * 7);
          downloadUrl = signed?.signedUrl || null;
        }
        return { ...row, downloadUrl };
      }),
    );

    return NextResponse.json({ data: rows }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `Error interno: ${msg}` }, { status: 500 });
  }
}

