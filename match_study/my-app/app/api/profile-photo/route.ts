import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

// Nombre del bucket donde se guardarán las fotos de perfil
const BUCKET = "Profile"; // Usa exactamente el nombre del bucket creado en Supabase

export async function POST(request: NextRequest) {
  try {
    // Verificar usuario autenticado (cookies -> sesión)
    const supabaseServer = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Archivo no proporcionado" },
        { status: 400 },
      );
    }

    // Validaciones básicas
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/gif",
      "image/avif",
    ];
    const maxSizeMB = 5;
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no soportado" },
        { status: 415 },
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `El archivo excede ${maxSizeMB}MB` },
        { status: 413 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const objectKey = `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${fileExt}`;

    // Cliente admin para evitar problemas de políticas de Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Faltan variables de entorno de Supabase" },
        { status: 500 },
      );
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey);

    // Subir a Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectKey, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error al subir imagen: ${uploadError.message}` },
        { status: 500 },
      );
    }

    // Obtener URL pública (suponiendo bucket público). Si no es público, aquí podrías crear un signed URL.
    const { data: publicData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(objectKey);

    const publicUrl = publicData.publicUrl;

    // Actualizar urlFoto en tabla usuarios (por email del usuario auth)
    const email = user.email;
    if (email) {
      const { error: updateError } = await supabaseAdmin
        .from("usuarios")
        .update({ urlFoto: publicUrl })
        .eq("email", email);

      if (updateError) {
        // No hacemos fail total si la carga fue exitosa, pero informamos
        return NextResponse.json(
          {
            warning: `Imagen subida pero no se pudo actualizar el perfil: ${updateError.message}`,
            url: publicUrl,
            path: objectKey,
          },
          { status: 200 },
        );
      }
    }

    return NextResponse.json(
      { url: publicUrl, path: objectKey },
      { status: 200 },
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { error: `Error interno del servidor: ${msg}` },
      { status: 500 },
    );
  }
}

