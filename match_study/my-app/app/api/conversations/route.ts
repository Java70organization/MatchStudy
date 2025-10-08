import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

type PostBody = {
  userId?: string;
};

type ConversationRow = {
  id: string;
  hora: string;
  usuario_1: string;
  usuario_2: string;
  notificacion: number | null;
};

// Crea o devuelve una conversación directa entre el usuario autenticado y `userId`.
export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = (await req.json()) as PostBody;
    const targetId = (body.userId || "").trim();
    if (!targetId) {
      return NextResponse.json({ error: "Falta userId destino" }, { status: 400 });
    }
    if (targetId === user.id) {
      return NextResponse.json({ error: "No puedes chatear contigo mismo" }, { status: 400 });
    }

    // Orden canónico para evitar duplicados (usuario_1 <= usuario_2)
    const a = user.id < targetId ? user.id : targetId;
    const b = user.id < targetId ? targetId : user.id;

    // Buscar si ya existe conversación entre ambos (en orden canónico)
    const { data: existing, error: qErr } = await supabaseServer
      .from("conversaciones")
      .select("id, hora, usuario_1, usuario_2, notificacion")
      .eq("usuario_1", a)
      .eq("usuario_2", b)
      .maybeSingle();

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ data: existing, created: false }, { status: 200 });
    }

    const row = {
      hora: new Date().toISOString(),
      usuario_1: a,
      usuario_2: b,
      notificacion: 0,
    } as const;

    const { data: inserted, error: insErr } = await supabaseServer
      .from("conversaciones")
      .insert(row)
      .select("id, hora, usuario_1, usuario_2, notificacion")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ data: inserted, created: true }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `Error interno: ${msg}` }, { status: 500 });
  }
}

// Lista conversaciones del usuario autenticado
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

    // Evitar 'or' string para no provocar comparaciones texto/uuid.
    const { data: d1, error: e1 } = await supabaseServer
      .from("conversaciones")
      .select("id, hora, usuario_1, usuario_2, notificacion")
      .eq("usuario_1", user.id)
      .limit(200);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });

    const { data: d2, error: e2 } = await supabaseServer
      .from("conversaciones")
      .select("id, hora, usuario_1, usuario_2, notificacion")
      .eq("usuario_2", user.id)
      .limit(200);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });

    // Unir y deduplicar por id, ordenar por hora desc
    const map = new Map<string, ConversationRow>();
    for (const r of [...(d1 || []), ...(d2 || [])] as ConversationRow[]) map.set(r.id, r);
    const data = Array.from(map.values()).sort((a: ConversationRow, b: ConversationRow) => {
      const ta = new Date(a.hora).getTime();
      const tb = new Date(b.hora).getTime();
      return tb - ta;
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `Error interno: ${msg}` }, { status: 500 });
  }
}
