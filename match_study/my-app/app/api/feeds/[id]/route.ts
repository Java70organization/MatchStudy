import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();
    if (authError || !user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    const { id } = await context.params;
    const { data: row, error: selErr } = await admin
      .from("feeds")
      .select("id, email")
      .eq("id", id)
      .maybeSingle();
    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });
    if (!row) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if ((row.email as string | null)?.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: "Prohibido" }, { status: 403 });
    }

    const { error: delErr } = await admin.from("feeds").delete().eq("id", id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
