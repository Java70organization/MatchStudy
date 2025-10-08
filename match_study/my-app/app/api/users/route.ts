import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno" },
        { status: 500 },
      );
    }

    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin
      .from("usuarios")
      .select("id, nombres, apellidos, email, urlFoto")
      .order("nombres", { ascending: true })
      .limit(200);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `Error interno: ${msg}` }, { status: 500 });
  }
}

