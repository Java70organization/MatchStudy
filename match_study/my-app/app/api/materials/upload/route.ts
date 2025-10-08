import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const BUCKET = "Files"; // bucket para materiales

export async function POST(request: NextRequest) {
  try {
    // Verificar usuario autenticado
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const materia = String(form.get("materia") || "").trim();
    const descripcion = String(form.get("descripcion") || "").trim();

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no proporcionado" }, { status: 400 });
    }
    if (!materia || !descripcion) {
      return NextResponse.json({ error: "Materia y descripción son requeridas" }, { status: 400 });
    }

    const allowedTypes = ["application/pdf"]; // principal: PDF
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Solo se permiten archivos PDF" }, { status: 415 });
    }
    const maxMB = 20;
    if (file.size > maxMB * 1024 * 1024) {
      return NextResponse.json({ error: `Máximo ${maxMB}MB` }, { status: 413 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Faltan variables de entorno de Supabase" }, { status: 500 });
    }
    const admin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    // Subir a Storage (Files)
    const ext = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const objectKey = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = await file.arrayBuffer();
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(objectKey, buffer, { contentType: file.type, upsert: false });
    if (upErr) {
      return NextResponse.json({ error: `Error al subir archivo: ${upErr.message}` }, { status: 500 });
    }

    // Insertar en tabla material
    const displayName =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email ||
      "Usuario";
    const hora = new Date().toISOString();
    // No enviar "id". Deja que la base de datos asigne (bigserial/uuid default)
    const insertRow = {
      hora,
      usuario: displayName,
      materia,
      descripcion,
      email: user.email,
      urlmaterial: objectKey,
    } as const;

    const { error: insErr } = await admin.from("material").insert(insertRow);
    if (insErr) {
      return NextResponse.json({ error: `Error guardando registro: ${insErr.message}` }, { status: 500 });
    }

    // Crear URL firmada para descarga/vista
    const { data: signed } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(objectKey, 60 * 60 * 24 * 7);

    return NextResponse.json(
      {
        data: {
          ...insertRow,
          downloadUrl: signed?.signedUrl || null,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error desconocido";
    return NextResponse.json({ error: `Error interno del servidor: ${msg}` }, { status: 500 });
  }
}
